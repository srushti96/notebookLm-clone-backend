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

// Trust proxy for proper IP detection (important for Render.com and other services)
app.set("trust proxy", 1);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Define allowed origins
    const allowedOrigins = [
      // Production frontend
      "https://notebooklm-353459.netlify.app",
      // Local development
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      // Alternative local ports
      "http://localhost:5174",
      "http://localhost:4173",
    ];

    console.log("🌐 CORS Check - Origin:", origin);

    // Check if the origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log("✅ CORS - Origin allowed");
      return callback(null, true);
    }

    // For development, allow any localhost or 127.0.0.1
    if (process.env.NODE_ENV !== "production") {
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        console.log("✅ CORS - Development localhost allowed");
        return callback(null, true);
      }
    }

    console.log("❌ CORS - Origin not allowed:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `📨 ${req.method} ${req.path} - Origin: ${req.get("Origin") || "none"}`
  );
  next();
});

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
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      pdf: "/api/upload",
      chat: "/api/chat",
      health: "/api/health",
      models: "/api/models",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
