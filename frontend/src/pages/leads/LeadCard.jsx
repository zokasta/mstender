import {
  Edit2,
  GripVertical,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  Video,
} from "lucide-react";

export default function LeadCard({
  snapshot = { isDragging: true },
  navigate,
  lead,
  openEditModal = () => {},
  deleteLead = () => {},
  setSelectedLead = () => {},
  setShowFollowupModal = () => {},
}) {
  const temperatureColors = {
    Hot: "bg-red-100 text-red-600 border-red-200",

    Warm: "bg-yellow-100 text-yellow-700 border-yellow-200",

    Cold: "bg-cyan-100 text-cyan-700 border-cyan-200",
  };
  return (
    <div
      className={`bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[26px] p-4 mb-3 transition-all duration-200 ${
        snapshot.isDragging
          ? "rotate-1 scale-[1.02] shadow-2xl border-primary-300"
          : "hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <div
            onClick={() => navigate(`/lead/details?id=${lead.id}`)}
            className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center font-bold shrink-0 cursor-pointer"
          >
            {lead.name[0]}
          </div>

          <div className="min-w-0">
            <h4
              onClick={() => navigate(`/lead/details?id=${lead.id}`)}
              className="text-sm font-bold text-gray-800 dark:text-white truncate cursor-pointer hover:text-primary-500"
            >
              {lead.name}
            </h4>

            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
              {lead.company}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-1 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-surface-soft dark:bg-surface-darkMuted text-gray-400 flex items-center justify-center cursor-grab active:cursor-grabbing">
            <GripVertical size={15} />
          </div>

          <button
            onClick={() => openEditModal(lead)}
            className="w-8 h-8 rounded-xl dark:text-gray-400 bg-surface-soft dark:bg-surface-darkMuted hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-500 flex items-center justify-center transition-all"
          >
            <Edit2 size={14} />
          </button>

          <button
            onClick={() => deleteLead(lead.id)}
            className="w-8 h-8 rounded-xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center transition-all  dark:text-gray-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* CONTACT */}

      <div className="mt-4 space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
        <p className="truncate">{lead.email}</p>

        <p>{lead.phone}</p>
      </div>

      {/* VALUE */}

      <div className="flex items-start justify-between border-t border-surface-border dark:border-surface-darkBorder mt-4 pt-4 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Deal Value
          </p>

          <h4 className="text-lg font-black text-emerald-600 mt-1">
            ₹{Number(lead.value || 0).toLocaleString("en-IN")}
          </h4>
        </div>

        <span
          className={`text-[10px] px-3 py-1.5 rounded-full border font-semibold ${
            temperatureColors[lead.lead_temperature]
          }`}
        >
          {lead.lead_temperature}
        </span>
      </div>

      {/* ACTIONS */}

      <div className="grid grid-cols-4 gap-2 mt-4">
        <button className="h-10 rounded-2xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 transition-all flex items-center justify-center">
          <Phone size={14} />
        </button>

        <button className="h-10 rounded-2xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 transition-all flex items-center justify-center">
          <MessageCircle size={14} />
        </button>

        <button className="h-10 rounded-2xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 transition-all flex items-center justify-center">
          <Video size={14} />
        </button>

        <button
          onClick={() => {
            setSelectedLead(lead);

            setShowFollowupModal(true);
          }}
          className="h-10 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white transition-all flex items-center justify-center shadow-lg shadow-primary-500/20"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
