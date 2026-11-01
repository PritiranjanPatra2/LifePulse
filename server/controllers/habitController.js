const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// Helper to compute habit streaks
const calculateStreak = async (userId, habitId) => {
  const logs = await HabitLog.find({
    user: userId,
    habit: habitId,
    completed: true,
  }).sort({ date: -1 });

  if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const datesSet = new Set(logs.map((l) => l.date));
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = datesSet.has(todayStr) ? new Date(today) : new Date(yesterday);

  if (datesSet.has(todayStr) || datesSet.has(yesterdayStr)) {
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (datesSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  const sortedDates = Array.from(datesSet).sort();
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate = null;

  for (const dStr of sortedDates) {
    const cur = new Date(dStr);
    if (!prevDate) {
      currentRun = 1;
    } else {
      const diffDays = Math.round((cur - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    if (currentRun > longestStreak) longestStreak = currentRun;
    prevDate = cur;
  }

  return { currentStreak, longestStreak };
};

// @desc    Get user habits with status for a date
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Check if user has habits, if not, create helpful defaults
    let habits = await Habit.find({ user: req.user.id, isActive: true });
    if (habits.length === 0) {
      const defaultHabits = [
        { name: 'Morning Walk', emoji: '🚶', color: '#1ea678', targetDaysPerWeek: 7 },
        { name: 'Drink 3L+ Water', emoji: '💧', color: '#06b6d4', targetDaysPerWeek: 7 },
        { name: 'No Sugary Drinks', emoji: '🥤', color: '#ef4444', targetDaysPerWeek: 6 },
        { name: '10 Mins Meditation', emoji: '🧘', color: '#8b5cf6', targetDaysPerWeek: 5 },
        { name: 'Sleep Before 11 PM', emoji: '🌙', color: '#3b82f6', targetDaysPerWeek: 7 },
      ];
      habits = await Habit.insertMany(
        defaultHabits.map((h) => ({ ...h, user: req.user.id }))
      );
    }

    const logsForDate = await HabitLog.find({
      user: req.user.id,
      date,
    });
    const completedHabitMap = new Map();
    logsForDate.forEach((log) => {
      completedHabitMap.set(log.habit.toString(), log.completed);
    });

    const enrichedHabits = await Promise.all(
      habits.map(async (habit) => {
        const { currentStreak, longestStreak } = await calculateStreak(req.user.id, habit._id);
        return {
          ...habit.toObject(),
          isCompletedToday: completedHabitMap.get(habit._id.toString()) || false,
          currentStreak,
          longestStreak,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedHabits.length,
      data: enrichedHabits,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res, next) => {
  try {
    const { name, emoji, color, category, targetDaysPerWeek } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Habit name is required',
      });
    }

    const habit = await Habit.create({
      user: req.user.id,
      name: name.trim(),
      emoji: emoji || '✨',
      color: color || '#1ea678',
      category: category || 'General',
      targetDaysPerWeek: Number(targetDaysPerWeek) || 7,
    });

    res.status(201).json({
      success: true,
      data: {
        ...habit.toObject(),
        isCompletedToday: false,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    const updated = await Habit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found',
      });
    }

    await habit.deleteOne();
    await HabitLog.deleteMany({ habit: req.params.id, user: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Habit removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle habit completion for a specific date
// @route   POST /api/habits/log
// @access  Private
const toggleHabitLog = async (req, res, next) => {
  try {
    const { habitId, date } = req.body;

    if (!habitId) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID is required',
      });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    let log = await HabitLog.findOne({
      user: req.user.id,
      habit: habitId,
      date: targetDate,
    });

    if (log) {
      log.completed = !log.completed;
      await log.save();
    } else {
      log = await HabitLog.create({
        user: req.user.id,
        habit: habitId,
        date: targetDate,
        completed: true,
      });
    }

    const { currentStreak, longestStreak } = await calculateStreak(req.user.id, habitId);

    res.status(200).json({
      success: true,
      data: {
        habitId,
        date: targetDate,
        completed: log.completed,
        currentStreak,
        longestStreak,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get habit analytics (heatmap data, completion rates, achievements)
// @route   GET /api/habits/analytics
// @access  Private
const getHabitAnalytics = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 60; // default 60 days for calendar heatmap
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const logs = await HabitLog.find({
      user: req.user.id,
      date: { $gte: startStr, $lte: endStr },
      completed: true,
    });

    // Group completions by date for GitHub style heatmap
    const dateCounts = {};
    logs.forEach((log) => {
      dateCounts[log.date] = (dateCounts[log.date] || 0) + 1;
    });

    const heatmap = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      const dStr = curr.toISOString().split('T')[0];
      heatmap.push({
        date: dStr,
        count: dateCounts[dStr] || 0,
      });
      curr.setDate(curr.getDate() + 1);
    }

    // Calculate badges
    const totalHabits = await Habit.countDocuments({ user: req.user.id, isActive: true });
    const habits = await Habit.find({ user: req.user.id, isActive: true });
    let maxCurrentStreak = 0;
    for (const h of habits) {
      const { currentStreak } = await calculateStreak(req.user.id, h._id);
      if (currentStreak > maxCurrentStreak) maxCurrentStreak = currentStreak;
    }

    const totalCompletions = logs.length;

    const badges = [
      {
        id: 'starter',
        name: 'First Step',
        description: 'Completed your first habit',
        icon: '🌱',
        achieved: totalCompletions >= 1,
      },
      {
        id: 'streak-3',
        name: 'Consistency Kick',
        description: 'Achieved a 3-day habit streak',
        icon: '🔥',
        achieved: maxCurrentStreak >= 3,
      },
      {
        id: 'streak-7',
        name: 'Week Champion',
        description: 'Achieved a 7-day habit streak',
        icon: '⚡',
        achieved: maxCurrentStreak >= 7,
      },
      {
        id: 'century',
        name: 'Habit Master',
        description: 'Completed 50 habit entries',
        icon: '👑',
        achieved: totalCompletions >= 50,
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        heatmap,
        totalCompletions,
        maxCurrentStreak,
        badges,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitLog,
  getHabitAnalytics,
};
