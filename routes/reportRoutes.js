const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateReport } = require("../controllers/reportController");

router.get("/", protect, generateReport); // ✅ New route for reports

module.exports = router;
