const express = require("express");
const Bid = require("../models/Bid");
const Profile = require("../models/Profile");
const ParticipatingAlumnus = require("../models/ParticipatingAlumnus");

const router = express.Router();

/**
 * @swagger
 * /participatingAlumnus/select-winner:
 *   post:
 *     summary: Select the winning bidder for tomorrow
 *     tags: [Participating Alumnus]
 *     responses:
 *       200:
 *         description: Winner selected successfully
 *       400:
 *         description: Winner already selected or limit reached
 *       404:
 *         description: No bids found
 */

router.post("/select-winner", async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Finds highest bid for the selected date
    const highestBid = await Bid.findOne({
      bidDate: tomorrow
    }).sort({ amount: -1, createdAt: 1 });

    if (!highestBid) {
      return res.status(404).json({ message: "No bids found for tomorrow" });
    }

    // Ensures only one winner is selected per day
    const existingParticipatingAlumnus = await ParticipatingAlumnus.findOne({
      featureDate: tomorrow
    });

    if (existingParticipatingAlumnus) {
      return res.status(400).json({
        message: "Winner already selected for tomorrow"
      });
    }

    // Checks monthly win limit (max 3 wins per month)
    const monthStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1);
    const nextMonthStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth() + 1, 1);

    const winCountThisMonth = await ParticipatingAlumnus.countDocuments({
      userId: highestBid.userId,
      featureDate: {
        $gte: monthStart,
        $lt: nextMonthStart
      }
    });

    if (winCountThisMonth >= 3) {
      return res.status(400).json({
        message: "This alumnus has already reached the maximum of 3 wins this month"
      });
    }

    // Creates participating alumnus record
    const participatingAlumnus = await ParticipatingAlumnus.create({
      userId: highestBid.userId,
      bidId: highestBid._id,
      featureDate: tomorrow
    });

    // Updates bid statuses after selecting a winner
    await Bid.updateMany(
      { bidDate: tomorrow },
      { $set: { status: "lost" } }
    );

    await Bid.updateOne(
      { _id: highestBid._id },
      { $set: { status: "winning" } }
    );

    return res.json({
      message: "Winner selected successfully",
      participatingAlumnus
    });
  } catch (error) {
    console.error("SELECT WINNER ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
});

/**
 * @swagger
 * /participatingAlumnus/today:
 *   get:
 *     summary: Get today's participating alumnus
 *     tags: [Participating Alumnus]
 *     responses:
 *       200:
 *         description: Participating alumnus retrieved successfully
 *       404:
 *         description: No participating alumnus or profile found
 *       500:
 *         description: Server error
 */

router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const participatingAlumnus = await ParticipatingAlumnus.findOne({
      featureDate: today
    });

    if (!participatingAlumnus) {
      return res.status(404).json({
        message: "No participating alumnus for today"
      });
    }

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
    console.error("GET TODAY PARTICIPATING ALUMNUS ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
});

/**
 * @swagger
 * /participatingAlumnus/tomorrow:
 *   get:
 *     summary: Get tomorrow's participating alumnus
 *     tags: [Participating Alumnus]
 *     responses:
 *       200:
 *         description: Participating alumnus retrieved successfully
 *       404:
 *         description: No participating alumnus or profile found
 *       500:
 *         description: Server error
 */

router.get("/tomorrow", async (req, res) => {
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

    const profile = await Profile.findOne({
      userId: participatingAlumnus.userId
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    return res.json({
      message: "Tomorrow's participating alumnus retrieved successfully",
      profile
    });
  } catch (error) {
    console.error("GET TOMORROW PARTICIPATING ALUMNUS ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
});

module.exports = router;