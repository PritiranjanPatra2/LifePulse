import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { notifyToast } from '../components/common/Toast';
import { ExerciseDonutChart } from '../components/charts/ExerciseDonutChart';
import { EXERCISE_CATEGORIES } from '../constants/emojis';
import { exerciseService } from '../services/exerciseService';
import { goalService } from '../services/goalService';
import {
  Dumbbell,
  Plus,
  Flame,
  Timer,
  Award,
  Trash2,
  TrendingUp,
} from 'lucide-react';

export const FitnessPage = () => {
  const { selectedDate } = useSelector((state) => state.date);

  const [exercises, setExercises] = useState([]);
  const [goal, setGoal] = useState(null);
  const [allHistory, setAllHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // New exercise form states
  const [selectedCat, setSelectedCat] = useState('Gym');
  const [activityName, setActivityName] = useState('Strength Workout');
  const [durationMin, setDurationMin] = useState('45');
  const [startTime, setStartTime] = useState('07:30');
  const [intensity, setIntensity] = useState('medium');
  const [notes, setNotes] = useState('');

  const loadFitnessData = async () => {
    setIsLoading(true);
    try {
      const [todayEx, gRes, histEx] = await Promise.all([
        exerciseService.getExercises({ date: selectedDate }),
        goalService.getGoals(),
        exerciseService.getExercises({}), // all history for distribution analytics
      ]);

      if (todayEx.data) setExercises(todayEx.data);
      if (gRes.data) setGoal(gRes.data);
      if (histEx.data) setAllHistory(histEx.data);
    } catch (err) {
      console.error('Error loading fitness data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFitnessData();
  }, [selectedDate]);

  const handleSelectCategoryPill = (cat) => {
    setSelectedCat(cat.name);
    setActivityName(`${cat.name} Session`);
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    try {
      await exerciseService.createExercise({
        date: selectedDate,
        name: activityName,
        category: selectedCat,
        durationMinutes: Number(durationMin),
        startTime,
        intensity,
        notes,
      });

      alert(`Exercise "${activityName}" (${durationMin} mins) saved successfully!`);
      notifyToast({
        title: 'Exercise Recorded! 🏋️',
        message: `Logged ${durationMin} mins of ${activityName}.`,
        type: 'success',
      });

      setNotes('');
      loadFitnessData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving exercise');
      notifyToast({
        title: 'Exercise Failed',
        message: err.response?.data?.message || 'Error saving exercise',
        type: 'error',
      });
    }
  };

  const handleDeleteExercise = async (id) => {
    try {
      await exerciseService.deleteExercise(id);
      notifyToast({
        title: 'Exercise Deleted',
        message: 'Exercise session removed.',
        type: 'info',
      });
      loadFitnessData();
    } catch (err) {
      notifyToast({
        title: 'Action Failed',
        message: 'Error removing exercise',
        type: 'error',
      });
    }
  };

  // Stats calculation
  const totalMinutesToday = exercises.reduce((sum, e) => sum + e.durationMinutes, 0);
  const totalCaloriesToday = exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);
  const targetMinutes = goal?.exerciseMinutes || 45;

  // Most frequent activity across history
  const activityFrequency = {};
  allHistory.forEach((e) => {
    activityFrequency[e.category] = (activityFrequency[e.category] || 0) + 1;
  });
  let mostFrequentActivity = 'None';
  let maxCount = 0;
  Object.entries(activityFrequency).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentActivity = cat;
    }
  });

  // Category distribution for Donut Chart
  const categoryMinutesMap = {};
  allHistory.forEach((e) => {
    categoryMinutesMap[e.category] = (categoryMinutesMap[e.category] || 0) + e.durationMinutes;
  });
  const donutData = Object.keys(categoryMinutesMap).map((cat) => ({
    name: cat,
    minutes: categoryMinutesMap[cat],
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Fitness & Exercise Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Workout logs, calorie burn estimates & activity distribution
        </p>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card hover padding="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <Timer className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Duration
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalMinutesToday}
            </span>
            <span className="text-xs text-slate-400">/ {targetMinutes} mins</span>
          </div>
        </Card>

        <Card hover padding="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Burn Estimate
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ~{totalCaloriesToday}
            </span>
            <span className="text-xs text-slate-400">kcal</span>
          </div>
        </Card>

        <Card hover padding="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Dumbbell className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Sessions
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {allHistory.length}
            </span>
            <span className="text-xs text-slate-400">logged</span>
          </div>
        </Card>

        <Card hover padding="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Activity
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900 dark:text-white truncate">
              {mostFrequentActivity}
            </span>
          </div>
        </Card>
      </div>

      {/* LOGGING FORM & TODAY'S SESSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Exercise Form (7 Cols) */}
        <Card
          title="Log Workout Activity"
          subtitle="Choose category & details"
          icon={Dumbbell}
          className="lg:col-span-7"
        >
          {/* Quick Category Selector Pills */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-5 gap-2">
              {EXERCISE_CATEGORIES.map((cat) => {
                const isSelected = selectedCat === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleSelectCategoryPill(cat)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl mb-1">{cat.emoji}</span>
                    <span className="truncate w-full text-center text-[11px]">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleAddExercise} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Workout Title
              </label>
              <input
                type="text"
                required
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="e.g. 5K Outdoor Run"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Intensity
                </label>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="low">Low (Light)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Intense)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Workout Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reps, distance, heart rate, or feelings..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <Button type="submit" size="sm" icon={Plus} className="w-full">
              Record Exercise
            </Button>
          </form>
        </Card>

        {/* Sessions & Distribution Donut (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card
            title="Today's Logged Workouts"
            subtitle={`${exercises.length} sessions for ${selectedDate}`}
            icon={Dumbbell}
          >
            {exercises.length > 0 ? (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {exercises.map((ex) => (
                  <div
                    key={ex._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ex.emoji}</span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {ex.name}
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          {ex.durationMinutes} mins • ~{ex.caloriesBurned} kcal ({ex.intensity})
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteExercise(ex._id)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No workouts logged today yet
              </div>
            )}
          </Card>

          {/* Exercise Category Donut Chart */}
          <Card
            title="Activity Category Distribution"
            subtitle="Lifetime training minutes breakdown"
            icon={TrendingUp}
          >
            <ExerciseDonutChart data={donutData} height={230} />
          </Card>
        </div>
      </div>
    </div>
  );
};
