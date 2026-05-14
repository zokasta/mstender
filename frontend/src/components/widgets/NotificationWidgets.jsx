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

  const user = JSON.parse(localStorage.getItem("user"));

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
    } catch (err) {
      console.error("Failed to delete notification");
    }
  };

  const markAllRead = async () => {
    try {
      await Token.post("/notifications/mark-all-read");

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {}
  };

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
      {/* BUTTON */}

      <button
        onClick={() => setOpen(!open)}
        className={`relative w-10 h-10 rounded-2xl transition-all duration-200 flex items-center justify-center border ${
          open
            ? "bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/25"
            : "bg-white dark:bg-surface-darkCard border-surface-border dark:border-surface-darkBorder text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-surface-darkMuted hover:text-primary-500"
        }`}
      >
        <FaBell size={14} />

        {unreadCount > 0 && (
          <>
            {/* PING */}

            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500 animate-ping" />

            {/* COUNT */}

            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-danger-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-danger-500/30">
              {unreadCount}
            </span>
          </>
        )}
      </button>

      {/* DROPDOWN */}

      {open && (
        <div className="absolute right-0 mt-3 w-[380px] bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-2xl overflow-hidden z-50">
          {/* HEADER */}

          <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-gradient-to-r from-primary-50 to-white dark:from-surface-darkMuted dark:to-surface-darkCard">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Notifications
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You have {unreadCount} unread notifications
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="h-9 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-all shadow-lg shadow-primary-500/20"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* LIST */}

          <ul className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 && (
              <li className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-primary-50 dark:bg-surface-darkMuted flex items-center justify-center text-primary-500">
                  <FaBell size={20} />
                </div>

                <h4 className="mt-4 font-semibold text-gray-700 dark:text-white">
                  No Notifications
                </h4>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You're all caught up for now.
                </p>
              </li>
            )}

            {notifications.map((n) => (
              <li
                key={n.id}
                className={`group relative px-6 py-5 transition-all border-b border-surface-border dark:border-surface-darkBorder ${
                  !n.is_read
                    ? "bg-primary-50/60 dark:bg-primary-900/10"
                    : "bg-white dark:bg-surface-darkCard"
                } hover:bg-primary-50 dark:hover:bg-surface-darkMuted`}
              >
                {/* UNREAD LINE */}

                {!n.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full" />
                )}

                {/* DELETE */}

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    deleteNotification(n.id);
                  }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-xl hover:bg-danger-100 dark:hover:bg-danger-900/20 text-gray-400 hover:text-danger-500 flex items-center justify-center"
                >
                  ✕
                </button>

                {/* CONTENT */}

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
                  <div className="flex gap-4">
                    {/* ICON */}

                    <div
                      className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center ${
                        !n.is_read
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                          : "bg-primary-50 dark:bg-surface-darkMuted text-primary-500"
                      }`}
                    >
                      <FaBell size={14} />
                    </div>

                    {/* TEXT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-gray-800 dark:text-white leading-6">
                          {n.title}
                        </p>

                        {!n.is_read && (
                          <span className="mt-1 w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-6">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className="text-[11px] text-gray-400"
                          title={dayjs(n.created_at).format(
                            "DD MMM YYYY hh:mm A"
                          )}
                        >
                          {dayjs(n.created_at).fromNow()}
                        </span>

                        {!n.is_read && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* FOOTER */}

          {notifications.length > 0 && (
            <div className="p-4 bg-surface-light dark:bg-surface-darkMuted border-t border-surface-border dark:border-surface-darkBorder">
              <button className="w-full h-11 rounded-2xl bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder hover:bg-primary-50 dark:hover:bg-surface-dark text-primary-500 font-semibold text-sm transition-all">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
