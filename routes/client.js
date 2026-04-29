const express = require("express");
const ParticipatingAlumnus = require("../models/ParticipatingAlumnus");
const Profile = require("../models/Profile");
const requireApiKey = require("../middleware/requireApiKey");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Limits client requests to reduce abuse of Client-facing endpoints (1 minute and 100 requests max per min)
const clientRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, 
  message: {
    message: "Too many requests. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @swagger
 * /client/participatingAlumnus/tomorrow:
 *   get:
 *     summary: Get tomorrow's participating alumnus for client access
 *     tags: [Client]
 *     responses:
 *       200:
 *         description: Participating alumnus retrieved successfully
 *       404:
 *         description: No participating alumnus found
 */

router.get(
  "/participatingAlumnus/tomorrow",
  clientRateLimiter,
  requireApiKey("read:alumni_of_day"),
  async (req, res) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const participatingAlumnus = await ParticipatingAlumnus.findOne({
        featureDate: tomorrow
      });

      if (!participatingAlumnus) {
        return res.status(404).json({
          message: "No participating alumnus for tomorrow"
        });
      }

      // Retrieves the public profile linked to the selected alumnus
      const profile = await Profile.findOne({
        userId: participatingAlumnus.userId
      });

      if (!profile) {
        return res.status(404).json({
          message: "Profile not found"
        });
      }

      return res.json({
        message: "Participating alumnus retrieved successfully",
        profile
      });
    } catch (error) {
      console.error("CLIENT PARTICIPATING ALUMNUS ERROR:", error);
      return res.status(500).json({
        message: error.message || "Server error"
      });
    }
  }
);

module.exports = router;
