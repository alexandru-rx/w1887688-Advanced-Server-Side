const express = require("express");
const Bid = require("../models/Bid");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

/**
 * @swagger
 * /bids/place:
 *   post:
 *     summary: Place a bid for tomorrow
 *     tags: [Bids]
 *     responses:
 *       200:
 *         description: Bid placed successfully
 *       400:
 *         description: Invalid bid
 */

router.post("/place", requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;

    // Validates bid amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Bid amount must be greater than 0" });
    }

    // Calculates tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Ensures user only places one bid per day
    const existingBid = await Bid.findOne({
      userId: req.session.userId,
      bidDate: tomorrow
    });

    if (existingBid) {
      return res.status(400).json({
        message: "You have already placed a bid for tomorrow. Use update bid instead."
      });
    }

    const bid = new Bid({
      userId: req.session.userId,
      amount,
      bidDate: tomorrow,
      status: "pending"
    });

    await bid.save();

    return res.json({
      message: "Bid placed successfully",
      bid
    });
  } catch (error) {
    console.error("BID PLACE ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

/**
 * @swagger
 * /bids/my-current:
 *   get:
 *     summary: Get current user's bid for tomorrow
 *     tags: [Bids]
 *     responses:
 *       200:
 *         description: Bid retrieved successfully
 *       404:
 *         description: No bid found for tomorrow
 *       500:
 *         description: Server error
 */

router.get("/my-current", requireAuth, async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const bid = await Bid.findOne({
      userId: req.session.userId,
      bidDate: tomorrow
    });

    if (!bid) {
      return res.status(404).json({ message: "No bid found for tomorrow" });
    }

    return res.json({ bid });
  } catch (error) {
    console.error("GET CURRENT BID ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

/**
 * @swagger
 * /bids/update:
 *   put:
 *     summary: Update an existing bid
 *     tags: [Bids]
 *     responses:
 *       200:
 *         description: Bid updated successfully
 *       400:
 *         description: Invalid bid update
 */

// Updates existing bid (increase only)

router.put("/update", requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;

    // Validates bid amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Bid amount must be greater than 0" });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const existingBid = await Bid.findOne({
      userId: req.session.userId,
      bidDate: tomorrow
    });

    if (!existingBid) {
      return res.status(404).json({
        message: "No existing bid found for tomorrow. Place a bid first."
      });
    }

    // Enforces increase-only rule for fairness
    if (amount <= existingBid.amount) {
      return res.status(400).json({
        message: "Updated bid must be higher than your current bid"
      });
    }

    existingBid.amount = amount;
    await existingBid.save();

    return res.json({
      message: "Bid updated successfully",
      bid: existingBid
    });
  } catch (error) {
    console.error("UPDATE BID ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

/**
 * @swagger
 * /bids/status:
 *   get:
 *     summary: Check current user's bid status
 *     tags: [Bids]
 *     responses:
 *       200:
 *         description: Bid status retrieved successfully
 *       500:
 *         description: Server error
 */

router.get("/status", requireAuth, async (req, res) => {
  try {

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0,0,0,0);

    // Gets highest bid for tomorrow
    const highestBid = await Bid.findOne({
      bidDate: tomorrow
    }).sort({ amount: -1 });

    if (!highestBid) {
      return res.json({
        status: "no bids yet"
      });
    }

    // Gets current user's bid
    const myBid = await Bid.findOne({
      userId: req.session.userId,
      bidDate: tomorrow
    });

    if (!myBid) {
      return res.json({
        status: "no bid placed"
      });
    }

    // Compares user bid with highest bid (blind bidding)
    if (highestBid.userId.toString() === req.session.userId) {
      return res.json({
        status: "winning"
      });
    } else {
      return res.json({
        status: "not winning"
      });
    }

  } catch (error) {
    console.error("BID STATUS ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error"
    });
  }
});

module.exports = router;
