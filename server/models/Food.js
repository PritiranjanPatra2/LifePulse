const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means global system default food item
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    emoji: {
      type: String,
      required: [true, 'Emoji is required'],
      default: '🍲',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Grains',
        'Rice & Cereals',
        'Fruits',
        'Vegetables',
        'Dairy Products',
        'Protein',
        'Meat & Seafood',
        'Indian Snacks',
        'Beverages',
        'Nuts & Seeds',
        'Other Foods',
      ],
      default: 'Other Foods',
    },
    servingSize: {
      type: Number,
      required: true,
      default: 100,
    },
    servingUnit: {
      type: String,
      required: true,
      default: 'g', // 'g', 'ml', 'piece', 'bowl', 'cup', 'plate'
    },
    calories: {
      type: Number,
      required: true,
      default: 100,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
    fiber: {
      type: Number,
      default: 0,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

FoodSchema.index({ name: 'text', category: 1 });

module.exports = mongoose.model('Food', FoodSchema);

