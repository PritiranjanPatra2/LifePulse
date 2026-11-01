const SleepLog = require('../models/SleepLog');

const calculateSleepMinutes = (bedtime, wakeTime) => {
  if (!bedtime || !wakeTime) return 480;

  const [bHours, bMinutes] = bedtime.split(':').map(Number);
  const [wHours, wMinutes] = wakeTime.split(':').map(Number);

  const bedTotal = bHours * 60 + bMinutes;
  const wakeTotal = wHours * 60 + wMinutes;

  if (wakeTotal >= bedTotal) {
    return wakeTotal - bedTotal;
  } else {
    // Crosses midnight: from bedtime to 24:00 (1440 min) + from 00:00 to wakeTime
    return 1440 - bedTotal + wakeTotal;
  }
};

// @desc    Get sleep logs
// @route   GET /api/sleep
// @access  Private
const getSleepLogs = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;

    const query = { user: req.user.id };

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const logs = await SleepLog.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log sleep (create or update for date)
// @route   POST /api/sleep
// @access  Private
const logSleep = async (req, res, next) => {
  try {
    const { date, bedtime, wakeTime, durationMinutes, quality, notes } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }

    const calculatedDuration = durationMinutes !== undefined && durationMinutes !== ''
      ? Number(durationMinutes)
      : calculateSleepMinutes(bedtime || '23:00', wakeTime || '07:00');

    const log = await SleepLog.findOneAndUpdate(
      { user: req.user.id, date },
      {
        $set: {
          bedtime: bedtime || '23:00',
          wakeTime: wakeTime || '07:00',
          durationMinutes: calculatedDuration,
          quality: quality || 'good',
          notes: notes || '',
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete sleep log
// @route   DELETE /api/sleep/:id
// @access  Private
const deleteSleepLog = async (req, res, next) => {
  try {
    const log = await SleepLog.findOne({ _id: req.params.id, user: req.user.id });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Sleep record not found',
      });
    }

    await log.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sleep record removed',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSleepLogs,
  logSleep,
  deleteSleepLog,
  calculateSleepMinutes,
};
