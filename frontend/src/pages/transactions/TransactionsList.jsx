import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import ReactMoment from "react-moment";

import AddButton from "../../components/tables/AddButton";
import EditButton from "../../components/tables/EditButton";
import Pagination from "../../components/tables/Pagination";
import ConfirmDialog from "../../components/tables/ConfirmDialog";
import { toastCfg } from "../../data/toastCfg";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import Token from "../../database/Token";
import BadgeIcon from "../../components/tables/BadgeButton";
import Permission from "../../utils/Permission";
import BulkAction from "../../components/tables/BulkAction";
import DeleteButton from "../../components/tables/DeleteButton";
import FilterButton from "../../components/tables/FilterButton";

/* -------------------------
   ✅ Custom hook for selection
-------------------------- */
function useTableSelection(rows) {
  const [selected, setSelected] = useState(new Set());
  const headerCheckboxRef = useRef(null);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllOnPage = (checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      rows.forEach((r) => {
        if (checked) next.add(r.id);
        else next.delete(r.id);
      });
      return next;
    });
  };

  const isAllSelected =
    rows.length > 0 && rows.every((r) => selected.has(r.id));

  return {
    selected,
    setSelected,
    toggleSelect,
    selectAllOnPage,
    isAllSelected,
    headerCheckboxRef,
  };
}

/* -------------------------
   🔍 Filter Card
-------------------------- */
function FilterCard({ value, onChange, onSearch, onClear, onCancel }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600">
            Search (Txn ID / User)
          </label>
          <Input
            value={value.search}
            onChange={(v) => onChange({ ...value, search: v })}
            placeholder="Search transactions..."
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Type</label>
          <Select
            value={value.type}
            onChange={(v) => onChange({ ...value, type: v })}
          >
            <option value="">All</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Status</label>
          <Select
            value={value.status}
            onChange={(v) => onChange({ ...value, status: v })}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2 border rounded">
          Cancel
        </button>
        <button onClick={onClear} className="px-3 py-2 border rounded">
          Clear
        </button>
        <button
          onClick={onSearch}
          className="px-3 py-2 bg-orange-500 text-white rounded"
        >
          Search
        </button>
      </div>
    </div>
  );
}

/* -------------------------
   ✅ TransactionsList
-------------------------- */
export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filter, setFilter] = useState({
    search: "",
    type: "",
    status: "",
  });

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const {
    selected,
    setSelected,
    toggleSelect,
    selectAllOnPage,
    isAllSelected,
    headerCheckboxRef,
  } = useTableSelection(transactions);

  /* -------------------------
     Fetch Transactions
  -------------------------- */
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: rowsPerPage,
        ...filter,
      };

      const res = await Token.get("/transactions", { params });

      setTransactions(res.data.data || []);
      setTotal(res.data.total);
      setTotalPages(res.data.last_page);
    } catch (err) {
      toast.error("Failed to load transactions", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage]);

  const handleSearch = () => {
    setPage(1);
    fetchTransactions();
  };

  const handleClear = () => {
    setFilter({ search: "", type: "", status: "" });
    setPage(1);
    fetchTransactions();
  };

  const confirmDeleteNow = async () => {
    try {
      await Token.delete(`/transactions/${confirmDelete.id}`);
      toast.success("Transaction deleted", toastCfg);
      setConfirmDelete({ open: false, id: null });
      fetchTransactions();
    } catch {
      toast.error("Delete failed", toastCfg);
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return toast.warn("No rows selected", toastCfg);
    setConfirmBulkDeleteOpen(true);
  };


  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>

        <div className="flex items-center gap-3">
          <FilterButton onClick={() => setFiltersVisible((s) => !s)} />
          <BulkAction
            list={[
              {
                title: "Bulk Delete",
                onClick: handleBulkDelete,
                api: "/api/transactions/bulk-delete",
                method: "post",
              },
              // {
              //   title: "Change Status (bulk)",
              //   onClick: openBulkStatusModal,
              //   api: "/api/transactions/bulk-status",
              //   method: "post",
              // },
            ]}
          />
          <AddButton title="Add Transaction" path="/transaction/create" />
          <Permission api="/api/transactions" method="post"></Permission>
        </div>
      </div>

      {filtersVisible && (
        <FilterCard
          value={filter}
          onChange={setFilter}
          onSearch={handleSearch}
          onClear={handleClear}
          onCancel={() => setFiltersVisible(false)}
        />
      )}
      {/* Selection + Pagination */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer select-none ml-4">
          <input
            type="checkbox"
            ref={headerCheckboxRef}
            checked={isAllSelected}
            onChange={(e) => selectAllOnPage(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
          />
          <span className="text-sm text-gray-600">
            {selected.size} selected
          </span>
        </label>
        <div style={{ minWidth: 360 }}>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsChange={(n) => {
              setRowsPerPage(n);
              setPage(1);
            }}
            total={total}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto scroll-bar">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-sm text-gray-600">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  checked={isAllSelected}
                  onChange={(e) => selectAllOnPage(e.target.checked)}
                  className="h-4 w-4 cursor-pointer float-left"
                />
              </th>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Transaction ID</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>

                  <td className="px-4 py-3">
                    {(page - 1) * rowsPerPage + idx + 1}
                  </td>

                  <td className="px-4 py-3">{row.transaction_id}</td>
                  <td className="px-4 py-3">{row.user?.name ?? "-"}</td>
                  <td className="px-4 py-3 font-semibold">₹{row.amount}</td>
                  <td className="px-4 py-3">
                    <BadgeIcon>{row.type}</BadgeIcon>
                  </td>
                  <td className="px-4 py-3">
                    <ReactMoment format="DD MMM YYYY">
                      {row.created_at}
                    </ReactMoment>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Permission api="/api/transactions/{id}" method="put">
                        <EditButton path={`/transaction/update?id=${row.id}`} />
                      </Permission>

                      <Permission api="/api/transactions/{id}" method="delete">
                        <DeleteButton
                          onClick={() =>
                            setConfirmDelete({ open: true, id: row.id })
                          }
                        />
                      </Permission>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsChange={(n) => {
          setRowsPerPage(n);
          setPage(1);
        }}
        total={total}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  );
}
