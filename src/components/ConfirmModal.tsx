import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, RotateCcw, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      // Auto focus primary action
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />,
          iconBg: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500',
        };
      case 'warning':
        return {
          icon: <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
          iconBg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500',
        };
      case 'primary':
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />,
          iconBg: 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60',
          btnBg: 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500',
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${vStyles.iconBg}`}>
              {vStyles.icon}
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${vStyles.btnBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
