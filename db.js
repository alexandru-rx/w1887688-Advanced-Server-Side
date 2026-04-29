const mongoose = require("mongoose");

// Establishes connection to MongoDB using environment variable
async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;

    // Ensures connection string is provided
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    // Connects to MongoDB database
    await mongoose.connect(mongoUri);
    console.log(" MongoDB connected");

  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
