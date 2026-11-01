const WeightLog = require('../models/WeightLog');
const Goal = require('../models/Goal');
const User = require('../models/User');

// @desc    Get weight logs
// @route   GET /api/weight
// @access  Private
const getWeightLogs = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const logs = await WeightLog.find(query).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log weight measurement
// @route   POST /api/weight
// @access  Private
const logWeight = async (req, res, next) => {
  try {
    const { date, weightKg, bodyFatPercentage, notes } = req.body;

    if (!weightKg) {
      return res.status(400).json({
        success: false,
        message: 'Weight in kg is required',
      });
    }

    const entryDate = date || new Date().toISOString().split('T')[0];
    const weightVal = Number(weightKg);

    const log = await WeightLog.findOneAndUpdate(
      { user: req.user.id, date: entryDate },
      {
        $set: {
          weightKg: weightVal,
          bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : null,
          notes: notes || '',
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Also update current weight on User model
    await User.findByIdAndUpdate(req.user.id, { weight: weightVal });

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete weight log
// @route   DELETE /api/weight/:id
// @access  Private
const deleteWeightLog = async (req, res, next) => {
  try {
    const log = await WeightLog.findOne({ _id: req.params.id, user: req.user.id });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Weight record not found',
      });
    }

    await log.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Weight record deleted',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get weight summary with starting, current, target and progress
// @route   GET /api/weight/summary
// @access  Private
const getWeightSummary = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ user: req.user.id });
    const user = await User.findById(req.user.id);
    const latestLog = await WeightLog.findOne({ user: req.user.id }).sort({ date: -1 });
    const firstLog = await WeightLog.findOne({ user: req.user.id }).sort({ date: 1 });

    const startingWeight = goal?.startingWeight || firstLog?.weightKg || user?.weight || 70;
    const currentWeight = latestLog?.weightKg || user?.weight || startingWeight;
    const targetWeight = goal?.targetWeight || (startingWeight > 60 ? startingWeight - 5 : 60);

    const totalChange = Math.round((currentWeight - startingWeight) * 10) / 10;
    const remainingToTarget = Math.round((currentWeight - targetWeight) * 10) / 10;

    const totalGoalDelta = startingWeight - targetWeight;
    let progressPercentage = 0;
    if (totalGoalDelta !== 0) {
      const achievedDelta = startingWeight - currentWeight;
      progressPercentage = Math.min(Math.max(Math.round((achievedDelta / totalGoalDelta) * 100), 0), 100);
    }

    // BMI calculation: weight / (height/100)^2
    const heightM = (user?.height || 170) / 100;
    const bmi = Math.round((currentWeight / (heightM * heightM)) * 10) / 10;

    res.status(200).json({
      success: true,
      data: {
        startingWeight,
        currentWeight,
        targetWeight,
        totalChange,
        remainingToTarget,
        progressPercentage,
        bmi,
        latestDate: latestLog?.date || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWeightLogs,
  logWeight,
  deleteWeightLog,
  getWeightSummary,
};

