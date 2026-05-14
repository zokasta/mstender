import { useState } from "react";

export default function Switch({
  checked,
  value,
  onChange = () => {},
  isLoading = false,
}) {
  const [isPressed, setIsPressed] = useState(false);

  const isOn = Boolean(
    typeof checked !== "undefined" ? checked : value
  );

  const handleClick = () => {
    if (isLoading) return;
    onChange(!isOn);
  };

  const handleKeyDown = (e) => {
    const key = (e?.key || "").toLowerCase();
    if (key === "enter" || key === " " || key === "spacebar") {
      e.preventDefault?.();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={isLoading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 
        ${isOn ? "bg-primary-500" : "bg-gray-300"}
        ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {isLoading ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <svg
            className="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </span>
      ) : (
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white dark:bg-surface-darkCard shadow-md transform transition-transform duration-300 ease-out
            ${isOn ? "translate-x-5" : "translate-x-0"}
            ${isPressed ? "scale-95" : "scale-100"}
          `}
        />
      )}
    </button>
  );
}
