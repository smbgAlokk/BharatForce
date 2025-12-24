require("dotenv").config();
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/database");
const path = require("path");

// Handling Uncaught Exception
// process.on("uncaughtException", (err) => {
//   console.log(`Error: ${err.message}`);
//   console.log()`Shutting down the server due to Unhandled Promise Rejection-1`;
//   process.exit(1);
// });

// config
// dotenv.config({ path: "Backend/config/config.env" });

// Import Routes
const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const orgRoutes = require("./routes/orgRoutes");

console.log("1. Starting Server Script..."); // Debug Log

console.log("MONGO_URI =", process.env.MONGO_URI);

// Database Connection
connectDB();

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// 1. MAKE UPLOADS FOLDER PUBLIC
// This allows URLs like http://localhost:5000/uploads/filename.pdf to work
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// 2. REGISTER UPLOAD ROUTE (We will create this file next)
app.use("/api/upload", require("./routes/uploadRoutes"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/org", orgRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  // console.log(
  //   `3. 🚀 Server is running on http://localhost:${process.env.PORT}`
  // ); // Debug Log
  console.log(`3. 🚀 Server is running on http://0.0.0.0:${PORT}`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  // console.log(`Shutting down the server due to Unhandled Promise Rejection-2`);

  server.close(() => {
    process.exit(1);
  });
});
