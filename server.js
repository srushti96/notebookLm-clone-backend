/**
 * Server Entry Point
 * Starts the Express application
 */

const app = require("./src/app");

// Environment variables
const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
});

// Handle server errors
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
});

module.exports = server;
