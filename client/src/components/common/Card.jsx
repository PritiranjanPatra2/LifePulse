import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  icon: Icon,
  action,
  headerBorder = false,
  padding = 'p-6',
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-subtle ${
        hover ? 'transition-all duration-200 hover:shadow-premium hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || Icon || action) && (
        <div
          className={`flex items-center justify-between px-6 py-4.5 ${
            headerBorder ? 'border-b border-slate-100 dark:border-slate-800/80' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-semibold text-slate-900 dark:text-white text-base tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  );
};

