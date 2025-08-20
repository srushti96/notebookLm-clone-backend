/**
 * Chat Controller
 * Handles chat requests and AI interactions
 */

const { asyncHandler, AppError } = require("../middleware/errorHandler");
const aiService = require("../config/ai");
const memoryDB = require("../config/database");

/**
 * Process chat message with AI
 * POST /api/chat
 */
const processChat = asyncHandler(async (req, res) => {
  const { question, fileId, options = {} } = req.body;

  // Validate request
  if (!question || !fileId) {
    throw new AppError("Question and fileId are required", 400);
  }

  if (typeof question !== "string" || question.trim().length === 0) {
    throw new AppError("Question must be a non-empty string", 400);
  }

  // Get PDF content from database
  const context = memoryDB.getPDF(fileId);
  if (!context) {
    throw new AppError("PDF not found. Please upload the document first.", 404);
  }

  try {
    // Generate AI response
    const aiResponse = await aiService.generateResponse(
      question,
      context,
      options
    );

    res.json({
      success: true,
      data: {
        answer: aiResponse.answer,
        citations: aiResponse.citations,
        model: aiResponse.model,
        usage: aiResponse.usage,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat processing error:", error);

    // Handle specific AI service errors
    if (error.message.includes("API key")) {
      throw new AppError("AI service configuration error", 500);
    }

    if (error.message.includes("timeout")) {
      throw new AppError("AI service timeout. Please try again.", 408);
    }

    throw new AppError("Failed to process chat request", 500);
  }
});

/**
 * Get available AI models
 * GET /api/models
 */
const getAvailableModels = asyncHandler(async (req, res) => {
  try {
    const models = await aiService.getAvailableModels();

    res.json({
      success: true,
      data: {
        models,
        count: models.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to fetch models:", error);
    res.json({
      success: true,
      data: {
        models: [],
        count: 0,
        message: "Unable to fetch models at this time",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * Validate AI service configuration
 * GET /api/ai/status
 */
const getAIStatus = asyncHandler(async (req, res) => {
  try {
    const isValid = await aiService.validateAPIKey();

    res.json({
      success: true,
      data: {
        status: isValid ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        status: "error",
        message: "Unable to validate AI service",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
const healthCheck = asyncHandler(async (req, res) => {
  const stats = memoryDB.getStats();

  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      storage: stats,
    },
  });
});

module.exports = {
  processChat,
  getAvailableModels,
  getAIStatus,
  healthCheck,
};
