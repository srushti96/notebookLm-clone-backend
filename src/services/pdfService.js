/**
 * PDF Service
 * Handles PDF parsing, validation, and processing
 */

const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

class PDFService {
  constructor() {
    this.supportedTypes = ["application/pdf"];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  /**
   * Validate PDF file
   * @param {Object} file - Multer file object
   * @returns {Object} Validation result
   */
  validateFile(file) {
    if (!file) {
      return { valid: false, error: "No file provided" };
    }

    if (!this.supportedTypes.includes(file.mimetype)) {
      return { valid: false, error: "Only PDF files are supported" };
    }

    if (file.size > this.maxFileSize) {
      return { valid: false, error: "File size exceeds 10MB limit" };
    }

    return { valid: true };
  }

  /**
   * Parse PDF file and extract text
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<Object>} Parsed PDF data
   */
  async parsePDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);

      return {
        success: true,
        text: pdfData.text,
        pages: pdfData.numpages,
        info: pdfData.info,
        metadata: pdfData.metadata,
      };
    } catch (error) {
      console.error("PDF parsing error:", error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  /**
   * Extract text content from PDF
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} Extracted text content
   */
  async extractText(filePath) {
    const result = await this.parsePDF(filePath);
    return result.text;
  }

  /**
   * Get PDF metadata
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<Object>} PDF metadata
   */
  async getMetadata(filePath) {
    const result = await this.parsePDF(filePath);
    return {
      pages: result.pages,
      info: result.info,
      metadata: result.metadata,
    };
  }

  /**
   * Clean up temporary file
   * @param {string} filePath - Path to file to delete
   */
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up temporary file: ${filePath}`);
      }
    } catch (error) {
      console.error("Error cleaning up file:", error);
    }
  }

  /**
   * Generate file metadata
   * @param {Object} file - Multer file object
   * @param {Object} pdfData - Parsed PDF data
   * @returns {Object} File metadata
   */
  generateFileMetadata(file, pdfData) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      pages: pdfData.pages,
      textLength: pdfData.text.length,
      uploadedAt: new Date(),
      info: pdfData.info || {},
    };
  }
}

module.exports = new PDFService();
