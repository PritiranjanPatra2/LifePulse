const mongoose = require('mongoose');

const MealItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
  },
  name: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    default: '🍲',
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  servingSize: {
    type: Number,
    default: 100,
  },
  servingUnit: {
    type: String,
    default: 'g',
  },
  calories: {
    type: Number,
    required: true,
    default: 0,
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
});

const MealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Breakfast',
        'Morning Snacks',
        'Lunch',
        'Evening Snacks',
        'Dinner',
        'Other Food',
      ],
      default: 'Breakfast',
    },
    name: {
      type: String,
      default: function () {
        return this.category;
      },
    },
    emoji: {
      type: String,
      default: '🍽️',
    },
    items: [MealItemSchema],
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
    },
    totalFat: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

MealSchema.index({ user: 1, date: 1, category: 1 });

module.exports = mongoose.model('Meal', MealSchema);

