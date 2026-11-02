import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../store/authSlice';
import { Activity, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import { ROUTES } from '../constants/routes';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const res = await dispatch(loginUser({ email, password }));
    if (!res.error) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@lifepulse.io');
    setPassword('password123');
    dispatch(clearAuthError());
    const res = await dispatch(
      loginUser({ email: 'demo@lifepulse.io', password: 'password123' })
    );
    if (!res.error) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center mx-auto mb-3 shadow-glow-primary">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome to Life<span className="text-brand-500">Pulse</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personal Lifestyle Analytics & Performance Dashboard
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/90 text-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/90 text-white text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-3 mt-2"
            icon={ArrowRight}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Demo Login Shortcut */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Quick Demo Login (Alex Morgan • 14 days history)
          </button>
        </div>

        {/* Register link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link
            to={ROUTES.REGISTER}
            className="text-brand-400 hover:text-brand-300 font-semibold"
          >
            Create your account
          </Link>
        </p>

        {/* PWA Install Card on Login */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <PWAInstallButton variant="sidebar" />
        </div>
      </div>
    </div>
  );
};

