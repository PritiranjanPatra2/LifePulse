const mongoose = require('mongoose');

const WaterLogSchema = new mongoose.Schema(
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
    amountMl: {
      type: Number,
      required: [true, 'Please provide water amount in ml'],
      min: [1, 'Amount must be at least 1 ml'],
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

WaterLogSchema.index({ user: 1, date: 1, loggedAt: -1 });

module.exports = mongoose.model('WaterLog', WaterLogSchema);
