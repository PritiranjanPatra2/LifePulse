import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SleepAreaChart } from '../components/charts/SleepAreaChart';
import { sleepService } from '../services/sleepService';
import { goalService } from '../services/goalService';
import { Moon, Save, Sparkles, Clock, CheckCircle2, Star } from 'lucide-react';

export const SleepTrackerPage = () => {
  const { selectedDate } = useSelector((state) => state.date);

  const [currentSleep, setCurrentSleep] = useState(null);
  const [goal, setGoal] = useState(null);
  const [sleepTrend, setSleepTrend] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState('good');
  const [notes, setNotes] = useState('');

  const loadSleepData = async () => {
    setIsLoading(true);
    try {
      const [todayRes, goalRes] = await Promise.all([
        sleepService.getSleepLogs({ date: selectedDate }),
        goalService.getGoals(),
      ]);

      const entry = todayRes.data?.[0];
      setCurrentSleep(entry || null);
      if (entry) {
        setBedtime(entry.bedtime || '23:00');
        setWakeTime(entry.wakeTime || '07:00');
        setQuality(entry.quality || 'good');
        setNotes(entry.notes || '');
      }
      if (goalRes.data) setGoal(goalRes.data);

      // Load 7-day trend
      const dates7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - i);
        dates7.push(d.toISOString().split('T')[0]);
      }

      const weekRes = await sleepService.getSleepLogs({
        startDate: dates7[0],
        endDate: dates7[6],
      });

      const dayMap = {};
      (weekRes.data || []).forEach((s) => {
        dayMap[s.date] = s.durationMinutes;
      });

      const trendData = dates7.map((dStr) => ({
        date: dStr,
        day: new Date(dStr).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Math.round(((dayMap[dStr] || 0) / 60) * 10) / 10,
      }));
      setSleepTrend(trendData);
    } catch (err) {
      console.error('Error loading sleep data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSleepData();
  }, [selectedDate]);

  const handleSaveSleep = async (e) => {
    e.preventDefault();
    try {
      await sleepService.logSleep({
        date: selectedDate,
        bedtime,
        wakeTime,
        quality,
        notes,
      });
      loadSleepData();
      alert('Sleep record saved successfully!');
    } catch (err) {
      alert('Error logging sleep');
    }
  };

  const durationHours = currentSleep
    ? Math.round((currentSleep.durationMinutes / 60) * 10) / 10
    : 0;
  const targetHours = goal?.sleepHours || 8;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sleep & Recovery Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Automatic cross-midnight duration calculation & rest consistency
        </p>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover padding="p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Recorded Sleep
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-indigo-500">
              {durationHours}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              / {targetHours} hrs target
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {durationHours >= targetHours ? 'Target achieved! ✨' : `${Math.round((targetHours - durationHours) * 10) / 10}h below target`}
          </span>
        </Card>

        <Card hover padding="p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Sleep Quality
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white capitalize flex items-center gap-2">
            {currentSleep?.quality || 'Good'}
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </span>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Subjective restorative score
          </span>
        </Card>

        <Card hover padding="p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Schedule Interval
          </span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {currentSleep ? `${currentSleep.bedtime} → ${currentSleep.wakeTime}` : '23:00 → 07:00'}
          </span>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Crosses midnight calculation verified
          </span>
        </Card>
      </div>

      {/* SLEEP LOG FORM & 7-DAY RECOVERY CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sleep Logging Form (5 Cols) */}
        <Card
          title="Record Sleep Times"
          subtitle={`Logging night ending on ${selectedDate}`}
          icon={Moon}
          className="lg:col-span-5"
        >
          <form onSubmit={handleSaveSleep} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Bedtime (Night Before)
                </label>
                <input
                  type="time"
                  required
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Wake-up Time
                </label>
                <input
                  type="time"
                  required
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Sleep Quality Rating
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="excellent">Excellent 🌟 (Deep, uninterrupted)</option>
                <option value="good">Good 😊 (Restful)</option>
                <option value="fair">Fair 😐 (Woke up once or twice)</option>
                <option value="poor">Poor 😴 (Restless, exhausted)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Notes & Sleep Hygiene
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="No screens 30 mins before bed, chamomile tea, etc."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button type="submit" size="sm" icon={Save} className="w-full">
              Save Sleep Entry
            </Button>
          </form>
        </Card>

        {/* 7-Day Sleep Trend (7 Cols) */}
        <Card
          title="7-Day Sleep Duration Trend"
          subtitle="Hours of rest vs. 8h target"
          icon={Clock}
          className="lg:col-span-7"
        >
          <SleepAreaChart data={sleepTrend} target={targetHours} height={260} />
        </Card>
      </div>
    </div>
  );
};
