import { useEffect, useRef, useState } from "react";
import Token from "../../database/Token";

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

  /* -------------------------
     Outside click
  -------------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* -------------------------
     Autofocus search
  -------------------------- */
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  /* -------------------------
     Debounce search
  -------------------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceTime);
    return () => clearTimeout(t);
  }, [search, debounceTime]);

  /* -------------------------
     Validate default value
     (/api/{id})
  -------------------------- */
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

  /* -------------------------
     Fetch list (AUTO + SEARCH)
  -------------------------- */
  useEffect(() => {
    if (!api) return;

    if (debouncedSearch.length < minSearchLength && debouncedSearch !== "") {
      return;
    }

    fetchList();
  }, [debouncedSearch, hasValidDefault]);

  /* -------------------------
     Fetch list
  -------------------------- */
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

  /* -------------------------
     Selected item
  -------------------------- */
  const selectedItem =
    items.find((i) => String(i[valueKey]) === String(value)) ||
    (hasValidDefault ? defaultItem : null);

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        onClick={() => setOpen((p) => !p)}
        className={`h-10 bg-[#f4f6f8] border rounded-sm px-3 flex items-center justify-between cursor-pointer
          ${error ? "border-red-500" : "border-gray-300"}
          ${className}`}
      >
        <span className="text-sm text-gray-700 truncate font-medium">
          {selectedItem ? selectedItem[labelKey] : placeholder}
          {isDefault &&
            hasValidDefault &&
            selectedItem &&
            String(selectedItem[valueKey]) === String(value) && (
              <span className="ml-2 text-xs text-primary-600">(default)</span>
            )}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>

      {open && (
        <div className="absolute z-50 w-full bg-white border rounded-sm shadow mt-1">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border-b outline-none"
          />

          <div className="max-h-60 overflow-auto">
            {loading && (
              <div className="p-3 text-sm text-gray-400">Loading...</div>
            )}

            {!loading && items.length === 0 && (
              <div className="p-3 text-sm text-gray-400">No results found</div>
            )}

            {items.map((item) => {
              const isDefaultItem =
                hasValidDefault &&
                defaultItem &&
                String(item[valueKey]) === String(defaultItem[valueKey]);

              return (
                <div
                  key={item[valueKey]}
                  onClick={() => {
                    onChange(item[valueKey]);
                    setOpen(false);
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary-50
                    ${
                      String(item[valueKey]) === String(value)
                        ? "bg-primary-100 font-semibold"
                        : ""
                    }`}
                >
                  {item[labelKey]}
                  {isDefault && isDefaultItem && (
                    <span className="ml-2 text-xs text-primary-600">
                      (default)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
