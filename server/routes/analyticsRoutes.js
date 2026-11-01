const express = require('express');
const router = express.Router();
const { getAnalyticsOverview } = require('../controllers/analyticsController');
const { getSmartInsights } = require('../controllers/insightsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', getAnalyticsOverview);
router.get('/insights', getSmartInsights);

module.exports = router;

