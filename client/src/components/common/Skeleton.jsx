import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-subtle space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-16 h-5 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-36 h-8" />
    </div>
    <Skeleton className="w-full h-2 rounded-full" />
  </div>
);

