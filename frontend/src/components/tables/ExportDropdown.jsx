import { useState, useRef, useEffect } from "react";
import Token from "../../database/Token";
import { toast } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";

export default function BulkExportDropdown({ selected }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (type) => {
    if (selected.size === 0) {
      toast.warn("Please select at least one invoice", toastCfg);
      return;
    }

    try {
      setLoading(true);

      const res = await Token.post(
        `/invoices/bulk-export`,
        {
          ids: Array.from(selected),
          type,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = type === "pdf" ? "invoices.pdf" : "invoices.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setOpen(false);
    } catch {
      toast.error("Export failed", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading}
        className="px-3 py-2 border rounded text-sm hover:bg-gray-100 disabled:opacity-50 bg-white dark:bg-surface-darkCard"
      >
        Export 
        {/* ({selected.size}) */}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-surface-darkCard border rounded shadow-lg z-50">
          <button
            onClick={() => handleExport("pdf")}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Export Selected as PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Export Selected as Excel
          </button>
        </div>
      )}
    </div>
  );
}
