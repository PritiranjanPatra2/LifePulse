import React from 'react';

export const MacroNutrientBar = ({
  protein = 0,
  carbs = 0,
  fat = 0,
  targetProtein = 80,
  targetCarbs = 250,
  targetFat = 65,
}) => {
  // 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const totalCals = proteinCals + carbsCals + fatCals || 1;

  const proteinPct = Math.round((proteinCals / totalCals) * 100);
  const carbsPct = Math.round((carbsCals / totalCals) * 100);
  const fatPct = Math.max(100 - proteinPct - carbsPct, 0);

  return (
    <div className="space-y-3">
      {/* Segmented Macro Bar */}
      <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
        <div
          style={{ width: `${proteinPct}%` }}
          className="bg-emerald-500 h-full transition-all duration-300"
          title={`Protein: ${protein}g (${proteinPct}%)`}
        />
        <div
          style={{ width: `${carbsPct}%` }}
          className="bg-blue-500 h-full transition-all duration-300"
          title={`Carbs: ${carbs}g (${carbsPct}%)`}
        />
        <div
          style={{ width: `${fatPct}%` }}
          className="bg-amber-500 h-full transition-all duration-300"
          title={`Fat: ${fat}g (${fatPct}%)`}
        />
      </div>

      {/* Macro details pills */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              Protein
            </span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {protein}g
          </span>
          <span className="text-[10px] text-slate-400 block">
            / {targetProtein}g target
          </span>
        </div>

        <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
              Carbs
            </span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {carbs}g
          </span>
          <span className="text-[10px] text-slate-400 block">
            / {targetCarbs}g target
          </span>
        </div>

        <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
              Fats
            </span>
          </div>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {fat}g
          </span>
          <span className="text-[10px] text-slate-400 block">
            / {targetFat}g target
          </span>
        </div>
      </div>
    </div>
  );
};
