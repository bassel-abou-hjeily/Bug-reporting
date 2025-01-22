const express = require('express');
const { protect, authorizeRole } = require('../middleware/authMiddleware');
const { getBugSummary, getTeamPerformance, getBugHistory } = require('../controllers/dashboardController');
const router = express.Router();
router.get('/bugs', protect, authorizeRole('Manager'), getBugSummary);
router.get('/team-performance', protect, authorizeRole('Manager'), getTeamPerformance);
router.get('/bug-history/:id', protect, authorizeRole('Manager'), getBugHistory);
module.exports = router;
