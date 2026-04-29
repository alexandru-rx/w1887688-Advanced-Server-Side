const mongoose = require("mongoose");

// Model defines API keys used for client access

const ApiTokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
    permissions: {
    type: [String],
    default: []
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  revokedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("ApiToken", ApiTokenSchema);
