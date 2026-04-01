const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../models/User");
const EmailToken = require("../models/EmailToken");

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new alumni user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Invalid input
 */

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validates required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Enforces university email domain restriction
    const allowedDomain = process.env.UNIVERSITY_DOMAIN || "westminster.ac.uk";
    const emailLower = String(email).toLowerCase().trim();

    if (!emailLower.endsWith("@" + allowedDomain)) {
      return res.status(400).json({
        message: `Email must be a university email ending with @${allowedDomain}`,
      });
    }

    // Passwords strength validation
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    if (!/[a-zA-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least 1 letter",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least 1 uppercase letter",
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least 1 number",
      });
    }

    // Prevents duplicate accounts
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hashes password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: emailLower,
      password: hashedPassword,
      verified: false,
    });

    await user.save();

    // Generates secure email verification token (stored as hash)
    const rawToken = crypto.randomBytes(32).toString("hex");

    const secret = process.env.VERIFY_TOKEN_SECRET;
    if (!secret) {
      return res.status(500).json({
        message: "Server misconfigured: VERIFY_TOKEN_SECRET missing in .env",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken + secret)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await EmailToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    // Generates verification link for user
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const verifyLink = `${baseUrl}/auth/verify?token=${rawToken}`;
    console.log("✅ VERIFY EMAIL LINK:", verifyLink);

    return res.json({
      message: "Registered. Please verify your email (check console link).",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Missing, invalid, used, or expired token
 *       500:
 *         description: Server error
 */
 
router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    const secret = process.env.VERIFY_TOKEN_SECRET;
    if (!secret) {
      return res.status(500).json({
        message: "Server misconfigured: VERIFY_TOKEN_SECRET missing in .env",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(String(token) + secret)
      .digest("hex");

    const record = await EmailToken.findOne({ tokenHash });

    if (!record) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (record.usedAt) {
      return res.status(400).json({ message: "Token already used" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    // Marks user as verified and invalidates token
    await User.updateOne({ _id: record.userId }, { $set: { verified: true } });

    record.usedAt = new Date();
    await record.save();

    return res.json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid login details
 */

// Authenticates user and creates session
 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailLower = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Prevents login if email not verified
    if (!user.verified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Stores user session
    req.session.userId = user._id;
    req.session.userEmail = user.email;

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Logout failed
 */
 
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid");
    return res.json({ message: "Logout successful" });
  });
});

module.exports = router;