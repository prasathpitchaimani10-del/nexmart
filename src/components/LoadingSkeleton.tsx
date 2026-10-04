import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-zinc-200 overflow-hidden animate-pulse">
          <div className="aspect-square bg-zinc-100" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-zinc-100 rounded w-1/3" />
            <div className="h-4 bg-zinc-100 rounded w-3/4" />
            <div className="h-4 bg-zinc-100 rounded w-1/2" />
            <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
              <div className="h-5 bg-zinc-100 rounded w-1/4" />
              <div className="h-8 w-8 bg-zinc-100 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
