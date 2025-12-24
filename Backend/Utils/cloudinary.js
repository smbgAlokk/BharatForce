const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");

// Ensure env vars are loaded if this file is imported early
dotenv.config();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bharatforce_docs", // Your Cloudinary Folder Name
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "doc", "docx"],
    resource_type: "auto", // Auto-detects image vs raw (PDF)
    public_id: (req, file) => {
      // Generate unique filename: "originalName_timestamp"
      const name = file.originalname
        .split(".")[0]
        .replace(/[^a-zA-Z0-9]/g, "_");
      const uniqueSuffix = Date.now();
      return `${name}_${uniqueSuffix}`;
    },
  },
});

module.exports = {
  cloudinary,
  storage,
};
