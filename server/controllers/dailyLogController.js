const DailyLog = require('../models/DailyLog');
const Goal = require('../models/Goal');

// @desc    Get daily logs (steps, mood, daily notes)
// @route   GET /api/daily-logs
// @access  Private
const getDailyLogs = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;

    const query = { user: req.user.id };

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const logs = await DailyLog.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update daily log (upsert by date)
// @route   POST /api/daily-logs
// @access  Private
const upsertDailyLog = async (req, res, next) => {
  try {
    const { date, steps, distanceKm, notes, overallMood } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }

    const strideLength = req.user.preferences?.strideLengthCm || 75;
    const stepCount = steps !== undefined ? Number(steps) : 0;
    const calculatedDistance = distanceKm !== undefined && distanceKm !== ''
      ? Number(distanceKm)
      : Math.round(((stepCount * strideLength) / 100000) * 100) / 100;

    const updatedLog = await DailyLog.findOneAndUpdate(
      { user: req.user.id, date },
      {
        $set: {
          steps: stepCount,
          distanceKm: calculatedDistance,
          ...(notes !== undefined && { notes }),
          ...(overallMood && { overallMood }),
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedLog,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDailyLogs,
  upsertDailyLog,
};
