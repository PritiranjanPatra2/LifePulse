const WaterLog = require('../models/WaterLog');
const Goal = require('../models/Goal');

// @desc    Get water logs for a specific date or date range
// @route   GET /api/water
// @access  Private
const getWaterLogs = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;

    const query = { user: req.user.id };

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const logs = await WaterLog.find(query).sort({ loggedAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add water transaction
// @route   POST /api/water
// @access  Private
const addWater = async (req, res, next) => {
  try {
    const { amountMl, date, note, loggedAt } = req.body;

    if (!amountMl || Number(amountMl) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid water amount in ml',
      });
    }

    const todayDate = date || new Date().toISOString().split('T')[0];

    const waterLog = await WaterLog.create({
      user: req.user.id,
      date: todayDate,
      amountMl: Number(amountMl),
      note: note || '',
      loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
    });

    // Calculate updated total for this date
    const dayLogs = await WaterLog.find({ user: req.user.id, date: todayDate });
    const currentTotalMl = dayLogs.reduce((acc, curr) => acc + curr.amountMl, 0);

    res.status(201).json({
      success: true,
      data: waterLog,
      dailyTotalMl: currentTotalMl,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update water log
// @route   PUT /api/water/:id
// @access  Private
const updateWater = async (req, res, next) => {
  try {
    const waterLog = await WaterLog.findOne({ _id: req.params.id, user: req.user.id });

    if (!waterLog) {
      return res.status(404).json({
        success: false,
        message: 'Water transaction not found',
      });
    }

    const { amountMl, note, loggedAt } = req.body;
    if (amountMl !== undefined) waterLog.amountMl = Number(amountMl);
    if (note !== undefined) waterLog.note = note;
    if (loggedAt) waterLog.loggedAt = new Date(loggedAt);

    await waterLog.save();

    res.status(200).json({
      success: true,
      data: waterLog,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete water transaction
// @route   DELETE /api/water/:id
// @access  Private
const deleteWater = async (req, res, next) => {
  try {
    const waterLog = await WaterLog.findOne({ _id: req.params.id, user: req.user.id });

    if (!waterLog) {
      return res.status(404).json({
        success: false,
        message: 'Water transaction not found',
      });
    }

    await waterLog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Water log removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Undo the latest water entry for a date
// @route   POST /api/water/undo
// @access  Private
const undoLastWater = async (req, res, next) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const lastLog = await WaterLog.findOne({ user: req.user.id, date: targetDate }).sort({
      loggedAt: -1,
    });

    if (!lastLog) {
      return res.status(404).json({
        success: false,
        message: 'No water entries to undo for this date',
      });
    }

    await lastLog.deleteOne();

    const remainingLogs = await WaterLog.find({ user: req.user.id, date: targetDate });
    const currentTotalMl = remainingLogs.reduce((acc, curr) => acc + curr.amountMl, 0);

    res.status(200).json({
      success: true,
      message: 'Latest water log undone',
      dailyTotalMl: currentTotalMl,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get water summary for a date (target, total, %, logs)
// @route   GET /api/water/summary
// @access  Private
const getWaterSummary = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const goal = await Goal.findOne({ user: req.user.id });
    const targetMl = goal ? goal.waterMl : 4000;

    const logs = await WaterLog.find({ user: req.user.id, date }).sort({ loggedAt: -1 });
    const totalMl = logs.reduce((sum, item) => sum + item.amountMl, 0);
    const percentage = Math.min(Math.round((totalMl / targetMl) * 100), 100);
    const remainingMl = Math.max(targetMl - totalMl, 0);

    res.status(200).json({
      success: true,
      data: {
        date,
        totalMl,
        targetMl,
        percentage,
        remainingMl,
        count: logs.length,
        logs,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWaterLogs,
  addWater,
  updateWater,
  deleteWater,
  undoLastWater,
  getWaterSummary,
};
