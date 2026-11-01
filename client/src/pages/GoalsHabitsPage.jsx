import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { notifyToast } from '../components/common/Toast';
import { HabitHeatmap } from '../components/charts/HabitHeatmap';
import { habitService } from '../services/habitService';
import { goalService } from '../services/goalService';
import {
  Target,
  Plus,
  Flame,
  CheckCircle2,
  Circle,
  Award,
  Sparkles,
  Trash2,
  Calendar,
  Save,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from '../components/common/Modal';

export const GoalsHabitsPage = () => {
  const { selectedDate } = useSelector((state) => state.date);

  const [habits, setHabits] = useState([]);
  const [goal, setGoal] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // New habit modal
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('✨');
  const [habitTargetDays, setHabitTargetDays] = useState('7');

  // Goals editor form states
  const [waterGoal, setWaterGoal] = useState('4000');
  const [stepsGoal, setStepsGoal] = useState('10000');
  const [caloriesGoal, setCaloriesGoal] = useState('2200');
  const [exerciseGoal, setExerciseGoal] = useState('45');
  const [sleepGoal, setSleepGoal] = useState('8');
  const [isSavingGoals, setIsSavingGoals] = useState(false);

  const loadHabitsData = async () => {
    setIsLoading(true);
    try {
      const [hRes, gRes, aRes] = await Promise.all([
        habitService.getHabits(selectedDate),
        goalService.getGoals(),
        habitService.getHabitAnalytics(60),
      ]);

      if (hRes.data) setHabits(hRes.data);
      if (gRes.data) {
        setGoal(gRes.data);
        setWaterGoal(String(gRes.data.waterMl || 4000));
        setStepsGoal(String(gRes.data.steps || 10000));
        setCaloriesGoal(String(gRes.data.calories || 2200));
        setExerciseGoal(String(gRes.data.exerciseMinutes || 45));
        setSleepGoal(String(gRes.data.sleepHours || 8));
      }
      if (aRes.data) setAnalytics(aRes.data);
    } catch (err) {
      console.error('Error loading habits/goals data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHabitsData();
  }, [selectedDate]);

  const handleToggleHabit = async (habitId, isCompleted) => {
    try {
      if (!isCompleted) {
        // Fire celebration confetti when ticking habit complete
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      await habitService.toggleHabit(habitId, selectedDate);
      loadHabitsData();
    } catch (err) {
      notifyToast({
        title: 'Action Failed',
        message: 'Error toggling habit',
        type: 'error',
      });
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!habitName) return;
    try {
      await habitService.createHabit({
        name: habitName,
        emoji: habitEmoji,
        targetDaysPerWeek: Number(habitTargetDays),
      });
      notifyToast({
        title: 'Habit Created! 🎯',
        message: `Added habit "${habitEmoji} ${habitName}".`,
        type: 'success',
      });
      setHabitName('');
      setIsHabitModalOpen(false);
      loadHabitsData();
    } catch (err) {
      notifyToast({
        title: 'Creation Failed',
        message: 'Error creating habit',
        type: 'error',
      });
    }
  };

  const handleDeleteHabit = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this habit?')) return;
    try {
      await habitService.deleteHabit(id);
      notifyToast({
        title: 'Habit Removed',
        message: 'Habit deleted.',
        type: 'info',
      });
      loadHabitsData();
    } catch (err) {
      notifyToast({
        title: 'Action Failed',
        message: 'Error deleting habit',
        type: 'error',
      });
    }
  };

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    setIsSavingGoals(true);
    try {
      await goalService.updateGoals({
        waterMl: Number(waterGoal),
        steps: Number(stepsGoal),
        calories: Number(caloriesGoal),
        exerciseMinutes: Number(exerciseGoal),
        sleepHours: Number(sleepGoal),
      });
      setIsSavingGoals(false);
      loadHabitsData();
      notifyToast({
        title: 'Daily Targets Saved! 🎯',
        message: `Updated step goal (${Number(stepsGoal).toLocaleString()}), hydration (${waterGoal} ml) and calories.`,
        type: 'success',
      });
    } catch (err) {
      setIsSavingGoals(false);
      notifyToast({
        title: 'Targets Update Failed',
        message: err.response?.data?.message || 'Error saving targets',
        type: 'error',
      });
    }
  };

  const badges = analytics?.badges || [];
  const heatmapData = analytics?.heatmap || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Goals & Habit Mastery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Daily checklists, streaks, achievement badges & custom goals
          </p>
        </div>

        <Button
          size="sm"
          icon={Plus}
          onClick={() => setIsHabitModalOpen(true)}
        >
          Create New Habit
        </Button>
      </div>

      {/* DAILY CHECKLIST & STREAKS (7 Cols) vs BADGES (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Habit Checklist (7 Cols) */}
        <Card
          title={`Daily Habit Checklist • ${selectedDate}`}
          subtitle="Click to toggle completion for this day"
          icon={CheckCircle2}
          className="lg:col-span-7"
        >
          {habits.length > 0 ? (
            <div className="space-y-3">
              {habits.map((h) => {
                const isDone = h.isCompletedToday;
                return (
                  <div
                    key={h._id}
                    onClick={() => handleToggleHabit(h._id, isDone)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      isDone
                        ? 'border-brand-500/50 bg-brand-50/50 dark:bg-brand-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-brand-500 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="text-2xl">{h.emoji || '✨'}</span>
                      <div>
                        <h4
                          className={`text-sm font-bold transition-all ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {h.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Target: {h.targetDaysPerWeek} days/week
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{h.currentStreak || 0}d streak</span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteHabit(h._id, e)}
                        title="Delete habit"
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No habits created yet. Click "Create New Habit" above!
            </div>
          )}
        </Card>

        {/* Achievement Badges (5 Cols) */}
        <Card
          title="Achievement Badges"
          subtitle="Milestones unlocked through continuous consistency"
          icon={Award}
          className="lg:col-span-5"
        >
          <div className="space-y-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border flex items-center gap-3.5 transition-all ${
                  b.achieved
                    ? 'border-brand-500/40 bg-brand-50/40 dark:bg-brand-950/20'
                    : 'border-slate-100 dark:border-slate-800 opacity-50 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl shrink-0">
                  {b.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {b.name}
                    </h5>
                    {b.achieved && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-500 text-white">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* GITHUB-STYLE 60-DAY HABIT CONTRIBUTION HEATMAP */}
      <Card
        title="60-Day Habit Consistency Heatmap"
        subtitle="Visual representation of daily commitment frequency"
        icon={Calendar}
      >
        <HabitHeatmap data={heatmapData} />
      </Card>

      {/* DAILY GOALS TARGETS FORM */}
      <Card
        title="Personal Daily Goals Configuration"
        subtitle="Configure the benchmark metrics for your dashboard"
        icon={Target}
      >
        <form onSubmit={handleSaveGoals} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Steps Target
              </label>
              <input
                type="number"
                value={stepsGoal}
                onChange={(e) => setStepsGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Water Target (ml)
              </label>
              <input
                type="number"
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={caloriesGoal}
                onChange={(e) => setCaloriesGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Exercise (mins)
              </label>
              <input
                type="number"
                value={exerciseGoal}
                onChange={(e) => setExerciseGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Sleep (hours)
              </label>
              <input
                type="number"
                value={sleepGoal}
                onChange={(e) => setSleepGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" icon={Save} isLoading={isSavingGoals}>
              Update Daily Targets
            </Button>
          </div>
        </form>
      </Card>

      {/* CREATE HABIT MODAL */}
      <Modal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        title="Create New Habit"
        subtitle="Build healthy daily patterns"
      >
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Habit Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning 10-Min Meditation, No Sugar"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Choose Emoji Icon
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              {['🚶', '💧', '🥤', '🧘', '🌙', '📖', '🥗', '⚡', '🚴', '🏋️'].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setHabitEmoji(em)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all ${
                    habitEmoji === em
                      ? 'bg-brand-500/20 ring-2 ring-brand-500 scale-110'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Frequency (Days / Week)
            </label>
            <select
              value={habitTargetDays}
              onChange={(e) => setHabitTargetDays(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              {[7, 6, 5, 4, 3, 2, 1].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'day' : 'days'} per week
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsHabitModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
