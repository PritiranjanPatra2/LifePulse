import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Layers, Plus } from 'lucide-react';
import { Button } from '../common/Button';

const EMOJI_OPTIONS = ['📚', '🧠', '📐', '💻', '🧪', '⚖️', '🌍', '📜', '🎯', '💼', '📊', '🗣️'];
const COLOR_OPTIONS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
];

export const AddSubjectModal = ({
  isOpen,
  onClose,
  onCreateSubject,
  onSeedTemplate,
}) => {
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' | 'templates'
  const [name, setName] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📚');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [chaptersInput, setChaptersInput] = useState('');

  if (!isOpen) return null;

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initialChapters = chaptersInput
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    onCreateSubject({
      name: name.trim(),
      targetExam: targetExam.trim(),
      emoji: selectedEmoji,
      color: selectedColor,
      initialChapters,
    });

    // Reset and close
    setName('');
    setTargetExam('');
    setChaptersInput('');
    onClose();
  };

  const handleSelectTemplate = (templateType) => {
    onSeedTemplate(templateType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Add Study Subject
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Create a custom syllabus or load a verified roadmap
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl my-4">
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'custom'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Custom Subject
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'templates'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            1-Click Preset Roadmaps
          </button>
        </div>

        {/* Tab 1: Custom Subject Form */}
        {activeTab === 'custom' && (
          <form onSubmit={handleSubmitCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Reasoning, Quantitative Aptitude, Organic Chemistry"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Exam / Purpose (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Bank PO, SSC CGL, UPSC, GATE, Software Engineer"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Emoji & Color pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Icon
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setSelectedEmoji(em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        selectedEmoji === em
                          ? 'bg-brand-500/20 ring-2 ring-brand-500 scale-110'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Theme Color
                </label>
                <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        selectedColor === col ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Initial Chapters (One per line, optional)
              </label>
              <textarea
                rows={3}
                placeholder="Syllogism&#10;Blood Relations&#10;Seating Arrangement"
                value={chaptersInput}
                onChange={(e) => setChaptersInput(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <Button type="submit" size="sm" icon={Plus} className="w-full">
              Create Study Subject
            </Button>
          </form>
        )}

        {/* Tab 2: 1-Click Preset Roadmaps */}
        {activeTab === 'templates' && (
          <div className="space-y-3 py-2">
            <div
              onClick={() => handleSelectTemplate('reasoning')}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 bg-violet-50/40 dark:bg-violet-950/20 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🧠</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Logical Reasoning Roadmap
                  </h4>
                  <p className="text-xs text-slate-400">
                    Syllogism, Blood Relations, Linear & Circular Puzzles
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-violet-500">Load Roadmap →</span>
            </div>

            <div
              onClick={() => handleSelectTemplate('quant')}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📐</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Quantitative Aptitude
                  </h4>
                  <p className="text-xs text-slate-400">
                    Percentages, Profit & Loss, Time & Work, Pipes
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-500">Load Roadmap →</span>
            </div>

            <div
              onClick={() => handleSelectTemplate('dsa')}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/20 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">💻</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    DSA & Technical Coding
                  </h4>
                  <p className="text-xs text-slate-400">
                    Arrays, Two Pointers, Trees, BFS/DFS & Graphs
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-cyan-500">Load Roadmap →</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

