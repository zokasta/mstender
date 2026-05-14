import { FaFilter } from "react-icons/fa";

export default function FilterButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group h-10 px-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-primary-50 dark:hover:bg-surface-darkMuted hover:border-primary-300 dark:hover:border-primary-700 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-all shadow-sm hover:shadow-md flex items-center gap-3"
    >
      {/* ICON */}

      <div className="w-7 h-7 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center transition-all group-hover:bg-primary-500 group-hover:text-white">
        <FaFilter size={11} />
      </div>

      {/* TEXT */}

      <span className="text-sm font-semibold">Filters</span>
    </button>
  );
}
