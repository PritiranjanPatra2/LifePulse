const express = require('express');
const router = express.Router();
const { getGoals, updateGoals } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(updateGoals)
  .put(updateGoals);

module.exports = router;

