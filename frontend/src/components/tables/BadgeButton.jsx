export default function BadgeButton({ children, status, onClick }) {
  const STATUS_COLORS = {
    // ----- Leads -----
    new: "bg-orange-100 text-orange-800",
    contacted: "bg-blue-100 text-blue-800",
    interested: "bg-blue-100 text-blue-800",
    qualified: "bg-green-100 text-green-800",
    converted: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
    won: "bg-indigo-100 text-indigo-800",
    hot: "bg-red-200 text-red-900",
    cold: "bg-blue-200 text-blue-900",
    warm: "bg-yellow-200 text-yellow-900",

    // ----- Tickets -----
    open: "bg-green-100 text-green-800",
    "in progress": "bg-yellow-100 text-yellow-800",
    resolved: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    closed: "bg-red-100 text-red-800",

    urgent: "bg-red-100 text-red-800",
    high: "bg-blue-100 text-blue-800",
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",

    // ----- Employees -----
    online: "bg-green-200 text-green-900",
    offline: "bg-gray-200 text-gray-700",
    ban: "bg-red-300 text-red-900",
    "not ban": "bg-indigo-200 text-indigo-900",
    "on leave": "bg-yellow-100 text-yellow-800",
    terminated: "bg-red-100 text-red-800",
    inactive: "bg-blue-100 text-blue-800",
    suspended: "bg-red-100 text-red-800",

    // ----- Generic / Auto-added -----
    draft: "bg-purple-100 text-purple-800",
    archived: "bg-gray-300 text-gray-900",
    active: "bg-green-100 text-green-900",

    // ----- Trips -----
    cancelled: "bg-red-100 text-red-800",
    canceled: "bg-red-100 text-red-800",
    started: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    confirmed: "bg-green-100 text-green-800",
    cancel: "bg-red-100 text-red-800",

    // ------- Group -------
    pause: "bg-amber-100 text-yellow-900",
    reschedule: "bg-teal-100 text-teal-700",

    // ------- invoice -----
    paid: "bg-green-100 text-green-800",
    "partially paid": "bg-yellow-100 text-yellow-700",

    // ------- Transactions -----
    "invoice payment": "bg-green-100 text-green-800",
    "expense": "bg-yellow-100 text-yellow-700",
    "refund": "bg-red-100 text-red-700",
    "manual credit": "bg-blue-100 text-blue-700",
    "manual debit": "bg-orange-100 text-orange-700",
  };

  // Convert status to lowercase for lookup, but keep original for display
  const normalizedStatus = (status || children || "not found").toLowerCase();
  const colorClass =
    STATUS_COLORS[normalizedStatus] ?? "bg-gray-100 text-gray-800";

  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1 rounded-full text-nowrap font-semibold ${colorClass} outline-none select-none`}
    >
      {status || children}
    </button>
  );
}
