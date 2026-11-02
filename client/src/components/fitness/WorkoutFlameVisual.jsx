import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Timer, Heart, Zap, Award } from 'lucide-react';

export const WorkoutFlameVisual = ({
  currentMinutes = 0,
  targetMinutes = 45,
  caloriesBurned = 0,
  sessionCount = 0,
  className = '',
}) => {
  const target = targetMinutes || 45;
  const percentage = Math.min(Math.round((currentMinutes / target) * 100), 100);
  const remainingMinutes = Math.max(target - currentMinutes, 0);

  // SVG Ring Constants
  const size = 260;
  const strokeWidth = 18;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Animated Workout Ring */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 drop-shadow-xl overflow-visible"
        >
          <defs>
            {/* Fiery Gradient */}
            <linearGradient id="flameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>

            {/* Heat Glow Filter */}
            <filter id="flameGlow" x="-20%" y="-20%" width="140%" height="140%">
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
            stroke="url(#flameGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            filter={percentage > 5 ? 'url(#flameGlow)' : undefined}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {/* Animated Pulsing Flame Icon */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-rose-500 flex items-center justify-center mb-1 shadow-sm"
          >
            <Flame className="w-6 h-6 stroke-[2.5] fill-rose-500/30" />
          </motion.div>

          {/* Active Minutes Count */}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentMinutes}
            </span>
            <span className="text-xs font-bold text-slate-400">mins</span>
          </div>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            / {target} min target
          </span>

          {/* Badge */}
          <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-extrabold flex items-center gap-1">
            {percentage >= 100 ? (
              <>
                <Award className="w-3.5 h-3.5 text-rose-500" />
                <span>Burn Complete! 🔥</span>
              </>
            ) : (
              <span>{percentage}% of Daily Target</span>
            )}
          </div>
        </div>
      </div>

      {/* Fitness Sub-Metrics */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mt-4">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Active Burn</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {caloriesBurned || Math.round(currentMinutes * 8.5)} kcal
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            <Dumbbell className="w-3 h-3 text-rose-500" />
            <span>Sessions</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {sessionCount || (currentMinutes > 0 ? 1 : 0)} logged
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-[280px] mt-3">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span>{percentage >= 100 ? 'Target Crushed' : `${remainingMinutes} mins remaining`}</span>
          <span className="text-rose-500 font-bold">{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

