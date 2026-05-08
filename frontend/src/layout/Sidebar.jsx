import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import menuData from "../data/SidebarMenu.json";
import { FaListUl } from "react-icons/fa";
import {
  FaChevronDown,
  FaChevronRight,
  FaHome,
  FaUsers,
  FaBriefcase,
  FaUser,
  FaTicketAlt,
  FaLayerGroup,
  FaAppStore,
  FaBook,
  FaCog,
  FaUserCircle,
} from "react-icons/fa";
import { FaBus } from "react-icons/fa6";
import { HiDocumentCurrencyRupee } from "react-icons/hi2";
import { TbFileInvoice } from "react-icons/tb";
import { MdPayments } from "react-icons/md";
import { AiFillBank } from "react-icons/ai";
import { PiNoteFill } from "react-icons/pi";
import { IoIosNotifications } from "react-icons/io";
const icons = {
  home: <FaHome />,
  users: <FaUsers />,
  briefcase: <FaBriefcase />,
  user: <FaUser />,
  ticket: <FaTicketAlt />,
  layers: <FaLayerGroup />,
  "app-window": <FaAppStore />,
  book: <FaBook />,
  settings: <FaCog />,
  taxes: <HiDocumentCurrencyRupee />,
  invoices: <TbFileInvoice />,
  payments: <MdPayments />,
  trips: <FaBus />,
  banks: <AiFillBank />,
  "user-circle": <FaUserCircle />,
  "release-note": <PiNoteFill />,
  transactions: <FaListUl />,
  notification: <IoIosNotifications />,
};


// ✅ Check permission from localStorage
export const hasPermission = (api, method) => {
  if (!api || api === "none" || !method || method === "none") return true;
  try {
    const types = JSON.parse(localStorage.getItem("types")) || [];
    for (const type of types) {
      if (
        type.apis?.some(
          (a) =>
            a.endpoint === api &&
            a.method.toLowerCase() === method.toLowerCase()
        )
      ) {
        return true;
      }
    }
  } catch (err) {
    console.error("Error checking permissions:", err);
  }
  return false;
};

export default function Sidebar() {
  const [menu, setMenu] = useState([]);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  useEffect(() => {
    const adminMenu = menuData.find((m) => m.role === "admin");
    setMenu(adminMenu?.menu || []);
  }, []);

  // Auto-open parent if current path matches
  useEffect(() => {
    const newOpenMenus = {};
    menu.forEach((item, index) => {
      if (
        item.children?.some((child) => location.pathname.startsWith(child.url))
      ) {
        newOpenMenus[index] = true;
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }));
  }, [location.pathname, menu]);

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const renderChild = (child, i) => {
    if (!hasPermission(child.api, child.method)) return null;
    const isActive = location.pathname.startsWith(child.url);

    return (
      <NavLink
        key={i}
        to={child.url}
        className={`block px-2 py-1 rounded text-sm ${
          isActive
            ? "bg-primary-500 text-white"
            : "text-gray-600 hover:bg-primary-50 hover:text-primary-500"
        }`}
      >
        {child.title}
      </NavLink>
    );
  };

  return (
    <div className="min-w-56 bg-white shadow-lg h-screen flex flex-col select-none">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-primary-500">ERP</h2>
      </div>

      <nav className="flex-1 scroll-bar overflow-y-auto p-2">
        {menu.map((item, index) => {
          // Handle parent with children
          if (item.children) {
            const visibleChildren = item.children.filter((child) =>
              hasPermission(child.api, child.method)
            );
            if (visibleChildren.length === 0) return null; // Hide parent if all children are hidden

            return (
              <div key={index} className="mb-2">
                <button
                  onClick={() => toggleMenu(index)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded ${
                    item.children.some((child) =>
                      location.pathname.startsWith(child.url)
                    )
                      ? "bg-primary-500 text-white"
                      : "text-gray-700 hover:bg-primary-50 hover:text-primary-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{icons[item.icon]}</span>
                    <span>{item.title}</span>
                  </div>
                  {openMenus[index] ? <FaChevronDown /> : <FaChevronRight />}
                </button>

                <div
                  className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                    openMenus[index]
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {visibleChildren.map(renderChild)}
                </div>
              </div>
            );
          }

          // Handle single item
          if (!hasPermission(item.api, item.method)) return null;

          return (
            <NavLink
              key={index}
              to={item.url}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded font-medium ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-gray-700 hover:bg-primary-50 hover:text-primary-500"
                }`
              }
            >
              <span>{icons[item.icon]}</span>
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
