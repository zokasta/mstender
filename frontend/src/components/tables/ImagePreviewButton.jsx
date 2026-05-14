import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaImage, FaTimes } from "react-icons/fa";

export default function ImagePreviewButton({ imageUrl }) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };

    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!imageUrl) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-8 h-8 bg-primary-500 text-white rounded flex items-center justify-center hover:bg-primary-600 transition"
      >
        <FaImage className="scale-110" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-surface-darkCard rounded-xl shadow-lg p-4 max-w-3xl w-full mx-4"
            >
              {/* Close button */}
              <button
                onClick={close}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>

              {/* Image */}
              <div className="flex justify-center items-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
