/**
 * PDF Controller
 * Handles PDF upload and processing requests
 */

const { asyncHandler, AppError } = require("../middleware/errorHandler");
const pdfService = require("../services/pdfService");
const memoryDB = require("../config/database");

/**
 * Upload and process PDF file
 * POST /api/upload
 */
const uploadPDF = asyncHandler(async (req, res) => {
  const { file } = req;

  // Validate file
  const validation = pdfService.validateFile(file);
  if (!validation.valid) {
    throw new AppError(validation.error, 400);
  }

  try {
    // Parse PDF and extract text
    const pdfData = await pdfService.parsePDF(file.path);

    // Generate file metadata
    const metadata = pdfService.generateFileMetadata(file, pdfData);

    // Store in database
    const fileId = file.filename;
    memoryDB.storePDF(fileId, pdfData.text, metadata);

    // Clean up temporary file
    pdfService.cleanupFile(file.path);

    res.status(201).json({
      success: true,
      message: "PDF uploaded and processed successfully",
      data: {
        fileId,
        fileName: file.originalname,
        fileUrl: `${req.protocol}://${req.get("host")}/uploads/${
          file.filename
        }`,
        pages: pdfData.pages,
        textLength: pdfData.text.length,
        uploadedAt: metadata.uploadedAt,
      },
    });
  } catch (error) {
    // Clean up file on error
    pdfService.cleanupFile(file.path);
    throw error;
  }
});

/**
 * Get PDF information
 * GET /api/pdf/:fileId
 */
const getPDFInfo = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  if (!memoryDB.hasFile(fileId)) {
    throw new AppError("PDF not found", 404);
  }

  const metadata = memoryDB.getFileMetadata(fileId);
  const content = memoryDB.getPDF(fileId);

  res.json({
    success: true,
    data: {
      fileId,
      ...metadata,
      textLength: content ? content.length : 0,
    },
  });
});

/**
 * Delete PDF file
 * DELETE /api/pdf/:fileId
 */
const deletePDF = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  if (!memoryDB.hasFile(fileId)) {
    throw new AppError("PDF not found", 404);
  }

  memoryDB.removeFile(fileId);

  res.json({
    success: true,
    message: "PDF deleted successfully",
  });
});

/**
 * Get all PDFs (for admin purposes)
 * GET /api/pdfs
 */
const getAllPDFs = asyncHandler(async (req, res) => {
  const files = memoryDB.getAllFiles();

  res.json({
    success: true,
    data: files,
    count: files.length,
  });
});

/**
 * Get storage statistics
 * GET /api/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = memoryDB.getStats();

  res.json({
    success: true,
    data: {
      ...stats,
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = {
  uploadPDF,
  getPDFInfo,
  deletePDF,
  getAllPDFs,
  getStats,
};
