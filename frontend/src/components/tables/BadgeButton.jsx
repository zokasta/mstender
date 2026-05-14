export default function BadgeButton({ children, status, onClick }) {
  const STATUS_COLORS = {
    /* =========================================
       LEADS
    ========================================= */

    new: `bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 border border-primary-200 dark:border-primary-800`,
    contacted: `bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 `,

    interested: ` bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 `,

    qualified: ` bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800 `,

    converted: ` bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 `,

    lost: ` bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 `,

    won: ` bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 `,

    hot: ` bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 border border-rose-200 dark:border-rose-800 `,

    cold: ` bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 border border-sky-200 dark:border-sky-800 `,

    warm: ` bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 `,

    /* =========================================
       TICKETS
    ========================================= */

    open: ` bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800 `,

    "in progress": ` bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 `,

    resolved: ` bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 `,

    pending: ` bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-200 dark:border-orange-800 `,

    closed: ` bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 `,

    urgent: ` bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 `,

    high: ` bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 `,

    medium: ` bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 `,

    low: ` bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800 `,

    /* =========================================
       EMPLOYEES
    ========================================= */

    online: ` bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800 `,

    offline: ` bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 `,

    ban: ` bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 `,

    "not ban": ` bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 `,

    "on leave": ` bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 `,

    terminated: ` bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 `,

    inactive: ` bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 `,

    suspended: ` bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 `,

    /* =========================================
       GENERIC
    ========================================= */

    draft: ` bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-200 dark:border-purple-800 `,

    archived: ` bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 `,

    active: ` bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800 `,

    /* =========================================
       TRIPS
    ========================================= */

    cancelled: ` bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 `,

    canceled: ` bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 `,

    started: ` bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 `,

    completed: ` bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800 `,

    confirmed: ` bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 `,

    cancel: ` bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300  border border-red-200 dark:border-red-800  `,

    /* =========================================
       GROUP
    ========================================= */

    pause: `
      bg-amber-100 text-amber-700
      dark:bg-amber-900/20 dark:text-amber-300
      border border-amber-200 dark:border-amber-800
    `,

    reschedule: `
      bg-teal-100 text-teal-700
      dark:bg-teal-900/20 dark:text-teal-300
      border border-teal-200 dark:border-teal-800
    `,

    /* =========================================
       INVOICE
    ========================================= */

    paid: `
      bg-green-100 text-green-700
      dark:bg-green-900/20 dark:text-green-300
      border border-green-200 dark:border-green-800
    `,

    "partially paid": `
      bg-yellow-100 text-yellow-700
      dark:bg-yellow-900/20 dark:text-yellow-300
      border border-yellow-200 dark:border-yellow-800
    `,

    /* =========================================
       TRANSACTIONS
    ========================================= */

    "invoice payment": `
      bg-green-100 text-green-700
      dark:bg-green-900/20 dark:text-green-300
      border border-green-200 dark:border-green-800
    `,

    expense: `
      bg-yellow-100 text-yellow-700
      dark:bg-yellow-900/20 dark:text-yellow-300
      border border-yellow-200 dark:border-yellow-800
    `,

    refund: `
      bg-red-100 text-red-700
      dark:bg-red-900/20 dark:text-red-300
      border border-red-200 dark:border-red-800
    `,

    "manual credit": `
      bg-blue-100 text-blue-700
      dark:bg-blue-900/20 dark:text-blue-300
      border border-blue-200 dark:border-blue-800
    `,

    "manual debit": `
      bg-primary-100 text-primary-700
      dark:bg-primary-900/20 dark:text-primary-300
      border border-primary-200 dark:border-primary-800
    `,
  };

  const normalizedStatus = (status || children || "unknown").toLowerCase();

  const colorClass =
    STATUS_COLORS[normalizedStatus] ??
    `
      bg-gray-100 text-gray-700
      dark:bg-gray-800 dark:text-gray-300
      border border-gray-200 dark:border-gray-700
    `;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        min-h-[30px]
        px-3.5 py-1.5
        rounded-xl
        text-[11px]
        font-bold
        tracking-wide
        whitespace-nowrap
        transition-all
        duration-200
        shadow-sm
        hover:scale-[1.03]
        active:scale-[0.98]
        ${colorClass}
      `}
    >
      {status || children}
    </button>
  );
}
