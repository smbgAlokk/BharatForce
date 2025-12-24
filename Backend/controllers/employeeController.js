const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Employee = require("../models/Employee");
const User = require("../models/User");
const sendEmail = require("../Utils/email");
const fs = require("fs");
const path = require("path");

// --- Helper Functions ---

const generateRandomPassword = (length = 12) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

// --- Controller Functions ---

// @desc    Add New Employee (Non-Transactional / Standalone Compatible)
// @route   POST /api/employees
exports.addEmployee = async (req, res) => {
  try {
    const empData = req.body;

    // 1. Validation & Security
    if (!req.user || !req.user.companyId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User context missing." });
    }

    const { companyId, tenantId } = req.user;

    if (
      !empData.officialEmail ||
      !empData.firstName ||
      !empData.lastName ||
      !empData.employeeCode
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields: Name, Email, or Code." });
    }

    const normalizedEmail = empData.officialEmail.toLowerCase();

    // 2. Duplication Checks
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists)
      return res
        .status(400)
        .json({ message: "User account with this email already exists." });

    const codeExists = await Employee.findOne({
      employeeCode: empData.employeeCode,
      companyId,
    });
    if (codeExists)
      return res.status(400).json({
        message: `Employee Code '${empData.employeeCode}' is already in use.`,
      });

    // 3. Generate Credentials
    const plainTextPassword = generateRandomPassword();

    // ❌ REMOVED MANUAL HASHING to prevent Double Hash issue
    // The User Model's pre('save') hook will handle the hashing automatically.

    // 4. Create USER (Login)
    const newUser = new User({
      name: `${empData.firstName} ${empData.lastName}`,
      email: normalizedEmail,
      password: plainTextPassword, // ✅ Pass PLAIN TEXT here
      role: empData.role || "EMPLOYEE",
      companyId: companyId,
      tenantId: tenantId,
      status: "Active",
    });

    const savedUser = await newUser.save();

    // 5. Create EMPLOYEE (Profile)
    let savedEmployee;
    try {
      const newEmployee = new Employee({
        ...empData,
        officialEmail: normalizedEmail,
        companyId: companyId,
        tenantId: tenantId || companyId,
        userId: savedUser._id,
        createdBy: req.user.id,
      });

      savedEmployee = await newEmployee.save();
    } catch (empError) {
      // Manual Rollback if Employee creation fails
      await User.findByIdAndDelete(savedUser._id);
      throw empError;
    }

    // 6. Send Email
    // Note: Ensure this URL points to your actual frontend login page
    const loginLink = `${req.protocol}://${req.get("host")}/#/login`;

    const message = `
      Hello ${empData.firstName},
      
      Welcome to BharatForce!
      
      Your account has been created successfully.
      
      **Login Credentials:**
      --------------------------------
      URL: ${loginLink}
      Username: ${normalizedEmail}
      Password: ${plainTextPassword}
      --------------------------------
      
      Please login and change your password immediately.
    `;

    try {
      await sendEmail({
        email: normalizedEmail,
        subject: "Welcome to BharatForce - Login Credentials",
        message: message,
      });
    } catch (emailError) {
      console.error("Email failed:", emailError);
      // We don't rollback here; the account is created, admin can reset password if needed.
    }

    // Populate for immediate frontend update
    await savedEmployee.populate([
      { path: "departmentId", select: "name" },
      { path: "designationId", select: "name" },
      { path: "branchId", select: "name" },
    ]);

    res.status(201).json({
      success: true,
      message: "Employee added successfully.",
      data: savedEmployee,
    });
  } catch (error) {
    console.error("Add Employee Error:", error.message);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate entry: ${field} already exists.`,
      });
    }

    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get All Employees
// @route   GET /api/employees/:tenantId
// @access  Private (COMPANY_ADMIN Only)
exports.getEmployees = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // 🔒 1. SECURITY LOG: Check who is calling this
    console.log(
      `[GetEmployees] User: ${req.user.name} | Role: ${req.user.role} | Requesting Tenant: ${tenantId}`
    );

    // 🔒 2. ROLE GATE: Strictly Allow ONLY 'COMPANY_ADMIN'
    // If the user is an 'EMPLOYEE' or 'MANAGER', they get blocked immediately.
    if (req.user.role !== "COMPANY_ADMIN") {
      console.warn(
        `[GetEmployees] BLOCKED: User ${req.user.email} tried to access employee list.`
      );
      return res.status(403).json({
        message:
          "Access Denied: You do not have permission to view the company directory.",
      });
    }

    // 🔒 3. TENANT GATE: Ensure Admin isn't peeking at another company
    if (req.user.companyId !== tenantId && req.user.tenantId !== tenantId) {
      return res
        .status(403)
        .json({ message: "Access Denied: Tenant mismatch." });
    }

    // If passed, fetch the data
    const query = {
      $or: [{ tenantId: tenantId }, { companyId: tenantId }],
    };

    const employees = await Employee.find(query)
      .populate("departmentId", "name code")
      .populate("designationId", "name")
      .populate("branchId", "name")
      .populate("reportingManagerId", "firstName lastName")
      .select("-password -userId") // Optimization: Don't send sensitive linked IDs
      .sort({ createdAt: -1 });

    res.status(200).json(employees);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Employee Profile & Sync User Auth
// @route   PUT /api/employees/:id
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 1. Fetch Current Employee Data (Before Update)
    // We need this to compare if email/name/role changed
    const currentEmployee = await Employee.findOne({
      _id: id,
      companyId:
        req.user.role === "SUPER_ADMIN"
          ? { $exists: true }
          : req.user.companyId,
    });

    if (!currentEmployee) {
      return res
        .status(404)
        .json({ message: "Employee not found or access denied" });
    }

    // 2. Identify Critical Changes
    const isEmailChanged =
      updates.officialEmail &&
      updates.officialEmail.toLowerCase() !== currentEmployee.officialEmail;
    const isNameChanged =
      (updates.firstName && updates.firstName !== currentEmployee.firstName) ||
      (updates.lastName && updates.lastName !== currentEmployee.lastName);
    const isRoleChanged = updates.role && updates.role !== currentEmployee.role;

    // 3. Prepare USER Updates
    const userUpdates = {};

    // A. Sync Name
    if (isNameChanged) {
      const newFirst = updates.firstName || currentEmployee.firstName;
      const newLast = updates.lastName || currentEmployee.lastName;
      userUpdates.name = `${newFirst} ${newLast}`;
    }

    // B. Sync Role
    if (isRoleChanged) {
      userUpdates.role = updates.role;
    }

    // C. Sync Email & Handle Credentials (The Heavy Lifting)
    let newPlainTextPassword = null;

    if (isEmailChanged) {
      const newEmail = updates.officialEmail.toLowerCase();

      // Check if new email is already taken
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) {
        return res.status(400).json({
          message: "This email address is already in use by another user.",
        });
      }

      // Generate New Credentials
      newPlainTextPassword = generateRandomPassword();

      // ⚠️ IMPORTANT: findByIdAndUpdate DOES NOT trigger pre-save hooks.
      // We MUST manually hash the password here.
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPlainTextPassword, salt);

      userUpdates.email = newEmail;
      userUpdates.password = hashedPassword;

      console.log(
        `Email change detected for ${currentEmployee.firstName}. Resetting credentials.`
      );
    }

    // 4. Update the Linked USER Document
    if (Object.keys(userUpdates).length > 0 && currentEmployee.userId) {
      await User.findByIdAndUpdate(currentEmployee.userId, userUpdates);
    }

    // 5. Update the EMPLOYEE Document
    // Filter out immutable fields
    delete updates.companyId;
    delete updates.tenantId;
    delete updates._id;
    delete updates.userId;
    delete updates.employeeCode;

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("departmentId", "name")
      .populate("designationId", "name")
      .populate("branchId", "name");

    // 6. Send Invitation Email (Only if email changed)
    if (isEmailChanged && newPlainTextPassword) {
      const loginLink = `${req.protocol}://${req.get("host")}/#/login`;
      const emailMessage = `
            Hello ${updatedEmployee.firstName},

            Your employment email address has been updated.
            The system has automatically generated new login credentials for you.

            **New Login Details:**
            -------------------------------------------------
            URL: ${loginLink}
            New Username: ${userUpdates.email}
            New Password: ${newPlainTextPassword}
            -------------------------------------------------

            Please login and change your password immediately.
        `;

      try {
        await sendEmail({
          email: userUpdates.email,
          subject: "Security Update - New Login Credentials",
          message: emailMessage,
        });
      } catch (emailError) {
        console.error("Failed to send re-invitation email:", emailError);
        // We don't rollback the update here, but we warn the admin via console logs
      }
    }

    res.status(200).json({
      success: true,
      data: updatedEmployee,
      message: isEmailChanged
        ? "Profile updated & New credentials sent to email."
        : "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Employee (Profile + User + Files)
// @route   DELETE /api/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find Employee to get UserID and Documents
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // 2. Security Check: Prevent deleting the last Admin or Self
    if (req.user.id === employee.userId?.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account." });
    }

    // Ensure admin belongs to same company
    if (
      req.user.role !== "SUPER_ADMIN" &&
      req.user.companyId !== employee.companyId
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    // 3. Delete Physical Files (Documents)
    if (employee.documents && employee.documents.length > 0) {
      employee.documents.forEach((doc) => {
        if (doc.fileName) {
          // Construct path matching your upload logic (public/uploads/employeeDocuments)
          const filePath = path.join(
            __dirname,
            "../public/uploads/employeeDocuments",
            doc.fileName
          );
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log(`Deleted file: ${doc.fileName}`);
            } catch (err) {
              console.error(`Failed to delete file ${doc.fileName}:`, err);
            }
          }
        }
      });
    }

    // 4. Delete Linked User Account (Auth)
    if (employee.userId) {
      await User.findByIdAndDelete(employee.userId);
    }

    // 5. Delete Employee Record
    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Employee and all associated data deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Me (Self Service)
// @route   GET /api/employees/me
exports.getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id })
      .populate("departmentId", "name")
      .populate("designationId", "name")
      .populate("branchId", "name")
      .populate("reportingManagerId", "firstName lastName");

    if (!employee) {
      return res.status(404).json({ message: "Profile not found." });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Employee By ID
// @route   GET /api/employees/detail/:id
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("departmentId", "name")
      .populate("designationId", "name")
      .populate("branchId", "name")
      .populate("reportingManagerId", "firstName lastName");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // 🔒 STRICT SECURITY:
    // 1. Is it the Owner? (Employee viewing themselves) -> ALLOW
    // 2. Is it the Company Admin OF THE SAME COMPANY? -> ALLOW
    // 3. Everyone else (Super Admin, Other Company Admin) -> DENY

    const isOwner = employee.userId.toString() === req.user.id;
    const isCompanyAdmin =
      req.user.role === "COMPANY_ADMIN" &&
      req.user.companyId === employee.companyId;

    if (!isOwner && !isCompanyAdmin) {
      return res.status(403).json({ message: "Access Denied." });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
