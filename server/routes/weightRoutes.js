const express = require('express');
const router = express.Router();
const {
  getWeightLogs,
  logWeight,
  deleteWeightLog,
  getWeightSummary,
} = require('../controllers/weightController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getWeightSummary);

router.route('/')
  .get(getWeightLogs)
  .post(logWeight);

router.delete('/:id', deleteWeightLog);

module.exports = router;

