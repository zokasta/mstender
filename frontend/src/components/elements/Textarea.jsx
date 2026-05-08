import { useState, useRef, useEffect } from "react";

export default function Textarea({
  id,
  defaultValue = "",
  value,
  onChange,
  placeholder = "Write here...",
  className = "",
  label,
  error = "", // 🔴 new prop for error
  required = false,
  minRows = 3,
  maxRows = 10,
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

    textarea.style.height = "auto"; // reset
    const lineHeight = 24; // px
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
      {label && (
        <label
          htmlFor={id}
          className="block text-sm text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={id}
        ref={textareaRef}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`block w-full text-sm text-gray-900 
          bg-[#f4f6f8] rounded-sm 
          px-3 py-2 resize-y max-h-40 min-h-10 outline-none
          focus:border-primary-500 border-[0.75px]  focus:ring-1 focus:ring-primary-500
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}
          ${className}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}