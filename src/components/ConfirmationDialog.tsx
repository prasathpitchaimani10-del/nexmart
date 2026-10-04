import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-zinc-100 text-zinc-900'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900">{title}</h3>
            <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 font-semibold text-white rounded-lg shadow-sm transition-colors ${
              isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-zinc-950 hover:bg-zinc-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
