const express = require("express");
const Profile = require("../models/Profile");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

function buildFilterQuery(query) {
  const filter = {};

  if (query.programme) {
    filter.programme = query.programme;
  }

  if (query.industrySector) {
    filter.industrySector = query.industrySector;
  }

  if (query.graduationYear) {
    filter.graduationYear = Number(query.graduationYear);
  }

  return filter;
}

/**
 * @swagger
 * /analytics/summary:
 *   get:
 *     summary: Get dashboard summary analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *         description: Optional programme filter
 *       - in: query
 *         name: industrySector
 *         schema:
 *           type: string
 *         description: Optional industry sector filter
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: number
 *         description: Optional graduation year filter
 *     responses:
 *       200:
 *         description: Summary analytics retrieved successfully
 *       401:
 *         description: User is not authenticated
 *       500:
 *         description: Server error
 */

router.get("/summary", requireAuth, async (req, res) => {
  try {

    const filter = buildFilterQuery(req.query);

    const totalAlumni = await Profile.countDocuments(filter);
    const programmes = await Profile.distinct("programme", filter);
    const totalProgrammes = programmes.length;

    const topIndustry = await Profile.aggregate([
    { $match: filter },
    { $group: { _id: "$industrySector", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
    ]);

    res.json({
      totalAlumni,
      totalProgrammes,
      topIndustry: topIndustry[0]?._id || "N/A"
    });

  } catch (error) {
    console.error("SUMMARY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /analytics/by-industry:
 *   get:
 *     summary: Get alumni grouped by industry sector
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *         description: Optional programme filter
 *       - in: query
 *         name: industrySector
 *         schema:
 *           type: string
 *         description: Optional industry sector filter
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: number
 *         description: Optional graduation year filter
 *     responses:
 *       200:
 *         description: Industry analytics retrieved successfully
 *       401:
 *         description: User is not authenticated
 *       500:
 *         description: Server error
 */

router.get("/by-industry", requireAuth, async (req, res) => {
  try {

    const filter = buildFilterQuery(req.query);

    const data = await Profile.aggregate([
    { $match: filter },
    { $group: { _id: "$industrySector", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
    ]);

    res.json(
      data.map(item => ({
        label: item._id || "Unknown",
        value: item.count
      }))
    );

  } catch (error) {
    console.error("INDUSTRY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /analytics/by-programme:
 *   get:
 *     summary: Get alumni grouped by programme
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *         description: Optional programme filter
 *       - in: query
 *         name: industrySector
 *         schema:
 *           type: string
 *         description: Optional industry sector filter
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: number
 *         description: Optional graduation year filter
 *     responses:
 *       200:
 *         description: Programme analytics retrieved successfully
 *       401:
 *         description: User is not authenticated
 *       500:
 *         description: Server error
 */

router.get("/by-programme", requireAuth, async (req, res) => {
  try {

    const filter = buildFilterQuery(req.query);

    const data = await Profile.aggregate([
    { $match: filter },
    { $group: { _id: "$programme", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
    ]);

    res.json(
      data.map(item => ({
        label: item._id || "Unknown",
        value: item.count
      }))
    );

  } catch (error) {
    console.error("PROGRAMME ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /analytics/by-graduation-year:
 *   get:
 *     summary: Get alumni grouped by graduation year
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *         description: Optional programme filter
 *       - in: query
 *         name: industrySector
 *         schema:
 *           type: string
 *         description: Optional industry sector filter
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: number
 *         description: Optional graduation year filter
 *     responses:
 *       200:
 *         description: Graduation year analytics retrieved successfully
 *       401:
 *         description: User is not authenticated
 *       500:
 *         description: Server error
 */

router.get("/by-graduation-year", requireAuth, async (req, res) => {
  try {

    const filter = buildFilterQuery(req.query);

    const data = await Profile.aggregate([
    { $match: filter },
    { $group: { _id: "$graduationYear", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
    ]);

    res.json(
      data.map(item => ({
        label: item._id || "Unknown",
        value: item.count
      }))
    );

  } catch (error) {
    console.error("YEAR ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /analytics/skills:
 *   get:
 *     summary: Get most common alumni skills
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: programme
 *         schema:
 *           type: string
 *         description: Optional programme filter
 *       - in: query
 *         name: industrySector
 *         schema:
 *           type: string
 *         description: Optional industry sector filter
 *       - in: query
 *         name: graduationYear
 *         schema:
 *           type: number
 *         description: Optional graduation year filter
 *     responses:
 *       200:
 *         description: Skills analytics retrieved successfully
 *       401:
 *         description: User is not authenticated
 *       500:
 *         description: Server error
 */

router.get("/skills", requireAuth, async (req, res) => {
  try {
    const filter = buildFilterQuery(req.query);

    const data = await Profile.aggregate([
      { $match: filter },
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    res.json(
      data.map(item => ({
        label: item._id || "Unknown",
        value: item.count
      }))
    );
  } catch (error) {
    console.error("SKILLS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
