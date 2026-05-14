import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from "react-icons/fa6";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsChange,
  total,
}) {
  const start = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;

  const end = Math.min(page * rowsPerPage, total);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* LEFT */}

      <div className="flex items-center gap-3">
        {/* INFO */}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-800 dark:text-white">
            {start}
          </span>{" "}
          -{" "}
          <span className="font-semibold text-gray-800 dark:text-white">
            {end}
          </span>{" "}
          of <span className="font-semibold text-primary-500">{total}</span>
        </div>

        {/* ROWS */}

        <div className="relative">
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsChange(Number(e.target.value))}
            className="h-11 pl-4 pr-10 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark text-sm font-medium text-gray-700 dark:text-gray-300 outline-none hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 transition-all appearance-none"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>

          {/* ARROW */}

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            ▼
          </div>
        </div>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-2">
        {/* FIRST */}

        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
            page === 1
              ? "opacity-50 cursor-not-allowed border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted text-gray-400"
              : "border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 hover:text-primary-500"
          }`}
        >
          <FaAnglesLeft size={13} />
        </button>

        {/* PREV */}

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
            page === 1
              ? "opacity-50 cursor-not-allowed border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted text-gray-400"
              : "border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 hover:text-primary-500"
          }`}
        >
          <FaAngleLeft size={13} />
        </button>

        {/* PAGE */}

        <div className="min-w-[90px] h-11 px-4 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary-500/20">
          {page} / {totalPages}
        </div>

        {/* NEXT */}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
            page === totalPages
              ? "opacity-50 cursor-not-allowed border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted text-gray-400"
              : "border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 hover:text-primary-500"
          }`}
        >
          <FaAngleRight size={13} />
        </button>

        {/* LAST */}

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
            page === totalPages
              ? "opacity-50 cursor-not-allowed border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted text-gray-400"
              : "border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 hover:text-primary-500"
          }`}
        >
          <FaAnglesRight size={13} />
        </button>
      </div>
    </div>
  );
}
