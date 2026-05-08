export default function Pagination({
  page,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsChange,
  total,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing {(page - 1) * rowsPerPage + 1} -{" "}
        {Math.min(page * rowsPerPage, total)} of {total}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 border rounded overflow-hidden">
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            disabled={page === 1}
          >
            {"<<"}
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            disabled={page === 1}
          >
            Prev
          </button>

          <div className="px-3 py-1 bg-white border-l border-r">{page}</div>

          <button
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            disabled={page === totalPages}
          >
            Next
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            disabled={page === totalPages}
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}
