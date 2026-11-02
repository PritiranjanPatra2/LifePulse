import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Share, PlusSquare, Smartphone, X } from 'lucide-react';
import { notifyToast } from './Toast';

export const PWAInstallButton = ({ variant = 'sidebar' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture standard PWA install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      notifyToast({
        title: 'App Installed! 🚀',
        message: 'LifePulse has been installed to your home screen / desktop.',
        type: 'success',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback for browsers without direct prompt access
      notifyToast({
        title: 'Install LifePulse App 📱',
        message: 'Click the install icon in your browser address bar or menu.',
        type: 'info',
      });
    }
  };

  // If already installed as PWA
  if (isInstalled) {
    if (variant === 'navbar') return null;
    return (
      <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>App Installed</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">Active</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'navbar' ? (
        <button
          onClick={handleInstallClick}
          title="Install LifePulse App"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold shadow-sm hover:brightness-105 transition-all"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>
      ) : (
        /* Sidebar Card Variant */
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-14 h-14 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
                Install Mobile App
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-extrabold uppercase">
                  PWA
                </span>
              </h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Add LifePulse to your home screen for quick offline access.
              </p>
              <button
                onClick={handleInstallClick}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Install LifePulse</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  LP
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Install on iOS
                </h4>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Install LifePulse to your iPhone or iPad home screen in 2 easy steps:
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200">
                  1. Tap the <span className="font-bold text-blue-500">Share</span> icon in Safari toolbar.
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200">
                  2. Scroll down and tap <span className="font-bold text-emerald-500">Add to Home Screen</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

