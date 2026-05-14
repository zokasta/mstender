import React from "react";

const THEME_STYLES = {
  primary: {
    base: "bg-primary-500 hover:bg-primary-600 text-white",
    disabled: "bg-primary-300 text-white",
    ring: "focus-visible:ring-primary-500",
  },
  gray: {
    base: "bg-gray-200 hover:bg-gray-300 text-gray-700",
    disabled: "bg-gray-200 text-gray-500 dark:text-gray-400",
    ring: "focus-visible:ring-gray-400",
  },
};

export default function Button({
  type = "button",
  title,
  loadingTitle = "Processing...",
  isLoading = false,
  onClick,
  theme = "primary", // "primary" | "gray"
  className = "",
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  ariaLabel,
  ...rest
}) {
  const styles = THEME_STYLES[theme] || THEME_STYLES.primary;
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel || title}
      className={[
        "inline-flex items-center justify-center",
        "px-4 py-2 rounded-md text-sm font-medium",
        "transition-colors duration-150",
        "shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        styles.ring,
        isDisabled
          ? `${styles.disabled} cursor-not-allowed opacity-90`
          : `${styles.base} cursor-pointer`,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {/* Left icon */}
      {leftIcon && !isLoading && (
        <span className="mr-2 flex items-center">{leftIcon}</span>
      )}

      {/* Spinner when loading */}
      {isLoading && (
        <span className="mr-2 flex items-center">
          <svg
            className="animate-spin h-4 w-4 text-current"
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
      )}

      {/* Text */}
      <span>
        {isLoading
          ? loadingTitle || title || "Loading..."
          : title}
      </span>

      {/* Right icon */}
      {rightIcon && !isLoading && (
        <span className="ml-2 flex items-center">{rightIcon}</span>
      )}
    </button>
  );
}
