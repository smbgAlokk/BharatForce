require("dotenv").config();
const mongoose = require("mongoose");

// Database Connection
const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  console.log("2. Attempting to connect to MongoDB..."); // Debug Log

  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"));
  // Here instead of .catch we use Unhandled Promise Rejection (in server.js)
};

module.exports = connectDB;
