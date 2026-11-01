import React from 'react';

export const HabitHeatmap = ({ data = [], days = 60 }) => {
  // If data is empty, generate placeholder 60 days
  const items = data.length > 0 ? data : [];

  const getColorClass = (count) => {
    if (!count || count === 0) return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-700 text-white';
    if (count === 3) return 'bg-emerald-500 dark:bg-emerald-600 text-white';
    return 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs';
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 justify-start">
        {items.map((item, idx) => (
          <div
            key={item.date || idx}
            title={`${item.date}: ${item.count} habits completed`}
            className={`w-4 h-4 rounded-md transition-all duration-150 hover:scale-125 cursor-pointer ${getColorClass(
              item.count
            )}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Less consistent</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800" title="0 habits" />
          <div className="w-3.5 h-3.5 rounded bg-emerald-200 dark:bg-emerald-900/60" title="1 habit" />
          <div className="w-3.5 h-3.5 rounded bg-emerald-400 dark:bg-emerald-700" title="2-3 habits" />
          <div className="w-3.5 h-3.5 rounded bg-emerald-600 dark:bg-emerald-500" title="4+ habits" />
        </div>
        <span>More consistent</span>
      </div>
    </div>
  );
};

