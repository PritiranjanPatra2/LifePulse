import React from 'react';
import { motion } from 'framer-motion';
import { Footprints, Flame, Navigation, Award, Sparkles } from 'lucide-react';

export const StepsTrackerVisual = ({
  currentSteps = 0,
  targetSteps = 10000,
  strideLengthCm = 75,
  className = '',
}) => {
  const target = targetSteps || 10000;
  const percentage = Math.min(Math.round((currentSteps / target) * 100), 100);
  const remainingSteps = Math.max(target - currentSteps, 0);
  const distanceKm = (Math.round(((currentSteps * strideLengthCm) / 100000) * 100) / 100).toFixed(2);
  const caloriesBurned = Math.round(currentSteps * 0.04);

  // SVG Ring Constants
  const size = 260;
  const strokeWidth = 18;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Animated Circular Step Track */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 drop-shadow-xl overflow-visible"
        >
          <defs>
            {/* Step Track Gradient */}
            <linearGradient id="stepsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="stepGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Ring */}
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
            stroke="url(#stepsGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            filter={percentage > 5 ? 'url(#stepGlow)' : undefined}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {/* Animated Footprints Icon taking steps */}
          <motion.div
            animate={{
              y: [0, -4, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mb-1 shadow-sm"
          >
            <Footprints className="w-6 h-6 stroke-[2.5]" />
          </motion.div>

          {/* Step Count */}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentSteps.toLocaleString()}
            </span>
          </div>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            / {target.toLocaleString()} steps
          </span>

          {/* Completion pill */}
          <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center gap-1">
            {percentage >= 100 ? (
              <>
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Goal Smashed! 🎉</span>
              </>
            ) : (
              <span>{percentage}% Completed</span>
            )}
          </div>
        </div>
      </div>

      {/* Walking Metrics Sub-Bar */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mt-4">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            <Navigation className="w-3 h-3 text-cyan-500" />
            <span>Distance</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {distanceKm} km
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>Energy Burn</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            ~{caloriesBurned} kcal
          </span>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="w-full max-w-[280px] mt-3">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span>{percentage >= 100 ? 'Target Achieved' : `${remainingSteps.toLocaleString()} steps left`}</span>
          <span className="text-emerald-500 font-bold">{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

