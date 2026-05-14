import { useState } from "react";

export default function Input({
  label,
  defaultValue = "",
  value,
  onChange,
  type = "text",
  className = "",
  placeholder = "",
  error = "",
  required = false,
  country = "in",
}) {
  const [internalValue, setInternalValue] =
    useState(defaultValue);

  const handleChange = (e) => {
    setInternalValue(e.target.value);

    if (onChange) onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}

          {required && (
            <span className="text-danger-500 ml-1">*</span>
          )}
        </label>
      )}

      <input
        type={type}
        country={country}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full h-12 rounded-2xl border bg-surface-light dark:bg-surface-darkMuted px-4 outline-none transition-all text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
          error
            ? "border-danger-500 focus:border-danger-500"
            : "border-surface-border dark:border-surface-darkBorder focus:border-primary-500 dark:focus:border-primary-500"
        } ${className}`}
      />

      {error && (
        <p className="text-xs text-danger-500 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}