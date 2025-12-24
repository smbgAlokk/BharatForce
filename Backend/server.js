require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/database");
const path = require("path");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const orgRoutes = require("./routes/orgRoutes");
const uploadRoutes = require("./routes/uploadRoutes"); // Ensure this exists

console.log("1. Starting Server Script...");

// Database Connection
connectDB();

const app = express();

// 1. Trust the Proxy (Critical for secure cookies & IP detection on Render)
app.set("trust proxy", 1);

// 2. Configure CORS for Production
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local Development (Vite)
      "http://localhost:3000", // Local Development (React Standard)
      "https://bharatforce-9gsv.onrender.com", // ✅ YOUR LIVE PRODUCTION FRONTEND
      process.env.FRONTEND_URL, // Fallback for Env Var
    ].filter(Boolean), // Removes any undefined/null values
    credentials: true, // Allow cookies/headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));

// 3. Static Files (Fallback for legacy local uploads)
// Note: Since we moved to Cloudinary, this is strictly a backup.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 4. Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/upload", uploadRoutes); // Cloudinary Uploads

// Health Check Endpoint (Useful for Render auto-deploy checks)
app.get("/", (req, res) => {
  res.status(200).send("BharatForce Backend is Running 🚀");
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`3. 🚀 Server is running on Port: ${PORT}`);
  console.log(`   - Environment: ${process.env.NODE_ENV || "Development"}`);
});

// Handling Unhandled Promise Rejections (Crash Prevention)
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  // In production, we log the error but try to keep the server alive if possible,
  // or shut down gracefully if the DB connection is lost.
  console.log("Shutting down server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
