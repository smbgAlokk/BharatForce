const mongoose = require("mongoose");

// Database Connection
const connectDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/bharatforce";

  console.log("2. Attempting to connect to MongoDB..."); // Debug Log

  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"));
  // Here instead of .catch we use Unhandled Promise Rejection (in server.js)
};

module.exports = connectDB;
