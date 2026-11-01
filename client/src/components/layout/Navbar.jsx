import React, { useState } from 'react';
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

export const Navbar = ({ onOpenSidebar, onOpenQuickAdd }) => {
  const dispatch = useDispatch();
  const { selectedDate } = useSelector((state) => state.date);
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  const [showNotifications, setShowNotifications] = useState(false);

  // Format date for display: "Sun, Nov 1, 2026" on desktop, clean compact on mobile
  const dateObj = new Date(selectedDate);
  const formattedDisplayDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const mobileDisplayDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const notifications = [
    { id: 1, title: 'Hydration Goal Alert', desc: 'Remember to drink at least 500ml water by afternoon.', time: '2h ago' },
    { id: 2, title: 'Streak Active!', desc: 'You logged meals 3 days in a row! Keep it up.', time: '5h ago' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-18 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-2.5 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu Trigger + Date Navigator */}
      <div className="flex items-center gap-1.5 sm:gap-4 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Date Selector Group */}
        <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 sm:p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs shrink-0">
          <button
            onClick={() => dispatch(goToPreviousDay())}
            title="Previous Day"
            className="p-1 sm:p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <label className="relative flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 cursor-pointer select-none">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500 shrink-0" />
            
            {/* Mobile compact single-line label */}
            <span className="sm:hidden text-xs font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
              {isToday ? 'Today' : mobileDisplayDate}
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
            className="p-1 sm:p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shrink-0"
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
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-premium p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Notifications
                </h4>
                <span className="text-[11px] text-brand-500 font-medium">
                  2 unread
                </span>
              </div>
              <div className="space-y-3 mt-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {n.desc}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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

