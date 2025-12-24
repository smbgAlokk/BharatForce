const {
  Department,
  Designation,
  Branch,
  Grade,
  CostCenter,
} = require("../models/OrgModels");

// Helper to get Tenant ID
const getTenantId = (req) => req.user.companyId || req.user.tenantId;

// @desc    Get All Org Data
exports.getAllOrgData = async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    // Fetch ALL 5 Collections
    const [departments, designations, branches, grades, costCenters] =
      await Promise.all([
        Department.find({ tenantId }),
        Designation.find({ tenantId }),
        Branch.find({ tenantId }),
        Grade.find({ tenantId }),
        CostCenter.find({ tenantId }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        departments,
        designations,
        branches,
        grades,
        costCenters,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BRANCH OPERATIONS ---

exports.addBranch = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    console.log("📥 Received Branch Data:", req.body); // <--- DEBUG LOG

    const { isHeadOffice } = req.body;

    if (isHeadOffice === true || isHeadOffice === "true") {
      await Branch.updateMany({ tenantId }, { $set: { isHeadOffice: false } });
    }

    const newBranch = await Branch.create({
      ...req.body,
      tenantId,
      companyId: tenantId,
      isHeadOffice: isHeadOffice === true || isHeadOffice === "true",
    });

    console.log("✅ Saved Branch to DB:", newBranch); // <--- DEBUG LOG

    res.status(201).json({ success: true, data: newBranch });
  } catch (error) {
    console.error("❌ Save Failed:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const tenantId = req.user.companyId || req.user.tenantId;
    const { isHeadOffice } = req.body;

    // 1. ⚡ ATOMIC RESET: Demote others if this one is becoming King
    if (isHeadOffice === true || isHeadOffice === "true") {
      await Branch.updateMany(
        { tenantId: tenantId, _id: { $ne: req.params.id } }, // Don't demote self
        { $set: { isHeadOffice: false } }
      );
    }

    // 2. Update the Branch
    const updatedBranch = await Branch.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({ success: true, data: updatedBranch });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const branch = await Branch.findOneAndDelete({
      _id: req.params.id,
      tenantId,
    });

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({ success: true, message: "Branch deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DEPARTMENT OPERATIONS ---

exports.addDepartment = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    console.log(`📝 Adding Dept for Tenant: ${tenantId}`);

    const newDept = await Department.create({
      ...req.body,
      tenantId,
      companyId: tenantId,
    });

    res.status(201).json({ success: true, data: newDept });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    const updatedDept = await Department.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedDept) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ success: true, data: updatedDept });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const dept = await Department.findOneAndDelete({
      _id: req.params.id,
      tenantId,
    });

    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ success: true, message: "Department deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DESIGNATION OPERATIONS ---

exports.addDesignation = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const newDesig = await Designation.create({
      ...req.body,
      tenantId,
      companyId: tenantId,
    });
    res.status(201).json({ success: true, data: newDesig });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDesignation = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const updatedDesig = await Designation.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDesig)
      return res.status(404).json({ message: "Designation not found" });
    res.status(200).json({ success: true, data: updatedDesig });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDesignation = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const desig = await Designation.findOneAndDelete({
      _id: req.params.id,
      tenantId,
    });
    if (!desig)
      return res.status(404).json({ message: "Designation not found" });
    res.status(200).json({ success: true, message: "Designation deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GRADE OPERATIONS ---
exports.addGrade = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const item = await Grade.create({
      ...req.body,
      tenantId,
      companyId: tenantId,
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const item = await Grade.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Grade not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    await Grade.findOneAndDelete({ _id: req.params.id, tenantId });
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- COST CENTER OPERATIONS ---
exports.addCostCenter = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const item = await CostCenter.create({
      ...req.body,
      tenantId,
      companyId: tenantId,
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCostCenter = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const item = await CostCenter.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true }
    );
    if (!item)
      return res.status(404).json({ message: "Cost Center not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCostCenter = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    await CostCenter.findOneAndDelete({ _id: req.params.id, tenantId });
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
