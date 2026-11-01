import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { notifyToast } from '../components/common/Toast';
import { analyticsService } from '../services/analyticsService';
import { habitService } from '../services/habitService';
import { CalorieBarChart } from '../components/charts/CalorieBarChart';
import { StepsBarChart } from '../components/charts/StepsBarChart';
import { HydrationLineChart } from '../components/charts/HydrationLineChart';
import { SleepAreaChart } from '../components/charts/SleepAreaChart';
import { LifestyleRadarChart } from '../components/charts/LifestyleRadarChart';
import { HabitHeatmap } from '../components/charts/HabitHeatmap';
import { toPng } from 'html-to-image';
import {
  FileDown,
  Activity,
  Calendar,
  Filter,
  CheckSquare,
  Sparkles,
  Printer,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { useSelector } from 'react-redux';

export const ReportsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const reportRef = useRef(null);

  // Filters & Customization
  const [timeRange, setTimeRange] = useState('last7');
  const [resolution, setResolution] = useState(2); // 2x or 3x
  const [isExporting, setIsExporting] = useState(false);
  const [reportTitle, setReportTitle] = useState('Personal Lifestyle & Health Performance Report');

  // Chart toggles
  const [includeNutrition, setIncludeNutrition] = useState(true);
  const [includeHydration, setIncludeHydration] = useState(true);
  const [includeSteps, setIncludeSteps] = useState(true);
  const [includeSleep, setIncludeSleep] = useState(true);
  const [includeRadar, setIncludeRadar] = useState(true);
  const [includeHeatmap, setIncludeHeatmap] = useState(true);

  // Data
  const [analytics, setAnalytics] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const [res, habitsRes] = await Promise.all([
        analyticsService.getOverview({ timeRange }),
        habitService.getHabitAnalytics(60),
      ]);
      if (res.data) setAnalytics(res.data);
      if (habitsRes.data) setHeatmapData(habitsRes.data.heatmap || []);
    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  // PNG EXPORT HANDLER VIA html-to-image
  const handleExportPNG = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      // Small pause to allow all SVG charts to settle in DOM
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(reportRef.current, {
        quality: 0.98,
        pixelRatio: resolution,
        backgroundColor: '#0f172a',
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `LifePulse-Report-${timeRange}-${new Date().toISOString().split('T')[0]}-${resolution}x.png`;
      link.href = dataUrl;
      link.click();
      notifyToast({
        title: 'Report Exported! 📸',
        message: `High-resolution ${resolution}x PNG downloaded successfully.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error capturing report PNG:', err);
      alert('Failed to generate PNG image. Please try again.');
      notifyToast({
        title: 'Export Failed',
        message: 'Failed to generate PNG image. Please try again.',
        type: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const timeFilterOptions = [
    { id: 'last7', label: 'Last 7 Days' },
    { id: 'last30', label: 'Last 30 Days' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'prevWeek', label: 'Previous Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'prevMonth', label: 'Previous Month' },
  ];

  const {
    averages = {},
    bestDays = {},
    comparisons = {},
    charts = {},
    filter = {},
  } = analytics || {};

  const generatedDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500 text-white">
              Export Suite
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reports & PNG Export
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Generate and download high-resolution Power BI-style report posters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportPNG}
            isLoading={isExporting}
            size="md"
            icon={FileDown}
            className="shadow-glow-primary"
          >
            Export PNG ({resolution}x HD)
          </Button>
        </div>
      </div>

      {/* REPORT CUSTOMIZATION CONTROLS */}
      <Card
        title="Report Customization & Layout Controls"
        subtitle="Select date window, resolution multiplier, and charts to include"
        icon={Sliders}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Time range selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Report Date Range
            </label>
            <div className="flex flex-wrap gap-1.5">
              {timeFilterOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTimeRange(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    timeRange === opt.id
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export resolution */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Export Resolution Scale
            </label>
            <div className="flex items-center gap-2">
              {[
                { val: 2, label: '2x (Standard HD • 1080p+)' },
                { val: 3, label: '3x (Ultra HD • Print Ready)' },
              ].map((res) => (
                <button
                  key={res.val}
                  onClick={() => setResolution(res.val)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    resolution === res.val
                      ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 ring-1 ring-brand-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart toggles */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Include Sections
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeNutrition}
                  onChange={(e) => setIncludeNutrition(e.target.checked)}
                  className="rounded text-brand-500"
                />
                Nutrition Intake
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeHydration}
                  onChange={(e) => setIncludeHydration(e.target.checked)}
                  className="rounded text-brand-500"
                />
                Hydration Trend
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeSteps}
                  onChange={(e) => setIncludeSteps(e.target.checked)}
                  className="rounded text-brand-500"
                />
                Walking Steps
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeSleep}
                  onChange={(e) => setIncludeSleep(e.target.checked)}
                  className="rounded text-brand-500"
                />
                Sleep Recovery
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeRadar}
                  onChange={(e) => setIncludeRadar(e.target.checked)}
                  className="rounded text-brand-500"
                />
                Lifestyle Radar
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeHeatmap}
                  onChange={(e) => setIncludeHeatmap(e.target.checked)}
                  className="rounded text-brand-500"
                />
                Habit Heatmap
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* DEDICATED REPORT PREVIEW CONTAINER (CAPTURED FOR PNG EXPORT) */}
      <div className="overflow-x-auto pb-4">
        <div
          ref={reportRef}
          className="w-full min-w-[900px] bg-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6"
        >
          {/* Report Top Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-glow-primary">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-white">
                    Life<span className="text-brand-500">Pulse</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                    Executive Analytics Report
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mt-0.5">
                  {reportTitle}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-white">
                Member: {user?.name || 'LifePulse Member'}
              </p>
              <p className="text-[11px] text-slate-400">
                Date Window: {filter.startStr} to {filter.endStr}
              </p>
              <p className="text-[10px] text-brand-400 font-medium">
                Generated: {generatedDateStr}
              </p>
            </div>
          </div>

          {/* Report Summary Cards Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Daily Intake
              </span>
              <span className="text-2xl font-black text-amber-400">
                {averages.calories?.toLocaleString() || 0} kcal
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {comparisons.caloriesChangePct > 0 ? `+${comparisons.caloriesChangePct}%` : `${comparisons.caloriesChangePct}%`} vs prior period
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Daily Steps
              </span>
              <span className="text-2xl font-black text-cyan-400">
                {averages.steps?.toLocaleString() || 0}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {comparisons.stepsChangePct > 0 ? `+${comparisons.stepsChangePct}%` : `${comparisons.stepsChangePct}%`} vs prior period
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Hydration
              </span>
              <span className="text-2xl font-black text-blue-400">
                {averages.water?.toLocaleString() || 0} ml
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {comparisons.waterChangePct > 0 ? `+${comparisons.waterChangePct}%` : `${comparisons.waterChangePct}%`} vs prior period
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Sleep Hours
              </span>
              <span className="text-2xl font-black text-indigo-400">
                {averages.sleepHours || 0} hrs
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Nightly recovery average
              </span>
            </div>
          </div>

          {/* Selected Charts Matrix */}
          <div className="grid grid-cols-2 gap-6">
            {includeNutrition && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Calorie Intake History
                </h4>
                <CalorieBarChart data={charts.dailyCalorieIntake || []} height={200} />
              </div>
            )}

            {includeSteps && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Walking Steps Activity
                </h4>
                <StepsBarChart data={charts.weeklySteps || []} height={200} />
              </div>
            )}

            {includeHydration && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Daily Hydration Volume
                </h4>
                <HydrationLineChart data={charts.hydrationTrends || []} height={200} />
              </div>
            )}

            {includeSleep && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Sleep Duration Trend
                </h4>
                <SleepAreaChart data={charts.sleepDuration || []} height={200} />
              </div>
            )}

            {includeRadar && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Lifestyle Performance Radar
                </h4>
                <LifestyleRadarChart data={charts.lifestyleRadar || []} height={200} />
              </div>
            )}

            {includeHeatmap && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  60-Day Habit Consistency Heatmap
                </h4>
                <HabitHeatmap data={heatmapData} />
              </div>
            )}
          </div>

          {/* Report Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>LifePulse Personal Lifestyle Analytics Platform • Confidential</span>
            <span>https://lifepulse.io</span>
          </div>
        </div>
      </div>
    </div>
  );
};
