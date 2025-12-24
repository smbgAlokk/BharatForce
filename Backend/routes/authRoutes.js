const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/authMiddleware");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  googleLogin,
  inviteEmployee,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.post("/invite", protect, restrictTo("COMPANY_ADMIN"), inviteEmployee);

module.exports = router;
