const mongoose = require("mongoose");

// 1. Common Fields
const commonSchema = {
  tenantId: { type: String, required: true, index: true },
  companyId: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, default: "Active" },
};

// 2. Department
const DepartmentSchema = new mongoose.Schema(
  {
    ...commonSchema,
    code: { type: String, uppercase: true },
    headOfDepartmentId: String,
    parentDepartmentId: String,
  },
  { timestamps: true }
);

// 3. Designation
const DesignationSchema = new mongoose.Schema(
  {
    ...commonSchema,
    code: { type: String, uppercase: true },
    grade: String,
    description: String,
    departmentId: String, // ✅ Added this field to match Frontend
  },
  { timestamps: true }
);

// 4. Branch
const BranchSchema = new mongoose.Schema(
  {
    ...commonSchema,
    // New fields your frontend is sending:
    code: { type: String, uppercase: true },
    isHeadOffice: { type: Boolean, default: false },

    // Address Breakdown
    city: String,
    state: String,
    country: String,
    pincode: String,
    addressLine1: String, // Matches frontend "addressLine1"

    // Contact
    contactNumber: String,
  },
  { timestamps: true }
);

// 5. Grade Schema (NEW)
const GradeSchema = new mongoose.Schema(
  {
    ...commonSchema,
    level: String, // e.g. "Junior", "Mid", "Senior"
    description: String,
  },
  { timestamps: true }
);

// 5. Cost Center Schema (NEW)
const CostCenterSchema = new mongoose.Schema(
  {
    ...commonSchema,
    code: { type: String, uppercase: true },
    departmentId: String,
    branchId: String,
    description: String,
  },
  { timestamps: true }
);

module.exports = {
  Department: mongoose.model("Department", DepartmentSchema),
  Designation: mongoose.model("Designation", DesignationSchema),
  Branch: mongoose.model("Branch", BranchSchema),
  Grade: mongoose.model("Grade", GradeSchema), // Exported
  CostCenter: mongoose.model("CostCenter", CostCenterSchema), // Exported
};
