import { useState } from "react";

import { FaChevronDown } from "react-icons/fa";

export default function Select({
  label,
  defaultValue = "",
  value,
  onChange,
  className = "",
  children,
  error = "",
  required = false,
  name = "",
  disabled = false,
  helperText = "",
}) {
  const [internalValue, setInternalValue] =
    useState(defaultValue);

  const handleChange = (e) => {
    setInternalValue(e.target.value);

    if (onChange) {
      onChange(e.target.value);
    }
  };

  const selectedValue =
    value !== undefined
      ? value
      : internalValue;

  return (
    <div className="w-full">
      
      {/* LABEL */}

      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          
          {label}

          {required && (
            <span className="text-danger-500 ml-1">
              *
            </span>
          )}
        </label>
      )}

      {/* SELECT */}

      <div className="relative group">
        <select
          value={selectedValue}
          name={name}
          disabled={disabled}
          onChange={handleChange}
          className={`w-full h-12 rounded-2xl border bg-surface-light dark:bg-surface-darkMuted px-4 pr-11 outline-none transition-all appearance-none text-sm font-medium text-gray-800 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed ${
            error
              ? "border-danger-500 focus:border-danger-500"
              : "border-surface-border dark:border-surface-darkBorder hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 dark:focus:border-primary-500"
          } ${className}`}
        >
          {children}
        </select>

        {/* ICON */}

        <div
          className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all ${
            error
              ? "text-danger-500"
              : "text-gray-400 group-hover:text-primary-500"
          }`}
        >
          <FaChevronDown size={11} />
        </div>
      </div>

      {/* HELPER */}

      {helperText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-5">
          {helperText}
        </p>
      )}

      {/* ERROR */}

      {error && (
        <p className="text-xs text-danger-500 mt-2 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}