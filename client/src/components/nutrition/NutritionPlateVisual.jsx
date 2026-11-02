import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Flame, PieChart, Award, Sparkles } from 'lucide-react';

export const NutritionPlateVisual = ({
  caloriesConsumed = 0,
  caloriesTarget = 2200,
  proteinGrams = 0,
  proteinTarget = 80,
  carbsGrams = 0,
  carbsTarget = 250,
  fatGrams = 0,
  fatTarget = 65,
  mealsCount = 0,
  className = '',
}) => {
  const target = caloriesTarget || 2200;
  const calPct = Math.min(Math.round((caloriesConsumed / target) * 100), 100);
  const remainingCals = Math.max(target - caloriesConsumed, 0);

  // Concentric Rings Configuration
  const size = 260;
  const center = size / 2;

  // Outer Ring: Calories (Emerald)
  const r1 = 110;
  const c1 = 2 * Math.PI * r1;
  const off1 = c1 - (calPct / 100) * c1;

  // Middle Ring: Protein (Cyan)
  const proteinPct = Math.min(Math.round((proteinGrams / (proteinTarget || 80)) * 100), 100);
  const r2 = 90;
  const c2 = 2 * Math.PI * r2;
  const off2 = c2 - (proteinPct / 100) * c2;

  // Inner Ring: Carbs (Amber)
  const carbsPct = Math.min(Math.round((carbsGrams / (carbsTarget || 250)) * 100), 100);
  const r3 = 72;
  const c3 = 2 * Math.PI * r3;
  const off3 = c3 - (carbsPct / 100) * c3;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Concentric Macro Plate Rings */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 drop-shadow-xl overflow-visible"
        >
          <defs>
            <linearGradient id="calPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="proteinPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="carbsPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <filter id="plateGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track 1 (Calories) */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={12}
            className="text-slate-100 dark:text-slate-800/80"
          />
          {/* Progress 1 (Calories) */}
          <motion.circle
            cx={center}
            cy={center}
            r={r1}
            fill="transparent"
            stroke="url(#calPlateGrad)"
            strokeWidth={12}
            strokeDasharray={c1}
            initial={{ strokeDashoffset: c1 }}
            animate={{ strokeDashoffset: off1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            strokeLinecap="round"
          />

          {/* Background Track 2 (Protein) */}
          <circle
            cx={center}
            cy={center}
            r={r2}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={10}
            className="text-slate-100 dark:text-slate-800/80"
          />
          {/* Progress 2 (Protein) */}
          <motion.circle
            cx={center}
            cy={center}
            r={r2}
            fill="transparent"
            stroke="url(#proteinPlateGrad)"
            strokeWidth={10}
            strokeDasharray={c2}
            initial={{ strokeDashoffset: c2 }}
            animate={{ strokeDashoffset: off2 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            strokeLinecap="round"
          />

          {/* Background Track 3 (Carbs) */}
          <circle
            cx={center}
            cy={center}
            r={r3}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={8}
            className="text-slate-100 dark:text-slate-800/80"
          />
          {/* Progress 3 (Carbs) */}
          <motion.circle
            cx={center}
            cy={center}
            r={r3}
            fill="transparent"
            stroke="url(#carbsPlateGrad)"
            strokeWidth={8}
            strokeDasharray={c3}
            initial={{ strokeDashoffset: c3 }}
            animate={{ strokeDashoffset: off3 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Orbiting food emoji animations */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 pointer-events-none"
        >
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-sm">🍚</span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-sm">🥗</span>
          <span className="absolute top-1/2 right-1 -translate-y-1/2 text-sm">🥚</span>
          <span className="absolute top-1/2 left-1 -translate-y-1/2 text-sm">🍌</span>
        </motion.div>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mb-1 shadow-sm"
          >
            <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
          </motion.div>

          {/* Calorie Count */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {caloriesConsumed.toLocaleString()}
            </span>
          </div>

          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            / {target.toLocaleString()} kcal
          </span>

          {/* Calorie status badge */}
          <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold">
            {calPct >= 100 ? 'Target Met 🎯' : `${calPct}% Fueled`}
          </div>
        </div>
      </div>

      {/* 3 Concentric Ring Legend with Grams */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mt-4">
        {/* Protein */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-cyan-500 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Protein</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
            {proteinGrams}g
          </span>
          <span className="text-[9px] text-slate-400">/ {proteinTarget}g</span>
        </div>

        {/* Carbs */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-500 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Carbs</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
            {carbsGrams}g
          </span>
          <span className="text-[9px] text-slate-400">/ {carbsTarget}g</span>
        </div>

        {/* Fat */}
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-500 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Fats</span>
          </div>
          <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">
            {fatGrams}g
          </span>
          <span className="text-[9px] text-slate-400">/ {fatTarget}g</span>
        </div>
      </div>

      {/* Meals Logged Progress */}
      <div className="w-full max-w-[280px] mt-3">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span>{remainingCals > 0 ? `${remainingCals} kcal remaining` : 'Target reached!'}</span>
          <span className="text-emerald-500 font-bold">{mealsCount} meals logged</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

