import React from 'react';
import { AVATAR_OPTIONS } from '../../constants/emojis';
import { Check } from 'lucide-react';

export const AvatarPicker = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATAR_OPTIONS.map((avatar) => {
        const isSelected = value === avatar.id;
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.id)}
            className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 ${
              isSelected
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 shadow-sm scale-105'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${avatar.bg}`}
            >
              {avatar.emoji}
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-2 truncate w-full text-center">
              {avatar.label}
            </span>
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
