const express = require("express");
const router = express.Router();
const {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
  getEmployeeById,
} = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");

// Apply Protection to All routes
// this ensures 'req.users' exists in the controller
router.use(protect);

router.get("/me", protect, getMyProfile);
router.get("/detail/:id", protect, getEmployeeById);

// Route: /api/employees/:tenantId
router.get("/:tenantId", getEmployees);

// Route: /api/employees
router.post("/", addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", protect, deleteEmployee);

module.exports = router;
