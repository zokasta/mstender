import Dropdown from "./Dropdown";

import {
  FaChevronDown,
  FaTrash,
  FaLayerGroup,
  FaCheckCircle,
  FaBolt,
} from "react-icons/fa";

export default function BulkAction({
  list,
  handleBulkDelete = () => {},
  openBulkStatusModal = () => {},
}) {
  const baseItems =
    list && list.length > 0
      ? list
      : [
          {
            title: "Bulk Delete",
            description: "Delete selected rows",
            icon: <FaTrash />,
            danger: true,
            onClick: () => handleBulkDelete(),
          },

          {
            title: "Change Status",
            description: "Update selected status",
            icon: <FaCheckCircle />,
            onClick: () => openBulkStatusModal(),
          },
        ];

  return (
    <Dropdown
      align="left"
      button={
        <button className="group h-10 px-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder hover:border-primary-300 dark:hover:border-primary-700 text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-all flex items-center gap-3 shadow-sm hover:shadow-md">
          {/* ICON */}

          <div className="w-7 h-7 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center transition-all group-hover:bg-primary-500 group-hover:text-white">
            <FaBolt size={11} />
          </div>

          {/* TEXT */}

          <span className="text-sm font-semibold">Bulk Actions</span>

          {/* ARROW */}

          <FaChevronDown size={10} className="opacity-60" />
        </button>
      }
    >
      {({ close }) => (
        <div className="w-[280px] overflow-hidden rounded-[24px] border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard shadow-2xl">
          {/* HEADER */}

          <div className="px-4 py-3 border-b border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted">
            <div className="flex items-center gap-3">
              {/* ICON */}

              <div className="w-9 h-9 rounded-2xl bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
                <FaLayerGroup size={13} />
              </div>

              {/* TEXT */}

              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                  Bulk Actions
                </h3>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage selected rows
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}

          <div className="p-2">
            <div className="space-y-1">
              {baseItems.map((item, idx) => {
                const isDanger = item.danger;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      close();

                      item.onClick && item.onClick(item);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all group ${
                      isDanger
                        ? "hover:bg-danger-50 dark:hover:bg-danger-900/10"
                        : "hover:bg-primary-50 dark:hover:bg-surface-darkMuted"
                    }`}
                  >
                    {/* ICON */}

                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                        isDanger
                          ? "bg-danger-50 dark:bg-danger-900/20 text-danger-500 group-hover:bg-danger-500 group-hover:text-white"
                          : "bg-primary-50 dark:bg-primary-900/20 text-primary-500 group-hover:bg-primary-500 group-hover:text-white"
                      }`}
                    >
                      {item.icon || <FaLayerGroup size={13} />}
                    </div>

                    {/* CONTENT */}

                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm leading-none ${
                          isDanger
                            ? "text-danger-600 dark:text-danger-400"
                            : "text-gray-800 dark:text-white"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-4">
                        {item.description || "Perform action"}
                      </p>
                    </div>

                    {/* ARROW */}

                    <div className="opacity-0 group-hover:opacity-100 transition-all text-gray-400 text-sm">
                      →
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Dropdown>
  );
}
