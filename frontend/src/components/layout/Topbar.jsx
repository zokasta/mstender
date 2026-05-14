import { FaExpand } from "react-icons/fa";
import TimeWidget from "../../components/widgets/TimeWidget";
import NotificationMenu from "../../components/widgets/NotificationWidgets";
import ProfileMenu from "../../components/widgets/ProfileWidgets";
import { useSettings } from "../../context/SettingsContext";
import ThemeWidget from "../widgets/ThemeWidget";

export default function Topbar() {
  const { settings } = useSettings();

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="sticky top-0 z-40 h-16 px-6 bg-surface-soft dark:bg-surface-dark border-b border-surface-border dark:border-surface-darkBorder flex items-center justify-between">
      {/* LEFT */}

      <div>
        {/* <h1 className="text-lg font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Welcome back to your ERP system
        </p> */}
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-3">
        {/* TIME */}

        {settings.widgets.time.enabled && (
          <div className="h-10 px-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
            <TimeWidget />
          </div>
        )}

        {/* FULLSCREEN */}

        {settings.widgets.screen.enabled && (
          <button
            onClick={handleFullscreen}
            className="w-10 h-10 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-all flex items-center justify-center shadow-sm"
          >
            <FaExpand size={14} />
          </button>
        )}

        {/* THEME */}

        <ThemeWidget />

        {/* NOTIFICATION */}

        {settings.widgets.notification.enabled && <NotificationMenu />}

        {/* PROFILE */}

        <ProfileMenu />
      </div>
    </div>
  );
}
