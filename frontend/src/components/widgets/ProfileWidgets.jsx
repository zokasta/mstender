import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Image1 from '../../assets/images/image.JPG'
import env from "../../data/env";

export default function ProfileWidgets() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef();
  const navigate = useNavigate();



  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      setUser({
        name: "Guest",
        email: "guest@example.com",
        profile_image: Image1,
      });
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      if (!parsed || typeof parsed !== "object") {
        setUser({
          name: "Guest",
          email: "guest@example.com",
          profile_image: Image1,
        });
        return;
      }

      setUser({
        ...parsed,
        profile_image:
          typeof parsed.profile_image === "string"
            ? parsed.profile_image
            : Image1,
      });
    } catch (e) {
      console.warn("Invalid profile JSON:", e);
      setUser({
        name: "Guest",
        email: "guest@example.com",
        profile_image: Image1,
      });
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("remember_me");
    navigate("/login");
  };

  if (!user) {
    return <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="focus:outline-none"
        type="button"
      >
        <img
          src={`${env.IMAGE_PATH}${user.profile_image}` || Image1}
          alt="Profile"
          className="w-7 h-7 rounded-full border border-gray-300 hover:scale-105 transition"
          onError={(e) => (e.currentTarget.src = Image1)}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 shadow-lg rounded-lg z-50">
          <div className="flex items-center gap-3 p-3 border-b">
            <img
              src={`${env.IMAGE_PATH}${user.profile_image}` || Image1}
              alt="Profile"
              className="w-10 h-10 rounded-full border"
              onError={(e) => (e.currentTarget.src = Image1)}
            />
            <div>
              <p className="font-semibold text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <ul className="text-sm text-gray-700">
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              View Profile
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate("/settings")}
            >
              Settings
            </li>
            <li
              className="px-4 py-2 hover:bg-primary-50 text-primary-700 border-t cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
