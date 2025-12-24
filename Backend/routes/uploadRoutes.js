const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

// Route to Upload
router.post("/", protect, documentController.uploadFile);

// Route to Delete
router.post("/delete", protect, documentController.deleteFile);

// Note: For 'download' route we now use direct Cloudinary URLs.

module.exports = router;
