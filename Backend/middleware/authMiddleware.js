const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "You are not logged in!" });
  }

  try {
    // 1. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Middleware: Token Verified. User ID:", decoded.id);

    // 2. Check User
    // IMPORTANT: Check if 'User' model is loaded correctly before calling it
    if (!User) {
      throw new Error("User Model is not loaded properly.");
    }

    // 1. Verify Token
    const currentUser = await User.findById(decoded.id);

    //2. Check user exists
    if (!currentUser) {
      console.log("❌ Middleware: User ID from token not found in DB.");
      return res.status(401).json({
        message: "The user belonging to this token no longer exists.",
      });
    }

    // 3. Enforce tenant presece (This prevents: 1.Orphan users 2.Corrupt records 3.Broken auth states)
    if (!currentUser.companyId) {
      console.log("❌ Middleware: User ID from token not found in DB.");
      return res.status(403).json({
        message: "The user belonging to this token no longer exists.",
      });
    }

    // 4. Enforce token vs DB tenant consistency
    if (decoded.tenantId && decoded.tenantId !== currentUser.companyId) {
      return res.status(401).json({
        message: "Token tenant mismatch. Please login again.",
      });
    }

    // 5. Attach context
    req.user = currentUser;
    req.tenantId = currentUser.companyId;
    req.userRole = currentUser.role;

    // 3. Grant Access
    next();
  } catch (error) {
    console.error("💥 Middleware Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
