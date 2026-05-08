import { useState } from "react";
import { FaTimes } from "react-icons/fa";


export const Modal = ({ open, title, children, onClose, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Full screen overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 sm:mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && <div className="px-6 py-4 border-t bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
};

// ------------------- Confirm Dialog -------------------
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
      footer={
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded border hover:bg-gray-100"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : "Yes, delete"}
          </button>
        </div>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
