import { useEffect, useMemo, useRef, useState } from "react";

export default function SelectSearchJson({
  label,
  value,
  onChange,

  data = [],          // 🔥 JSON ARRAY
  labelKey = "name",
  valueKey = "id",

  placeholder = "Select option",
  required = false,
  error = "",
  className = "",

  minSearchLength = 0,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  /* ─────────────────────────────
     Close on outside click
  ───────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ─────────────────────────────
     Auto focus search input
  ───────────────────────────── */
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  /* ─────────────────────────────
     Filter data locally
  ───────────────────────────── */
  const filteredItems = useMemo(() => {
    if (!search || search.length < minSearchLength) return data;

    return data.filter((item) =>
      String(item[labelKey])
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, data, labelKey, minSearchLength]);

  /* ─────────────────────────────
     Resolve selected item
  ───────────────────────────── */
  const selectedItem = data.find(
    (item) => String(item[valueKey]) === String(value)
  );

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Selected box */}
      <div
        onClick={() => setOpen((p) => !p)}
        className={`h-10 bg-[#f4f6f8] border rounded-sm px-3 flex items-center justify-between cursor-pointer
          ${error ? "border-red-500" : "border-gray-300"}
          ${className}`}
      >
        <span className="text-sm text-gray-700 truncate">
          {selectedItem ? selectedItem[labelKey] : placeholder}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>

      {/* Dropdown */}
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
            {filteredItems.length === 0 && (
              <div className="p-3 text-sm text-gray-400">
                No results found
              </div>
            )}

            {filteredItems.map((item) => (
              <div
                key={item[valueKey]}
                onClick={() => {
                  onChange(item[valueKey]);
                  setOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-primary-50
                  ${
                    String(item[valueKey]) === String(value)
                      ? "bg-primary-100"
                      : ""
                  }`}
              >
                {item[labelKey]}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
