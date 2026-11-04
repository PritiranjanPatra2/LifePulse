import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, CheckCircle2, Target, Award, Sparkles, Flame } from 'lucide-react';

export const StudyPrepVisual = ({
  overallProgress = 0,
  questionsSolved = 0,
  questionsTarget = 10000,
  completedChapters = 0,
  totalChapters = 0,
  completedSubjects = 0,
  totalSubjects = 0,
  className = '',
}) => {
  const percentage = Math.min(Math.round(overallProgress), 100);

  // SVG Ring Configuration
  const size = 260;
  const strokeWidth = 18;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let readinessLevel = 'Foundation Stage 🌱';
  let badgeColor = 'text-slate-400 bg-slate-500/10 border-slate-500/20';

  if (percentage >= 100) {
    readinessLevel = 'Exam Master 🏆';
    badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (percentage >= 75) {
    readinessLevel = 'Exam Ready 🚀';
    badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  } else if (percentage >= 40) {
    readinessLevel = 'Accelerating 🔥';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (percentage > 0) {
    readinessLevel = 'In Progress ✍️';
    badgeColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
  }

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Animated Circular Study Gauge */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 drop-shadow-xl overflow-visible"
        >
          <defs>
            {/* Study Violet to Indigo Gradient */}
            <linearGradient id="studyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="studyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200/80 dark:text-slate-800/80"
          />

          {/* Animated Progress Arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#studyGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            filter="url(#studyGlow)"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1 shadow-inner"
          >
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </motion.div>

          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {percentage}%
            </span>
          </div>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Syllabus Mastered
          </span>

          {/* Questions counter pill */}
          <div className="mt-1 text-[11px] font-semibold text-indigo-500 dark:text-indigo-400">
            {questionsSolved.toLocaleString()} Qs Solved
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-xs ${badgeColor}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {readinessLevel}
        </span>

        {/* Quick summary line */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
          <span>{completedChapters}/{totalChapters} Chapters</span>
          <span>•</span>
          <span>{completedSubjects}/{totalSubjects} Subjects</span>
        </div>
      </div>
    </div>
  );
};

