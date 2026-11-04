const StudySubject = require('../models/StudySubject');

// Helper to compute deep metrics for a single subject
const computeSubjectMetrics = (subject) => {
  const sObj = subject.toObject ? subject.toObject() : subject;
  let totalSubtopics = 0;
  let completedSubtopics = 0;
  let totalQuestionsSolved = 0;
  let totalQuestionsTarget = 0;
  let totalChapters = sObj.chapters ? sObj.chapters.length : 0;
  let completedChapters = 0;

  (sObj.chapters || []).forEach((ch) => {
    let chSubDone = 0;
    (ch.subtopics || []).forEach((sub) => {
      totalSubtopics++;
      totalQuestionsSolved += sub.practiceQuestions || 0;
      totalQuestionsTarget += sub.practiceQuestionsTarget || 500;
      if (sub.isCompleted) {
        completedSubtopics++;
        chSubDone++;
      }
    });

    const isChDone = ch.subtopics?.length > 0 && chSubDone === ch.subtopics.length;
    ch.isCompleted = isChDone;
    ch.totalSubtopics = ch.subtopics?.length || 0;
    ch.completedSubtopics = chSubDone;
    ch.progressPercentage =
      ch.subtopics?.length > 0 ? Math.round((chSubDone / ch.subtopics.length) * 100) : 0;

    if (isChDone) completedChapters++;
  });

  const progressPercentage =
    totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;
  const isCompleted = totalChapters > 0 && completedChapters === totalChapters;

  return {
    ...sObj,
    totalChapters,
    completedChapters,
    totalSubtopics,
    completedSubtopics,
    totalQuestionsSolved,
    totalQuestionsTarget,
    progressPercentage,
    isCompleted,
  };
};

