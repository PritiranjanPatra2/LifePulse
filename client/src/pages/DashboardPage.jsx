import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { dashboardService } from '../services/dashboardService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { WaterBottle } from '../components/hydration/WaterBottle';
import { StepsTrackerVisual } from '../components/fitness/StepsTrackerVisual';
import { WorkoutFlameVisual } from '../components/fitness/WorkoutFlameVisual';
import { SleepMoonVisual } from '../components/sleep/SleepMoonVisual';
import { WeightScaleVisual } from '../components/weight/WeightScaleVisual';
import { NutritionPlateVisual } from '../components/nutrition/NutritionPlateVisual';
import { MacroNutrientBar } from '../components/nutrition/MacroNutrientBar';
import { StepsBarChart } from '../components/charts/StepsBarChart';
import { CalorieBarChart } from '../components/charts/CalorieBarChart';
import { HydrationLineChart } from '../components/charts/HydrationLineChart';
import {
  Flame,
  Droplets,
  Footprints,
  Dumbbell,
  Moon,
  UtensilsCrossed,
  Scale,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export const DashboardPage = () => {
  const { selectedDate } = useSelector((state) => state.date);
  const { user } = useSelector((state) => state.auth);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVisualTab, setActiveVisualTab] = useState('water');

  const visualTabs = [
    { id: 'water', label: '💧 Water', route: ROUTES.HYDRATION, name: 'Water Bottle' },
    { id: 'steps', label: '🚶 Steps', route: ROUTES.DAILY_TRACKER, name: 'Steps Track' },
    { id: 'workout', label: '🔥 Workout', route: ROUTES.FITNESS, name: 'Workout Flame' },
    { id: 'sleep', label: '🌙 Sleep', route: ROUTES.SLEEP, name: 'Sleep Moon' },
    { id: 'nutrition', label: '🥗 Nutrition', route: ROUTES.NUTRITION, name: 'Macro Plate' },
    { id: 'weight', label: '⚖️ Weight', route: ROUTES.WEIGHT, name: 'Smart Scale' },
  ];
  const activeTabMeta = visualTabs.find((t) => t.id === activeVisualTab) || visualTabs[0];

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getDashboardData(selectedDate);
      if (res.data) setData(res.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    const handleRefresh = () => loadDashboard();
    window.addEventListener('lifepulse-activity-logged', handleRefresh);
    return () => window.removeEventListener('lifepulse-activity-logged', handleRefresh);
  }, [selectedDate]);

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const {
    summaryCards = {},
    weeklyTrends = [],
    todayMeals = [],
    todayExercises = [],
    recentActivities = [],
    nutritionSummary = {},
    habitsOverview = {},
    goal = {},
  } = data || {};

  // Helper for trend badge
  const renderTrendDiff = (diff, unit) => {
    if (diff === undefined || diff === null || diff === 0) {
      return <span className="text-slate-400 text-[11px]">— same as yesterday</span>;
    }
    const isUp = diff > 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
          isUp ? 'text-emerald-500' : 'text-slate-400'
        }`}
      >
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isUp ? `+${diff}` : diff} {unit} vs yesterday
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good day, <span className="text-brand-500">{user?.name || 'Champ'}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here is your lifestyle performance breakdown for {selectedDate}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.DAILY_TRACKER}>
            <Button size="sm" variant="outline" icon={ArrowRight}>
              Daily Logger
            </Button>
          </Link>
          <Link to={ROUTES.REPORTS}>
            <Button size="sm" icon={Sparkles}>
              Export Report
            </Button>
          </Link>
        </div>
      </div>

      {/* 8 SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Calories */}
        <Card hover padding="p-5" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Calories
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {summaryCards.calories?.value?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {summaryCards.calories?.target?.toLocaleString()} kcal
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${summaryCards.calories?.percentage || 0}%` }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
            <div className="pt-2 flex flex-col">
              <span className="text-[11px] text-slate-500">
                {summaryCards.calories?.remaining || 0} kcal remaining
              </span>
              {renderTrendDiff(summaryCards.calories?.diffFromYesterday, 'kcal')}
            </div>
          </div>
        </Card>

        {/* 2. Water */}
        <Card hover padding="p-5" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Hydration
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {summaryCards.water?.value?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {summaryCards.water?.target?.toLocaleString()} ml
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${summaryCards.water?.percentage || 0}%` }}
                className="h-full bg-cyan-500 rounded-full"
              />
            </div>
            <div className="pt-2 flex flex-col">
              <span className="text-[11px] text-slate-500">
                {summaryCards.water?.remaining || 0} ml remaining ({summaryCards.water?.percentage}%)
              </span>
              {renderTrendDiff(summaryCards.water?.diffFromYesterday, 'ml')}
            </div>
          </div>
        </Card>

        {/* 3. Steps */}
        <Card hover padding="p-5" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Walking Steps
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Footprints className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {summaryCards.steps?.value?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {summaryCards.steps?.target?.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${summaryCards.steps?.percentage || 0}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <div className="pt-2 flex flex-col">
              <span className="text-[11px] text-slate-500">
                ~{summaryCards.steps?.distanceKm || 0} km walked
              </span>
              {renderTrendDiff(summaryCards.steps?.diffFromYesterday, 'steps')}
            </div>
          </div>
        </Card>

        {/* 4. Exercise Duration */}
        <Card hover padding="p-5" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Exercise
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {summaryCards.exercise?.value || 0}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {summaryCards.exercise?.target || 45} mins
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${summaryCards.exercise?.percentage || 0}%` }}
                className="h-full bg-rose-500 rounded-full"
              />
            </div>
            <div className="pt-2 flex flex-col">
              <span className="text-[11px] text-slate-500">
                ~{summaryCards.exercise?.caloriesBurned || 0} kcal burned
              </span>
              {renderTrendDiff(summaryCards.exercise?.diffFromYesterday, 'min')}
            </div>
          </div>
        </Card>

        {/* 5. Sleep Duration */}
        <Card hover padding="p-5" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sleep
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {summaryCards.sleep?.value || 0}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {summaryCards.sleep?.target || 8} hrs
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${summaryCards.sleep?.percentage || 0}%` }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
            <div className="pt-2 flex flex-col">
              <span className="text-[11px] text-slate-500 capitalize">
                Quality: {summaryCards.sleep?.quality || 'Good'}
              </span>
              {renderTrendDiff(summaryCards.sleep?.diffFromYesterday, 'hrs')}
            </div>
          </div>
        </Card>

        {/* 6. Meals Logged */}
        <Card hover padding="p-5" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Meals Logged
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {summaryCards.meals?.value || 0}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / 4 planned
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${summaryCards.meals?.percentage || 0}%` }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
            <div className="pt-2 flex flex-col">
              <span className="text-[11px] text-slate-500">
                {summaryCards.meals?.remaining || 0} meals to log
              </span>
              {renderTrendDiff(summaryCards.meals?.diffFromYesterday, 'meals')}
            </div>
          </div>
        </Card>

        {/* 7. Current Weight */}
        <Card hover padding="p-5" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Weight
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {summaryCards.weight?.value || 70}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                kg
              </span>
            </div>
            <div className="pt-2 flex flex-col">
              <span className="text-[11px] text-slate-500">
                Target: {summaryCards.weight?.target || 68} kg
              </span>
              <span className="text-[11px] font-semibold text-purple-500">
                Change: {summaryCards.weight?.change > 0 ? `+${summaryCards.weight?.change}` : summaryCards.weight?.change || 0} kg
              </span>
            </div>
          </div>
        </Card>

        {/* 8. Daily Goal Completion */}
        <Card hover padding="p-5" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Goal Completion
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                {summaryCards.goalCompletion?.value || 0}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${summaryCards.goalCompletion?.value || 0}%` }}
                className="h-full bg-brand-500 rounded-full"
              />
            </div>
            <div className="pt-2 flex flex-col">
              <span className="text-[11px] text-slate-500">
                Habits: {habitsOverview.completed || 0}/{habitsOverview.total || 0} done
              </span>
              <span className="text-[11px] font-semibold text-brand-500">
                Overall Health Score
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* SIGNATURE ANIMATED HEALTH HUB & NUTRITION BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Animated Health Visual Showcase Card */}
        <Card
          title={`Pulse Visual: ${activeTabMeta.name}`}
          subtitle="Signature live lifestyle animation"
          icon={Sparkles}
          action={
            <Link to={activeTabMeta.route}>
              <Button size="sm" variant="ghost" className="text-xs">
                Open {activeTabMeta.id} →
              </Button>
            </Link>
          }
          className="lg:col-span-1 flex flex-col justify-between"
        >
          {/* Interactive Visual Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto mb-2">
            {visualTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveVisualTab(tab.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  activeVisualTab === tab.id
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-2 flex items-center justify-center min-h-[300px]">
            {activeVisualTab === 'water' && (
              <WaterBottle
                currentMl={summaryCards.water?.value || 0}
                targetMl={summaryCards.water?.target || 4000}
              />
            )}
            {activeVisualTab === 'steps' && (
              <StepsTrackerVisual
                currentSteps={summaryCards.steps?.value || 0}
                targetSteps={summaryCards.steps?.target || 10000}
              />
            )}
            {activeVisualTab === 'workout' && (
              <WorkoutFlameVisual
                currentMinutes={summaryCards.exercise?.value || 0}
                targetMinutes={summaryCards.exercise?.target || 45}
                caloriesBurned={summaryCards.exercise?.caloriesBurned || 0}
                sessionCount={todayExercises.length}
              />
            )}
            {activeVisualTab === 'sleep' && (
              <SleepMoonVisual
                durationHours={summaryCards.sleep?.value || 0}
                targetHours={summaryCards.sleep?.target || 8}
                quality={summaryCards.sleep?.quality || 'good'}
              />
            )}
            {activeVisualTab === 'nutrition' && (
              <NutritionPlateVisual
                caloriesConsumed={nutritionSummary.calories || 0}
                caloriesTarget={goal?.calories || 2200}
                proteinGrams={nutritionSummary.protein || 0}
                proteinTarget={goal?.proteinGrams || 80}
                carbsGrams={nutritionSummary.carbs || 0}
                carbsTarget={goal?.carbsGrams || 250}
                fatGrams={nutritionSummary.fat || 0}
                fatTarget={goal?.fatGrams || 65}
                mealsCount={todayMeals.length}
              />
            )}
            {activeVisualTab === 'weight' && (
              <WeightScaleVisual
                currentWeight={summaryCards.weight?.value || 70}
                targetWeight={summaryCards.weight?.target || 68}
                startingWeight={goal?.startingWeight || 72}
              />
            )}
          </div>
        </Card>

        {/* Weekly Activity Trends & Nutrition Macros */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nutrition Summary Card */}
          <Card
            title="Today's Nutrition & Macronutrients"
            subtitle={`${nutritionSummary.calories || 0} kcal consumed`}
            icon={UtensilsCrossed}
            action={
              <Link to={ROUTES.NUTRITION}>
                <Button size="sm" variant="ghost" className="text-xs">
                  Food Tracker →
                </Button>
              </Link>
            }
          >
            <MacroNutrientBar
              protein={nutritionSummary.protein || 0}
              carbs={nutritionSummary.carbs || 0}
              fat={nutritionSummary.fat || 0}
              targetProtein={goal?.proteinGrams || 80}
              targetCarbs={goal?.carbsGrams || 250}
              targetFat={goal?.fatGrams || 65}
            />
          </Card>

          {/* Weekly Steps Chart Card */}
          <Card
            title="Weekly Steps Overview"
            subtitle="7-day walking trend"
            icon={Footprints}
            action={
              <Link to={ROUTES.FITNESS}>
                <Button size="sm" variant="ghost" className="text-xs">
                  Details →
                </Button>
              </Link>
            }
          >
            <StepsBarChart
              data={weeklyTrends}
              target={goal?.steps || 10000}
              height={220}
            />
          </Card>
        </div>
      </div>

      {/* TODAY'S MEALS & RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Meals */}
        <Card
          title="Today's Meals"
          subtitle={`${todayMeals.length} meals recorded`}
          icon={UtensilsCrossed}
          action={
            <Link to={ROUTES.NUTRITION}>
              <Button size="sm" variant="outline" className="text-xs">
                Manage Meals
              </Button>
            </Link>
          }
        >
          {todayMeals.length > 0 ? (
            <div className="space-y-3">
              {todayMeals.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.emoji || '🍽️'}</span>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {m.name} ({m.category})
                      </h5>
                      <span className="text-xs text-slate-400">
                        {m.items?.length || 0} items logged
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                      {m.totalCalories} kcal
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {m.totalProtein}g protein
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="🍽️"
              title="No meals logged for this date"
              description="Record your breakfast, lunch, or snacks to see calories and macro breakdowns."
              actionLabel="Add Food"
              onAction={() => (window.location.href = ROUTES.NUTRITION)}
            />
          )}
        </Card>

        {/* Recent Activities Timeline */}
        <Card
          title="Recent Activity Timeline"
          subtitle="Real-time lifestyle event feed"
          icon={Clock}
        >
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{act.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-400">{act.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(act.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="⚡"
              title="No recent activities"
              description="Start recording workouts, water, or meals to build your activity feed."
            />
          )}
        </Card>
      </div>
    </div>
  );
};
