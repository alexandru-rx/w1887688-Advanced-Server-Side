const mongoose = require("mongoose");

// Model defines the featured alumnus records for each day

const ParticipatingAlumnusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bid",
    required: true
  },
  featureDate: {
    type: Date,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ParticipatingAlumnus", ParticipatingAlumnusSchema);