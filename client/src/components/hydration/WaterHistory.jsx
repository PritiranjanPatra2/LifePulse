import React from 'react';
import { Trash2, Clock, Droplets } from 'lucide-react';

export const WaterHistory = ({ logs = [], onDeleteLog }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Droplets className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-500" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No water logs recorded yet today
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Use the quick-add buttons above to log your hydration
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
      {logs.map((log) => {
        const timeFormatted = new Date(log.loggedAt || log.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={log._id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                💧
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  +{log.amountMl} ml
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{timeFormatted}</span>
                  {log.note && <span>• {log.note}</span>}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDeleteLog(log._id)}
              title="Delete record"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

