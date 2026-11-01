import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Droplets, UtensilsCrossed, Dumbbell, Footprints, Moon, Scale } from 'lucide-react';
import { waterService } from '../../services/waterService';
import { dailyLogService } from '../../services/dailyLogService';
import { exerciseService } from '../../services/exerciseService';
import { sleepService } from '../../services/sleepService';
import { weightService } from '../../services/weightService';
import { mealService } from '../../services/mealService';
import { useSelector } from 'react-redux';

export const QuickAddModal = ({ isOpen, onClose, onSuccess }) => {
  const { selectedDate } = useSelector((state) => state.date);
  const [activeTab, setActiveTab] = useState('water');
  const [loading, setLoading] = useState(false);

  // Form states
  const [waterAmount, setWaterAmount] = useState('250');
  const [stepCount, setStepCount] = useState('2500');
  const [exerciseName, setExerciseName] = useState('Brisk Walking');
  const [exerciseCat, setExerciseCat] = useState('Walking');
  const [exerciseDuration, setExerciseDuration] = useState('30');
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState('good');
  const [weightKg, setWeightKg] = useState('70');
  const [mealCategory, setMealCategory] = useState('Breakfast');
  const [mealName, setMealName] = useState('Oatmeal with Fruits');
  const [mealCalories, setMealCalories] = useState('350');

  const tabs = [
    { id: 'water', label: 'Water', icon: Droplets, color: 'text-cyan-500' },
    { id: 'food', label: 'Food', icon: UtensilsCrossed, color: 'text-amber-500' },
    { id: 'steps', label: 'Steps', icon: Footprints, color: 'text-emerald-500' },
    { id: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'text-rose-500' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-blue-500' },
    { id: 'weight', label: 'Weight', icon: Scale, color: 'text-purple-500' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'water') {
        await waterService.addWater({
          amountMl: Number(waterAmount),
          date: selectedDate,
          note: 'Quick add',
        });
      } else if (activeTab === 'steps') {
        await dailyLogService.upsertDailyLog({
          date: selectedDate,
          steps: Number(stepCount),
        });
      } else if (activeTab === 'exercise') {
        await exerciseService.createExercise({
          date: selectedDate,
          name: exerciseName,
          category: exerciseCat,
          durationMinutes: Number(exerciseDuration),
        });
      } else if (activeTab === 'sleep') {
        await sleepService.logSleep({
          date: selectedDate,
          bedtime,
          wakeTime,
          quality: sleepQuality,
        });
      } else if (activeTab === 'weight') {
        await weightService.logWeight({
          date: selectedDate,
          weightKg: Number(weightKg),
        });
      } else if (activeTab === 'food') {
        await mealService.createMeal({
          date: selectedDate,
          category: mealCategory,
          name: mealName,
          items: [
            {
              name: mealName,
              quantity: 1,
              calories: Number(mealCalories),
              protein: Math.round(Number(mealCalories) * 0.05),
              carbs: Math.round(Number(mealCalories) * 0.12),
              fat: Math.round(Number(mealCalories) * 0.03),
            },
          ],
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error logging entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Activity Log"
      subtitle={`Logging record for ${selectedDate}`}
      maxWidth="max-w-md"
    >
      {/* Category selector pills */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[65px] flex flex-col items-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? tab.color : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* WATER TAB */}
        {activeTab === 'water' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Amount (ml)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {['100', '250', '500', '750'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWaterAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      waterAmount === amt
                        ? 'border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    +{amt} ml
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                placeholder="Custom ml"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                required
              />
            </div>
          </div>
        )}

        {/* STEPS TAB */}
        {activeTab === 'steps' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Today's Step Count
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {['3000', '6000', '10000'].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setStepCount(cnt)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      stepCount === cnt
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cnt} steps
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={stepCount}
                onChange={(e) => setStepCount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>
          </div>
        )}

        {/* FOOD TAB */}
        {activeTab === 'food' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Meal Category
              </label>
              <select
                value={mealCategory}
                onChange={(e) => setMealCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Morning Snacks">Morning Snacks</option>
                <option value="Lunch">Lunch</option>
                <option value="Evening Snacks">Evening Snacks</option>
                <option value="Dinner">Dinner</option>
                <option value="Other Food">Other Food</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Food Name / Description
              </label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={mealCalories}
                onChange={(e) => setMealCalories(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>
          </div>
        )}

        {/* EXERCISE TAB */}
        {activeTab === 'exercise' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Activity Category
              </label>
              <select
                value={exerciseCat}
                onChange={(e) => {
                  setExerciseCat(e.target.value);
                  setExerciseName(e.target.value);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {['Walking', 'Running', 'Gym', 'Cycling', 'Yoga', 'Swimming', 'Football', 'Badminton', 'Stretching', 'Other'].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Activity Name
              </label>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={exerciseDuration}
                onChange={(e) => setExerciseDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>
          </div>
        )}

        {/* SLEEP TAB */}
        {activeTab === 'sleep' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Wake-up Time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sleep Quality
              </label>
              <select
                value={sleepQuality}
                onChange={(e) => setSleepQuality(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="excellent">Excellent 🌟</option>
                <option value="good">Good 😊</option>
                <option value="fair">Fair 😐</option>
                <option value="poor">Poor 😴</option>
              </select>
            </div>
          </div>
        )}

        {/* WEIGHT TAB */}
        {activeTab === 'weight' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Weight Measurement (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                required
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} size="sm">
            Save Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
