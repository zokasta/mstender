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

/* -------------------------
   ✅ Custom hook for table selection (supports indeterminate)
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
  const isPartiallySelected = selected.size > 0 && !isAllSelected;

  // ✅ Update indeterminate state
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

/* -------------------------
   Filter Card
-------------------------- */
function FilterCard({ value, onChange, onSearch, onClear, onCancel }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            Search (Bank Name)
          </label>
          <Input
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e })}
            placeholder="Search bank..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            Status
          </label>
          <Select
            value={value.status}
            onChange={(e) => onChange({ ...value, status: e })}
          >
            {SEARCH_STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2 border rounded">
          Cancel
        </button>
        <button onClick={onClear} className="px-3 py-2 border rounded">
          Clear
        </button>
        <button
          onClick={onSearch}
          className="px-3 py-2 bg-primary-500 text-white rounded"
        >
          Search
        </button>
      </div>
    </div>
  );
}

/* -------------------------
   ✅ Main BanksList Component
-------------------------- */
export default function BanksList() {
  const [banks, setBanks] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filter, setFilter] = useState({ search: "", status: "" });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
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

  /* -------------------------
     Fetch banks
  -------------------------- */
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
    } catch (err) {
      toast.error("Failed to load banks", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [page, rowsPerPage]);

  /* -------------------------
     Filters
  -------------------------- */
  const handleSearch = () => {
    setPage(1);
    fetchBanks();
    // setFiltersVisible(false);
  };

  const handleClearFilters = () => {
    setFilter({ search: "", status: "" });
    setPage(1);
    fetchBanks();
  };

  /* -------------------------
     Delete (single + bulk)
  -------------------------- */
  const handleDelete = (id) => setConfirmDelete({ open: true, id });

  const confirmDeleteNow = async () => {
    try {
      await Token.delete(`/banks/${confirmDelete.id}`);
      toast.success("Bank deleted", toastCfg);
      setConfirmDelete({ open: false, id: null });
      fetchBanks();
    } catch (err) {
      toast.error("Failed to delete bank", toastCfg);
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return toast.warn("No rows selected", toastCfg);
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
    } catch (err) {
      toast.error("Failed to delete banks", toastCfg);
    }
  };

  /* -------------------------
     Bulk status
  -------------------------- */
  const openBulkStatusModal = () => {
    if (selected.size === 0) return toast.warn("No rows selected", toastCfg);
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
      toast.success("Status updated for selected banks", toastCfg);
      fetchBanks();
    } catch (err) {
      toast.error("Failed to change status", toastCfg);
    } finally {
      setBulkStatusLoading(false);
    }
  };

  /* -------------------------
     Toggle single status (with loading)
  -------------------------- */
  const toggleStatus = async (id, checked) => {
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await Token.patch(`/banks/${id}/status`, { is_active: checked });
      toast.success("Bank status updated");
      fetchBanks();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banks & Cash</h1>
        <div className="flex items-center gap-3">
          <BulkAction
            list={[
              {
                title: "Bulk Delete",
                onClick: handleBulkDelete,
              },
              {
                title: "Change Status (bulk)",
                onClick: openBulkStatusModal,
              },
            ]}
          />
          <FilterButton onClick={() => setFiltersVisible((s) => !s)} />
          <AddButton title="Add Bank" path="/bank/create" />
        </div>
      </div>

      {filtersVisible && (
        <FilterCard
          value={filter}
          onChange={setFilter}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          onCancel={() => setFiltersVisible(false)}
        />
      )}

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
                  className="h-4 w-4 float-left"
                />
              </th>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Bank Name</th>
              <th className="px-4 py-3 text-left">Balance</th>
              <th className="px-4 py-3 text-left">Branch</th>
              <th className="px-4 py-3 text-left">Account No</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : banks.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No banks found.
                </td>
              </tr>
            ) : (
              banks.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {(page - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.balance}</td>
                  <td className="px-4 py-3">{row.branch || "-"}</td>
                  <td className="px-4 py-3">{row.account_number || "-"}</td>
                  <td className="px-4 py-3 capitalize">{row.account_type}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={row.is_active}
                      isLoading={statusLoading[row.id]}
                      onChange={(checked) => toggleStatus(row.id, checked)}
                    />
                  </td>
                  <td className="px-4 py-3">
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

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Bank"
        message="Are you sure you want to delete this bank?"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
      <ConfirmDialog
        open={confirmBulkDeleteOpen}
        title="Delete Selected Banks"
        message={`Are you sure you want to delete ${selected.size} selected bank(s)?`}
        onConfirm={confirmBulkDeleteNow}
        onCancel={() => setConfirmBulkDeleteOpen(false)}
      />
      <Modal
        open={bulkStatusModalOpen}
        title="Change status for selected"
        onClose={() => setBulkStatusModalOpen(false)}
        footer={
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selected.size} selected
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setBulkStatusModalOpen(false)}
                disabled={bulkStatusLoading}
              >
                Cancel
              </button>

              <button
                className="px-3 py-1 bg-primary-500 text-white rounded
                       disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={doBulkStatusChange}
                disabled={bulkStatusLoading}
              >
                {bulkStatusLoading ? "Updating..." : "Save"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium">Select new status</label>
          <select
            value={bulkStatusValue}
            onChange={(e) => setBulkStatusValue(e.target.value)}
            className="w-full border rounded px-3 py-2"
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
