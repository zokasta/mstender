import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import menuData from "../../data/SidebarMenu.json";

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

export default function Sidebar() {
  const [menu, setMenu] = useState([]);

  const [openMenus, setOpenMenus] = useState({});

  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const role = user?.type || "intern";

  /**
   * ===================================================
   * CHECK ROLE ACCESS
   * ===================================================
   */
  const hasAccess = (roles = []) => {
    return roles.includes(role);
  };

  /**
   * ===================================================
   * FILTER MENU
   * ===================================================
   */
  useEffect(() => {
    const filteredMenu = menuData
      .filter((item) => {
        return hasAccess(item.allow_roles);
      })
      .map((item) => {
        if (item.children) {
          return {
            ...item,

            children: item.children.filter((child) =>
              hasAccess(child.allow_roles)
            ),
          };
        }

        return item;
      })
      .filter((item) => {
        if (item.children) {
          return item.children.length > 0;
        }

        return true;
      });

    setMenu(filteredMenu);
  }, []);

  /**
   * ===================================================
   * AUTO OPEN ACTIVE MENU
   * ===================================================
   */
  useEffect(() => {
    const newOpenMenus = {};

    menu.forEach((item, index) => {
      if (
        item.children?.some((child) =>
          location.pathname.startsWith(child.url)
        )
      ) {
        newOpenMenus[index] = true;
      }
    });

    setOpenMenus((prev) => ({
      ...prev,
      ...newOpenMenus,
    }));
  }, [location.pathname, menu]);

  /**
   * ===================================================
   * TOGGLE MENU
   * ===================================================
   */
  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  /**
   * ===================================================
   * CHILD ITEM
   * ===================================================
   */
  const renderChild = (child, i) => {
    const isActive = location.pathname.startsWith(child.url);

    return (
      <NavLink
        key={i}
        to={child.url}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
            : "text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-surface-darkMuted hover:text-primary-600 dark:hover:text-primary-400"
        }`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isActive
              ? "bg-white"
              : "bg-gray-300 dark:bg-gray-600 group-hover:bg-primary-500"
          }`}
        />

        <span>{child.title}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-w-64 max-w-64 bg-surface-soft dark:bg-surface-dark border-r border-surface-border dark:border-surface-darkBorder h-screen flex flex-col select-none">
      {/* =================================================== */}
      {/* LOGO */}
      {/* =================================================== */}

      <div className="h-16 px-5 border-b border-surface-border dark:border-surface-darkBorder flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-black tracking-wide text-primary-600 dark:text-primary-400">
            ERP
          </h2>

          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Enterprise Platform
          </p>
        </div>

        {/* <div className="w-10 h-10 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 font-bold">
          E
        </div> */}
      </div>

      {/* =================================================== */}
      {/* MENU */}
      {/* =================================================== */}

      <nav className="flex-1 overflow-y-auto scroll-bar p-3 space-y-1">
        {menu.map((item, index) => {
          /**
           * ===============================================
           * PARENT MENU
           * ===============================================
           */
          if (item.children) {
            const isParentActive = item.children.some((child) =>
              location.pathname.startsWith(child.url)
            );

            return (
              <div key={index}>
                <button
                  onClick={() => toggleMenu(index)}
                  className={`group flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isParentActive
                      ? "bg-primary-500 text-white shadow-xl shadow-primary-500/20"
                      : "text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-surface-darkMuted hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-lg ${
                        isParentActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-primary-500"
                      }`}
                    >
                      {icons[item.icon]}
                    </div>

                    <span className="font-semibold text-sm">
                      {item.title}
                    </span>
                  </div>

                  <div
                    className={`transition-transform duration-300 ${
                      openMenus[index] ? "rotate-180" : ""
                    }`}
                  >
                    <FaChevronDown size={12} />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openMenus[index]
                      ? "max-h-[500px] opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-5 pl-4 border-l border-surface-border dark:border-surface-darkBorder space-y-1">
                    {item.children.map(renderChild)}
                  </div>
                </div>
              </div>
            );
          }

          /**
           * ===============================================
           * SINGLE MENU
           * ===============================================
           */
          return (
            <NavLink
              key={index}
              to={item.url}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-500 text-white shadow-xl shadow-primary-500/20"
                    : "text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-surface-darkMuted hover:text-primary-600 dark:hover:text-primary-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`text-lg transition-all ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-primary-500"
                    }`}
                  >
                    {icons[item.icon]}
                  </div>

                  <span className="font-semibold text-sm">
                    {item.title}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* =================================================== */}
      {/* FOOTER */}
      {/* =================================================== */}

      {/* <div className="p-3 border-t border-surface-border dark:border-surface-darkBorder shrink-0">
        <div className="bg-primary-500 rounded-2xl p-4 text-white shadow-xl shadow-primary-500/20">
          <h4 className="font-semibold text-sm">ERP Dashboard</h4>

          <p className="text-xs text-primary-100 mt-1 leading-5">
            Manage your business smarter with modern enterprise tools.
          </p>

          <button className="mt-4 h-9 px-4 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-sm font-medium">
            Explore
          </button>
        </div>
      </div> */}
    </div>
  );
}