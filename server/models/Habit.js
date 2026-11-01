const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    emoji: {
      type: String,
      default: '✨',
    },
    color: {
      type: String,
      default: '#1ea678',
    },
    targetDaysPerWeek: {
      type: Number,
      default: 7,
      min: 1,
      max: 7,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

HabitSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Habit', HabitSchema);
