import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sun,
  Moon,
  Plus,
  Bell,
  CheckCircle2,
  Footprints,
  Droplets,
  UtensilsCrossed,
  Dumbbell,
  Scale,
  Check,
  Trash2,
  X,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  goToPreviousDay,
  goToNextDay,
  goToToday,
  setSelectedDate,
} from '../../store/dateSlice';
import { toggleTheme } from '../../store/themeSlice';
import { Button } from '../common/Button';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const Navbar = ({ onOpenSidebar, onOpenQuickAdd }) => {
  const dispatch = useDispatch();
  const { selectedDate } = useSelector((state) => state.date);
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Format date for display: "Sun, Nov 1, 2026" on desktop, sleek single-line on mobile
  const [year, month, day] = (selectedDate || '').split('-').map(Number);
  const dateObj = (year && month && day) ? new Date(year, month - 1, day) : new Date();

  const formattedDisplayDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  const mobileDisplayDate = isToday
    ? `Today, ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Storage key isolated per user
  const storageKey = `lifepulse_notifications_${user?._id || 'guest'}`;

  // Initial notifications state loaded from user storage or personalized lifestyle reminders
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return [
      {
        id: 'notif-step-goal',
        title: 'Daily Steps Goal Active 🚶',
        desc: 'Target: 10,000 steps. Track walking to maintain your health streak.',
        time: 'Today',
        timestamp: Date.now(),
        type: 'steps',
        read: false,
      },
      {
        id: 'notif-hydration',
        title: 'Hydration Target 💧',
        desc: 'Remember to drink water regularly throughout the day.',
        time: 'Today',
        timestamp: Date.now() - 1000 * 60 * 30,
        type: 'water',
        read: false,
      },
      {
        id: 'notif-welcome',
        title: 'Welcome to LifePulse! 🌟',
        desc: 'Log food, workouts, sleep, and steps to view your analytics.',
        time: 'Today',
        timestamp: Date.now() - 1000 * 60 * 60,
        type: 'system',
        read: true,
      },
    ];
  });

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications, storageKey]);

  // Listen for live activity logs and toast notifications across the entire app
  useEffect(() => {
    const handleNewActivityToast = (e) => {
      if (!e.detail) return;
      const { title, message } = e.detail;

      // Detect activity category
      let notifType = 'system';
      const lower = (title + ' ' + message).toLowerCase();
      if (lower.includes('step')) notifType = 'steps';
      else if (lower.includes('water') || lower.includes('hydration')) notifType = 'water';
      else if (lower.includes('food') || lower.includes('meal')) notifType = 'food';
      else if (lower.includes('workout') || lower.includes('exercise')) notifType = 'exercise';
      else if (lower.includes('sleep')) notifType = 'sleep';
      else if (lower.includes('weight')) notifType = 'weight';

      const newNotif = {
        id: 'notif-' + Date.now() + Math.random().toString(36).substring(2, 6),
        title: title || 'Activity Logged',
        desc: message || 'Your lifestyle log was updated.',
        time: 'Just now',
        timestamp: Date.now(),
        type: notifType,
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 24)]);
    };

    window.addEventListener('lifepulse-toast', handleNewActivityToast);
    return () => window.removeEventListener('lifepulse-toast', handleNewActivityToast);
  }, []);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDismissOne = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const renderNotifIcon = (n) => {
    switch (n.type) {
      case 'steps':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <Footprints className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'water':
        return (
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'food':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'exercise':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'sleep':
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
            <Moon className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      case 'weight':
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-brand-500/15 text-brand-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-18 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-2.5 sm:px-6 lg:px-8 flex items-center justify-between transition-colors app-drag">
      {/* Left: Mobile Menu Trigger + Date Navigator */}
      <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Date Selector Group */}
        <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 sm:p-1 rounded-full sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs shrink-0">
          <button
            onClick={() => dispatch(goToPreviousDay())}
            title="Previous Day"
            className="p-1 sm:p-1.5 rounded-full sm:rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 active:scale-90 transition-all shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <label className="relative flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 py-0.5 sm:py-1 cursor-pointer select-none">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500 shrink-0" />
            
            {/* Mobile compact single-line label with sleek pulsating dot for Today */}
            <span className="sm:hidden flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              )}
              {mobileDisplayDate}
            </span>

            {/* Desktop full label */}
            <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight whitespace-nowrap">
              {formattedDisplayDate}
            </span>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) dispatch(setSelectedDate(e.target.value));
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              title="Pick a custom date"
            />
          </label>

          <button
            onClick={() => dispatch(goToNextDay())}
            title="Next Day"
            className="p-1 sm:p-1.5 rounded-full sm:rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 active:scale-90 transition-all shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => dispatch(goToToday())}
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-brand-500 text-white ml-0.5 sm:ml-1 hover:bg-brand-600 transition-colors shadow-xs shrink-0 whitespace-nowrap"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick-Add, Notifications, Theme Toggle, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Install PWA App Button */}
        <PWAInstallButton variant="navbar" />

        {/* Quick Add Button */}
        <Button
          onClick={onOpenQuickAdd}
          size="sm"
          icon={Plus}
          className="shadow-glow-primary hidden sm:inline-flex"
        >
          Quick Log
        </Button>

        {/* Small icon version for tiny mobile */}
        <button
          onClick={onOpenQuickAdd}
          className="p-2 rounded-xl bg-brand-500 text-white shadow-glow-primary sm:hidden"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-indigo-500" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h4>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold">
                      All caught up
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      title="Mark all as read"
                      className="p-1 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Read all</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      title="Clear all notifications"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2 mt-3 max-h-80 overflow-y-auto pr-0.5">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      No notifications
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      You're all caught up! New logs and daily target reminders will show here.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleToggleRead(n.id)}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                        !n.read
                          ? 'bg-slate-50/90 dark:bg-slate-800/60 border-brand-500/30 shadow-xs'
                          : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {renderNotifIcon(n)}
                        <div className="flex-1 min-w-0 pr-5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                            {n.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1.5 block">
                            {n.time}
                          </span>
                        </div>

                        {/* Individual dismiss button */}
                        <button
                          onClick={(e) => handleDismissOne(n.id, e)}
                          title="Dismiss"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity absolute top-2 right-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          {user?.avatar && user.avatar.startsWith('http') ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-brand-500"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight truncate max-w-[100px]">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
              Daily Target Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

