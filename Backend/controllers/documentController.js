const multer = require("multer");
const { cloudinary, storage } = require("../Utils/cloudinary");

// 1. Init Upload Middleware
// I use the 'storage' engine I configured in the utils file
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("file");

// --- CONTROLLER FUNCTIONS ---

// @desc    Upload File to Cloudinary
// @route   POST /api/upload
exports.uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Cloudinary Upload Error:", err);
      return res
        .status(400)
        .json({ message: err.message || "File upload failed" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Success response
    res.status(200).json({
      success: true,
      fileUrl: req.file.path,
      fileName: req.file.filename,
      originalName: req.file.originalname,
    });
  });
};

// @desc    Delete File from Cloudinary
// @route   POST /api/upload/delete
exports.deleteFile = async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res
        .status(400)
        .json({ message: "Filename (Public ID) is required" });
    }

    console.log(`Deleting from Cloudinary: ${fileName}`);

    // Try deleting as 'image' first
    let result = await cloudinary.uploader.destroy(fileName);

    // If 'image' delete fails (common for PDFs), try as 'raw'
    if (result.result !== "ok") {
      result = await cloudinary.uploader.destroy(fileName, {
        resource_type: "raw",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    res.status(500).json({ message: "Server error during file deletion" });
  }
};
