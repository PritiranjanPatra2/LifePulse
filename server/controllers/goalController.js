const Goal = require('../models/Goal');

// @desc    Get user goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({ user: req.user.id });

    if (!goal) {
      goal = await Goal.create({
        user: req.user.id,
        waterMl: 4000,
        steps: 10000,
        calories: 2200,
        proteinGrams: 80,
        carbsGrams: 250,
        fatGrams: 65,
        exerciseMinutes: 45,
        sleepHours: 8,
        startingWeight: req.user.weight || 70,
        targetWeight: req.user.weight > 60 ? req.user.weight - 4 : 60,
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user goals
// @route   PUT /api/goals
// @access  Private
const updateGoals = async (req, res, next) => {
  try {
    let goal = await Goal.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGoals,
  updateGoals,
};

