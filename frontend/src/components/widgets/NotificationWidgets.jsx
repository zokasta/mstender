import { useState, useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import Token from "../../database/Token";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import env from "../../data/env";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";
dayjs.extend(relativeTime);

export default function NotificationWidgets() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef();

  const user = JSON.parse(localStorage.getItem("user")); // adjust if different
  // Setup Echo
  useEffect(() => {
    window.Pusher = Pusher;

    const echo = new Echo({
      broadcaster: "pusher",
      key: env.PUSHER_APP_KEY,
      cluster: env.VITE_PUSHER_APP_CLUSTER,
      forceTLS: true,
      authEndpoint: "http://localhost:8000/api/broadcasting/auth",
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      },
    });

    if (user?.id) {
      echo
        .private(`private-user.${user.id}`)
        .listen(".notification.created", (e) => {
          setNotifications((prev) => [e, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });
    }

    return () => {
      echo.disconnect();
    };
  }, []);

  // Load existing notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await Token.get("/notifications");
      const data = res.data?.data ?? res.data ?? [];

      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await Token.delete(`/notifications/${id}`);

      setNotifications((prev) => prev.filter((n) => n.id !== id));

      setUnreadCount((prev) => {
        const deleted = notifications.find((n) => n.id === id);
        if (deleted && !deleted.is_read) {
          return Math.max(prev - 1, 0);
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to delete notification");
    }
  };

  const markAllRead = async () => {
    try {
      await Token.post("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  // Close dropdown outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="hover:text-primary-500 transition-colors relative"
      >
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-primary-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 shadow-lg rounded-lg z-50">
          <div className="px-4 py-2 font-semibold border-b text-gray-700 flex justify-between">
            Notifications
            <button onClick={markAllRead} className="text-xs text-primary-500">
              Mark all read
            </button>
          </div>

          <ul className="max-h-72 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500">
                No notifications
              </li>
            )}

            {notifications.map((n) => (
              <li
                key={n.id}
                className={`relative px-4 py-3 text-sm cursor-pointer hover:bg-gray-100 ${
                  !n.is_read ? "bg-primary-50" : ""
                }`}
              >
                {/* ❌ Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent link click
                    deleteNotification(n.id);
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-primary-500 text-xs"
                >
                  ✕
                </button>

                {/* Clickable Content */}
                <Link
                  to={n.link ? n.link : ""}
                  className="block"
                  onClick={() => {
                    if (!n.is_read) {
                      Token.post(`/notifications/${n.id}/mark-read`);
                      setUnreadCount((prev) => Math.max(prev - 1, 0));
                    }
                  }}
                >
                  <p className="text-gray-700 font-medium">{n.title}</p>
                  <p className="text-gray-600 text-xs">{n.message}</p>
                  <span
                    className="text-xs text-gray-400"
                    title={dayjs(n.created_at).format("DD MMM YYYY hh:mm A")}
                  >
                    {dayjs(n.created_at).fromNow()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="text-center py-2 border-t text-sm text-primary-500 hover:bg-gray-50 cursor-pointer">
            View all
          </div>
        </div>
      )}
    </div>
  );
}
