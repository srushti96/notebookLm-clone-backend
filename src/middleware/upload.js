/**
 * Upload Middleware
 * Handles file uploads with validation and configuration
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return cb(new Error("File size must be less than 10MB"), false);
  }

  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Only allow 1 file per request
  },
});

// Single file upload middleware
const uploadSingle = upload.single("pdf");

// Wrapper to handle multer errors
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          return res.status(400).json({
            success: false,
            error: "File too large. Maximum size is 10MB.",
          });
        case "LIMIT_FILE_COUNT":
          return res.status(400).json({
            success: false,
            error: "Too many files. Only one file allowed.",
          });
        case "LIMIT_UNEXPECTED_FILE":
          return res.status(400).json({
            success: false,
            error: "Unexpected file field.",
          });
        default:
          return res.status(400).json({
            success: false,
            error: "File upload error.",
          });
      }
    } else if (err) {
      // Other errors
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    // No file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded.",
      });
    }

    next();
  });
};

module.exports = {
  upload,
  handleUpload,
  uploadsDir,
};
