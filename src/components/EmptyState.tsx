import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-16 px-4 text-center max-w-md mx-auto flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mb-4 border border-zinc-200">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-zinc-900">{title}</h3>
      <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
