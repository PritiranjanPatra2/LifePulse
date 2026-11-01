import React from 'react';
import { motion } from 'framer-motion';

export const WaterBottle = ({
  currentMl = 0,
  targetMl = 4000,
  className = '',
}) => {
  const percentage = Math.min(Math.round((currentMl / (targetMl || 4000)) * 100), 100);
  const currentL = (currentMl / 1000).toFixed(1);
  const targetL = ((targetMl || 4000) / 1000).toFixed(1);
  const remainingMl = Math.max((targetMl || 4000) - currentMl, 0);
  const remainingL = (remainingMl / 1000).toFixed(1);

  // SVG dimensions for bottle
  const BOTTLE_HEIGHT = 380;
  const BOTTLE_WIDTH = 180;
  const BOTTLE_BODY_TOP = 80;
  const BOTTLE_BODY_BOTTOM = 360;
  const MAX_WATER_HEIGHT = BOTTLE_BODY_BOTTOM - BOTTLE_BODY_TOP; // 280px

  // Calculate pixel height of water
  const fillFraction = Math.min(currentMl / (targetMl || 4000), 1);
  const waterHeightPx = fillFraction * MAX_WATER_HEIGHT;
  const waterTopY = BOTTLE_BODY_BOTTOM - waterHeightPx;

  // Bottle body path
  // Starts at cap, neck, curves outward to shoulder, down straight sides, rounded base
  const bottlePath = `
    M 68,15
    L 112,15
    Q 116,15 116,22
    L 116,40
    Q 116,45 112,45
    L 106,45
    L 106,70
    Q 106,85 130,95
    Q 150,105 150,130
    L 150,335
    Q 150,365 125,365
    L 55,365
    Q 30,365 30,335
    L 30,130
    Q 30,105 50,95
    Q 74,85 74,70
    L 74,45
    L 68,45
    Q 64,45 64,40
    L 64,22
    Q 64,15 68,15
    Z
  `;

  // Bottle interior fill clip path
  const bottleInnerClip = `
    M 76,72
    Q 76,86 52,98
    Q 34,108 34,132
    L 34,333
    Q 34,361 57,361
    L 123,361
    Q 146,361 146,333
    L 146,132
    Q 146,108 128,98
    Q 104,86 104,72
    Z
  `;

  // Ticks at 25%, 50%, 75%, 100%
  const ticks = [
    { fraction: 0.25, label: `${((targetMl * 0.25) / 1000).toFixed(1)}L` },
    { fraction: 0.5, label: `${((targetMl * 0.5) / 1000).toFixed(1)}L` },
    { fraction: 0.75, label: `${((targetMl * 0.75) / 1000).toFixed(1)}L` },
    { fraction: 1.0, label: `${targetL}L` },
  ];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* SVG Bottle Display */}
      <div className="relative w-[210px] h-[400px] flex items-center justify-center">
        <svg
          viewBox="0 0 180 380"
          className="w-full h-full drop-shadow-xl overflow-visible"
        >
          <defs>
            {/* Water gradient */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="waveHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Glass reflection gradient */}
            <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="15%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="90%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
            </linearGradient>

            {/* Bottle Inner Clip Mask */}
            <clipPath id="bottleInsideMask">
              <path d={bottleInnerClip} />
            </clipPath>
          </defs>

          {/* Bottle Back / Shadow */}
          <path
            d={bottlePath}
            className="fill-slate-100/60 dark:fill-slate-800/50 stroke-slate-200 dark:stroke-slate-700/60"
            strokeWidth="3"
          />

          {/* Water content group (clipped to bottle interior) */}
          <g clipPath="url(#bottleInsideMask)">
            {/* Rising Water Level */}
            <motion.rect
              x="0"
              width="180"
              initial={{ y: BOTTLE_BODY_BOTTOM, height: 0 }}
              animate={{
                y: waterTopY,
                height: waterHeightPx,
              }}
              transition={{
                type: 'spring',
                damping: 18,
                stiffness: 90,
              }}
              fill="url(#waterGradient)"
            />

            {/* Animated Wave 1 */}
            {fillFraction > 0.02 && (
              <motion.g
                initial={{ y: waterTopY }}
                animate={{ y: waterTopY }}
                transition={{ type: 'spring', damping: 18, stiffness: 90 }}
              >
                <motion.path
                  d="M -180,0 Q -90,-8 0,0 Q 90,8 180,0 Q 270,-8 360,0 L 360,20 L -180,20 Z"
                  fill="#7dd3fc"
                  fillOpacity="0.45"
                  animate={{
                    x: [-180, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'linear',
                  }}
                />
                <motion.path
                  d="M -180,0 Q -90,8 0,0 Q 90,-8 180,0 Q 270,8 360,0 L 360,20 L -180,20 Z"
                  fill="#ffffff"
                  fillOpacity="0.35"
                  animate={{
                    x: [0, -180],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: 'linear',
                  }}
                />
              </motion.g>
            )}

            {/* Floating Rising Bubbles */}
            {fillFraction > 0.1 && (
              <>
                <motion.circle
                  cx="65"
                  r="3"
                  fill="#ffffff"
                  fillOpacity="0.7"
                  animate={{
                    cy: [BOTTLE_BODY_BOTTOM - 20, Math.max(waterTopY + 10, 80)],
                    opacity: [0, 0.8, 0],
                    x: [0, 4, -3, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.8,
                    ease: 'easeInOut',
                    delay: 0.2,
                  }}
                />
                <motion.circle
                  cx="110"
                  r="4"
                  fill="#ffffff"
                  fillOpacity="0.65"
                  animate={{
                    cy: [BOTTLE_BODY_BOTTOM - 10, Math.max(waterTopY + 12, 80)],
                    opacity: [0, 0.9, 0],
                    x: [0, -5, 3, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.4,
                    ease: 'easeInOut',
                    delay: 1.0,
                  }}
                />
                <motion.circle
                  cx="85"
                  r="2.5"
                  fill="#ffffff"
                  fillOpacity="0.8"
                  animate={{
                    cy: [BOTTLE_BODY_BOTTOM - 30, Math.max(waterTopY + 8, 80)],
                    opacity: [0, 0.7, 0],
                    x: [0, 3, -4, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeInOut',
                    delay: 1.7,
                  }}
                />
              </>
            )}
          </g>

          {/* Volume Measurement Graduation Lines & Ticks */}
          {ticks.map((t) => {
            const tickY = BOTTLE_BODY_BOTTOM - t.fraction * MAX_WATER_HEIGHT;
            return (
              <g key={t.fraction} opacity="0.65">
                <line
                  x1="134"
                  y1={tickY}
                  x2="144"
                  y2={tickY}
                  className="stroke-slate-400 dark:stroke-slate-500"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <text
                  x="126"
                  y={tickY + 3}
                  textAnchor="end"
                  className="fill-slate-500 dark:fill-slate-400 font-bold text-[9px]"
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* Glass Specular Sheen Overlay */}
          <path
            d={bottlePath}
            fill="url(#glassSheen)"
            className="pointer-events-none"
          />

          {/* Bottle Rim / Cap Highlight */}
          <rect
            x="64"
            y="18"
            width="52"
            height="24"
            rx="5"
            className="fill-slate-800 dark:fill-slate-700 stroke-slate-600 dark:stroke-slate-500"
            strokeWidth="2"
          />
          {/* Cap grip ribs */}
          <line x1="77" y1="23" x2="77" y2="37" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="90" y1="23" x2="90" y2="37" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="103" y1="23" x2="103" y2="37" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Bottle Outer Gloss Border */}
          <path
            d={bottlePath}
            fill="none"
            className="stroke-slate-300 dark:stroke-slate-600/80 pointer-events-none"
            strokeWidth="3"
          />
        </svg>

        {/* Center Percentage Display Badge */}
        <div className="absolute inset-x-0 bottom-24 flex flex-col items-center pointer-events-none">
          <motion.div
            key={percentage}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-3.5 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-premium flex flex-col items-center"
          >
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
              {percentage}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 -mt-0.5">
              Target Hydrated
            </span>
          </motion.div>
        </div>
      </div>

      {/* Hydration Stats Readout Below Bottle */}
      <div className="w-full max-w-xs mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            Consumed
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {currentMl.toLocaleString()} <span className="text-xs font-normal text-slate-500">ml</span>
          </span>
          <span className="text-[11px] text-cyan-500 font-semibold block">
            ({currentL} / {targetL} L)
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
            Remaining
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {remainingMl.toLocaleString()} <span className="text-xs font-normal text-slate-500">ml</span>
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block">
            ({remainingL} L to go)
          </span>
        </div>
      </div>
    </div>
  );
};

