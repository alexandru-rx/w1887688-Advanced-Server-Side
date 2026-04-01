const ApiToken = require("../models/ApiToken");
const ApiUsage = require("../models/ApiUsage");

// Middleware used validate API key and restrict access to authorised clients

async function requireApiKey(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid Authorization header"
      });
    }

    const tokenValue = authHeader.split(" ")[1];

    const apiToken = await ApiToken.findOne({ token: tokenValue });

    if (!apiToken) {
      return res.status(401).json({
        message: "Invalid API token"
      });
    }

    if (apiToken.isRevoked) {
      return res.status(403).json({
        message: "API token has been revoked"
      });
    }

    await ApiUsage.create({
      tokenId: apiToken._id,
      endpoint: req.originalUrl,
      method: req.method
    });

    req.apiToken = apiToken;
    next();
  } catch (error) {
    console.error("API KEY MIDDLEWARE ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
}

module.exports = requireApiKey;