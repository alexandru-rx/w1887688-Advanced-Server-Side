const mongoose = require("mongoose");

// Model is tracking API usage and access logs

const ApiUsageSchema = new mongoose.Schema({
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ApiToken",
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  accessedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ApiUsage", ApiUsageSchema);
