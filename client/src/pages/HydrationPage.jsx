import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { notifyToast } from '../components/common/Toast';
import { WaterBottle } from '../components/hydration/WaterBottle';
import { WaterQuickAdd } from '../components/hydration/WaterQuickAdd';
import { WaterHistory } from '../components/hydration/WaterHistory';
import { HydrationLineChart } from '../components/charts/HydrationLineChart';
import { waterService } from '../services/waterService';
import { goalService } from '../services/goalService';
import { Droplets, Sparkles, TrendingUp, Settings } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const HydrationPage = () => {
  const { selectedDate } = useSelector((state) => state.date);

  const [waterLogs, setWaterLogs] = useState([]);
  const [waterSummary, setWaterSummary] = useState(null);
  const [goal, setGoal] = useState(null);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Target customization modal
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [customTargetMl, setCustomTargetMl] = useState('4000');

  const loadHydrationData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, sumRes, goalRes] = await Promise.all([
        waterService.getWaterLogs({ date: selectedDate }),
        waterService.getWaterSummary(selectedDate),
        goalService.getGoals(),
      ]);

      if (logsRes.data) setWaterLogs(logsRes.data);
      if (sumRes.data) setWaterSummary(sumRes.data);
      if (goalRes.data) {
        setGoal(goalRes.data);
        setCustomTargetMl(String(goalRes.data.waterMl || 4000));
      }

      // Load 7-day trend up to selectedDate
      const dates7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - i);
        dates7.push(d.toISOString().split('T')[0]);
      }

      const weekRes = await waterService.getWaterLogs({
        startDate: dates7[0],
        endDate: dates7[6],
      });

      const dayMap = {};
      (weekRes.data || []).forEach((w) => {
        dayMap[w.date] = (dayMap[w.date] || 0) + w.amountMl;
      });

      const trendData = dates7.map((dStr) => ({
        date: dStr,
        day: new Date(dStr).toLocaleDateString('en-US', { weekday: 'short' }),
        waterMl: dayMap[dStr] || 0,
      }));
      setWeeklyTrend(trendData);
    } catch (err) {
      console.error('Error loading hydration data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHydrationData();
  }, [selectedDate]);

  const handleAddWater = async (amountMl, note) => {
    try {
      await waterService.addWater({
        amountMl,
        date: selectedDate,
        note,
      });
      alert(`Water intake of ${amountMl} ml recorded successfully!`);
      notifyToast({
        title: 'Hydration Logged! 💧',
        message: `Added ${amountMl} ml of water.`,
        type: 'success',
      });
      loadHydrationData();
    } catch (err) {
      alert('Error recording water intake');
      notifyToast({
        title: 'Water Log Error',
        message: 'Error recording water intake',
        type: 'error',
      });
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await waterService.deleteWater(id);
      notifyToast({
        title: 'Entry Deleted',
        message: 'Water record deleted.',
        type: 'info',
      });
      loadHydrationData();
    } catch (err) {
      notifyToast({
        title: 'Action Failed',
        message: 'Error removing record',
        type: 'error',
      });
    }
  };

  const handleUndo = async () => {
    try {
      await waterService.undoLastWater(selectedDate);
      notifyToast({
        title: 'Water Log Undone ↩️',
        message: 'Reverted most recent water entry.',
        type: 'info',
      });
      loadHydrationData();
    } catch (err) {
      notifyToast({
        title: 'Undo Failed',
        message: 'No water transactions to undo',
        type: 'error',
      });
    }
  };

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    try {
      await goalService.updateGoals({
        waterMl: Number(customTargetMl),
      });
      setIsTargetModalOpen(false);
      alert(`Water target updated to ${customTargetMl} ml!`);
      notifyToast({
        title: 'Water Goal Updated! 🎯',
        message: `Daily target set to ${customTargetMl} ml.`,
        type: 'success',
      });
      loadHydrationData();
    } catch (err) {
      alert('Error updating water goal');
      notifyToast({
        title: 'Update Failed',
        message: 'Error updating goal',
        type: 'error',
      });
    }
  };

  const currentTotal = waterSummary?.totalMl || 0;
  const targetTotal = goal?.waterMl || waterSummary?.targetMl || 4000;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Animated Hydration Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time interactive water bottle tracking for {selectedDate}
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          icon={Settings}
          onClick={() => setIsTargetModalOpen(true)}
        >
          Hydration Target: {(targetTotal / 1000).toFixed(1)}L
        </Button>
      </div>

      {/* SIGNATURE ANIMATED WATER BOTTLE & CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Animated Water Bottle Display (5 Cols) */}
        <Card
          title="Live Hydration Status"
          subtitle="Dynamic fluid simulation with wave & bubble physics"
          icon={Droplets}
          className="lg:col-span-5 flex flex-col items-center justify-center py-4"
        >
          <WaterBottle
            currentMl={currentTotal}
            targetMl={targetTotal}
            className="my-2"
          />
        </Card>

        {/* Controls & Transaction History (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick-Add Buttons Card */}
          <Card
            title="Log Water Consumption"
            subtitle="Quick-add presets or custom fluid volume"
            icon={Droplets}
          >
            <WaterQuickAdd
              onAddWater={handleAddWater}
              onUndo={handleUndo}
              canUndo={waterLogs.length > 0}
              isLoading={isLoading}
            />
          </Card>

          {/* Today's Water Transactions */}
          <Card
            title="Today's Hydration Transactions"
            subtitle={`${waterLogs.length} entries recorded`}
            icon={Droplets}
          >
            <WaterHistory logs={waterLogs} onDeleteLog={handleDeleteLog} />
          </Card>
        </div>
      </div>

      {/* 7-DAY HYDRATION TREND */}
      <Card
        title="7-Day Hydration Consistency Trend"
        subtitle="Tracking daily volume against your hydration goal"
        icon={TrendingUp}
      >
        <HydrationLineChart data={weeklyTrend} target={targetTotal} height={250} />
      </Card>

      {/* Target Config Modal */}
      <Modal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title="Configure Daily Water Goal"
        subtitle="Set your personal hydration target"
      >
        <form onSubmit={handleSaveTarget} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Daily Target (ml)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['2500', '3000', '3500', '4000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCustomTargetMl(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    customTargetMl === amt
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {(Number(amt) / 1000).toFixed(1)} L
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1000"
              max="8000"
              step="100"
              required
              value={customTargetMl}
              onChange={(e) => setCustomTargetMl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsTargetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="cyan" size="sm">
              Save New Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
