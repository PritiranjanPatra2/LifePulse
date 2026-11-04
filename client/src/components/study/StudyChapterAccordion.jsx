import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Award,
  Sparkles,
  Layers,
} from 'lucide-react';
import { SubtopicItem } from './SubtopicItem';

export const StudyChapterAccordion = ({
  subjectId,
  chapter,
  onUpdateSubtopic,
  onIncrementQuestions,
  onDeleteSubtopic,
  onAddSubtopic,
  onDeleteChapter,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isAddingSubtopic, setIsAddingSubtopic] = useState(false);
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');
  const [newSubtopicTarget, setNewSubtopicTarget] = useState(500);

  const subtopics = chapter.subtopics || [];
  const completedCount = subtopics.filter((s) => s.isCompleted).length;
  const isChapterComplete = subtopics.length > 0 && completedCount === subtopics.length;
  const progressPct =
    subtopics.length > 0 ? Math.round((completedCount / subtopics.length) * 100) : 0;

  const handleCreateSubtopic = (e) => {
    e.preventDefault();
    if (!newSubtopicTitle.trim()) return;

    onAddSubtopic(subjectId, chapter._id, {
      title: newSubtopicTitle.trim(),
      practiceQuestionsTarget: Number(newSubtopicTarget) || 500,
    });

    setNewSubtopicTitle('');
    setNewSubtopicTarget(500);
    setIsAddingSubtopic(false);
  };

  return (
    <div
      className={`rounded-3xl border transition-all overflow-hidden ${
        isChapterComplete
          ? 'bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent border-emerald-500/40 shadow-xs'
          : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80'
      }`}
    >
      {/* Chapter Header Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4 select-none">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
              isChapterComplete
                ? 'bg-emerald-500 text-white shadow-glow-primary'
                : 'bg-indigo-500/10 text-indigo-500'
            }`}
          >
            {isChapterComplete ? (
              <Award className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Layers className="w-4 h-4 stroke-[2.5]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                {chapter.title}
              </h4>

              {isChapterComplete && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500 text-white shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  Chapter Completed!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span>
                {completedCount} of {subtopics.length} topics finished ({progressPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Add subtopic + Delete Chapter + Accordion Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddingSubtopic(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-500 hover:text-brand-500 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subtopic
          </button>

          <button
            type="button"
            onClick={() => onDeleteChapter(subjectId, chapter._id)}
            title="Delete Chapter"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Subtopics Deck */}
      {isOpen && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {/* Inline Add Subtopic Form */}
          {isAddingSubtopic && (
            <form
              onSubmit={handleCreateSubtopic}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-brand-500/50 shadow-md flex flex-col sm:flex-row items-center gap-3 animate-in fade-in"
            >
              <input
                type="text"
                required
                placeholder="Subtopic title (e.g. Either-Or Syllogism Cases)"
                value={newSubtopicTitle}
                onChange={(e) => setNewSubtopicTitle(e.target.value)}
                className="flex-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
              />

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[11px] text-slate-400">Target Qs:</span>
                  <input
                    type="number"
                    min="1"
                    value={newSubtopicTarget}
                    onChange={(e) => setNewSubtopicTarget(e.target.value)}
                    className="w-14 bg-transparent font-bold text-center outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-glow-primary hover:bg-brand-600 transition-all shrink-0"
                >
                  Add Topic
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingSubtopic(false)}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Subtopic Items */}
          {subtopics.length > 0 ? (
            subtopics.map((sub) => (
              <SubtopicItem
                key={sub._id}
                subjectId={subjectId}
                chapterId={chapter._id}
                subtopic={sub}
                onUpdateSubtopic={onUpdateSubtopic}
                onIncrementQuestions={onIncrementQuestions}
                onDeleteSubtopic={onDeleteSubtopic}
              />
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
              <span>No subtopics added in this chapter yet.</span>
              <button
                type="button"
                onClick={() => setIsAddingSubtopic(true)}
                className="mt-2 text-brand-500 font-bold hover:underline"
              >
                + Add your first subtopic
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

