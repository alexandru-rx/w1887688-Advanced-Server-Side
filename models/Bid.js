const mongoose = require("mongoose");

// Model defines the structure of the bidding data for the system

const BidSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 1
  },

  bidDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "winning", "lost"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Bid", BidSchema);
