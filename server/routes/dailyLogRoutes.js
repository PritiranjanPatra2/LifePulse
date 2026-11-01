const express = require('express');
const router = express.Router();
const {
  getDailyLogs,
  upsertDailyLog,
} = require('../controllers/dailyLogController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getDailyLogs)
  .post(upsertDailyLog);

module.exports = router;
