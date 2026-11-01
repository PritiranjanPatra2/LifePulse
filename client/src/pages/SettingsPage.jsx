import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { AvatarPicker } from '../components/common/AvatarPicker';
import { updateUserProfile } from '../store/authSlice';
import { toggleTheme, setTheme } from '../store/themeSlice';
import { goalService } from '../services/goalService';
import {
  Settings as SettingsIcon,
  User,
  Sun,
  Moon,
  Target,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  // Profile states
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || 'pulse-avatar-1');
  const [gender, setGender] = useState(user?.gender || 'other');
  const [height, setHeight] = useState(user?.height || '170');
  const [weight, setWeight] = useState(user?.weight || '70');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Goal targets
  const [waterGoal, setWaterGoal] = useState('4000');
  const [stepsGoal, setStepsGoal] = useState('10000');
  const [caloriesGoal, setCaloriesGoal] = useState('2200');
  const [exerciseGoal, setExerciseGoal] = useState('45');
  const [sleepGoal, setSleepGoal] = useState('8');
  const [targetWeight, setTargetWeight] = useState('68');
  const [isSavingGoals, setIsSavingGoals] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || 'pulse-avatar-1');
      setGender(user.gender || 'other');
      setHeight(user.height || '170');
      setWeight(user.weight || '70');
    }

    goalService.getGoals().then((res) => {
      if (res.data) {
        setWaterGoal(String(res.data.waterMl || 4000));
        setStepsGoal(String(res.data.steps || 10000));
        setCaloriesGoal(String(res.data.calories || 2200));
        setExerciseGoal(String(res.data.exerciseMinutes || 45));
        setSleepGoal(String(res.data.sleepHours || 8));
        setTargetWeight(String(res.data.targetWeight || 68));
      }
    });
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await dispatch(
        updateUserProfile({
          name,
          avatar,
          gender,
          height: Number(height),
          weight: Number(weight),
        })
      );
      setIsUpdatingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setIsUpdatingProfile(false);
      alert('Failed to update profile');
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
        targetWeight: Number(targetWeight),
      });
      setIsSavingGoals(false);
      alert('Targets updated successfully!');
    } catch (err) {
      setIsSavingGoals(false);
      alert('Failed to save targets');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Preferences & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile, lifestyle targets, and theme appearance
        </p>
      </div>

      {/* THEME & APPEARANCE */}
      <Card
        title="Theme & Appearance"
        subtitle="Choose between light and dark visual themes"
        icon={Sun}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => dispatch(setTheme('dark'))}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'border-brand-500 bg-brand-500/10 text-white ring-1 ring-brand-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <div className="text-left">
              <span className="text-sm font-bold block">Dark SaaS Mode</span>
              <span className="text-[11px] text-slate-400">Power BI style dark palette</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => dispatch(setTheme('light'))}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${
              theme === 'light'
                ? 'border-brand-500 bg-brand-500/10 text-slate-900 ring-1 ring-brand-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <span className="text-sm font-bold block">Clean Light Mode</span>
              <span className="text-[11px] text-slate-400">High contrast daylight canvas</span>
            </div>
          </button>
        </div>
      </Card>

      {/* PROFILE SETTINGS & AVATAR */}
      <Card
        title="Personal Profile & Avatar"
        subtitle="Avatar icons • No image uploads required"
        icon={User}
      >
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Preset Lifestyle Avatar
            </label>
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" icon={Save} isLoading={isUpdatingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* DAILY LIFESTYLE GOAL TARGETS */}
      <Card
        title="Lifestyle Targets & Benchmarks"
        subtitle="Used across all dashboard progress rings & summary calculations"
        icon={Target}
      >
        <form onSubmit={handleSaveGoals} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Steps Target
              </label>
              <input
                type="number"
                value={stepsGoal}
                onChange={(e) => setStepsGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Water Target (ml)
              </label>
              <input
                type="number"
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Calorie Target (kcal)
              </label>
              <input
                type="number"
                value={caloriesGoal}
                onChange={(e) => setCaloriesGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exercise Target (mins)
              </label>
              <input
                type="number"
                value={exerciseGoal}
                onChange={(e) => setExerciseGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sleep Target (hours)
              </label>
              <input
                type="number"
                value={sleepGoal}
                onChange={(e) => setSleepGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goal Bodyweight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" icon={Save} isLoading={isSavingGoals}>
              Update Benchmarks
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
