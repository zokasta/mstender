// src/Components/elements/Input.jsx
import { useState } from "react";

export default function Input({
  label,
  defaultValue = "",
  value,
  onChange,
  type = "text",
  className = "",
  placeholder = "",
  error = "", // 🔴 new prop for showing error
  required = false,
  country = 'in',
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const handleChange = (e) => {
    setInternalValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type={type}
        country={country}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full h-10 bg-[#f4f6f8] border rounded-sm outline-none px-3
          ${error ? "border-primary-500 focus:border-primary-500" : "border-gray-300 focus:border-primary-500"}
          ${className}`}
      />

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
