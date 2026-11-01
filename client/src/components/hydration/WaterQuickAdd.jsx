import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Plus, RotateCcw, Droplets } from 'lucide-react';

export const WaterQuickAdd = ({ onAddWater, onUndo, canUndo = false, isLoading = false }) => {
  const [customAmount, setCustomAmount] = useState('');
  const presets = [
    { label: '+100 ml', amount: 100, desc: 'Small glass' },
    { label: '+250 ml', amount: 250, desc: 'Regular cup' },
    { label: '+500 ml', amount: 500, desc: 'Sports bottle' },
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = Number(customAmount);
    if (val > 0) {
      onAddWater(val, 'Custom entry');
      setCustomAmount('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {presets.map((p) => (
          <button
            key={p.amount}
            type="button"
            disabled={isLoading}
            onClick={() => onAddWater(p.amount, p.desc)}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-cyan-50/70 hover:bg-cyan-100/80 dark:bg-cyan-950/30 dark:hover:bg-cyan-900/40 border border-cyan-200/80 dark:border-cyan-800/60 transition-all duration-200 group active:scale-95 disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-cyan-900 dark:text-cyan-200">
              {p.label}
            </span>
            <span className="text-[10px] text-cyan-600/70 dark:text-cyan-400/70">
              {p.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Amount Input Row */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            min="10"
            max="3000"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Custom amount (e.g. 350 ml)"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
            ml
          </span>
        </div>
        <Button
          type="submit"
          disabled={!customAmount || isLoading}
          variant="cyan"
          size="sm"
          icon={Plus}
        >
          Add
        </Button>
        {canUndo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={isLoading}
            icon={RotateCcw}
            title="Undo latest water entry"
          >
            Undo
          </Button>
        )}
      </form>
    </div>
  );
};
