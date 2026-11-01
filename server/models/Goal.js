const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    waterMl: {
      type: Number,
      default: 4000, // 4 litres default as requested
    },
    steps: {
      type: Number,
      default: 10000,
    },
    calories: {
      type: Number,
      default: 2200,
    },
    proteinGrams: {
      type: Number,
      default: 80,
    },
    carbsGrams: {
      type: Number,
      default: 250,
    },
    fatGrams: {
      type: Number,
      default: 65,
    },
    exerciseMinutes: {
      type: Number,
      default: 45,
    },
    sleepHours: {
      type: Number,
      default: 8,
    },
    startingWeight: {
      type: Number,
      default: 72,
    },
    targetWeight: {
      type: Number,
      default: 68,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', GoalSchema);
