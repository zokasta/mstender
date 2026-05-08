import { FaExpand } from "react-icons/fa";
import TimeWidget from "../../components/widgets/TimeWidget";
import NotificationMenu from "../../components/widgets/NotificationWidgets";
import ProfileMenu from "../../components/widgets/ProfileWidgets";
import { useSettings } from "../../context/SettingsContext";

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
    <div className="flex items-center justify-end bg-white shadow px-6 py-3 border-b">
      <div className="flex items-center gap-6 text-gray-600">
        {settings.widgets.time.enabled && <TimeWidget />}

        {/* Fullscreen */}
        {settings.widgets.screen.enabled && (
          <button
            onClick={handleFullscreen}
            className="hover:text-primary-500 transition-colors"
          >
            <FaExpand size={18} />
          </button>
        )}

        {/* Notifications */}
        {settings.widgets.notification.enabled && <NotificationMenu />}

        {/* Profile */}
        <ProfileMenu />
      </div>
    </div>
  );
}
