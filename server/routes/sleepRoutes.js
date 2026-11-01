const express = require('express');
const router = express.Router();
const {
  getSleepLogs,
  logSleep,
  deleteSleepLog,
} = require('../controllers/sleepController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSleepLogs)
  .post(logSleep);

router.delete('/:id', deleteSleepLog);

module.exports = router;

