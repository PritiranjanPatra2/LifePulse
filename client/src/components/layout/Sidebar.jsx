import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  UtensilsCrossed,
  Droplets,
  Dumbbell,
  Moon,
  Scale,
  BarChart3,
  FileDown,
  Target,
  Settings,
  Activity,
  LogOut,
  X,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';

export const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Daily Tracker', href: ROUTES.DAILY_TRACKER, icon: CalendarCheck },
    { name: 'Nutrition', href: ROUTES.NUTRITION, icon: UtensilsCrossed },
    { name: 'Hydration', href: ROUTES.HYDRATION, icon: Droplets, highlight: 'text-cyan-400' },
    { name: 'Fitness & Activity', href: ROUTES.FITNESS, icon: Dumbbell },
    { name: 'Sleep Tracker', href: ROUTES.SLEEP, icon: Moon },
    { name: 'Weight Tracker', href: ROUTES.WEIGHT, icon: Scale },
    { name: 'Analytics', href: ROUTES.ANALYTICS, icon: BarChart3, badge: 'Power BI' },
    { name: 'Reports & Export', href: ROUTES.REPORTS, icon: FileDown },
    { name: 'Goals & Habits', href: ROUTES.GOALS, icon: Target },
    { name: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-glow-primary">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  Life<span className="text-brand-500">Pulse</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5">
                Lifestyle Analytics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </div>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              end={item.href === ROUTES.DASHBOARD}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {user?.avatar && user.avatar.startsWith('http') ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-brand-500 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-lg shrink-0">
                  👤
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'LifePulse User'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || 'user@lifepulse.io'}
                </p>
              </div>
            </div>
            <button
              onClick={() => dispatch(logout())}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

