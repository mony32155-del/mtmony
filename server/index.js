// server.js
import express from "express";

// Initialize the Express application
const app = express();
const PORT = 3002;

// Middleware to parse incoming JSON payloads (useful for POST requests)

// --- ROUTES ---

// 1. Root Route (GET /)
app.get("/", (req, res) => {
  console.log("Request received for /");
  res.status(200).json({
    message: "Welcome to the basic Express Server!",
    status: "Running successfully",
    port: PORT,
  });
});

// 2. Health Check Route (GET /api/status)
// A dedicated endpoint to verify the server is up and responsive.
app.get("/api/status", (req, res) => {
  res.status(200).json({
    service: "Express Server",
    status: "OK", // Indicates the connection is working
    timestamp: new Date(),
  });
});

// 3. Get All Posts Route (GET /api/posts)
// Returns the mock data array.
app.get("/api/posts", (req, res) => {
  console.log("Request received for /api/posts");
  res.status(200).json(mockPosts);
});
// --- SERVER STARTUP ---

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running and ready for connection.`);
  console.log(`- Base URL: http://localhost:${PORT}`);
  console.log(`- Health Check: http://localhost:${PORT}/api/status`);
});
