const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../Utils/email");
const Employee = require("../models/Employee");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT Token
const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      tenantId: user.companyId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// -desc    Register a new user (Company Admin)
// -route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, companyId } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // 2. Create User
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || "COMPANY_ADMIN", // Default role
      companyId: companyId || `tenant-${Date.now()}`, // Generate temporary tenant ID if new
    });

    // 3. Generate Token
    const token = signToken(newUser._id);

    // 4. Send Response (Hide password)
    newUser.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user: newUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// -desc    Login User
// -route   POST /api/auth/login
exports.login = async (req, res) => {
  console.log("📨 Login Request Received for:", req.body.email);
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // 2. Check if user exists & password is correct
    // We explicitly select '+password' because we set select:false in Model
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // 3. Generate Token
    const token = signToken(user);

    // 4. Send Response
    user.password = undefined; // Hide hash from response

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// -desc    Login with Google
// -route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // 1. Verify Token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();

    console.log(`🔍 Google Login Attempt:, ${email}`);

    // 2. Check if User exists in OUR Database
    let user = await User.findOne({ email });

    if (user) {
      // 3A. User Exists -> Log them in
      console.log("✅ User found. Logging in...");

      // Optional: Update avatar if missing
      if (!user.avatar) {
        user.avatar = picture;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // 3B. User does NOT exist -> REJECT (Strict B2B Security)
      // In a SaaS, we rarely want auto-signup for random Google users.
      // They must be invited by HR or Registered manually first.
      console.log("❌ User not found. Rejecting.");
      return res.status(404).json({
        message:
          "No account found with this email. Please register or contact your HR.",
      });
    }

    // 4. Generate JWT (Same as standard login)
    const jwtToken = signToken(user);

    // 5. Send Response
    user.password = undefined; // Hide hash
    res.status(200).json({
      success: true,
      token: jwtToken,
      user,
    });
  } catch (error) {
    console.error("💥 Google Auth Error:", error);
    res.status(400).json({ message: "Google Authentication Failed" });
  }
};

// -desc    Forgot Password - send Email
// -route   Post /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  // Debug Log: Check what the server received
  console.log("🔍 Forgot Password Requested for:", req.body.email);

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    console.log("❌ User not found in DB");
    return res
      .status(404)
      .json({ message: "There is no user with that email address." });
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // Save token to DB

  // 3. Send it to user's email
  // NOTE: For local dev
  const resetURL = `http://localhost:3000/#/reset-password/${resetToken}`;

  // Just send the body content, the utility adds the header/footer
  const message = `
    <p>We received a request to reset the password for your account.</p>
    <p>Click the button below to proceed. This link expires in 10 minutes.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetURL}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p style="font-size: 12px; color: #9ca3af;">Or copy this link: <a href="${resetURL}">${resetURL}</a></p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      message: "There was an error sending the email. Try again later.",
    });
  }
};

// @desc    Reset Password - Update DB
// @route   PATCH /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    //  Hash it (Simulating what we did during generation)
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // First, try to find the user by Token ONLY (ignoring time)
    const userByToken = await User.findOne({ passwordResetToken: hashedToken });

    if (!userByToken) {
      console.log("ERROR: No user found with this token hash.");
      // Debug: Let's see if ANY user has a token right now
      const anyUser = await User.findOne({ email: "test@acme.com" }); // or whatever email you used
      console.log("Debug Check - Current DB Data for test user:", {
        token: anyUser?.passwordResetToken,
        expiry: anyUser?.passwordResetExpires,
      });
      return res
        .status(400)
        .json({ message: "Token is invalid (Hash Mismatch)" });
    }

    console.log("User found by token!");
    console.log("   - User ID:", userByToken._id);
    console.log("   - Token Expires At:", userByToken.passwordResetExpires);
    console.log("   - Current Server Time:", new Date());

    // 4. Check Time manually
    if (userByToken.passwordResetExpires < Date.now()) {
      console.log("ERROR: Token Expired.");
      return res.status(400).json({ message: "Token has expired" });
    }

    // 5. If we get here, everything is valid!
    console.log("✅ Token and Time are Valid. Resetting Password...");

    userByToken.password = req.body.password;
    userByToken.passwordResetToken = undefined;
    userByToken.passwordResetExpires = undefined;
    await userByToken.save();

    const token = jwt.sign({ id: userByToken._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      success: true,
      token,
      user: userByToken,
    });
  } catch (err) {
    console.error("SYSTEM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Invite Employee (Generate Token & Email)
// @route   POST /api/auth/invite
exports.inviteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const hrTenantId = req.user.companyId;

    // 1. Find the Employee Record
    const employee = await Employee.findOne({
      _id: employeeId,
      tenantId: hrTenantId,
    });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // 2. Check if User already exists
    const existingUser = await User.findOne({ email: employee.officialEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User login already exists for this employee." });
    }

    // 3. Create a temporary "Invite Token" (We can reuse the reset token logic!)
    // We create a Placeholder User account with no password access yet
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(inviteToken)
      .digest("hex");

    // Create the User, but mark as "Invited" status (or just use reset token)
    // Trick: We create them with a dummy password, but immediately set the reset token
    // so they MUST use the link.

    await User.create({
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.officialEmail,
      password: crypto.randomBytes(10).toString("hex"), // Unknowable password
      role: "EMPLOYEE",
      companyId: hrTenantId,
      passwordResetToken: hashedToken,
      passwordResetExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 Hours valid
    });

    // 4. Send Email
    const inviteURL = `http://localhost:3000/#/reset-password/${inviteToken}`;

    const message = `
      <h3>You have been invited to join BharatForce!</h3>
      <p>Hello ${employee.firstName},</p>
      <p>Your HR has created a profile for you. Please click the link below to set your password and activate your account.</p>
      <a href="${inviteURL}" style="background:#4F46E5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Accept Invitation</a>
    `;

    await sendEmail({
      email: employee.officialEmail,
      subject: "Invitation to Join BharatForce",
      message,
    });

    res
      .status(200)
      .json({ success: true, message: "Invitation sent to employee!" });
  } catch (error) {
    console.error("Invite Error:", error);
    res.status(500).json({ message: error.message });
  }
};
