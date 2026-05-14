import { Columns3, LayoutGrid } from "lucide-react";

export default function ViewMode({viewMode,setViewMode=()=>{}}) {
  return (
    <div className="h-12 bg-surface-soft dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder rounded-2xl p-1 flex items-center gap-1">
      <button
        onClick={() => setViewMode("kanban")}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          viewMode === "kanban"
            ? "bg-white dark:bg-surface-darkCard shadow-sm text-primary-500"
            : "text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-surface-dark"
        }`}
      >
        <Columns3 size={18} />
      </button>

      <button
        onClick={() => setViewMode("table")}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          viewMode === "table"
            ? "bg-white dark:bg-surface-darkCard shadow-sm text-primary-500"
            : "text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-surface-dark"
        }`}
      >
        <LayoutGrid size={18} />
      </button>
    </div>
  );
}
