/**
 * Chat Routes
 * Handles all chat and AI-related endpoints
 */

const express = require("express");
const {
  processChat,
  getAvailableModels,
  getAIStatus,
  healthCheck,
} = require("../controllers/chatController");

const router = express.Router();

// Process chat message
router.post("/chat", processChat);

// Get available AI models
router.get("/models", getAvailableModels);

// Get AI service status
router.get("/ai/status", getAIStatus);

// Health check
router.get("/health", healthCheck);

module.exports = router;
