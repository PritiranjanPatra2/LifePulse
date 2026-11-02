import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { notifyToast } from '../components/common/Toast';
import { WeightLineChart } from '../components/charts/WeightLineChart';
import { weightService } from '../services/weightService';
import { goalService } from '../services/goalService';
import { Scale, Plus, Target, TrendingDown, Trash2, Settings } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { WeightScaleVisual } from '../components/weight/WeightScaleVisual';

export const WeightTrackerPage = () => {
  const { selectedDate } = useSelector((state) => state.date);

  const [weightLogs, setWeightLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [goal, setGoal] = useState(null);
  const [filterRange, setFilterRange] = useState('30'); // '7' | '30' | 'all'

  // Log weight form
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(selectedDate);
  const [newNotes, setNewNotes] = useState('');

  // Target config modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startWeightInput, setStartWeightInput] = useState('');
  const [targetWeightInput, setTargetWeightInput] = useState('');

  const loadWeightData = async () => {
    try {
      let params = {};
      if (filterRange !== 'all') {
        const d = new Date();
        d.setDate(d.getDate() - Number(filterRange));
        params.startDate = d.toISOString().split('T')[0];
        params.endDate = new Date().toISOString().split('T')[0];
      }

      const [logsRes, sumRes, gRes] = await Promise.all([
        weightService.getWeightLogs(params),
        weightService.getWeightSummary(),
        goalService.getGoals(),
      ]);

      if (logsRes.data) setWeightLogs(logsRes.data);
      if (sumRes.data) {
        setSummary(sumRes.data);
        setNewWeight(String(sumRes.data.currentWeight || ''));
      }
      if (gRes.data) {
        setGoal(gRes.data);
        setStartWeightInput(String(gRes.data.startingWeight || '72'));
        setTargetWeightInput(String(gRes.data.targetWeight || '68'));
      }
    } catch (err) {
      console.error('Error loading weight data:', err);
    }
  };

  useEffect(() => {
    loadWeightData();
  }, [filterRange]);

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;
    try {
      await weightService.logWeight({
        date: newDate,
        weightKg: Number(newWeight),
        notes: newNotes,
      });
      setNewNotes('');
      loadWeightData();
      alert('Weight entry logged!');
      notifyToast({
        title: 'Weight Logged! ⚖️',
        message: `Recorded ${newWeight} kg for ${newDate}.`,
        type: 'success',
      });
    } catch (err) {
      alert('Error saving weight');
      notifyToast({
        title: 'Weight Save Failed',
        message: err.response?.data?.message || 'Error saving weight',
        type: 'error',
      });
    }
  };

  const handleDeleteWeight = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await weightService.deleteWeightLog(id);
      notifyToast({
        title: 'Entry Deleted',
        message: 'Weight record deleted.',
        type: 'info',
      });
      loadWeightData();
    } catch (err) {
      alert('Error deleting entry');
      notifyToast({
        title: 'Action Failed',
        message: 'Error deleting entry',
        type: 'error',
      });
    }
  };

  const handleSaveGoalTargets = async (e) => {
    e.preventDefault();
    try {
      await goalService.updateGoals({
        startingWeight: Number(startWeightInput),
        targetWeight: Number(targetWeightInput),
      });
      setIsModalOpen(false);
      loadWeightData();
      alert('Weight targets updated successfully!');
      notifyToast({
        title: 'Goals Updated! 🎯',
        message: `Target weight set to ${targetWeightInput} kg.`,
        type: 'success',
      });
    } catch (err) {
      alert('Error saving weight targets');
      notifyToast({
        title: 'Update Failed',
        message: 'Error saving weight targets',
        type: 'error',
      });
    }
  };

  const startingWeight = summary?.startingWeight || 72;
  const currentWeight = summary?.currentWeight || 70;
  const targetWeight = summary?.targetWeight || 68;
  const totalChange = summary?.totalChange || 0;
  const remainingTarget = summary?.remainingToTarget || 0;
  const progressPct = summary?.progressPercentage || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Weight Management Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Progress toward your target bodyweight & BMI monitoring
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          icon={Settings}
          onClick={() => setIsModalOpen(true)}
        >
          Configure Targets
        </Button>
      </div>

      {/* HERO SECTION: SIGNATURE WEIGHT SCALE & SUMMARY METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex justify-center">
          <Card padding="p-6" className="w-full flex items-center justify-center">
            <WeightScaleVisual
              currentWeight={currentWeight}
              startingWeight={startingWeight}
              targetWeight={targetWeight}
              heightCm={summary?.heightCm || 175}
            />
          </Card>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <Card hover padding="p-4 sm:p-5" className="flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Current Weight
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {currentWeight}
              </span>
              <span className="text-xs text-slate-400 font-semibold">kg</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              BMI: {summary?.bmi || 23.5}
            </span>
          </Card>

          <Card hover padding="p-4 sm:p-5" className="flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Starting Weight
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {startingWeight}
              </span>
              <span className="text-xs text-slate-400 font-semibold">kg</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              Baseline benchmark
            </span>
          </Card>

          <Card hover padding="p-4 sm:p-5" className="flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Change
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl sm:text-3xl font-black ${
                  totalChange <= 0 ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {totalChange > 0 ? `+${totalChange}` : totalChange}
              </span>
              <span className="text-xs text-slate-400 font-semibold">kg</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              Net change from start
            </span>
          </Card>

          <Card hover padding="p-4 sm:p-5" className="flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Target Weight
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-purple-500">
                {targetWeight}
              </span>
              <span className="text-xs text-slate-400 font-semibold">kg</span>
            </div>
            <span className="text-[11px] text-purple-400 mt-2 block font-semibold">
              {remainingTarget > 0 ? `${remainingTarget} kg remaining` : 'Target Achieved! 🏆'}
            </span>
          </Card>
        </div>
      </div>

      {/* WEIGHT PROGRESSION LINE CHART */}
      <Card
        title="Weight Progression History"
        subtitle="Tracking measurements against your target line"
        icon={Scale}
        action={
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: '7', label: '7D' },
              { id: '30', label: '30D' },
              { id: 'all', label: 'All' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterRange(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  filterRange === f.id
                    ? 'bg-purple-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        <WeightLineChart data={weightLogs} target={targetWeight} height={270} />
      </Card>

      {/* WEIGH-IN LOG FORM & RECORD HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Weigh-in Form (5 Cols) */}
        <Card
          title="Record Weigh-In"
          subtitle="Log new weight point"
          icon={Scale}
          className="lg:col-span-5"
        >
          <form onSubmit={handleLogWeight} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Measurement Date
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Weight in Kilograms (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 71.2"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Morning fasted, post-workout, etc."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <Button type="submit" size="sm" icon={Plus} className="w-full">
              Save Measurement
            </Button>
          </form>
        </Card>

        {/* History Table (7 Cols) */}
        <Card
          title="Measurement History"
          subtitle={`${weightLogs.length} data points recorded`}
          icon={Scale}
          className="lg:col-span-7"
        >
          {weightLogs.length > 0 ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {[...weightLogs].reverse().map((w) => (
                <div
                  key={w._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                      ⚖️
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {w.weightKg} kg
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {w.date} {w.notes && `• ${w.notes}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteWeight(w._id)}
                    title="Delete entry"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              No weight measurements logged in this date range
            </div>
          )}
        </Card>
      </div>

      {/* Target Config Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure Weight Goals"
        subtitle="Set baseline & goal targets"
      >
        <form onSubmit={handleSaveGoalTargets} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Starting Benchmark Weight (kg)
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={startWeightInput}
              onChange={(e) => setStartWeightInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Goal Weight (kg)
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={targetWeightInput}
              onChange={(e) => setTargetWeightInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Targets
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
