const express = require('express');
const router = express.Router();
const {
  getFoods,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFoods)
  .post(createFood);

router.route('/:id')
  .put(updateFood)
  .delete(deleteFood);

module.exports = router;
