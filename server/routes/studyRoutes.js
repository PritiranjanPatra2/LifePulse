const express = require('express');
const router = express.Router();
const {
  getStudyOverview,
  createSubject,
  updateSubject,
  deleteSubject,
  addChapter,
  updateChapter,
  deleteChapter,
  addSubtopic,
  updateSubtopic,
  incrementQuestions,
  deleteSubtopic,
  seedTemplate,
} = require('../controllers/studyController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Subjects
router.get('/', getStudyOverview);
router.post('/subject', createSubject);
router.put('/subject/:subjectId', updateSubject);
router.delete('/subject/:subjectId', deleteSubject);

// Chapters
router.post('/subject/:subjectId/chapter', addChapter);
router.put('/subject/:subjectId/chapter/:chapterId', updateChapter);
router.delete('/subject/:subjectId/chapter/:chapterId', deleteChapter);

// Subtopics
router.post('/subject/:subjectId/chapter/:chapterId/subtopic', addSubtopic);
router.put('/subject/:subjectId/chapter/:chapterId/subtopic/:subtopicId', updateSubtopic);
router.patch(
  '/subject/:subjectId/chapter/:chapterId/subtopic/:subtopicId/questions',
  incrementQuestions
);
router.delete(
  '/subject/:subjectId/chapter/:chapterId/subtopic/:subtopicId',
  deleteSubtopic
);

// Template loader
router.post('/seed-template', seedTemplate);

module.exports = router;

