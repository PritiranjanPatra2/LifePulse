import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CalorieBarChart } from '../components/charts/CalorieBarChart';
import { StepsBarChart } from '../components/charts/StepsBarChart';
import { HydrationLineChart } from '../components/charts/HydrationLineChart';
import { SleepAreaChart } from '../components/charts/SleepAreaChart';
import { ExerciseDonutChart } from '../components/charts/ExerciseDonutChart';
import { NutritionPieChart } from '../components/charts/NutritionPieChart';
import { WeightLineChart } from '../components/charts/WeightLineChart';
import { GroupedActivityChart } from '../components/charts/GroupedActivityChart';
import { StackedMealBarChart } from '../components/charts/StackedMealBarChart';
import { LifestyleRadarChart } from '../components/charts/LifestyleRadarChart';
import { HabitHeatmap } from '../components/charts/HabitHeatmap';
import { GoalProgressChart } from '../components/charts/GoalProgressChart';
import { analyticsService } from '../services/analyticsService';
import { habitService } from '../services/habitService';
import {
  BarChart3,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Flame,
  Droplets,
  Footprints,
  Dumbbell,
  Moon,
  Scale,
  Award,
} from 'lucide-react';

export const AnalyticsPage = () => {
  // Global date filter preset
  const [timeRange, setTimeRange] = useState('last7');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Backend analytics state
  const [analytics, setAnalytics] = useState(null);
  const [smartInsights, setSmartInsights] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [res, insightsRes, habitsRes] = await Promise.all([
        analyticsService.getOverview({
          timeRange,
          category: selectedCategory,
          startDate: customStart || undefined,
          endDate: customEnd || undefined,
        }),
        analyticsService.getSmartInsights(),
        habitService.getHabitAnalytics(60),
      ]);

      if (res.data) setAnalytics(res.data);
      if (insightsRes.data) setSmartInsights(insightsRes.data);
      if (habitsRes.data) setHeatmapData(habitsRes.data.heatmap || []);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedCategory]);

  const timeFilterOptions = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7', label: 'Last 7 Days' },
    { id: 'last30', label: 'Last 30 Days' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'prevWeek', label: 'Previous Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'prevMonth', label: 'Previous Month' },
  ];

  const categoryOptions = [
    { id: 'All', label: 'All Analytics', icon: BarChart3 },
    { id: 'Food', label: 'Nutrition', icon: Flame },
    { id: 'Water', label: 'Hydration', icon: Droplets },
    { id: 'Steps', label: 'Walking Steps', icon: Footprints },
    { id: 'Exercise', label: 'Exercise', icon: Dumbbell },
    { id: 'Sleep', label: 'Sleep Recovery', icon: Moon },
    { id: 'Weight', label: 'Weight Progress', icon: Scale },
  ];

  const {
    averages = {},
    bestDays = {},
    comparisons = {},
    charts = {},
    filter = {},
  } = analytics || {};

  const renderComparisonBadge = (pct) => {
    if (pct === undefined || pct === null) return null;
    const isUp = pct > 0;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
          isUp
            ? 'bg-emerald-500/10 text-emerald-500'
            : pct < 0
            ? 'bg-rose-500/10 text-rose-500'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
        }`}
      >
        {isUp ? <TrendingUp className="w-3 h-3" /> : pct < 0 ? <TrendingDown className="w-3 h-3" /> : null}
        {isUp ? `+${pct}%` : `${pct}%`} vs prior period
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Global Power BI Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500 text-white">
                Power BI Suite
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Lifestyle Analytics & BI Hub
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-dimensional cross-correlation of daily habits, vitals & health trends
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl overflow-x-auto border border-slate-200/80 dark:border-slate-700/80">
            {timeFilterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimeRange(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  timeRange === opt.id
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryOptions.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-brand-500 dark:border-brand-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPARISON METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card hover padding="p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Daily Steps
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {averages.steps?.toLocaleString() || 0}
            </span>
            <span className="text-xs text-slate-400">steps/day</span>
          </div>
          <div className="mt-2">
            {renderComparisonBadge(comparisons.stepsChangePct)}
          </div>
        </Card>

        <Card hover padding="p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Daily Water
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {averages.water?.toLocaleString() || 0}
            </span>
            <span className="text-xs text-slate-400">ml/day</span>
          </div>
          <div className="mt-2">
            {renderComparisonBadge(comparisons.waterChangePct)}
          </div>
        </Card>

        <Card hover padding="p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Sleep Duration
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {averages.sleepHours || 0}
            </span>
            <span className="text-xs text-slate-400">hrs/night</span>
          </div>
          <div className="mt-2">
            {renderComparisonBadge(comparisons.sleepChangePct)}
          </div>
        </Card>

        <Card hover padding="p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Peak Activity Day
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-brand-600 dark:text-brand-400 truncate">
              {bestDays.steps?.weekday ? `${bestDays.steps.weekday} (${bestDays.steps.steps.toLocaleString()})` : '—'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Highest steps logged in filter
          </span>
        </Card>
      </div>

      {/* SMART RULE-BASED INSIGHTS FEED */}
      {smartInsights.length > 0 && (
        <Card
          title="Automated Rule-Based Lifestyle Insights"
          subtitle="Real findings derived directly from your MongoDB records"
          icon={Sparkles}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {smartInsights.map((ins, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3"
              >
                <span className="text-2xl shrink-0">{ins.icon}</span>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                    {ins.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ins.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CHARTS GRID (13 REQUIRED VISUALIZATIONS) */}
      <div className="space-y-6">
        {/* ROW 1: Daily Calorie Intake & Weekly Steps */}
        {(selectedCategory === 'All' || selectedCategory === 'Food' || selectedCategory === 'Steps') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(selectedCategory === 'All' || selectedCategory === 'Food') && (
              <Card
                title="1. Daily Calorie Intake"
                subtitle="Bar chart • Daily calories consumed against goal"
                icon={Flame}
              >
                <CalorieBarChart data={charts.dailyCalorieIntake || []} height={260} />
              </Card>
            )}

            {(selectedCategory === 'All' || selectedCategory === 'Steps') && (
              <Card
                title="2. Walking Steps Trend"
                subtitle="Bar chart • Daily step count vs. 10,000 target"
                icon={Footprints}
              >
                <StepsBarChart data={charts.weeklySteps || []} height={260} />
              </Card>
            )}
          </div>
        )}

        {/* ROW 2: Hydration Trends & Sleep Duration */}
        {(selectedCategory === 'All' || selectedCategory === 'Water' || selectedCategory === 'Sleep') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(selectedCategory === 'All' || selectedCategory === 'Water') && (
              <Card
                title="3. Hydration Volume Trend"
                subtitle="Line chart • Daily water intake (ml) vs. target line"
                icon={Droplets}
              >
                <HydrationLineChart data={charts.hydrationTrends || []} height={260} />
              </Card>
            )}

            {(selectedCategory === 'All' || selectedCategory === 'Sleep') && (
              <Card
                title="4. Sleep Duration & Quality"
                subtitle="Area chart • Nightly sleep duration in hours"
                icon={Moon}
              >
                <SleepAreaChart data={charts.sleepDuration || []} height={260} />
              </Card>
            )}
          </div>
        )}

        {/* ROW 3: Exercise Distribution & Nutrition Breakdown */}
        {(selectedCategory === 'All' || selectedCategory === 'Exercise' || selectedCategory === 'Food') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(selectedCategory === 'All' || selectedCategory === 'Exercise') && (
              <Card
                title="5. Exercise Distribution"
                subtitle="Donut chart • Minutes allocated by sport/exercise category"
                icon={Dumbbell}
              >
                <ExerciseDonutChart data={charts.exerciseDistribution || []} height={260} />
              </Card>
            )}

            {(selectedCategory === 'All' || selectedCategory === 'Food') && (
              <Card
                title="6. Nutrition Breakdown"
                subtitle="Pie chart • Macronutrient grams (Protein, Carbs, Fats)"
                icon={Flame}
              >
                <NutritionPieChart data={charts.nutritionBreakdown || []} height={260} />
              </Card>
            )}
          </div>
        )}

        {/* ROW 4: Weight Progress & Grouped Activity Comparison */}
        {(selectedCategory === 'All' || selectedCategory === 'Weight' || selectedCategory === 'Steps') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(selectedCategory === 'All' || selectedCategory === 'Weight') && (
              <Card
                title="7. Weight Progress Tracking"
                subtitle="Line chart • Measured bodyweight vs target benchmark"
                icon={Scale}
              >
                <WeightLineChart data={charts.weightProgress || []} height={260} />
              </Card>
            )}

            {selectedCategory === 'All' && (
              <Card
                title="8. Weekly Activity Comparison"
                subtitle="Grouped bar chart • Step volume vs caloric energy expenditure"
                icon={BarChart3}
              >
                <GroupedActivityChart data={charts.weeklyActivityComparison || []} height={260} />
              </Card>
            )}
          </div>
        )}

        {/* ROW 5: Stacked Meal Distribution & Lifestyle Radar */}
        {(selectedCategory === 'All' || selectedCategory === 'Food') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title="9. Meal-Wise Calorie Distribution"
              subtitle="Stacked bar chart • Breakfast, Lunch, Dinner & Snacks"
              icon={Flame}
            >
              <StackedMealBarChart data={charts.mealWiseCalories || []} height={260} />
            </Card>

            <Card
              title="11. Lifestyle Performance Radar"
              subtitle="Radar chart • Multi-metric balanced lifestyle evaluation"
              icon={Award}
            >
              <LifestyleRadarChart data={charts.lifestyleRadar || []} height={260} />
            </Card>
          </div>
        )}

        {/* ROW 6: Daily Goal Completion & GitHub-Style Heatmap */}
        {selectedCategory === 'All' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title="13. Daily Goal Completion Trend"
              subtitle="Progress chart • Composite percentage score across all lifestyle goals"
              icon={TrendingUp}
            >
              <GoalProgressChart data={charts.dailyGoalCompletion || []} height={260} />
            </Card>

            <Card
              title="10. Daily Habit Consistency Calendar"
              subtitle="GitHub-style contribution heatmap • 60 days habit tracking"
              icon={Calendar}
            >
              <HabitHeatmap data={heatmapData} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
