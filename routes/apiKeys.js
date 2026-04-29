const express = require("express");
const crypto = require("crypto");
const ApiToken = require("../models/ApiToken");
const ApiUsage = require("../models/ApiUsage");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

/**
 * @swagger
 * /apiKeys/generate:
 *   post:
 *     summary: Generate API key
 *     tags: [API Keys]
 *     responses:
 *       200:
 *         description: API key generated successfully
 *       400:
 *         description: Invalid request
 */

router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name) {
    return res.status(400).json({ message: "Key name is required" });
    }

    if (permissions && !Array.isArray(permissions)) {
    return res.status(400).json({ message: "Permissions must be an array" });
    }

    // Creates random token value
    const token = crypto.randomBytes(24).toString("hex");

    const apiToken = await ApiToken.create({
      name,
      token,
      permissions: permissions || []
    });

    return res.json({
      message: "API key generated successfully",
      apiToken
    });
  } catch (error) {
    console.error("GENERATE API KEY ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
});

/**
 * @swagger
 * /apiKeys:
 *   get:
 *     summary: Get all API keys
 *     tags: [API Keys]
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *       500:
 *         description: Server error
 */

router.get("/", requireAuth, async (req, res) => {
  try {
    const apiKeys = await ApiToken.find().sort({ createdAt: -1 });
    return res.json({ apiKeys });
  } catch (error) {
    console.error("LIST API KEYS ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
});

/**
 * @swagger
 * /apiKeys/revoke/{id}:
 *   put:
 *     summary: Revoke an API key
 *     tags: [API Keys]
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       404:
 *         description: API key not found
 *       500:
 *         description: Server error
 */

router.put("/revoke/:id", requireAuth, async (req, res) => {
  try {
    const apiKey = await ApiToken.findById(req.params.id);

    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }

    apiKey.isRevoked = true;
    apiKey.revokedAt = new Date();
    await apiKey.save();

    return res.json({
      message: "API key revoked successfully",
      apiKey
    });
  } catch (error) {
    console.error("REVOKE API KEY ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
});

/**
 * @swagger
 * /apiKeys/usage:
 *   get:
 *     summary: Get API usage logs
 *     tags: [API Keys]
 *     responses:
 *       200:
 *         description: API usage retrieved successfully
 *       500:
 *         description: Server error
 */

router.get("/usage", requireAuth, async (req, res) => {
  try {
    const usageLogs = await ApiUsage.find()
      .populate("tokenId", "name token isRevoked")
      .sort({ accessedAt: -1 });

    return res.json({ usageLogs });
  } catch (error) {
    console.error("API USAGE ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
});

module.exports = router;
