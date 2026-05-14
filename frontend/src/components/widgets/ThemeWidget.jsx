import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeWidget() {
  const [open, setOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  const menuRef = useRef();

  const applyTheme = (mode) => {
    const root = document.documentElement;

    root.classList.remove("dark");

    if (mode === "dark") {
      root.classList.add("dark");
    }

    if (mode === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (systemDark) {
        root.classList.add("dark");
      }
    }
  };

  useEffect(() => {
    applyTheme(theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const currentIcon = () => {
    if (theme === "dark") {
      return <Moon size={16} />;
    }

    if (theme === "light") {
      return <Sun size={16} />;
    }

    return <Monitor size={16} />;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkCard hover:bg-primary-50 dark:hover:bg-surface-darkMuted flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-all"
      >
        {currentIcon()}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-3xl shadow-2xl overflow-hidden z-50 p-2">
          <button
            onClick={() => {
              setTheme("light");
              setOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
              theme === "light"
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300"
            }`}
          >
            <Sun size={16} />
            Light Mode
          </button>

          <button
            onClick={() => {
              setTheme("dark");
              setOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
              theme === "dark"
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300"
            }`}
          >
            <Moon size={16} />
            Dark Mode
          </button>

          <button
            onClick={() => {
              setTheme("system");
              setOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
              theme === "system"
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300"
            }`}
          >
            <Monitor size={16} />
            System Mode
          </button>
        </div>
      )}
    </div>
  );
}