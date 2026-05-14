export default function IconButton({
  title,
  onClick,
  children,
  colorClass = "text-gray-600",
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center p-2 rounded border bg-white dark:bg-surface-darkCard hover:bg-gray-50 ${colorClass}`}
    >
      {children}
    </button>
  );
}
