const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Walking',
        'Running',
        'Gym',
        'Cycling',
        'Yoga',
        'Swimming',
        'Football',
        'Badminton',
        'Stretching',
        'Other',
      ],
      default: 'Gym',
    },
    emoji: {
      type: String,
      default: '🏋️',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    startTime: {
      type: String,
      default: '07:00',
    },
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    caloriesBurned: {
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

ExerciseSchema.index({ user: 1, date: 1, category: 1 });

module.exports = mongoose.model('Exercise', ExerciseSchema);

