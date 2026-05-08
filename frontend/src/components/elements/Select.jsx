import { useState } from "react";

export default function Select({
  label,
  defaultValue = "",
  value,
  onChange,
  className = "",
  children,
  error = "", // 🔴 error prop
  required = false,
  name='',
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

      <select
        value={value !== undefined ? value : internalValue}
        name={name}
        onChange={handleChange}
        className={`w-full h-10 bg-[#f4f6f8] border rounded-sm outline-none px-3
          ${error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary-500"}
          focus:border-2 ${className}`}
      >
        {children}
      </select>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}