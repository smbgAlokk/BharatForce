const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAllOrgData,
  addBranch,
  updateBranch,
  deleteBranch,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  addDesignation,
  updateDesignation,
  deleteDesignation,
  addGrade,
  updateGrade,
  deleteGrade,
  addCostCenter,
  updateCostCenter,
  deleteCostCenter,
} = require("../controllers/orgController");

router.use(protect);

// Master Fetch
router.get("/all", getAllOrgData);

// Branch CRUD
router.post("/branches", addBranch);
router.put("/branches/:id", updateBranch);
router.delete("/branches/:id", deleteBranch);

// Department CRUD
router.post("/departments", addDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// Designation CRUD
router.post("/designations", addDesignation);
router.put("/designations/:id", updateDesignation);
router.delete("/designations/:id", deleteDesignation);

// Grades
router.post("/grades", addGrade);
router.put("/grades/:id", updateGrade);
router.delete("/grades/:id", deleteGrade);

// Cost Centers
router.post("/cost-centers", addCostCenter);
router.put("/cost-centers/:id", updateCostCenter);
router.delete("/cost-centers/:id", deleteCostCenter);

module.exports = router;
