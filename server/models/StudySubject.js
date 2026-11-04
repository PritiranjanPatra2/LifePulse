const mongoose = require('mongoose');

const SubtopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtopic title is required'],
      trim: true,
    },
    theoryCleared: {
      type: Boolean,
      default: false,
    },
    practiceQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },
    practiceQuestionsTarget: {
      type: Number,
      default: 500,
      min: 1,
    },
    dppCompleted: {
      type: Boolean,
      default: false,
    },
    pyqCompleted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ChapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Chapter title is required'],
      trim: true,
    },
    subtopics: [SubtopicSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const StudySubjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    targetExam: {
      type: String,
      default: '',
      trim: true,
    },
    emoji: {
      type: String,
      default: '📚',
    },
    color: {
      type: String,
      default: '#6366f1', // Indigo
    },
    chapters: [ChapterSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Method to recalculate completion flags
StudySubjectSchema.methods.recalculateCompletion = function () {
  let allChaptersDone = this.chapters.length > 0;

  for (const ch of this.chapters) {
    let allSubtopicsDone = ch.subtopics.length > 0;
    for (const sub of ch.subtopics) {
      // Subtopic is complete if Theory is cleared, DPP is completed, and questions meet or exceed target
      const isDone =
        sub.theoryCleared &&
        sub.dppCompleted &&
        sub.practiceQuestions >= (sub.practiceQuestionsTarget || 500);
      sub.isCompleted = isDone;
      if (!isDone) allSubtopicsDone = false;
    }
    ch.isCompleted = allSubtopicsDone;
    if (!allSubtopicsDone) allChaptersDone = false;
  }

  this.isCompleted = allChaptersDone;
};

// Pre-save hook to ensure completion flags are updated
StudySubjectSchema.pre('save', function (next) {
  this.recalculateCompletion();
  next();
});

module.exports = mongoose.model('StudySubject', StudySubjectSchema);

