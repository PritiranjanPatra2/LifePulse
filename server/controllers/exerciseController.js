const Exercise = require('../models/Exercise');

// MET estimates by category for realistic calorie burn calculation:
// Calories = MET * Weight(kg) * Duration(hours)
const MET_MAP = {
  Walking: { low: 2.8, medium: 3.5, high: 4.5 },
  Running: { low: 7.0, medium: 9.8, high: 11.5 },
  Gym: { low: 3.5, medium: 5.5, high: 8.0 },
  Cycling: { low: 4.0, medium: 6.8, high: 9.0 },
  Yoga: { low: 2.5, medium: 3.5, high: 4.5 },
  Swimming: { low: 5.0, medium: 7.0, high: 9.8 },
  Football: { low: 6.0, medium: 8.0, high: 10.0 },
  Badminton: { low: 4.5, medium: 6.0, high: 7.5 },
  Stretching: { low: 2.0, medium: 2.5, high: 3.0 },
  Other: { low: 3.5, medium: 5.0, high: 7.0 },
};

const EMOJI_MAP = {
  Walking: '🚶',
  Running: '🏃',
  Gym: '🏋️',
  Cycling: '🚴',
  Yoga: '🧘',
  Swimming: '🏊',
  Football: '⚽',
  Badminton: '🏸',
  Stretching: '🤸',
  Other: '⚡',
};

const calculateCalories = (category, intensity = 'medium', durationMinutes = 30, userWeight = 70) => {
  const metRates = MET_MAP[category] || MET_MAP.Other;
  const met = metRates[intensity] || metRates.medium;
  const hours = durationMinutes / 60;
  return Math.round(met * userWeight * hours);
};

// @desc    Get exercises
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res, next) => {
  try {
    const { date, startDate, endDate, category } = req.query;

    const query = { user: req.user.id };

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const exercises = await Exercise.find(query).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create an exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = async (req, res, next) => {
  try {
    const { name, category, emoji, durationMinutes, startTime, intensity, caloriesBurned, notes, date } = req.body;

    if (!name || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Exercise name and duration are required',
      });
    }

    const cat = category || 'Other';
    const resolvedEmoji = emoji || EMOJI_MAP[cat] || '⚡';
    const dur = Number(durationMinutes);
    const intens = intensity || 'medium';

    const calculatedCals = caloriesBurned !== undefined && caloriesBurned !== ''
      ? Number(caloriesBurned)
      : calculateCalories(cat, intens, dur, req.user.weight || 70);

    const exercise = await Exercise.create({
      user: req.user.id,
      date: date || new Date().toISOString().split('T')[0],
      name: name.trim(),
      category: cat,
      emoji: resolvedEmoji,
      durationMinutes: dur,
      startTime: startTime || '07:00',
      intensity: intens,
      caloriesBurned: calculatedCals,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      data: exercise,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private
const updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOne({ _id: req.params.id, user: req.user.id });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    const { name, category, emoji, durationMinutes, startTime, intensity, caloriesBurned, notes, date } = req.body;

    if (name) exercise.name = name.trim();
    if (category) exercise.category = category;
    if (emoji) exercise.emoji = emoji;
    if (durationMinutes !== undefined) exercise.durationMinutes = Number(durationMinutes);
    if (startTime) exercise.startTime = startTime;
    if (intensity) exercise.intensity = intensity;
    if (notes !== undefined) exercise.notes = notes;
    if (date) exercise.date = date;

    if (caloriesBurned !== undefined && caloriesBurned !== '') {
      exercise.caloriesBurned = Number(caloriesBurned);
    } else if (durationMinutes !== undefined || category || intensity) {
      exercise.caloriesBurned = calculateCalories(
        exercise.category,
        exercise.intensity,
        exercise.durationMinutes,
        req.user.weight || 70
      );
    }

    await exercise.save();

    res.status(200).json({
      success: true,
      data: exercise,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private
const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOne({ _id: req.params.id, user: req.user.id });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    await exercise.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Exercise deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
};
