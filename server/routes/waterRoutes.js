const express = require('express');
const router = express.Router();
const {
  getWaterLogs,
  addWater,
  updateWater,
  deleteWater,
  undoLastWater,
  getWaterSummary,
} = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getWaterSummary);
router.post('/undo', undoLastWater);

router.route('/')
  .get(getWaterLogs)
  .post(addWater);

router.route('/:id')
  .put(updateWater)
  .delete(deleteWater);

module.exports = router;
