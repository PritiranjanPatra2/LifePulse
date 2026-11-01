const mongoose = require('mongoose');

const SleepLogSchema = new mongoose.Schema(
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
    bedtime: {
      type: String, // HH:mm
      required: true,
      default: '23:00',
    },
    wakeTime: {
      type: String, // HH:mm
      required: true,
      default: '07:00',
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 480, // 8 hours
    },
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
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

SleepLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('SleepLog', SleepLogSchema);
