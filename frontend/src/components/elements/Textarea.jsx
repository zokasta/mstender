import { useState, useRef, useEffect } from "react";

export default function Textarea({
  id,
  defaultValue = "",
  value,
  onChange,
  placeholder = "Write here...",
  className = "",
  label,
  error = "",
  required = false,
  minRows = 3,
  maxRows = 10,
  disabled = false,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;

    setInternalValue(val);

    if (onChange) onChange(val);

    autoResize();
  };

  const autoResize = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const lineHeight = 24;

    const minHeight = minRows * lineHeight;

    const maxHeight = maxRows * lineHeight;

    textarea.style.height = `${Math.min(
      maxHeight,
      Math.max(minHeight, textarea.scrollHeight)
    )}px`;
  };

  useEffect(() => {
    autoResize();
  }, [internalValue, value]);

  return (
    <div className="w-full">
      {/* LABEL */}

      {label && (
        <label htmlFor={id} className="block mb-2">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {label}
            </span>

            {required && <span className="text-red-500 text-sm">*</span>}
          </div>
        </label>
      )}

      {/* TEXTAREA */}

      <div className="relative">
        <textarea
          id={id}
          ref={textareaRef}
          disabled={disabled}
          value={value !== undefined ? value : internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            block
            w-full
            text-sm
            bg-surface-light dark:bg-surface-darkMuted
            text-gray-800
            dark:text-gray-100
            placeholder:text-gray-400
            dark:placeholder:text-gray-500
            
            border
            rounded-2xl
            
            px-4
            py-3
            
            resize-none
            overflow-y-auto
            
            outline-none
            
            transition-all
            duration-200
            
            scroll-bar
            
            ${
              error
                ? `
                  border-red-400
                  dark:border-red-500
                  focus:border-red-500
                  focus:ring-4
                  focus:ring-red-100
                  dark:focus:ring-red-900/20
                `
                : `
                  border-surface-border dark:border-surface-darkBorder focus:border-primary-500 dark:focus:border-primary-500 
                `
            }

            ${
              disabled
                ? `
                  opacity-60
                  cursor-not-allowed
                `
                : ""
            }

            ${className}
          `}
        />

        {/* CHARACTER GLOW */}

        {!error && !disabled && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity bg-gradient-to-r from-primary-500/5 to-transparent" />
        )}
      </div>

      {/* ERROR */}

      {error && (
        <p className="mt-2 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
