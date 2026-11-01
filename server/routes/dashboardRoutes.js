const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/:date', protect, getDashboardData);

module.exports = router;
