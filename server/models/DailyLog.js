const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema(
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
    steps: {
      type: Number,
      default: 0,
    },
    distanceKm: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    overallMood: {
      type: String,
      enum: ['great', 'good', 'neutral', 'tired', 'stressed'],
      default: 'good',
    },
  },
  {
    timestamps: true,
  }
);

DailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);

