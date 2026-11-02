import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Target, TrendingDown, TrendingUp, Award, Activity } from 'lucide-react';

export const WeightScaleVisual = ({
  currentWeight = 70,
  startingWeight = 72,
  targetWeight = 68,
  heightCm = 175,
  className = '',
}) => {
  const current = Number(currentWeight) || 70;
  const start = Number(startingWeight) || 72;
  const target = Number(targetWeight) || 68;

  const totalToLose = start - target;
  const lostSoFar = start - current;
  const remaining = Math.abs(current - target).toFixed(1);
  const isLossGoal = start >= target;
  const progressPct =
    totalToLose !== 0
      ? Math.min(Math.max(Math.round((lostSoFar / totalToLose) * 100), 0), 100)
      : 100;

  // Calculate BMI
  const heightM = (heightCm || 175) / 100;
  const bmi = Math.round((current / (heightM * heightM)) * 10) / 10;
  let bmiCategory = 'Normal Weight';
  let bmiColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-orange-500 bg-orange-500/10 border-orange-500/30';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese Range';
    bmiColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
  }

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Animated Digital Scale Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-[280px] p-6 rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200/80 dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-300/80 dark:border-slate-700/80 shadow-2xl flex flex-col items-center overflow-hidden"
      >
        {/* Metallic glass corner reflections */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-2 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-white/50 dark:via-slate-600 to-transparent" />

        {/* Digital LCD Glass Display Panel */}
        <div className="w-full py-4 px-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle LED glow scanline */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

          <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-bold tracking-widest uppercase mb-1">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Digital Sensor</span>
          </div>

          {/* Animated Weight Digits */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex items-baseline gap-1.5"
          >
            <span className="text-4xl font-black text-cyan-400 tracking-tight font-mono drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              {current.toFixed(1)}
            </span>
            <span className="text-xs font-extrabold text-cyan-300 font-mono uppercase">
              kg
            </span>
          </motion.div>

          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            Target: {target.toFixed(1)} kg
          </span>
        </div>

        {/* Foot Placement Scale Sensor Grips */}
        <div className="flex items-center justify-between w-full px-4 mt-5">
          <div className="w-8 h-20 rounded-xl bg-slate-300/70 dark:bg-slate-700/50 border border-slate-400/30 flex items-center justify-center">
            <div className="w-4 h-12 border-y border-slate-400/40" />
          </div>

          {/* Central Logo / Status */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-500 flex items-center justify-center mb-1 shadow-sm"
            >
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </motion.div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              LifePulse
            </span>
          </div>

          <div className="w-8 h-20 rounded-xl bg-slate-300/70 dark:bg-slate-700/50 border border-slate-400/30 flex items-center justify-center">
            <div className="w-4 h-12 border-y border-slate-400/40" />
          </div>
        </div>

        {/* BMI Tag */}
        <div className={`mt-4 px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${bmiColor}`}>
          <span>BMI: {bmi} ({bmiCategory})</span>
        </div>
      </motion.div>

      {/* Target Metrics Sub-Bar */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mt-4">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            <Target className="w-3 h-3 text-purple-500" />
            <span>Start &rarr; Goal</span>
          </div>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
            {start} kg &rarr; {target} kg
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] uppercase font-bold mb-0.5">
            {isLossGoal ? (
              <TrendingDown className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingUp className="w-3 h-3 text-cyan-500" />
            )}
            <span>Remaining</span>
          </div>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
            {remaining} kg left
          </span>
        </div>
      </div>

      {/* Goal Journey Progress Bar */}
      <div className="w-full max-w-[280px] mt-3">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span>{progressPct >= 100 ? 'Target Achieved! 🎉' : 'Progress to Target'}</span>
          <span className="text-purple-500 font-bold">{progressPct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

