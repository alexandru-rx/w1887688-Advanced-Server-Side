const express = require("express");
const Profile = require("../models/Profile");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

/**
 * @swagger
 * /profile:
 *   post:
 *     summary: Create or update user profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile saved successfully
 *       400:
 *         description: Full name is required
 *       500:
 *         description: Server error
 */

router.post("/", requireAuth, async (req, res) => {
  try {
    const { fullName, bio, linkedinUrl, profileImageUrl } = req.body;

    // Basic validation for required fields
    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    // Prepares profile data 
    const updateData = {
      fullName,
      bio: bio || "",
      linkedinUrl: linkedinUrl || "",
      profileImageUrl: profileImageUrl || "",
      updatedAt: new Date()
    };

    // Update existing profile/ Create new profile 
    const profile = await Profile.findOneAndUpdate(
      { userId: req.session.userId },
      {
        $set: updateData,
        $setOnInsert: {
          userId: req.session.userId,
          createdAt: new Date()
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    return res.json({
      message: "Profile saved successfully",
      profile
    });

  } catch (error) {
    console.error("PROFILE SAVE ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

/**
 * @swagger
 * /profile/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */

router.get("/me", requireAuth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.session.userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({ profile });

  } catch (error) {
    console.error("PROFILE GET ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router;
