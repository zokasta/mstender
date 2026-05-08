import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import Token from "../../database/Token";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await Token.get("/notifications");
      const data = res.data?.data ?? res.data ?? [];
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const deleteNotification = async (id) => {
    await Token.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = async (id) => {
    await Token.post(`/notifications/${id}/mark-read`);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );
  };

  const markAllRead = async () => {
    await Token.post("/notifications/mark-all-read");
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Notifications
        </h1>

        <button
          onClick={markAllRead}
          className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Mark All as Read
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        {loading ? (
          <div className="p-6 text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-gray-400 text-center">
            No notifications found
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex justify-between items-start p-5 hover:bg-gray-50 transition ${
                  !n.is_read ? "bg-orange-50" : ""
                }`}
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                  }}
                >
                  <Link to={n.link || "#"}>
                    <p className="font-semibold text-gray-800">
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {n.message}
                    </p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {dayjs(n.created_at).fromNow()}
                    </span>
                  </Link>
                </div>

                <button
                  onClick={() => deleteNotification(n.id)}
                  className="text-gray-400 hover:text-red-500 ml-4"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}