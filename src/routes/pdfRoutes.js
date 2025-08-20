/**
 * PDF Routes
 * Handles all PDF-related endpoints
 */

const express = require("express");
const { handleUpload } = require("../middleware/upload");
const {
  uploadPDF,
  getPDFInfo,
  deletePDF,
  getAllPDFs,
  getStats,
} = require("../controllers/pdfController");

const router = express.Router();

// Upload PDF
router.post("/upload", handleUpload, uploadPDF);

// Get PDF information
router.get("/pdf/:fileId", getPDFInfo);

// Delete PDF
router.delete("/pdf/:fileId", deletePDF);

// Get all PDFs (admin)
router.get("/pdfs", getAllPDFs);

// Get storage statistics
router.get("/stats", getStats);

module.exports = router;
