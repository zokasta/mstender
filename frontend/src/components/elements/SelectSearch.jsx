import { useEffect, useRef, useState } from "react";

import Token from "../../database/Token";

import { FaChevronDown, FaSearch, FaCheck } from "react-icons/fa";

export default function SelectSearch({
  label,
  value,
  onChange,

  api,
  method = "GET",
  target = "data",
  labelKey = "trip_name",
  valueKey = "id",

  searchKey = "search",
  extraParams = {},

  placeholder = "Select option",
  required = false,
  error = "",
  className = "",
  dropMenuClassName = "",

  debounceTime = 500,
  minSearchLength = 1,

  isDefault = true,
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [defaultItem, setDefaultItem] = useState(null);
  const [hasValidDefault, setHasValidDefault] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  /* =========================================
     OUTSIDE CLICK
  ========================================= */

  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* =========================================
     AUTO FOCUS
  ========================================= */

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  /* =========================================
     DEBOUNCE
  ========================================= */

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceTime);

    return () => clearTimeout(t);
  }, [search, debounceTime]);

  /* =========================================
     VALIDATE DEFAULT
  ========================================= */

  useEffect(() => {
    if (!value || !api) {
      setDefaultItem(null);

      setHasValidDefault(false);

      return;
    }

    const checkDefault = async () => {
      try {
        const res = await Token.get(`${api}/${value}`, {
          params: extraParams,
        });

        if (res?.data && res.data[valueKey] != null) {
          setDefaultItem(res.data);

          setHasValidDefault(true);
        } else {
          setDefaultItem(null);

          setHasValidDefault(false);
        }
      } catch {
        setDefaultItem(null);

        setHasValidDefault(false);
      }
    };

    checkDefault();
  }, [value, api, valueKey]);

  /* =========================================
     FETCH LIST
  ========================================= */

  useEffect(() => {
    if (!api) return;

    if (debouncedSearch.length < minSearchLength && debouncedSearch !== "") {
      return;
    }

    fetchList();
  }, [debouncedSearch, hasValidDefault]);

  /* =========================================
     FETCH
  ========================================= */

  const fetchList = async () => {
    if (!api) return;

    setLoading(true);

    try {
      const res = await Token.request({
        url: api,
        method,
        params: {
          ...extraParams,
          [searchKey]: debouncedSearch,
        },
      });

      const payload =
        target === "data" ? res.data?.data ?? res.data : res.data?.[target];

      let list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      if (hasValidDefault && defaultItem) {
        list = [
          defaultItem,
          ...list.filter(
            (i) => String(i[valueKey]) !== String(defaultItem[valueKey])
          ),
        ];
      }

      setItems(list);
    } catch (err) {
      console.error("SelectSearch fetch error:", err);

      setItems(hasValidDefault && defaultItem ? [defaultItem] : []);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     SELECTED ITEM
  ========================================= */

  const selectedItem =
    items.find((i) => String(i[valueKey]) === String(value)) ||
    (hasValidDefault ? defaultItem : null);

  return (
    <div
      className={`w-full relative ${open ? "z-[999]" : "z-0"}`}
      ref={wrapperRef}
    >
      {/* LABEL */}

      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}

          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      {/* SELECT */}

      <div
        onClick={() => setOpen((p) => !p)}
        className={`h-12 rounded-2xl bg-surface-light dark:bg-surface-darkMuted border px-4 flex items-center justify-between cursor-pointer transition-all ${
          error
            ? "border-danger-500"
            : "border-surface-border dark:border-surface-darkBorder hover:border-primary-300 dark:hover:border-primary-700"
        } ${className}`}
      >
        {/* TEXT */}

        <div className="flex items-center gap-2 overflow-hidden">
          <span
            className={`text-sm truncate font-medium ${
              selectedItem
                ? "text-gray-800 dark:text-white"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {selectedItem ? selectedItem[labelKey] : placeholder}
          </span>

          {/* DEFAULT */}

          {isDefault &&
            hasValidDefault &&
            selectedItem &&
            String(selectedItem[valueKey]) === String(value) && (
              <span className="px-2 py-0.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-semibold shrink-0">
                Default
              </span>
            )}
        </div>

        {/* ICON */}

        <FaChevronDown
          size={11}
          className={`transition-all ${
            open ? "rotate-180 text-primary-500" : "text-gray-400"
          }`}
        />
      </div>

      {/* DROPDOWN */}

      {open && (
        <div
          className={`absolute left-0 top-[calc(100%+8px)] z-[999999] w-full overflow-hidden rounded-[24px] border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard shadow-2xl ${dropMenuClassName}`}
          style={{
            isolation: "isolate",
          }}
        >
          {/* SEARCH */}

          <div className="p-3 border-b border-surface-border dark:border-surface-darkBorder">
            <div className="relative">
              <FaSearch
                size={12}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 rounded-2xl bg-surface-light dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder pl-10 pr-4 outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* LIST */}

          <div className="max-h-64 overflow-y-auto scroll-bar p-2">
            {/* LOADING */}

            {loading && (
              <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                Loading...
              </div>
            )}

            {/* EMPTY */}

            {!loading && items.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                No results found
              </div>
            )}

            {/* ITEMS */}

            {!loading &&
              items.map((item) => {
                const active = String(item[valueKey]) === String(value);

                const isDefaultItem =
                  hasValidDefault &&
                  defaultItem &&
                  String(item[valueKey]) === String(defaultItem[valueKey]);

                return (
                  <button
                    key={item[valueKey]}
                    type="button"
                    onClick={() => {
                      onChange(item[valueKey]);

                      setOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-2xl text-left transition-all flex items-center justify-between gap-3 ${
                      active
                        ? "bg-primary-50 dark:bg-primary-900/10"
                        : "hover:bg-primary-50 dark:hover:bg-surface-darkMuted"
                    }`}
                  >
                    {/* LEFT */}

                    <div className="min-w-0">
                      <p
                        className={`text-sm truncate font-medium ${
                          active
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-gray-800 dark:text-white"
                        }`}
                      >
                        {item[labelKey]}
                      </p>

                      {/* DEFAULT */}

                      {isDefault && isDefaultItem && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          Default item
                        </p>
                      )}
                    </div>

                    {/* CHECK */}

                    {active && (
                      <div className="w-7 h-7 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0">
                        <FaCheck size={10} />
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <p className="text-xs text-danger-500 mt-2 font-medium">{error}</p>
      )}
    </div>
  );
}
