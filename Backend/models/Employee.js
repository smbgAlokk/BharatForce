const mongoose = require("mongoose");

// --- Sub-Schemas for Cleaner Code ---

const AddressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const EducationSchema = new mongoose.Schema(
  {
    id: String, // Frontend ID
    degree: String,
    specialization: String,
    institution: String,
    yearOfPassing: Number,
    grade: String,
  },
  { _id: false }
);

const ExperienceSchema = new mongoose.Schema(
  {
    id: String,
    companyName: String,
    jobTitle: String,
    startDate: String,
    endDate: String,
    lastCtc: String,
    reasonForLeaving: String,
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    id: String,
    type: String,
    fileName: String,
    fileUrl: String,
    uploadedOn: String,
    uploadedBy: String,
    customLabel: String,
    documentNumber: String,
    issueDate: String,
    expiryDate: String,
    notes: String,
  },
  { _id: false }
);

// --- Main Employee Schema ---

const EmployeeSchema = new mongoose.Schema(
  {
    //  1. Multi-Tenancy
    tenantId: { type: String, required: true, index: true },
    companyId: { type: String, required: true },

    //  2. Personal Details
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    photoUrl: String,
    role: {
      type: String,
      enum: ["EMPLOYEE", "MANAGER", "COMPANY_ADMIN", "SUPER_ADMIN"],
      default: "EMPLOYEE",
      required: true,
    },

    //  3. Contact
    officialEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    personalEmail: { type: String, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true },

    //  4. Bio Data
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: Date,
    maritalStatus: String,
    bloodGroup: String,

    //  5. Employment Details
    employeeCode: { type: String, required: true, uppercase: true, trim: true },
    designationId: String,
    departmentId: String,
    branchId: String,
    gradeId: String,
    costCenterId: String,
    reportingManagerId: String,
    secondLevelManagerId: String,

    joiningDate: { type: Date, required: true },
    confirmationDate: Date,
    probationPeriod: { type: Number, default: 0 },
    probationEndDate: Date,

    status: {
      type: String,
      enum: ["Active", "Probation", "Notice Period", "Separated", "Onboarding"],
      default: "Onboarding",
    },
    employmentType: {
      type: String,
      enum: ["Permanent", "Contract", "Intern", "Consultant"],
      default: "Permanent",
    },
    workLocationType: { type: String, default: "Onsite" },

    //  6. Addresses
    permanentAddress: AddressSchema,
    communicationAddress: AddressSchema,
    isCommunicationSameAsPermanent: { type: Boolean, default: false },

    //  7. Family & IDs
    familyDetails: {
      fatherName: String,
      motherName: String,
      spouseName: String,
      dependents: Number,
    },
    governmentIds: {
      aadhaar: String,
      pan: String,
      passport: String,
      drivingLicense: String,
    },

    // 🏦 8. Bank & Payroll
    bankDetails: {
      bankName: String,
      branchName: String,
      ifscCode: String,
      accountNumber: String,
      accountHolderName: String,
      paymentMode: String,
    },
    payrollSettings: {
      ctc: Number,
      salaryStructureId: String,
      pfNumber: String,
      esiNumber: String,
      uan: String,
      payrollGroup: String,
      internalCode: String,
      employeeCategory: String,
    },

    // 9. Arrays
    education: [EducationSchema],
    experience: [ExperienceSchema],
    documents: [DocumentSchema],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Every employee must have a login user account
    },
  },

  { timestamps: true }
);

// PERFORMANCE & SAFETY INDEXES

// (Allows the same person to work for two different companies on your platform)
EmployeeSchema.index({ officialEmail: 1, tenantId: 1 }, { unique: true });

// 2. Ensure Employee Code is unique ONLY within a specific Tenant
EmployeeSchema.index({ employeeCode: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Employee", EmployeeSchema);
