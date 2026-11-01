import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { WaterQuickAdd } from '../components/hydration/WaterQuickAdd';
import { WaterHistory } from '../components/hydration/WaterHistory';
import { FoodLibraryModal } from '../components/nutrition/FoodLibraryModal';
import { MealCard } from '../components/nutrition/MealCard';
import { MEAL_CATEGORIES } from '../constants/emojis';
import { waterService } from '../services/waterService';
import { mealService } from '../services/mealService';
import { exerciseService } from '../services/exerciseService';
import { dailyLogService } from '../services/dailyLogService';
import { sleepService } from '../services/sleepService';
import { weightService } from '../services/weightService';
import {
  UtensilsCrossed,
  Droplets,
  Dumbbell,
  Footprints,
  Moon,
  Scale,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const DailyTrackerPage = () => {
  const { selectedDate } = useSelector((state) => state.date);

  // Active section tab
  const [activeTab, setActiveTab] = useState('all');

  // Water data
  const [waterLogs, setWaterLogs] = useState([]);
  const [waterSummary, setWaterSummary] = useState(null);

  // Meal data
  const [meals, setMeals] = useState([]);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [activeMealCategory, setActiveMealCategory] = useState('Breakfast');
  const [activeMealToEdit, setActiveMealToEdit] = useState(null);

  // Exercise data
  const [exercises, setExercises] = useState([]);
  const [newExName, setNewExName] = useState('');
  const [newExCat, setNewExCat] = useState('Gym');
  const [newExDur, setNewExDur] = useState('45');

  // Steps & Notes
  const [dailyLog, setDailyLog] = useState(null);
  const [stepsInput, setStepsInput] = useState('0');
  const [notesInput, setNotesInput] = useState('');
  const [moodInput, setMoodInput] = useState('good');
  const [isSavingDailyLog, setIsSavingDailyLog] = useState(false);

  // Sleep
  const [sleepLog, setSleepLog] = useState(null);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepQuality, setSleepQuality] = useState('good');

  // Weight
  const [weightKg, setWeightKg] = useState('');

  // Load all data for the selected date
  const loadDateData = async () => {
    try {
      const [wLogs, wSumm, mList, exList, dLogs, sLogs, wList] = await Promise.all([
        waterService.getWaterLogs({ date: selectedDate }),
        waterService.getWaterSummary(selectedDate),
        mealService.getMeals({ date: selectedDate }),
        exerciseService.getExercises({ date: selectedDate }),
        dailyLogService.getDailyLogs({ date: selectedDate }),
        sleepService.getSleepLogs({ date: selectedDate }),
        weightService.getWeightLogs({ startDate: selectedDate, endDate: selectedDate }),
      ]);

      if (wLogs.data) setWaterLogs(wLogs.data);
      if (wSumm.data) setWaterSummary(wSumm.data);
      if (mList.data) setMeals(mList.data);
      if (exList.data) setExercises(exList.data);

      const dEntry = dLogs.data?.[0];
      setDailyLog(dEntry || null);
      setStepsInput(dEntry?.steps ? String(dEntry.steps) : '0');
      setNotesInput(dEntry?.notes || '');
      setMoodInput(dEntry?.overallMood || 'good');

      const sEntry = sLogs.data?.[0];
      setSleepLog(sEntry || null);
      if (sEntry) {
        setBedtime(sEntry.bedtime || '23:00');
        setWakeTime(sEntry.wakeTime || '07:00');
        setSleepQuality(sEntry.quality || 'good');
      }

      const wEntry = wList.data?.[0];
      setWeightKg(wEntry?.weightKg ? String(wEntry.weightKg) : '');
    } catch (err) {
      console.error('Error loading daily tracker data:', err);
    }
  };

  useEffect(() => {
    loadDateData();
  }, [selectedDate]);

  // WATER HANDLERS
  const handleAddWater = async (amountMl, note) => {
    try {
      await waterService.addWater({
        amountMl,
        date: selectedDate,
        note,
      });
      loadDateData();
    } catch (err) {
      alert('Error logging water');
    }
  };

  const handleDeleteWater = async (id) => {
    try {
      await waterService.deleteWater(id);
      loadDateData();
    } catch (err) {
      alert('Error removing water log');
    }
  };

  const handleUndoWater = async () => {
    try {
      await waterService.undoLastWater(selectedDate);
      loadDateData();
    } catch (err) {
      alert('Nothing to undo');
    }
  };

  // MEAL HANDLERS
  const handleOpenAddFood = (categoryName, existingMeal) => {
    setActiveMealCategory(categoryName);
    setActiveMealToEdit(existingMeal);
    setIsFoodModalOpen(true);
  };

  const handleSelectFoodItem = async (foodItem) => {
    try {
      if (activeMealToEdit) {
        // Append item to existing meal
        const updatedItems = [...(activeMealToEdit.items || []), foodItem];
        await mealService.updateMeal(activeMealToEdit._id, {
          items: updatedItems,
        });
      } else {
        // Create new meal for this category
        await mealService.createMeal({
          date: selectedDate,
          category: activeMealCategory,
          name: activeMealCategory,
          items: [foodItem],
        });
      }
      loadDateData();
    } catch (err) {
      alert('Error adding food item to meal');
    }
  };

  const handleRemoveMealItem = async (mealId, itemIndex) => {
    const targetMeal = meals.find((m) => m._id === mealId);
    if (!targetMeal) return;

    const updatedItems = targetMeal.items.filter((_, idx) => idx !== itemIndex);
    try {
      if (updatedItems.length === 0) {
        await mealService.deleteMeal(mealId);
      } else {
        await mealService.updateMeal(mealId, { items: updatedItems });
      }
      loadDateData();
    } catch (err) {
      alert('Error removing food item');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Delete this meal entry?')) return;
    try {
      await mealService.deleteMeal(mealId);
      loadDateData();
    } catch (err) {
      alert('Error deleting meal');
    }
  };

  // EXERCISE HANDLERS
  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!newExName) return;
    try {
      await exerciseService.createExercise({
        date: selectedDate,
        name: newExName,
        category: newExCat,
        durationMinutes: Number(newExDur),
      });
      setNewExName('');
      loadDateData();
    } catch (err) {
      alert('Error creating exercise');
    }
  };

  const handleDeleteExercise = async (id) => {
    try {
      await exerciseService.deleteExercise(id);
      loadDateData();
    } catch (err) {
      alert('Error removing exercise');
    }
  };

  // STEPS & NOTES HANDLER
  const handleSaveDailyLog = async (e) => {
    e.preventDefault();
    setIsSavingDailyLog(true);
    try {
      await dailyLogService.upsertDailyLog({
        date: selectedDate,
        steps: Number(stepsInput),
        notes: notesInput,
        overallMood: moodInput,
      });
      setIsSavingDailyLog(false);
      loadDateData();
    } catch (err) {
      setIsSavingDailyLog(false);
      alert('Error saving daily record');
    }
  };

  // SLEEP HANDLER
  const handleSaveSleep = async (e) => {
    e.preventDefault();
    try {
      await sleepService.logSleep({
        date: selectedDate,
        bedtime,
        wakeTime,
        quality: sleepQuality,
      });
      loadDateData();
    } catch (err) {
      alert('Error saving sleep log');
    }
  };

  // WEIGHT HANDLER
  const handleSaveWeight = async (e) => {
    e.preventDefault();
    if (!weightKg) return;
    try {
      await weightService.logWeight({
        date: selectedDate,
        weightKg: Number(weightKg),
      });
      loadDateData();
    } catch (err) {
      alert('Error logging weight');
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Modules' },
    { id: 'food', label: 'Food & Meals' },
    { id: 'water', label: 'Water' },
    { id: 'exercise', label: 'Exercise' },
    { id: 'steps', label: 'Steps & Notes' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'weight', label: 'Weight' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Daily Tracker Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Record and edit lifestyle activities for {selectedDate}
          </p>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: FOOD & MEALS */}
      {(activeTab === 'all' || activeTab === 'food') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Food & Meals
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Emoji-based searchable food library
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEAL_CATEGORIES.map((cat) => {
              const matchedMeal = meals.find((m) => m.category === cat.name);
              return (
                <MealCard
                  key={cat.id}
                  category={cat}
                  meal={matchedMeal}
                  onOpenAddFood={handleOpenAddFood}
                  onRemoveItem={handleRemoveMealItem}
                  onDeleteMeal={handleDeleteMeal}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 2: HYDRATION */}
      {(activeTab === 'all' || activeTab === 'water') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                <Droplets className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Water Hydration
              </h2>
            </div>
            <span className="text-xs font-bold text-cyan-500">
              Total: {waterSummary?.totalMl || 0} / {waterSummary?.targetMl || 4000} ml ({waterSummary?.percentage || 0}%)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Quick Hydration Intake" subtitle="Log water consumption" icon={Droplets}>
              <WaterQuickAdd
                onAddWater={handleAddWater}
                onUndo={handleUndoWater}
                canUndo={waterLogs.length > 0}
              />
            </Card>

            <Card
              title="Today's Water Entries"
              subtitle={`${waterLogs.length} transactions logged`}
              icon={Droplets}
            >
              <WaterHistory logs={waterLogs} onDeleteLog={handleDeleteWater} />
            </Card>
          </div>
        </section>
      )}

      {/* SECTION 3: EXERCISE */}
      {(activeTab === 'all' || activeTab === 'exercise') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <Dumbbell className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Physical Fitness & Exercise
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {exercises.length} sessions logged
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exercise Form */}
            <Card title="Log Exercise Session" subtitle="Record physical workout" icon={Dumbbell}>
              <form onSubmit={handleAddExercise} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning Jog, Leg Day, Vinyasa Yoga"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={newExCat}
                      onChange={(e) => setNewExCat(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-rose-500"
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
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newExDur}
                      onChange={(e) => setNewExDur(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="sm" icon={Plus} className="w-full mt-2">
                  Record Workout
                </Button>
              </form>
            </Card>

            {/* Exercise List */}
            <Card
              title="Today's Workouts"
              subtitle={`${exercises.reduce((s, e) => s + e.durationMinutes, 0)} total minutes`}
              icon={Dumbbell}
            >
              {exercises.length > 0 ? (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {exercises.map((ex) => (
                    <div
                      key={ex._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ex.emoji || '⚡'}</span>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {ex.name}
                          </h5>
                          <span className="text-[11px] text-slate-400">
                            {ex.durationMinutes} mins • ~{ex.caloriesBurned} kcal
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteExercise(ex._id)}
                        title="Delete workout"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <span className="text-2xl block mb-1">🏋️</span>
                  No exercise logged for this date
                </div>
              )}
            </Card>
          </div>
        </section>
      )}

      {/* SECTION 4: STEPS & DAILY LOG NOTES */}
      {(activeTab === 'all' || activeTab === 'steps') && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Footprints className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Walking Steps & Lifestyle Reflections
            </h2>
          </div>

          <Card padding="p-6">
            <form onSubmit={handleSaveDailyLog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Daily Steps Walked
                  </label>
                  <input
                    type="number"
                    value={stepsInput}
                    onChange={(e) => setStepsInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Estimated distance: ~
                    {Math.round(((Number(stepsInput) * 75) / 100000) * 100) / 100} km
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Overall Mood / Energy
                  </label>
                  <select
                    value={moodInput}
                    onChange={(e) => setMoodInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="great">Great 🌟 (High Energy)</option>
                    <option value="good">Good 😊 (Balanced)</option>
                    <option value="neutral">Neutral 😐 (Moderate)</option>
                    <option value="tired">Tired 😴 (Low Energy)</option>
                    <option value="stressed">Stressed 😣 (Rest Needed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Daily Reflections & Journal Notes
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="How did today feel? Any diet or training notes?"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" isLoading={isSavingDailyLog} icon={Save}>
                  Save Steps & Notes
                </Button>
              </div>
            </form>
          </Card>
        </section>
      )}

      {/* SECTION 5: SLEEP & WEIGHT */}
      {(activeTab === 'all' || activeTab === 'sleep' || activeTab === 'weight') && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SLEEP CARD */}
          {(activeTab === 'all' || activeTab === 'sleep') && (
            <Card title="Sleep Tracker" subtitle="Bedtime & Wake-up calculation" icon={Moon}>
              <form onSubmit={handleSaveSleep} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Bedtime
                    </label>
                    <input
                      type="time"
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Wake Time
                    </label>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Sleep Quality
                  </label>
                  <select
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="excellent">Excellent 🌟</option>
                    <option value="good">Good 😊</option>
                    <option value="fair">Fair 😐</option>
                    <option value="poor">Poor 😴</option>
                  </select>
                </div>

                {sleepLog && (
                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Calculated Duration:
                    </span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {Math.round((sleepLog.durationMinutes / 60) * 10) / 10} hours
                    </span>
                  </div>
                )}

                <Button type="submit" size="sm" icon={Save} className="w-full">
                  Update Sleep Record
                </Button>
              </form>
            </Card>
          )}

          {/* WEIGHT CARD */}
          {(activeTab === 'all' || activeTab === 'weight') && (
            <Card title="Weight Measurement" subtitle="Record current bodyweight" icon={Scale}>
              <form onSubmit={handleSaveWeight} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Weight in Kilograms (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 71.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs text-slate-600 dark:text-slate-400">
                  Consistent weigh-ins (ideally in the morning after waking up) yield the most reliable trend charts.
                </div>

                <Button type="submit" size="sm" icon={Save} className="w-full">
                  Save Weight Entry
                </Button>
              </form>
            </Card>
          )}
        </section>
      )}

      {/* FOOD LIBRARY MODAL */}
      <FoodLibraryModal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        onSelectFood={handleSelectFoodItem}
        mealCategory={activeMealCategory}
      />
    </div>
  );
};
