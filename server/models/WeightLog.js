const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema(
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
    weightKg: {
      type: Number,
      required: [true, 'Weight in kg is required'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [300, 'Weight must be less than 300 kg'],
    },
    bodyFatPercentage: {
      type: Number,
      default: null,
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

WeightLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('WeightLog', WeightLogSchema);
