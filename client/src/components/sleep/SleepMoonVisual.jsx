import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Star, Clock, Sparkles, Award } from 'lucide-react';

export const SleepMoonVisual = ({
  durationMinutes = 0,
  durationHours,
  targetHours = 8,
  quality = 'good',
  bedtime = '23:00',
  wakeTime = '07:00',
  className = '',
}) => {
  const currentHours =
    durationHours !== undefined
      ? durationHours
      : Math.round(((durationMinutes || 0) / 60) * 10) / 10;
  const target = targetHours || 8;
  const percentage = Math.min(Math.round((currentHours / target) * 100), 100);

  // SVG Ring Constants
  const size = 260;
  const strokeWidth = 18;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const qualityLabels = {
    excellent: { text: 'Deep Rest 🌟', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    good: { text: 'Optimal Sleep ✨', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    fair: { text: 'Moderate Rest 🌙', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    poor: { text: 'Low Sleep 😴', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  };

  const currentQuality = qualityLabels[quality.toLowerCase()] || qualityLabels.good;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Animated Sleep Ring */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 drop-shadow-xl overflow-visible"
        >
          <defs>
            {/* Night Sky Gradient */}
            <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="moonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800/80"
          />

          {/* Animated Progress Ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="url(#sleepGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            filter={percentage > 5 ? 'url(#moonGlow)' : undefined}
          />
        </svg>

        {/* Floating Twinkling Stars */}
        <motion.div
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-14 text-indigo-400"
        >
          <Star className="w-3.5 h-3.5 fill-indigo-400/40" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.8, 0.2, 0.8], scale: [1.1, 0.7, 1.1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-12 left-14 text-purple-400"
        >
          <Star className="w-3 h-3 fill-purple-400/40" />
        </motion.div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {/* Animated Gentle Swaying Moon Icon */}
          <motion.div
            animate={{
              y: [0, -5, 0],
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-1 shadow-sm"
          >
            <Moon className="w-6 h-6 stroke-[2.5] fill-indigo-500/30" />
          </motion.div>

          {/* Hours Count */}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentHours}
            </span>
            <span className="text-xs font-bold text-slate-400">hrs</span>
          </div>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            / {target} hrs target
          </span>

          {/* Quality Pill */}
          <div className={`mt-1.5 px-2.5 py-0.5 rounded-full border text-xs font-extrabold flex items-center gap-1 ${currentQuality.color}`}>
            <span>{currentQuality.text}</span>
          </div>
        </div>
      </div>

      {/* Bedtime / Wake Sub-Bar */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mt-4">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>Bedtime</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {bedtime || '23:00'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Wake Time</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {wakeTime || '07:00'}
          </span>
        </div>
      </div>

      {/* Sleep Goal Progress Bar */}
      <div className="w-full max-w-[280px] mt-3">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span>{percentage >= 100 ? 'Target Reached' : `${Math.max(Math.round((target - currentHours) * 10) / 10, 0)} hrs to target`}</span>
          <span className="text-indigo-400 font-bold">{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
