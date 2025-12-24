const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    // Identity
    tenantId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    legalName: { type: String },
    industry: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // Branding
    primaryColor: { type: String, default: "#4F46E5" },

    // Statutory
    pan: String,
    gstin: String,
    cin: String,

    // Address (Nested)
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Contact
    contactPerson: String,
    email: { type: String, required: true },
    phone: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", CompanySchema);
