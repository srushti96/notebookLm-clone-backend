/**
 * Main Application File
 * Configures Express app with middleware and routes
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Import routes
const pdfRoutes = require("./routes/pdfRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Create Express app
const app = express();

// Trust proxy for proper IP detection
app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Routes
app.use("/api", pdfRoutes);
app.use("/api", chatRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NotebookLM API Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      pdf: "/api/upload",
      chat: "/api/chat",
      health: "/api/health",
      models: "/api/models",
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
