const Food = require('../models/Food');

// @desc    Get foods (system defaults + user custom foods)
// @route   GET /api/foods
// @access  Private
const getFoods = async (req, res, next) => {
  try {
    const { q, category, customOnly } = req.query;

    const filter = {
      $or: [{ user: null }, { user: req.user.id }],
    };

    if (customOnly === 'true') {
      filter.$or = [{ user: req.user.id }];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (q && q.trim()) {
      filter.name = { $regex: q.trim(), $options: 'i' };
    }

    const foods = await Food.find(filter).sort({ isCustom: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a custom food item
// @route   POST /api/foods
// @access  Private
const createFood = async (req, res, next) => {
  try {
    const {
      name,
      emoji,
      category,
      servingSize,
      servingUnit,
      calories,
      protein,
      carbs,
      fat,
      fiber,
    } = req.body;

    if (!name || calories === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Food name and calories are required',
      });
    }

    const food = await Food.create({
      user: req.user.id,
      name: name.trim(),
      emoji: emoji || '🍲',
      category: category || 'Other Foods',
      servingSize: Number(servingSize) || 100,
      servingUnit: servingUnit || 'g',
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      fiber: Number(fiber) || 0,
      isCustom: true,
    });

    res.status(201).json({
      success: true,
      data: food,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a custom food
// @route   PUT /api/foods/:id
// @access  Private
const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findOne({ _id: req.params.id, user: req.user.id });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Custom food not found or you are not authorized to edit default foods',
      });
    }

    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedFood,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a custom food
// @route   DELETE /api/foods/:id
// @access  Private
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findOne({ _id: req.params.id, user: req.user.id });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Custom food not found or you are not authorized to delete default foods',
      });
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Custom food deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFoods,
  createFood,
  updateFood,
  deleteFood,
};

