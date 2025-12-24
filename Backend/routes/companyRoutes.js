const express = require("express");
const router = express.Router();
const {
  getCompanyProfile,
  getAllCompanyProfile,
  updateCompanyProfile,
  createCompany,
  getAllCompanies,
  deleteCompany,
} = require("../controllers/companyController");

router.get("/", getAllCompanies);
router.post("/new", createCompany);
router.get("/:tenantId", getCompanyProfile);
// router.get("/allcompany", getAllCompanyProfile);
router.put("/:tenantId", updateCompanyProfile);
router.delete("/:tenantId", deleteCompany);

module.exports = router;
