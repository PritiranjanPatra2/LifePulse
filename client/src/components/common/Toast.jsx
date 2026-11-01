import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const notifyToast = ({ title, message, type = 'success', duration = 3500 }) => {
  window.dispatchEvent(
    new CustomEvent('lifepulse-toast', {
      detail: { id: Date.now(), title, message, type, duration },
    })
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const newToast = e.detail;
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 3500);
    };

    window.addEventListener('lifepulse-toast', handleToast);
    return () => window.removeEventListener('lifepulse-toast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-premium border backdrop-blur-md ${
                isSuccess
                  ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 dark:bg-emerald-950/95 shadow-emerald-950/50'
                  : isError
                  ? 'bg-rose-950/90 text-rose-100 border-rose-500/40 dark:bg-rose-950/95 shadow-rose-950/50'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700 dark:bg-slate-900/95'
              }`}
            >
              <div
                className={`p-1 rounded-xl shrink-0 ${
                  isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isError
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                ) : isError ? (
                  <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Info className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h5 className="text-xs font-bold tracking-tight text-white">
                  {toast.title}
                </h5>
                {toast.message && (
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

