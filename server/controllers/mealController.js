const Meal = require('../models/Meal');

const calculateMealTotals = (items = []) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  items.forEach((item) => {
    totalCalories += Number(item.calories) || 0;
    totalProtein += Number(item.protein) || 0;
    totalCarbs += Number(item.carbs) || 0;
    totalFat += Number(item.fat) || 0;
  });

  return {
    totalCalories: Math.round(totalCalories * 10) / 10,
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
  };
};

// @desc    Get meals for a date or date range
// @route   GET /api/meals
// @access  Private
const getMeals = async (req, res, next) => {
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

    const meals = await Meal.find(query).sort({ date: -1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a meal
// @route   POST /api/meals
// @access  Private
const createMeal = async (req, res, next) => {
  try {
    const { date, category, name, emoji, items, notes } = req.body;

    if (!date || !category) {
      return res.status(400).json({
        success: false,
        message: 'Date and category are required',
      });
    }

    const totals = calculateMealTotals(items || []);

    const meal = await Meal.create({
      user: req.user.id,
      date,
      category,
      name: name || category,
      emoji: emoji || '🍽️',
      items: items || [],
      ...totals,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      data: meal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user.id });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal record not found',
      });
    }

    const { items, name, emoji, notes, category, date } = req.body;

    if (items) {
      meal.items = items;
      const totals = calculateMealTotals(items);
      meal.totalCalories = totals.totalCalories;
      meal.totalProtein = totals.totalProtein;
      meal.totalCarbs = totals.totalCarbs;
      meal.totalFat = totals.totalFat;
    }

    if (name) meal.name = name;
    if (emoji) meal.emoji = emoji;
    if (notes !== undefined) meal.notes = notes;
    if (category) meal.category = category;
    if (date) meal.date = date;

    await meal.save();

    res.status(200).json({
      success: true,
      data: meal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user.id });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal record not found',
      });
    }

    await meal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Meal deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
};

