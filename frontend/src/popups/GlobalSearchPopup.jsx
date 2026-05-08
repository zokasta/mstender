import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

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

  const inputRef = useRef(null);

  const navigate = useNavigate();

  /**
   * ===================================================
   * USER ROLE
   * ===================================================
   */
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.type || "intern";

  /**
   * ===================================================
   * ROLE CHECK
   * ===================================================
   */
  const hasAccess = (roles = []) => {

    return roles.includes(role);
  };

  /**
   * ===================================================
   * OPEN/CLOSE SHORTCUTS
   * ===================================================
   */
  useEffect(() => {

    const handleKey = (e) => {

      const key = (
        e?.key || ""
      ).toLowerCase();

      if (!key) return;

      // CTRL + S
      if (
        e.ctrlKey &&
        key === "s"
      ) {

        e.preventDefault();

        setOpen(true);
      }

      // ESC
      if (key === "escape") {

        e.preventDefault();

        setOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );

  }, []);

  /**
   * ===================================================
   * AUTO FOCUS
   * ===================================================
   */
  useEffect(() => {

    if (
      open &&
      inputRef.current
    ) {

      setTimeout(() => {

        inputRef.current?.focus();

      }, 100);
    }

  }, [open]);

  /**
   * ===================================================
   * CLOSE
   * ===================================================
   */
  const close = () => {

    setQuery("");

    setResults([]);

    setOpen(false);
  };

  /**
   * ===================================================
   * SEARCH
   * ===================================================
   */
  useEffect(() => {

    if (!query.trim()) {

      setResults([]);

      return;
    }

    const allItems = [];

    /**
     * ===============================================
     * BUILD SEARCH LIST
     * ===============================================
     */
    if (Array.isArray(menuData)) {

      menuData.forEach((m) => {

        /**
         * -------------------------------------------
         * PARENT MENU
         * -------------------------------------------
         */
        if (m.children) {

          // Hide full parent
          if (
            !hasAccess(m.allow_roles)
          ) {
            return;
          }

          m.children.forEach((c) => {

            // Hide child
            if (
              !hasAccess(c.allow_roles)
            ) {
              return;
            }

            allItems.push({

              ...c,

              parent: m.title,

              icon: icons[m.icon],
            });
          });
        }

        /**
         * -------------------------------------------
         * SINGLE MENU
         * -------------------------------------------
         */
        else {

          if (
            !hasAccess(m.allow_roles)
          ) {
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

    /**
     * ===============================================
     * FILTER
     * ===============================================
     */
    const q = query.toLowerCase();

    const matched = allItems.filter((item) => {

      const title = (
        item.title || ""
      ).toLowerCase();

      const url = (
        item.url || ""
      ).toLowerCase();

      return (
        title.includes(q) ||
        url.includes(q)
      );
    });

    /**
     * ===============================================
     * PRIORITY SORT
     * ===============================================
     */
    matched.sort((a, b) => {

      const aStarts = (
        a.title || ""
      )
        .toLowerCase()
        .startsWith(q);

      const bStarts = (
        b.title || ""
      )
        .toLowerCase()
        .startsWith(q);

      if (
        aStarts &&
        !bStarts
      ) return -1;

      if (
        !aStarts &&
        bStarts
      ) return 1;

      return 0;
    });

    setResults(matched);

  }, [query]);

  /**
   * ===================================================
   * SELECT
   * ===================================================
   */
  const handleSelect = (url) => {

    if (!url) return;

    close();
  };

  /**
   * ===================================================
   * ENTER
   * ===================================================
   */
  const handleInputKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      results.length > 0
    ) {

      handleSelect(
        results[0].url
      );

      navigate(
        results[0].url
      );
    }
  };

  /**
   * ===================================================
   * HIGHLIGHT
   * ===================================================
   */
  const highlightMatch = (
    text,
    query
  ) => {

    if (!query) return text;

    try {

      const regex = new RegExp(
        `(${query})`,
        "gi"
      );

      return text.replace(
        regex,
        "<mark>$1</mark>"
      );

    } catch {

      return text;
    }
  };

  return (
    <AnimatePresence>

      {open && (

        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-40 z-50"
          onClick={close}
        >

          <motion.div
            initial={{
              scale: 0.95,
              opacity: 0
            }}
            animate={{
              scale: 1,
              opacity: 1
            }}
            exit={{
              scale: 0.95,
              opacity: 0
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden"
          >

            {/* SEARCH BAR */}

            <div className="flex items-center gap-3 px-4 py-3 border-b">

              <FaSearch className="text-gray-500" />

              <input
                ref={inputRef}
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                onKeyDown={
                  handleInputKeyDown
                }
                type="text"
                placeholder="Search pages, menus, or actions..."
                className="flex-1 outline-none text-gray-700 text-base"
              />

              <button
                onClick={close}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                ESC
              </button>

            </div>

            {/* RESULTS */}

            <div className="max-h-96 overflow-y-auto">

              {results.length === 0 ? (

                <div className="text-center text-gray-500 py-10">
                  No results found
                </div>

              ) : (

                results.map((item, i) => {

                  const title =
                    item.title || "";

                  const highlighted =
                    highlightMatch(
                      title,
                      query
                    );

                  return (

                    <Link
                      key={i}
                      to={item.url}
                    >

                      <button
                        onClick={() =>
                          handleSelect(
                            item.url
                          )
                        }
                        className="w-full text-left px-5 py-3 hover:bg-gray-50 border-b flex items-center gap-3"
                      >

                        {item.icon && (

                          <span className="text-primary-500">

                            {item.icon}

                          </span>
                        )}

                        <div className="flex flex-col">

                          <div
                            className="text-gray-800 font-medium"
                            dangerouslySetInnerHTML={{
                              __html:
                                highlighted,
                            }}
                          />

                          {item.parent && (

                            <div className="text-xs text-gray-500">

                              {item.parent}

                            </div>
                          )}

                        </div>

                      </button>

                    </Link>
                  );
                })
              )}

            </div>

          </motion.div>

        </motion.div>
      )}

    </AnimatePresence>
  );
}