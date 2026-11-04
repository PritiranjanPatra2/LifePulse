import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  BookOpen,
  FileText,
  Target,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Check,
  Award,
  Sparkles,
} from 'lucide-react';

export const SubtopicItem = ({
  subjectId,
  chapterId,
  subtopic,
  onUpdateSubtopic,
  onIncrementQuestions,
  onDeleteSubtopic,
}) => {
  const [isEditingQuestions, setIsEditingQuestions] = useState(false);
  const [tempQuestions, setTempQuestions] = useState(subtopic.practiceQuestions || 0);

  const target = subtopic.practiceQuestionsTarget || 500;
  const questions = subtopic.practiceQuestions || 0;
  const questionPct = Math.min(Math.round((questions / target) * 100), 100);
  const isQuestionGoalMet = questions >= target;

  const isCompleted =
    subtopic.theoryCleared && subtopic.dppCompleted && isQuestionGoalMet;

  const handleToggleTheory = () => {
    onUpdateSubtopic(subjectId, chapterId, subtopic._id, {
      theoryCleared: !subtopic.theoryCleared,
    });
  };

  const handleToggleDPP = () => {
    onUpdateSubtopic(subjectId, chapterId, subtopic._id, {
      dppCompleted: !subtopic.dppCompleted,
    });
  };

  const handleTogglePYQ = () => {
    onUpdateSubtopic(subjectId, chapterId, subtopic._id, {
      pyqCompleted: !subtopic.pyqCompleted,
    });
  };

  const handleSaveDirectQuestions = (e) => {
    e.preventDefault();
    onUpdateSubtopic(subjectId, chapterId, subtopic._id, {
      practiceQuestions: Math.max(0, Number(tempQuestions) || 0),
    });
    setIsEditingQuestions(false);
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top row: Title + Mastered Badge + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              isCompleted
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            {isCompleted ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            )}
          </div>

          <h5
            className={`text-sm font-bold tracking-tight ${
              isCompleted
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {subtopic.title}
          </h5>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Status Badge */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Topic Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {questionPct > 0 || subtopic.theoryCleared || subtopic.dppCompleted
                ? 'In Progress ⏳'
                : 'Not Started'}
            </span>
          )}

          <button
            onClick={() => onDeleteSubtopic(subjectId, chapterId, subtopic._id)}
            title="Delete subtopic"
            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Pillar Criteria Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Criterion 1: Theory Cleared */}
        <div className="md:col-span-3 flex items-center">
          <button
            type="button"
            onClick={handleToggleTheory}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
              subtopic.theoryCleared
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Theory Cleared?
            </span>
            {subtopic.theoryCleared ? (
              <span className="text-emerald-500 font-extrabold flex items-center gap-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Yes
              </span>
            ) : (
              <span className="text-slate-400 font-medium">Pending</span>
            )}
          </button>
        </div>

        {/* Criterion 2: Practice Questions (500 Target) */}
        <div className="md:col-span-6 flex flex-col justify-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-brand-500" />
              Practice Questions
            </span>

            {isEditingQuestions ? (
              <form onSubmit={handleSaveDirectQuestions} className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={tempQuestions}
                  onChange={(e) => setTempQuestions(e.target.value)}
                  className="w-16 px-1.5 py-0.5 text-xs rounded border border-brand-500 bg-white dark:bg-slate-900 outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-1.5 py-0.5 bg-brand-500 text-white text-[10px] rounded font-bold"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1">
                <span
                  onClick={() => {
                    setTempQuestions(questions);
                    setIsEditingQuestions(true);
                  }}
                  className={`cursor-pointer font-extrabold ${
                    isQuestionGoalMet
                      ? 'text-emerald-500'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}
                  title="Click to manually edit"
                >
                  {questions} / {target}
                </span>
                <span className="text-[10px] text-slate-400">({questionPct}%)</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
            <div
              style={{ width: `${questionPct}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                isQuestionGoalMet
                  ? 'bg-emerald-500 shadow-glow-primary'
                  : 'bg-brand-500'
              }`}
            />
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onIncrementQuestions(subjectId, chapterId, subtopic._id, -10)}
                disabled={questions <= 0}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-rose-500 disabled:opacity-40"
              >
                -10
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onIncrementQuestions(subjectId, chapterId, subtopic._id, 10)}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:border-brand-500 hover:text-brand-500"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => onIncrementQuestions(subjectId, chapterId, subtopic._id, 50)}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:border-brand-500 hover:text-brand-500"
              >
                +50
              </button>
              <button
                type="button"
                onClick={() => onIncrementQuestions(subjectId, chapterId, subtopic._id, 100)}
                className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/40 border border-brand-500/30 text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-500 hover:text-white"
              >
                +100
              </button>
            </div>
          </div>
        </div>

        {/* Criterion 3: DPP Solved? */}
        <div className="md:col-span-3 flex items-center">
          <button
            type="button"
            onClick={handleToggleDPP}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
              subtopic.dppCompleted
                ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              DPP Solved?
            </span>
            {subtopic.dppCompleted ? (
              <span className="text-emerald-500 font-extrabold flex items-center gap-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Yes
              </span>
            ) : (
              <span className="text-slate-400 font-medium">Pending</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