// 1. Get All Subjects & Overall Prep Dashboard Stats
exports.getStudyOverview = async (req, res, next) => {
  try {
    const subjects = await StudySubject.find({ user: req.user.id }).sort({ createdAt: 1 });

    const processedSubjects = subjects.map(computeSubjectMetrics);

    // Global aggregations
    let overallSubtopics = 0;
    let overallSubtopicsDone = 0;
    let overallQuestionsSolved = 0;
    let overallQuestionsTarget = 0;
    let totalChapters = 0;
    let completedChapters = 0;
    let completedSubjects = 0;

    processedSubjects.forEach((s) => {
      overallSubtopics += s.totalSubtopics;
      overallSubtopicsDone += s.completedSubtopics;
      overallQuestionsSolved += s.totalQuestionsSolved;
      overallQuestionsTarget += s.totalQuestionsTarget;
      totalChapters += s.totalChapters;
      completedChapters += s.completedChapters;
      if (s.isCompleted) completedSubjects++;
    });

    const overallProgress =
      overallSubtopics > 0
        ? Math.round((overallSubtopicsDone / overallSubtopics) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        subjects: processedSubjects,
        stats: {
          totalSubjects: processedSubjects.length,
          completedSubjects,
          totalChapters,
          completedChapters,
          overallSubtopics,
          overallSubtopicsDone,
          overallQuestionsSolved,
          overallQuestionsTarget,
          overallProgress,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// 2. Create New Subject
exports.createSubject = async (req, res, next) => {
  try {
    const { name, targetExam, emoji, color, initialChapters } = req.body;

    const chapters = (initialChapters || []).map((chName) => ({
      title: chName,
      subtopics: [],
    }));

    const subject = await StudySubject.create({
      user: req.user.id,
      name,
      targetExam: targetExam || '',
      emoji: emoji || '📚',
      color: color || '#6366f1',
      chapters,
    });

    res.status(201).json({
      success: true,
      data: computeSubjectMetrics(subject),
      message: 'Study Subject created successfully',
    });
  } catch (err) {
    next(err);
  }
};

// 3. Update Subject Info
exports.updateSubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { name, targetExam, emoji, color } = req.body;

    const subject = await StudySubject.findOne({ _id: subjectId, user: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (name !== undefined) subject.name = name;
    if (targetExam !== undefined) subject.targetExam = targetExam;
    if (emoji !== undefined) subject.emoji = emoji;
    if (color !== undefined) subject.color = color;

    await subject.save();

    res.status(200).json({
      success: true,
      data: computeSubjectMetrics(subject),
      message: 'Subject updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// 4. Delete Subject
exports.deleteSubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const subject = await StudySubject.findOneAndDelete({ _id: subjectId, user: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// 5. Add Chapter to Subject
exports.addChapter = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Chapter title is required' });
    }

    const subject = await StudySubject.findOne({ _id: subjectId, user: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    subject.chapters.push({ title: title.trim(), subtopics: [] });
    await subject.save();

    res.status(201).json({
      success: true,
      data: computeSubjectMetrics(subject),
      message: 'Chapter added successfully',
    });
  } catch (err) {
    next(err);
  }
};

// 6. Update Chapter
exports.updateChapter = async (req, res, next) => {
  try {
    const { subjectId, chapterId } = req.params;
    const { title } = req.body;

    const subject = await StudySubject.findOne({ _id: subjectId, user: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    if (title) chapter.title = title.trim();
    await subject.save();

    res.status(200).json({
      success: true,
      data: computeSubjectMetrics(subject),
      message: 'Chapter updated',
    });
  } catch (err) {
    next(err);
  }
};

// 7. Delete Chapter
exports.deleteChapter = async (req, res, next) => {
  try {
    const { subjectId, chapterId } = req.params;
    const subject = await StudySubject.findOne({ _id: subjectId, user: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    subject.chapters.pull({ _id: chapterId });
    await subject.save();

    res.status(200).json({
      success: true,
      data: computeSubjectMetrics(subject),
      message: 'Chapter deleted',
    });
  } catch (err) {
    next(err);
  }
};

// 8. Add Subtopic to Chapter
exports.addSubtopic = async (req, res, next) => {
  try {
    const { subjectId, chapterId } = req.params;
    const { title, practiceQuestionsTarget, notes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Subtopic title is required' });
    }

    const subject = await StudySubject.findOne({ _id: subjectId, user: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    chapter.subtopics.push({
      title: title.trim(),
      theoryCleared: false,
      practiceQuestions: 0,
      practiceQuestionsTarget: Number(practiceQuestionsTarget) || 500,
      dppCompleted: false,
      pyqCompleted: false,
      notes: notes || '',
    });

    await subject.save();

    res.status(201).json({
      success: true,
      data: computeSubjectMetrics(subject),
      message: 'Subtopic added',
    });
  } catch (err) {
    next(err);
  }
};

// 9. Update Subtopic Checklist / Values
exports.updateSubtopic = async (req, res, next) => {
  try {
    const { subjectId, chapterId, subtopicId } = req.params;
    const {
      title,
      theoryCleared,
      practiceQuestions,
      practiceQuestionsTarget,
      dppCompleted,
      pyqCompleted,
      notes,
    } = req.body;

    const subject = await StudySubject.findOne({ _id: subjectId, user: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    const subtopic = chapter.subtopics.id(subtopicId);
    if (!subtopic) {
      return res.status(404).json({ success: false, message: 'Subtopic not found' });
    }

    if (title !== undefined) subtopic.title = title.trim();
    if (theoryCleared !== undefined) subtopic.theoryCleared = Boolean(theoryCleared);
    if (practiceQuestions !== undefined)
      subtopic.practiceQuestions = Math.max(Number(practiceQuestions) || 0, 0);
    if (practiceQuestionsTarget !== undefined)
      subtopic.practiceQuestionsTarget = Math.max(Number(practiceQuestionsTarget) || 500, 1);
    if (dppCompleted !== undefined) subtopic.dppCompleted = Boolean(dppCompleted);
    if (pyqCompleted !== undefined) subtopic.pyqCompleted = Boolean(pyqCompleted);
    if (notes !== undefined) subtopic.notes = notes;

    await subject.save();

    res.status(200).json({
      success: true,
      data: computeSubjectMetrics(subject),
      message: 'Subtopic updated',
    });
  } catch (err) {
    next(err);
  }
};

// 10. Quick Increment Questions (+10, +50, -10, etc.)
exports.incrementQuestions = async (req, res, next) => {
  try {
    const { subjectId, chapterId, subtopicId } = req.params;
    const { delta } = req.body;

    const change = Number(delta) || 0;

    const subject = await StudySubject.findOne({ _id: subjectId, user: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    const subtopic = chapter.subtopics.id(subtopicId);
    if (!subtopic) {
      return res.status(404).json({ success: false, message: 'Subtopic not found' });
    }

    subtopic.practiceQuestions = Math.max(0, (subtopic.practiceQuestions || 0) + change);
    await subject.save();

    res.status(200).json({
      success: true,
      data: computeSubjectMetrics(subject),
      message: `Updated practice questions (${change > 0 ? `+${change}` : change})`,
    });
  } catch (err) {
    next(err);
  }
};

// 11. Delete Subtopic
exports.deleteSubtopic = async (req, res, next) => {
  try {
    const { subjectId, chapterId, subtopicId } = req.params;
    const subject = await StudySubject.findOne({ _id: subjectId, user: req.user.id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: 'Chapter not found' });
    }

    chapter.subtopics.pull({ _id: subtopicId });
    await subject.save();

    res.status(200).json({
      success: true,
      data: computeSubjectMetrics(subject),
      message: 'Subtopic deleted',
    });
  } catch (err) {
    next(err);
  }
};

// 12. Seed Template Syllabi
exports.seedTemplate = async (req, res, next) => {
  try {
    const { templateType } = req.body; // 'reasoning' | 'quant' | 'dsa'

    let templateData = null;

    if (templateType === 'reasoning') {
      templateData = {
        name: 'Logical Reasoning',
        emoji: '🧠',
        color: '#8b5cf6', // Violet
        targetExam: 'Competitive Exams / Banking & SSC',
        chapters: [
          {
            title: 'Syllogism',
            subtopics: [
              {
                title: 'Basic Syllogism & Venn Diagrams',
                theoryCleared: true,
                practiceQuestions: 350,
                practiceQuestionsTarget: 500,
                dppCompleted: true,
              },
              {
                title: 'Either-Or & Complementary Pairs',
                theoryCleared: true,
                practiceQuestions: 220,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
              {
                title: 'Only / Only A Few Conditions',
                theoryCleared: false,
                practiceQuestions: 80,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
            ],
          },
          {
            title: 'Blood Relations',
            subtopics: [
              {
                title: 'Family Tree Generation & Hierarchy',
                theoryCleared: true,
                practiceQuestions: 400,
                practiceQuestionsTarget: 500,
                dppCompleted: true,
              },
              {
                title: 'Coded Blood Relations',
                theoryCleared: false,
                practiceQuestions: 150,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
            ],
          },
          {
            title: 'Seating Arrangement & Puzzles',
            subtopics: [
              {
                title: 'Linear Single & Parallel Rows',
                theoryCleared: false,
                practiceQuestions: 120,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
              {
                title: 'Circular & Square Arrangements',
                theoryCleared: false,
                practiceQuestions: 90,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
              {
                title: 'Floor, Box & Variable Puzzles',
                theoryCleared: false,
                practiceQuestions: 40,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
            ],
          },
        ],
      };
    } else if (templateType === 'quant') {
      templateData = {
        name: 'Quantitative Aptitude',
        emoji: '📐',
        color: '#10b981', // Emerald
        targetExam: 'General Competitions',
        chapters: [
          {
            title: 'Percentages & Fractions',
            subtopics: [
              {
                title: 'Fraction to Percentage Conversions',
                theoryCleared: true,
                practiceQuestions: 500,
                practiceQuestionsTarget: 500,
                dppCompleted: true,
              },
              {
                title: 'Successive Percentage & Net Change',
                theoryCleared: true,
                practiceQuestions: 310,
                practiceQuestionsTarget: 500,
                dppCompleted: true,
              },
            ],
          },
          {
            title: 'Profit, Loss & Discount',
            subtopics: [
              {
                title: 'CP, SP, and Markup Percentage',
                theoryCleared: false,
                practiceQuestions: 180,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
              {
                title: 'Dishonest Dealer & Equivalent Discount',
                theoryCleared: false,
                practiceQuestions: 60,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
            ],
          },
          {
            title: 'Time & Work',
            subtopics: [
              {
                title: 'Efficiency & LCM Method',
                theoryCleared: false,
                practiceQuestions: 150,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
              {
                title: 'Pipes & Cisterns',
                theoryCleared: false,
                practiceQuestions: 75,
                practiceQuestionsTarget: 500,
                dppCompleted: false,
              },
            ],
          },
        ],
      };
    } else {
      // Default to Computer Science / DSA
      templateData = {
        name: 'DSA & Algorithms',
        emoji: '💻',
        color: '#06b6d4', // Cyan
        targetExam: 'Technical Coding Interviews',
        chapters: [
          {
            title: 'Arrays & Two Pointers',
            subtopics: [
              {
                title: 'Two Pointers & Sliding Window',
                theoryCleared: true,
                practiceQuestions: 250,
                practiceQuestionsTarget: 300,
                dppCompleted: true,
              },
              {
                title: 'Prefix Sums & Hashing',
                theoryCleared: true,
                practiceQuestions: 300,
                practiceQuestionsTarget: 300,
                dppCompleted: true,
              },
            ],
          },
          {
            title: 'Trees & Graphs',
            subtopics: [
              {
                title: 'Binary Tree Traversals (BFS/DFS)',
                theoryCleared: true,
                practiceQuestions: 180,
                practiceQuestionsTarget: 300,
                dppCompleted: false,
              },
              {
                title: 'Dijkstra & Shortest Path Algorithms',
                theoryCleared: false,
                practiceQuestions: 90,
                practiceQuestionsTarget: 300,
                dppCompleted: false,
              },
            ],
          },
        ],
      };
    }

    const created = await StudySubject.create({
      user: req.user.id,
      ...templateData,
    });

    res.status(201).json({
      success: true,
      data: computeSubjectMetrics(created),
      message: `Template "${templateData.name}" loaded successfully!`,
    });
  } catch (err) {
    next(err);
  }
};

