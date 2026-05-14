import { useState } from "react";

import { FaTimes, FaTrash, FaExclamationTriangle } from "react-icons/fa";

/* =========================================
   MODAL
========================================= */

export const Modal = ({ open, title, children, onClose, footer, icon }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* OVERLAY */}

      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* CONTENT */}

      <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted">
          <div className="flex items-center justify-between gap-4">
            {/* LEFT */}

            <div className="flex items-center gap-4">
              {/* ICON */}

              <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center shrink-0">
                {icon || <FaExclamationTriangle size={16} />}
              </div>

              {/* TEXT */}

              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ERP Action Confirmation
                </p>
              </div>
            </div>

            {/* CLOSE */}

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-danger-50 dark:hover:bg-danger-900/10 hover:border-danger-300 dark:hover:border-danger-800 text-gray-500 hover:text-danger-500 transition-all flex items-center justify-center"
            >
              <FaTimes size={13} />
            </button>
          </div>
        </div>

        {/* BODY */}

        <div className="p-6 max-h-[70vh] overflow-y-auto scroll-bar">
          {children}
        </div>

        {/* FOOTER */}

        {footer && (
          <div className="px-6 py-5 border-t border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================
   CONFIRM DIALOG
========================================= */

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      icon={<FaTrash size={15} />}
      footer={
        <div className="flex items-center justify-between gap-4">
          {/* LEFT */}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            This action cannot be undone
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3">
            {/* CANCEL */}

            <button
              onClick={onCancel}
              disabled={loading}
              className="group h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-surface-light dark:hover:bg-surface-darkMuted hover:border-primary-300 dark:hover:border-primary-700 text-gray-700 dark:text-gray-300 hover:text-primary-500 font-semibold transition-all flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-xl bg-surface-light dark:bg-surface-darkMuted flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                ✕
              </div>
              Cancel
            </button>

            {/* DELETE */}

            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`group h-11 px-5 rounded-2xl text-white font-semibold flex items-center gap-3 transition-all shadow-lg ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-danger-500 hover:bg-danger-600 shadow-danger-500/20 hover:shadow-danger-500/30"
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center">
                <FaTrash size={11} />
              </div>

              {loading ? "Processing..." : "Delete"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* WARNING */}

        <div className="flex items-start gap-4 p-5 rounded-2xl bg-danger-50 dark:bg-danger-900/10 border border-danger-100 dark:border-danger-900/20">
          <div className="w-11 h-11 rounded-2xl bg-danger-100 dark:bg-danger-900/20 text-danger-500 flex items-center justify-center shrink-0">
            <FaExclamationTriangle size={14} />
          </div>

          <div>
            <h4 className="font-semibold text-danger-600 dark:text-danger-400">
              Warning
            </h4>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-6">
              {message}
            </p>
          </div>
        </div>

        {/* EXTRA */}

        <div className="text-sm text-gray-500 dark:text-gray-400 leading-6">
          Please confirm before continuing. Deleted data may not be recoverable.
        </div>
      </div>
    </Modal>
  );
}
