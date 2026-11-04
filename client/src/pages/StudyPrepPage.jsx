import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { notifyToast } from '../components/common/Toast';
import { studyService } from '../services/studyService';
import { StudyPrepVisual } from '../components/study/StudyPrepVisual';
import { StudyChapterAccordion } from '../components/study/StudyChapterAccordion';
import { AddSubjectModal } from '../components/study/AddSubjectModal';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Layers,
  Sparkles,
  CheckCircle2,
  Target,
  Award,
  Trash2,
  FolderPlus,
  Flame,
} from 'lucide-react';

export const StudyPrepPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({});
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  const loadStudyData = async () => {
    setIsLoading(true);
    try {
      const res = await studyService.getStudyOverview();
      if (res.data) {
        setSubjects(res.data.subjects || []);
        setStats(res.data.stats || {});
        if (res.data.subjects && res.data.subjects.length > 0) {
          setActiveSubjectId((prev) => {
            const exists = res.data.subjects.some((s) => s._id === prev);
            return exists ? prev : res.data.subjects[0]._id;
          });
        }
      }
    } catch (err) {
      console.error('Error loading study data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudyData();
  }, []);

  const activeSubject =
    subjects.find((s) => s._id === activeSubjectId) || subjects[0] || null;

  // 1. Create Subject
  const handleCreateSubject = async (formData) => {
    try {
      await studyService.createSubject(formData);
      notifyToast({
        title: 'Subject Added! 📚',
        message: `Created "${formData.name}" successfully.`,
        type: 'success',
      });
      loadStudyData();
    } catch (err) {
      notifyToast({
        title: 'Error Creating Subject',
        message: err.response?.data?.message || 'Could not add subject',
        type: 'error',
      });
    }
  };

  // 2. Load Preset Template
  const handleSeedTemplate = async (templateType) => {
    try {
      await studyService.seedTemplate(templateType);
      notifyToast({
        title: 'Roadmap Loaded! 🚀',
        message: 'Preset syllabus imported with chapters & subtopics.',
        type: 'success',
      });
      loadStudyData();
    } catch (err) {
      notifyToast({
        title: 'Template Failed',
        message: 'Could not load syllabus template',
        type: 'error',
      });
    }
  };

  // 3. Delete Subject
  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Delete this entire subject and all its chapters?')) return;
    try {
      await studyService.deleteSubject(subjectId);
      notifyToast({
        title: 'Subject Removed',
        message: 'Subject and chapters deleted.',
        type: 'info',
      });
      loadStudyData();
    } catch (err) {
      notifyToast({
        title: 'Action Failed',
        message: 'Could not delete subject',
        type: 'error',
      });
    }
  };

  // 4. Add Chapter
  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapterTitle.trim() || !activeSubject) return;

    try {
      await studyService.addChapter(activeSubject._id, { title: newChapterTitle.trim() });
      setNewChapterTitle('');
      setIsAddingChapter(false);
      notifyToast({
        title: 'Chapter Added! 📖',
        message: `Added chapter to ${activeSubject.name}.`,
        type: 'success',
      });
      loadStudyData();
    } catch (err) {
      notifyToast({
        title: 'Failed Adding Chapter',
        message: err.response?.data?.message || 'Error',
        type: 'error',
      });
    }
  };

  // 5. Delete Chapter
  const handleDeleteChapter = async (subjectId, chapterId) => {
    if (!window.confirm('Delete this chapter and all its topics?')) return;
    try {
      await studyService.deleteChapter(subjectId, chapterId);
      notifyToast({
        title: 'Chapter Deleted',
        message: 'Chapter removed from subject.',
        type: 'info',
      });
      loadStudyData();
    } catch (err) {
      notifyToast({
        title: 'Action Failed',
        message: 'Could not delete chapter',
        type: 'error',
      });
    }
  };

  // 6. Add Subtopic
  const handleAddSubtopic = async (subjectId, chapterId, subtopicData) => {
    try {
      await studyService.addSubtopic(subjectId, chapterId, subtopicData);
      notifyToast({
        title: 'Topic Added! 🎯',
        message: `Target: ${subtopicData.practiceQuestionsTarget || 500} questions.`,
        type: 'success',
      });
      loadStudyData();
    } catch (err) {
      notifyToast({
        title: 'Error Adding Topic',
        message: err.response?.data?.message || 'Failed',
        type: 'error',
      });
    }
  };

  // 7. Update Subtopic Checklist (Theory, DPP, etc.)
  const handleUpdateSubtopic = async (subjectId, chapterId, subtopicId, updateData) => {
    try {
      await studyService.updateSubtopic(subjectId, chapterId, subtopicId, updateData);
      loadStudyData();
    } catch (err) {
      notifyToast({
        title: 'Update Failed',
        message: 'Could not update checklist',
        type: 'error',
      });
    }
  };

  // 8. Quick Increment Questions (+10, +50, etc.)
  const handleIncrementQuestions = async (subjectId, chapterId, subtopicId, delta) => {
    try {
      await studyService.incrementQuestions(subjectId, chapterId, subtopicId, delta);
      loadStudyData();
    } catch (err) {
      notifyToast({
        title: 'Failed',
        message: 'Could not increment questions',
        type: 'error',
      });
    }
  };

  // 9. Delete Subtopic
  const handleDeleteSubtopic = async (subjectId, chapterId, subtopicId) => {
    try {
      await studyService.deleteSubtopic(subjectId, chapterId, subtopicId);
      notifyToast({
        title: 'Topic Removed',
        message: 'Subtopic removed.',
        type: 'info',
      });
      loadStudyData();
    } catch (err) {
      notifyToast({
        title: 'Action Failed',
        message: 'Could not delete subtopic',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Study & Exam Prep Center
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
              Mastery Mode
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Hierarchical syllabus tracking: Theory cleared + 500 practice questions + DPP solved
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setIsAddSubjectOpen(true)}
          >
            Add Subject
          </Button>
        </div>
      </div>

      {/* HERO SECTION: SIGNATURE STUDY GAUGE & OVERALL METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Animated Study Progress Visual */}
        <div className="lg:col-span-5 flex justify-center">
          <Card padding="p-6" className="w-full flex items-center justify-center">
            <StudyPrepVisual
              overallProgress={stats.overallProgress || 0}
              questionsSolved={stats.overallQuestionsSolved || 0}
              questionsTarget={stats.overallQuestionsTarget || 10000}
              completedChapters={stats.completedChapters || 0}
              totalChapters={stats.totalChapters || 0}
              completedSubjects={stats.completedSubjects || 0}
              totalSubjects={stats.totalSubjects || 0}
            />
          </Card>
        </div>

        {/* 4 Stats Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <Card hover padding="p-4 sm:p-5" className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-indigo-500 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Practice Questions
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {(stats.overallQuestionsSolved || 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {(stats.overallQuestionsTarget || 0).toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              Across all subtopics
            </span>
          </Card>

          <Card hover padding="p-4 sm:p-5" className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chapters Mastered
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {stats.completedChapters || 0}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {stats.totalChapters || 0}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              All subtopics 100% complete
            </span>
          </Card>

          <Card hover padding="p-4 sm:p-5" className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-violet-500 mb-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Subjects
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {stats.totalSubjects || 0}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                ({stats.completedSubjects || 0} completed)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              {stats.overallSubtopics || 0} syllabus topics tracked
            </span>
          </Card>

          <Card hover padding="p-4 sm:p-5" className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mastery Readiness
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-500">
                {stats.overallProgress || 0}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              Cascading completion score
            </span>
          </Card>
        </div>
      </div>

      {/* SUBJECTS DECK & CHAPTERS DRILLDOWN */}
      {subjects.length > 0 ? (
        <div className="space-y-6">
          {/* Subject Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {subjects.map((sub) => {
              const isActive = sub._id === activeSubject?._id;
              return (
                <button
                  key={sub._id}
                  onClick={() => setActiveSubjectId(sub._id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                    isActive
                      ? 'bg-brand-500 text-white border-brand-600 shadow-glow-primary scale-102'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base">{sub.emoji}</span>
                  <span>{sub.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {sub.progressPercentage}%
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setIsAddSubjectOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-400 hover:text-brand-500 hover:border-brand-500 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Subject
            </button>
          </div>

          {/* Active Subject Detail Container */}
          {activeSubject && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
              {/* Subject Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: `${activeSubject.color}20` }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner"
                  >
                    {activeSubject.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        {activeSubject.name}
                      </h2>
                      {activeSubject.isCompleted && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-white shadow-xs">
                          Subject Completed 🏆
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{activeSubject.targetExam || 'General Syllabus'}</span>
                      <span>•</span>
                      <span>{activeSubject.chapters?.length || 0} Chapters</span>
                      <span>•</span>
                      <span>
                        {(activeSubject.totalQuestionsSolved || 0).toLocaleString()} questions
                        practiced
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingChapter(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-glow-primary hover:bg-brand-600 transition-all"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Add Chapter
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(activeSubject._id)}
                    title="Delete entire subject"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add Chapter Form */}
              {isAddingChapter && (
                <form
                  onSubmit={handleAddChapter}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-brand-500/50 shadow-md flex items-center gap-3 animate-in fade-in"
                >
                  <input
                    type="text"
                    required
                    placeholder="Chapter Title (e.g. Syllogism, Seating Arrangement, Ratio & Proportion)"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-glow-primary hover:bg-brand-600 transition-all shrink-0"
                  >
                    Save Chapter
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingChapter(false)}
                    className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Chapters List */}
              <div className="space-y-4">
                {activeSubject.chapters && activeSubject.chapters.length > 0 ? (
                  activeSubject.chapters.map((ch) => (
                    <StudyChapterAccordion
                      key={ch._id}
                      subjectId={activeSubject._id}
                      chapter={ch}
                      onUpdateSubtopic={handleUpdateSubtopic}
                      onIncrementQuestions={handleIncrementQuestions}
                      onDeleteSubtopic={handleDeleteSubtopic}
                      onAddSubtopic={handleAddSubtopic}
                      onDeleteChapter={handleDeleteChapter}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <span className="text-3xl block mb-2">📖</span>
                    <span>No chapters in this subject yet.</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingChapter(true)}
                      className="block mx-auto mt-2 text-brand-500 font-bold hover:underline"
                    >
                      + Add the first chapter
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State with 1-Click Roadmaps */
        <Card padding="p-8 sm:p-12" className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
            Build Your Study & Exam Mastery
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            Track syllabus coverage with cascading completion rules: Theory Cleared + 500 Practice
            Questions + DPP solved for every subtopic.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="sm"
              icon={Plus}
              onClick={() => setIsAddSubjectOpen(true)}
            >
              Create First Subject
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Sparkles}
              onClick={() => handleSeedTemplate('reasoning')}
            >
              Load Reasoning Roadmap 🧠
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={Sparkles}
              onClick={() => handleSeedTemplate('quant')}
            >
              Load Quant Roadmap 📐
            </Button>
          </div>
        </Card>
      )}

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onCreateSubject={handleCreateSubject}
        onSeedTemplate={handleSeedTemplate}
      />
    </div>
  );
};

