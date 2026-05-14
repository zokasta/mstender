import React, { useEffect, useState, useRef } from "react";

import { toast, ToastContainer } from "react-toastify";

import AddButton from "../../components/tables/AddButton";
import EditButton from "../../components/tables/EditButton";
import Pagination from "../../components/tables/Pagination";

import ConfirmDialog, { Modal } from "../../components/tables/ConfirmDialog";

import Switch from "../../components/elements/Switch";

import { toastCfg } from "../../data/toastCfg";

import Input from "../../components/elements/Input";

import Select from "../../components/elements/Select";

import Token from "../../database/Token";

import { SEARCH_STATUS_LIST, STATUS_LIST } from "./data";

import BulkAction from "../../components/tables/BulkAction";

import DeleteButton from "../../components/tables/DeleteButton";

import FilterButton from "../../components/tables/FilterButton";

import {
  FaUniversity,
  FaSearch,
  FaLayerGroup,
  FaCheckCircle,
} from "react-icons/fa";

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
            <FaSearch />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Filters
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Filter and search bank records
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* SEARCH */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Search Bank
            </label>

            <Input
              value={value.search}
              onChange={(e) =>
                onChange({
                  ...value,
                  search: e,
                })
              }
              placeholder="Search bank..."
            />
          </div>

          {/* STATUS */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>

            <Select
              value={value.status}
              onChange={(e) =>
                onChange({
                  ...value,
                  status: e,
                })
              }
            >
              {SEARCH_STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
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
   MAIN COMPONENT
========================================= */

export default function BanksList() {
  const [banks, setBanks] = useState([]);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [filter, setFilter] = useState({
    search: "",
    status: "",
  });

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);

  const [bulkStatusValue, setBulkStatusValue] = useState("Active");

  const [loading, setLoading] = useState(false);

  const [statusLoading, setStatusLoading] = useState({});

  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);

  const {
    selected,
    setSelected,
    toggleSelect,
    selectAllOnPage,
    isAllSelected,
    headerCheckboxRef,
  } = useTableSelection(banks);

  /* =========================================
     FETCH
  ========================================= */

  const fetchBanks = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        per_page: rowsPerPage,
        search: filter.search || "",
        status: filter.status || "",
      };

      const res = await Token.get("/banks", { params });

      setBanks(res.data.data);

      setTotal(res.data.total);

      setTotalPages(res.data.last_page);
    } catch {
      toast.error("Failed to load banks", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [page, rowsPerPage]);

  /* =========================================
     FILTERS
  ========================================= */

  const handleSearch = () => {
    setPage(1);

    fetchBanks();
  };

  const handleClearFilters = () => {
    setFilter({
      search: "",
      status: "",
    });

    setPage(1);

    fetchBanks();
  };

  /* =========================================
     DELETE
  ========================================= */

  const handleDelete = (id) =>
    setConfirmDelete({
      open: true,
      id,
    });

  const confirmDeleteNow = async () => {
    try {
      await Token.delete(`/banks/${confirmDelete.id}`);

      toast.success("Bank deleted", toastCfg);

      setConfirmDelete({
        open: false,
        id: null,
      });

      fetchBanks();
    } catch {
      toast.error("Failed to delete bank", toastCfg);
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
      await Token.post("/banks/bulk-delete", {
        ids: Array.from(selected),
      });

      setSelected(new Set());

      setConfirmBulkDeleteOpen(false);

      toast.success("Selected banks deleted", toastCfg);

      fetchBanks();
    } catch {
      toast.error("Failed to delete banks", toastCfg);
    }
  };

  /* =========================================
     BULK STATUS
  ========================================= */

  const openBulkStatusModal = () => {
    if (selected.size === 0) {
      return toast.warn("No rows selected", toastCfg);
    }

    setBulkStatusModalOpen(true);
  };

  const doBulkStatusChange = async () => {
    try {
      setBulkStatusLoading(true);

      await Token.post("/banks/bulk-status", {
        ids: Array.from(selected),

        is_active: bulkStatusValue === "Active",
      });

      setBulkStatusModalOpen(false);

      setSelected(new Set());

      toast.success("Status updated", toastCfg);

      fetchBanks();
    } catch {
      toast.error("Failed to update status", toastCfg);
    } finally {
      setBulkStatusLoading(false);
    }
  };

  /* =========================================
     STATUS TOGGLE
  ========================================= */

  const toggleStatus = async (id, checked) => {
    setStatusLoading((prev) => ({
      ...prev,
      [id]: true,
    }));

    try {
      await Token.patch(`/banks/${id}/status`, {
        is_active: checked,
      });

      toast.success("Bank status updated");

      fetchBanks();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading((prev) => ({
        ...prev,
        [id]: false,
      }));
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
              <FaUniversity size={20} />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-white">
                Banks & Cash
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all bank accounts and balances
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-3 flex-wrap">
          <BulkAction
            list={[
              {
                title: "Bulk Delete",
                onClick: handleBulkDelete,
              },
              {
                title: "Change Status",
                onClick: openBulkStatusModal,
              },
            ]}
          />

          <FilterButton onClick={() => setFiltersVisible((s) => !s)} />

          <AddButton title="Add Bank" path="/bank/create" />
        </div>
      </div>

      {/* FILTERS */}

      {filtersVisible && (
        <FilterCard
          value={filter}
          onChange={setFilter}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          onCancel={() => setFiltersVisible(false)}
        />
      )}

      {/* =========================================
         TABLE CARD
      ========================================= */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[32px] shadow-sm overflow-hidden">
        {/* TOP */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted flex items-center justify-between">
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

        {/* TABLE */}

        <div className="overflow-x-auto scroll-bar">
          <table className="min-w-full">
            {/* HEAD */}

            <thead>
              <tr className="bg-surface-light dark:bg-surface-darkMuted text-gray-600 dark:text-gray-300 text-sm">
                <th className="px-5 py-4 text-left font-semibold">#</th>

                <th className="px-5 py-4 text-left font-semibold">Bank Name</th>

                <th className="px-5 py-4 text-left font-semibold">Balance</th>

                <th className="px-5 py-4 text-left font-semibold">Branch</th>

                <th className="px-5 py-4 text-left font-semibold">
                  Account No
                </th>

                <th className="px-5 py-4 text-left font-semibold">Type</th>

                <th className="px-5 py-4 text-left font-semibold">Status</th>

                <th className="px-5 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading banks...
                  </td>
                </tr>
              ) : banks.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    No banks found.
                  </td>
                </tr>
              ) : (
                banks.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-t border-surface-border dark:border-surface-darkBorder hover:bg-primary-50/50 dark:hover:bg-surface-darkMuted transition-all"
                  >
                    {/* INDEX */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="w-4 h-4 rounded"
                        />

                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {(page - 1) * rowsPerPage + idx + 1}
                        </span>
                      </div>
                    </td>

                    {/* NAME */}

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {row.name}
                        </p>
                      </div>
                    </td>

                    {/* BALANCE */}

                    <td className="px-5 py-4">
                      <span className="font-semibold text-success-600">
                        ₹{row.balance}
                      </span>
                    </td>

                    {/* BRANCH */}

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {row.branch || "-"}
                    </td>

                    {/* ACCOUNT */}

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {row.account_number || "-"}
                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-semibold capitalize">
                        {row.account_type}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <Switch
                        checked={row.is_active}
                        isLoading={statusLoading[row.id]}
                        onChange={(checked) => toggleStatus(row.id, checked)}
                      />
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <EditButton path={`/bank/update?id=${row.id}`} />

                        <DeleteButton onClick={() => handleDelete(row.id)} />
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

      {/* DELETE */}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Bank"
        message="Are you sure you want to delete this bank?"
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
        title="Delete Selected Banks"
        message={`Are you sure you want to delete ${selected.size} selected bank(s)?`}
        onConfirm={confirmBulkDeleteNow}
        onCancel={() => setConfirmBulkDeleteOpen(false)}
      />

      {/* BULK STATUS */}

      <Modal
        open={bulkStatusModalOpen}
        title="Change Status"
        onClose={() => setBulkStatusModalOpen(false)}
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selected.size} selected
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setBulkStatusModalOpen(false)}
                disabled={bulkStatusLoading}
                className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-surface-light dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 font-medium transition-all"
              >
                Cancel
              </button>

              <button
                onClick={doBulkStatusChange}
                disabled={bulkStatusLoading}
                className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {bulkStatusLoading ? "Updating..." : "Save"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Select New Status
          </label>

          <select
            value={bulkStatusValue}
            onChange={(e) => setBulkStatusValue(e.target.value)}
            className="w-full h-12 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-darkMuted px-4 outline-none text-gray-800 dark:text-white"
          >
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}
