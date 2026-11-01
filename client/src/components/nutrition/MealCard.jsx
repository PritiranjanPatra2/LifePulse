import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Plus, Trash2, X } from 'lucide-react';

export const MealCard = ({
  category,
  meal,
  onOpenAddFood,
  onRemoveItem,
  onDeleteMeal,
}) => {
  const items = meal?.items || [];
  const totalCalories = meal?.totalCalories || 0;
  const totalProtein = meal?.totalProtein || 0;

  return (
    <Card
      className="h-full flex flex-col justify-between"
      padding="p-4 sm:p-5"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{category.emoji}</span>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {category.name}
              </h4>
              <span className="text-[11px] text-slate-400">
                {items.length} {items.length === 1 ? 'item' : 'items'} logged
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 block">
              {totalCalories} kcal
            </span>
            <span className="text-[10px] text-slate-400">
              {totalProtein}g protein
            </span>
          </div>
        </div>

        {/* Logged Items List */}
        {items.length > 0 ? (
          <div className="space-y-1.5 mb-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{item.emoji || '🍲'}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.quantity}x • {item.calories} kcal
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(meal._id, idx)}
                  title="Remove item"
                  className="opacity-60 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            <span className="text-2xl block mb-1 opacity-50">{category.emoji}</span>
            No food recorded for {category.name.toLowerCase()} yet
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
        <Button
          size="sm"
          variant="outline"
          icon={Plus}
          onClick={() => onOpenAddFood(category.name, meal)}
          className="flex-1 text-xs py-1.5"
        >
          Add Food
        </Button>
        {meal && items.length > 0 && (
          <button
            type="button"
            onClick={() => onDeleteMeal(meal._id)}
            title="Delete this entire meal"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
};
