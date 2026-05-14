import React, { useEffect, useState, useRef } from "react";

import { toast, ToastContainer } from "react-toastify";

import ReactMoment from "react-moment";

import { FaFilter, FaMoneyCheckAlt } from "react-icons/fa";

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

/* =========================================
   TABLE SELECTION
========================================= */

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

  const isPartiallySelected = selected.size > 0 && !isAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  return {
    selected,
    setSelected,
    toggleSelect,
    selectAllOnPage,
    isAllSelected,
    headerCheckboxRef,
  };
}

/* =========================================
   FILTER CARD
========================================= */

function FilterCard({ value, onChange, onSearch, onClear, onCancel }) {
  return (
    <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
      {/* HEADER */}

      <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
            <FaFilter />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Filters
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Filter and search transactions
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            label="Search"
            value={value.search}
            onChange={(v) =>
              onChange({
                ...value,
                search: v,
              })
            }
            placeholder="Search transaction..."
          />

          <Select
            label="Type"
            value={value.type}
            onChange={(v) =>
              onChange({
                ...value,
                type: v,
              })
            }
          >
            <option value="">All</option>

            <option value="Credit">Credit</option>

            <option value="Debit">Debit</option>
          </Select>

          <Select
            label="Status"
            value={value.status}
            onChange={(v) =>
              onChange({
                ...value,
                status: v,
              })
            }
          >
            <option value="">All</option>

            <option value="Pending">Pending</option>

            <option value="Success">Success</option>

            <option value="Failed">Failed</option>
          </Select>
        </div>

        {/* ACTIONS */}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-surface-light dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 font-medium transition-all"
          >
            Cancel
          </button>

          <button
            onClick={onClear}
            className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-surface-light dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 font-medium transition-all"
          >
            Clear
          </button>

          <button
            onClick={onSearch}
            className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   MAIN
========================================= */

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

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  const {
    selected,
    setSelected,
    toggleSelect,
    selectAllOnPage,
    isAllSelected,
    headerCheckboxRef,
  } = useTableSelection(transactions);

  /* =========================================
     FETCH
  ========================================= */

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

  /* =========================================
     FILTERS
  ========================================= */

  const handleSearch = () => {
    setPage(1);

    fetchTransactions();
  };

  const handleClear = () => {
    setFilter({
      search: "",
      type: "",
      status: "",
    });

    setPage(1);

    fetchTransactions();
  };

  /* =========================================
     DELETE
  ========================================= */

  const confirmDeleteNow = async () => {
    try {
      await Token.delete(`/transactions/${confirmDelete.id}`);

      toast.success("Transaction deleted", toastCfg);

      setConfirmDelete({
        open: false,
        id: null,
      });

      fetchTransactions();
    } catch {
      toast.error("Delete failed", toastCfg);
    }
  };

  /* =========================================
     BULK DELETE
  ========================================= */

  const handleBulkDelete = () => {
    if (selected.size === 0) {
      return toast.warn("No rows selected", toastCfg);
    }

    setConfirmBulkDeleteOpen(true);
  };

  const confirmBulkDeleteNow = async () => {
    try {
      await Token.post("/transactions/bulk-delete", {
        ids: Array.from(selected),
      });

      setSelected(new Set());

      setConfirmBulkDeleteOpen(false);

      toast.success("Transactions deleted", toastCfg);

      fetchTransactions();
    } catch {
      toast.error("Bulk delete failed", toastCfg);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* =========================================
         PAGE HEADER
      ========================================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* LEFT */}

        <div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[20px] bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
              <FaMoneyCheckAlt size={20} />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-white">
                Transactions
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all financial transactions
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-3 flex-wrap">
          <FilterButton onClick={() => setFiltersVisible((s) => !s)} />

          <BulkAction
            list={[
              {
                title: "Bulk Delete",
                onClick: handleBulkDelete,
              },
            ]}
          />

          <Permission types={["superadmin"]}>
            <AddButton title="Add Transaction" path="/transaction/create" />
          </Permission>
        </div>
      </div>

      {/* FILTERS */}

      {filtersVisible && (
        <FilterCard
          value={filter}
          onChange={setFilter}
          onSearch={handleSearch}
          onClear={handleClear}
          onCancel={() => setFiltersVisible(false)}
        />
      )}

      {/* =========================================
         TABLE CARD
      ========================================= */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[32px] shadow-sm overflow-hidden">
        {/* TOP */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              ref={headerCheckboxRef}
              checked={isAllSelected}
              onChange={(e) => selectAllOnPage(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />

            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {selected.size} selected
            </span>
          </div>

          <div className="w-full lg:w-auto">
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

        {/* TABLE */}

        <div className="overflow-x-auto scroll-bar">
          <table className="min-w-full">
            {/* HEAD */}

            <thead>
              <tr className="bg-surface-light dark:bg-surface-darkMuted text-gray-600 dark:text-gray-300 text-sm">
                <th className="px-5 py-4">
                  <input
                    type="checkbox"
                    ref={headerCheckboxRef}
                    checked={isAllSelected}
                    onChange={(e) => selectAllOnPage(e.target.checked)}
                    className="h-4 w-4 cursor-pointer"
                  />
                </th>

                <th className="px-5 py-4 text-left font-semibold">#</th>

                <th className="px-5 py-4 text-left font-semibold">
                  Transaction ID
                </th>

                <th className="px-5 py-4 text-left font-semibold">User</th>

                <th className="px-5 py-4 text-left font-semibold">Amount</th>

                <th className="px-5 py-4 text-left font-semibold">Type</th>

                <th className="px-5 py-4 text-left font-semibold">Date</th>

                <th className="px-5 py-4 text-left font-semibold">Action</th>
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-t border-surface-border dark:border-surface-darkBorder hover:bg-primary-50/50 dark:hover:bg-surface-darkMuted transition-all"
                  >
                    {/* CHECKBOX */}

                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>

                    {/* INDEX */}

                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {(page - 1) * rowsPerPage + idx + 1}
                    </td>

                    {/* TRANSACTION ID */}

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800 dark:text-white">
                        {row.transaction_id}
                      </div>
                    </td>

                    {/* USER */}

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {row.user?.name || "-"}
                    </td>

                    {/* AMOUNT */}

                    <td className="px-5 py-4">
                      <span className="font-semibold text-success-600">
                        ₹{row.amount}
                      </span>
                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">
                      <BadgeIcon>{row.type}</BadgeIcon>
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      <ReactMoment format="DD MMM YYYY">
                        {row.created_at}
                      </ReactMoment>
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <EditButton path={`/transaction/update?id=${row.id}`} />

                        <DeleteButton
                          onClick={() =>
                            setConfirmDelete({
                              open: true,
                              id: row.id,
                            })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM PAGINATION */}

      <div className="pt-2">
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

      {/* DELETE */}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        onConfirm={confirmDeleteNow}
        onCancel={() =>
          setConfirmDelete({
            open: false,
            id: null,
          })
        }
      />

      {/* BULK DELETE */}

      <ConfirmDialog
        open={confirmBulkDeleteOpen}
        title="Delete Selected Transactions"
        message={`Are you sure you want to delete ${selected.size} selected transaction(s)?`}
        onConfirm={confirmBulkDeleteNow}
        onCancel={() => setConfirmBulkDeleteOpen(false)}
      />
    </div>
  );
}
