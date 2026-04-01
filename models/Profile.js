const mongoose = require("mongoose");

// Model defines the structure of profile data stored in the database

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ""
  },
  linkedinUrl: {
    type: String,
    default: ""
  },
  profileImageUrl: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Profile", ProfileSchema);
