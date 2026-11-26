import React from 'react';
import { X } from 'lucide-react';

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'navy',
  loading = false,
  onConfirm,
  onClose,
  children,
}) {
  if (!open) return null;

  const btnColors = {
    navy: 'bg-[#183B63] hover:bg-[#2878B9]',
    green: 'bg-[#15966E] hover:bg-[#117a59]',
    red: 'bg-[#D84D57] hover:bg-[#be3c45]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#172B4D]">{title}</h3>
            {description && <p className="mt-1 text-sm text-[#64748B]">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F3F5F9] hover:text-[#172B4D]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#F3F5F9]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${btnColors[tone] || btnColors.navy}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
