const Employee = require("../models/Employee");
const {
  Department,
  Designation,
  Branch,
  Grade,
  CostCenter,
} = require("../models/OrgModels");
const User = require("../models/user");
const sendEmail = require("../Utils/email");
const crypto = require("crypto");
const Company = require("../models/company");

// @desc    Get All Companies (Super Admin Only)
// @route   GET /api/company
exports.getAllCompanies = async (req, res) => {
  try {
    // Optional: Add check if req.user.role === 'SUPER_ADMIN'
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Particular Company Profile
exports.getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ tenantId: req.params.tenantId });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    GET allCompanies
exports.getAllCompanyProfile = async (req, res) => {
  const allCompany = await Company.find();
  res.status(200).json({ success: true, allCompany });
};

// @desc    Update Company Profile
// @route   PUT /api/company/:tenantId
exports.updateCompanyProfile = async (req, res) => {
  const { role } = req.body;
  const { tenantId } = req.params;

  try {
    // 1. Fetch current company data (Need this to compare emails)
    let company = await Company.findOne({ tenantId });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Store old email for user lookup
    const oldEmail = company.email;
    const newEmail = req.body.email;

    // 🔒 SUPER ADMIN LOGIC
    if (role === "SUPER_ADMIN" || role === "Super Admin") {
      // 2. EMAIL CHANGE LOGIC (Critical)
      if (newEmail && newEmail !== oldEmail) {
        // A. Check if new email is taken
        const emailTaken = await User.findOne({ email: newEmail });
        if (emailTaken) {
          return res.status(400).json({
            message: `Email ${newEmail} is already in use by another user.`,
          });
        }

        // B. Find the Admin User linked to this company (using old email)
        const linkedAdmin = await User.findOne({
          email: oldEmail,
          companyId: tenantId,
        });

        if (linkedAdmin) {
          console.log(`🔄 Syncing User Email: ${oldEmail} -> ${newEmail}`);
          linkedAdmin.email = newEmail;
          await linkedAdmin.save({ validateBeforeSave: false });

          // C. Send Notification to NEW Email
          try {
            const loginURL = `http://localhost:3000/#/login`;
            await sendEmail({
              email: newEmail,
              subject: "Your BharatForce Login Email Has Changed",
              message: `
                 <p>Hello ${linkedAdmin.name},</p>
                 <p>Your company email has been updated by the Super Admin.</p>
                 <p><b>Old Login:</b> ${oldEmail}</p>
                 <p><b>New Login:</b> ${newEmail}</p>
                 <p>Your password remains the same.</p>
                 <a href="${loginURL}">Login Here</a>
               `,
            });
          } catch (err) {
            console.error("⚠️ Failed to send update email:", err.message);
          }
        }
      }

      // 3. Update Company Document
      const { tenantId: _, ...updates } = req.body; // Remove tenantId from updates to be safe
      Object.assign(company, updates);

      // Handle nested address merge
      if (req.body.address) {
        company.address = { ...company.address, ...req.body.address };
      }
    } else if (role === "COMPANY_ADMIN") {
      // HR Logic (Restricted) - HR cannot change the primary login email usually
      const allowed = [
        "cin",
        "phone",
        "contactPerson",
        "address",
        "primaryColor",
      ];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) company[field] = req.body[field];
      });
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    await company.save();
    res.status(200).json(company);
  } catch (error) {
    console.error("Update Failed:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create New Company (For Super Admin)
exports.createCompany = async (req, res) => {
  try {
    const { name, email, contactPerson } = req.body;

    // 1. STRICT CHECK: Ensure Email is globally unique first
    // We cannot have two Company Admins with the same email in this architecture
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: `The email ${email} is already registered to another user/company.`,
      });
    }

    // 2. Generate Tenant ID
    let tenantId = req.body.tenantId;
    if (!tenantId) {
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      tenantId = `tenant-${cleanName}-${Date.now().toString().slice(-4)}`;
    }

    // 3. Create Company
    const newCompany = await Company.create({
      ...req.body,
      tenantId,
    });

    // 4. Create Admin User
    const tempPassword = crypto.randomBytes(4).toString("hex") + "A1!";

    await User.create({
      name: contactPerson || "Admin",
      email: email,
      password: tempPassword,
      role: "COMPANY_ADMIN",
      companyId: tenantId,
    });

    console.log(`Company & Admin Created: ${email}`);

    // 5. Send Welcome Email
    try {
      await sendEmail({
        email: email,
        subject: "Welcome to BharatForce - Login Credentials",
        message: `
          <h3>Welcome aboard!</h3>
          <p>The company <b>${name}</b> has been successfully registered.</p>
          <p><b>Login ID:</b> ${email}<br><b>Temporary Password:</b> ${tempPassword}</p>
          <a href="http://localhost:3000/#/login" style="background:#4F46E5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Login Now</a>
        `,
      });
    } catch (err) {
      console.error("⚠️ Email failed:", err.message);
    }

    res.status(201).json({ success: true, data: newCompany });
  } catch (error) {
    // Handle duplicate company name/tenantId error
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Company Name or Tenant ID already exists." });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete Any Company (For Super Admin)
// @desc    Delete Company (And all its data)
// @route   DELETE /api/company/:tenantId
exports.deleteCompany = async (req, res) => {
  try {
    const { tenantId } = req.params;
    console.log(`🗑️ Deleting Tenant: ${tenantId}`);

    // 1. Delete Company Document
    const company = await Company.findOneAndDelete({ tenantId });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // 2. Cascade Delete (Clean up everything else)
    // This ensures no ghost data is left behind
    await Promise.all([
      User.deleteMany({ companyId: tenantId }),
      Employee.deleteMany({ tenantId }),
      Department.deleteMany({ tenantId }),
      Designation.deleteMany({ tenantId }),
      Branch.deleteMany({ tenantId }),
      Grade.deleteMany({ tenantId }),
      CostCenter.deleteMany({ tenantId }),
    ]);

    res.status(200).json({
      success: true,
      message: "Company and all associated data deleted.",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: error.message });
  }
};
