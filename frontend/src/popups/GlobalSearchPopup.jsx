import React, { useEffect, useState, useRef } from "react";

import { Link, useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import { FaSearch } from "react-icons/fa";

import menuData from "../data/SidebarMenu.json";

import {
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
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef(null);

  const navigate = useNavigate();

  /* =========================================
     USER ROLE
  ========================================= */

  const user = JSON.parse(localStorage.getItem("user"));

  const role = user?.type || "intern";

  /* =========================================
     ACCESS
  ========================================= */

  const hasAccess = (roles = []) => {
    return roles.includes(role);
  };

  /* =========================================
     SHORTCUTS
  ========================================= */

  useEffect(() => {
    const handleKey = (e) => {
      const key = (e?.key || "").toLowerCase();

      // CTRL + K
      if (e.ctrlKey && key === "k") {
        e.preventDefault();

        setOpen(true);
      }

      // ESC
      if (key === "escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* =========================================
     AUTO FOCUS
  ========================================= */

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  /* =========================================
     AUTO SCROLL
  ========================================= */

  useEffect(() => {
    const activeElement = document.querySelector("[data-search-active='true']");

    activeElement?.scrollIntoView({
      block: "nearest",
    });
  }, [activeIndex]);

  /* =========================================
     CLOSE
  ========================================= */

  const close = () => {
    setQuery("");

    setResults([]);

    setActiveIndex(0);

    setOpen(false);
  };

  /* =========================================
     SEARCH
  ========================================= */

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);

      return;
    }

    const allItems = [];

    if (Array.isArray(menuData)) {
      menuData.forEach((m) => {
        if (m.children) {
          if (!hasAccess(m.allow_roles)) {
            return;
          }

          m.children.forEach((c) => {
            if (!hasAccess(c.allow_roles)) {
              return;
            }

            allItems.push({
              ...c,

              parent: m.title,

              icon: icons[m.icon],
            });
          });
        } else {
          if (!hasAccess(m.allow_roles)) {
            return;
          }

          allItems.push({
            ...m,

            parent: null,

            icon: icons[m.icon],
          });
        }
      });
    }

    const q = query.toLowerCase();

    const matched = allItems.filter((item) => {
      const title = (item.title || "").toLowerCase();

      const url = (item.url || "").toLowerCase();

      return title.includes(q) || url.includes(q);
    });

    matched.sort((a, b) => {
      const aStarts = (a.title || "").toLowerCase().startsWith(q);

      const bStarts = (b.title || "").toLowerCase().startsWith(q);

      if (aStarts && !bStarts) return -1;

      if (!aStarts && bStarts) return 1;

      return 0;
    });

    setResults(matched);

    setActiveIndex(0);
  }, [query]);

  /* =========================================
     SELECT
  ========================================= */

  const handleSelect = (url) => {
    if (!url) return;

    close();

    navigate(url);
  };

  /* =========================================
     KEYBOARD NAVIGATION
  ========================================= */

  const handleInputKeyDown = (e) => {
    if (!results.length) return;

    // DOWN
    if (e.key === "ArrowDown") {
      e.preventDefault();

      setActiveIndex((prev) => (prev >= results.length - 1 ? 0 : prev + 1));
    }

    // UP
    else if (e.key === "ArrowUp") {
      e.preventDefault();

      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    }

    // ENTER
    else if (e.key === "Enter") {
      e.preventDefault();

      const selected = results[activeIndex];

      if (!selected?.url) return;

      handleSelect(selected.url);
    }
  };

  /* =========================================
     HIGHLIGHT
  ========================================= */

  const highlightMatch = (text, query) => {
    if (!query) return text;

    try {
      const regex = new RegExp(`(${query})`,"gi");

      return text.replace(regex, "<mark>$1</mark>");
    } catch {
      return text;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-start justify-center pt-32 z-[999]"
          onClick={close}
        >
          <motion.div
            initial={{
              scale: 0.96,
              opacity: 0,
              y: -20,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
            }}
            exit={{
              scale: 0.96,
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.2,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkCard shadow-2xl"
          >
            {/* HEADER */}

            <div className="border-b border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center shrink-0">
                  <FaSearch size={16} />
                </div>

                <div className="flex-1">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    type="text"
                    placeholder="Search pages, menus, settings..."
                    className="w-full bg-transparent outline-none text-lg font-medium text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Search through ERP pages and tools
                  </p>
                </div>

                <button
                  onClick={close}
                  className="min-w-[40px] h-10 inline-flex items-center justify-center px-3 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-surface-darkCard transition-all"
                >
                  ESC
                </button>
              </div>
            </div>

            {/* RESULTS */}

            <div className="max-h-[500px] overflow-y-auto scroll-bar">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-20 h-20 rounded-[28px] bg-primary-50 dark:bg-surface-darkMuted flex items-center justify-center text-primary-500">
                    <FaSearch size={24} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-gray-800 dark:text-white">
                    No Results Found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-6">
                    Try searching for menus, pages, settings, or dashboard
                    sections.
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-1">
                  {results.map((item, i) => {
                    const title = item.title || "";

                    const highlighted = highlightMatch(title, query);

                    return (
                      <button
                        key={i}
                        data-search-active={activeIndex === i}
                        onClick={() => handleSelect(item.url)}
                        className={`group w-full text-left px-4 py-4 rounded-2xl transition-all flex items-center gap-4 ${
                          activeIndex === i
                            ? "bg-primary-50 dark:bg-surface-darkMuted"
                            : "hover:bg-primary-50 dark:hover:bg-surface-darkMuted"
                        }`}
                      >
                        {/* ICON */}

                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                            activeIndex === i
                              ? "bg-primary-500 text-white"
                              : "bg-primary-50 dark:bg-surface-dark text-primary-500 group-hover:bg-primary-500 group-hover:text-white"
                          }`}
                        >
                          {item.icon}
                        </div>

                        {/* TEXT */}

                        <div className="flex-1 min-w-0">
                          <div
                            className="text-gray-800 dark:text-white font-semibold truncate [&>mark]:bg-primary-100 dark:[&>mark]:bg-primary-900/30 [&>mark]:text-primary-600 dark:[&>mark]:text-primary-400 [&>mark]:px-1 [&>mark]:rounded"
                            dangerouslySetInnerHTML={{
                              __html: highlighted,
                            }}
                          />

                          <div className="flex items-center gap-2 mt-1">
                            {item.parent && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.parent}
                              </span>
                            )}

                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />

                            <span className="text-xs text-primary-500 truncate">
                              {item.url}
                            </span>
                          </div>
                        </div>

                        {/* ENTER */}

                        <div className="hidden md:flex items-center gap-1 shrink-0">
                          <kbd className="min-w-[38px] h-8 px-2 inline-flex items-center justify-center rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                            ENTER
                          </kbd>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <kbd className="min-w-[38px] h-8 px-2 inline-flex items-center justify-center rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark text-[11px] font-semibold">
                    ↑↓
                  </kbd>
                  Navigate
                </div>

                <div className="flex items-center gap-2">
                  <kbd className="min-w-[50px] h-8 px-2 inline-flex items-center justify-center rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark text-[11px] font-semibold">
                    Enter
                  </kbd>
                  Open
                </div>
              </div>

              <div className="text-xs text-gray-400">Ctrl + K</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
