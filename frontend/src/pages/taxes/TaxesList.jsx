import React, { useEffect, useMemo, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaFilter } from "react-icons/fa";
import { toastCfg } from "../../data/toastCfg";

import AddButton from "../../components/tables/AddButton";
import EditButton from "../../components/tables/EditButton";
import Pagination from "../../components/tables/Pagination";
import ConfirmDialog, { Modal } from "../../components/tables/ConfirmDialog";
import Switch from "../../components/elements/Switch";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import Token from "../../database/Token"; // Axios instance or similar
import BulkAction from "../../components/tables/BulkAction";
import Permission from "../../utils/Permission";
import DeleteButton from "../../components/tables/DeleteButton";
import FilterButton from "../../components/tables/FilterButton";

/* -------------------------
   Status List
-------------------------- */
const STATUS_LIST = ["Active", "Inactive"];

/* -------------------------
   Filter Card
-------------------------- */
function FilterCard({ value, onChange, onSearch, onClear, onCancel }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            Search (name)
          </label>
          <Input
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e })}
            placeholder="Search tax..."
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
            <option value="">All</option>
            {STATUS_LIST.map((s) => (
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
   Table Selection Hook
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
   Main TaxesList
-------------------------- */
export default function TaxesList() {
  const [taxes, setTaxes] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filter, setFilter] = useState({ search: "", status: "" });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState("Active");
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);

  /* -------------------------
     Fetch Taxes from API
  -------------------------- */
  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: rowsPerPage,
        search: filter.search || "",
        status: filter.status || "",
      };
      const res = await Token.get("/taxes", { params });
      setTaxes(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.last_page);
    } catch (err) {
      toast.error("Failed to load taxes", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, [page, rowsPerPage]);

  /* -------------------------
     Table Selection Hook
  -------------------------- */
  const {
    selected,
    setSelected,
    toggleSelect,
    selectAllOnPage,
    isAllSelected,
    headerCheckboxRef,
  } = useTableSelection(taxes);

  /* -------------------------
     Filters
  -------------------------- */
  const handleSearch = () => {
    setPage(1);
    fetchTaxes();
  };

  const handleClearFilters = () => {
    setFilter({ search: "", status: "" });
    setPage(1);
    fetchTaxes();
  };

  /* -------------------------
     Delete Tax
  -------------------------- */
  const handleDelete = (id) => setConfirmDelete({ open: true, id });
  const confirmDeleteNow = async () => {
    try {
      await Token.delete(`/taxes/${confirmDelete.id}`);
      toast.success("Tax deleted", toastCfg);
      setConfirmDelete({ open: false, id: null });
      fetchTaxes();
    } catch (err) {
      toast.error("Failed to delete tax", toastCfg);
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return toast.warn("No rows selected", toastCfg);
    setConfirmBulkDeleteOpen(true);
  };
  const confirmBulkDeleteNow = async () => {
    try {
      await Token.post("/taxes/bulk-delete", {
        ids: Array.from(selected),
      });
      setSelected(new Set());
      setConfirmBulkDeleteOpen(false);
      toast.success("Selected taxes deleted", toastCfg);
      fetchTaxes();
    } catch (err) {
      toast.error("Failed to delete taxes", toastCfg);
    }
  };

  /* -------------------------
     Bulk Status Change
  -------------------------- */
  const openBulkStatusModal = () => {
    if (selected.size === 0) return toast.warn("No rows selected", toastCfg);
    setBulkStatusModalOpen(true);
  };
  const doBulkStatusChange = async () => {
    if (bulkStatusLoading) return;

    setBulkStatusLoading(true);
    try {
      await Token.post("/taxes/bulk-status", {
        ids: Array.from(selected),
        status: bulkStatusValue,
      });
      setBulkStatusModalOpen(false);
      setSelected(new Set());
      toast.success("Bulk status updated", toastCfg);
      fetchTaxes();
    } catch (err) {
      toast.error("Failed to change status", toastCfg);
    } finally {
      setBulkStatusLoading(false);
    }
  };

  /* -------------------------
     Toggle Single Status
  -------------------------- */
  const toggleStatus = async (id, checked) => {
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await Token.patch(`/taxes/${id}/status`, { is_active: checked });
      toast.success("Tax status updated", toastCfg);
      fetchTaxes();
    } catch (err) {
      toast.error("Failed to update status", toastCfg);
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  /* -------------------------
     Pagination Calculation
  -------------------------- */
  const pageData = useMemo(() => taxes, [taxes]);

  /* -------------------------
     Render
  -------------------------- */
  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Taxes</h1>
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
          <Permission types={["superadmin"]}>
            <AddButton title="Add Tax" path="/tax/create" />
          </Permission>
        </div>
      </div>

      {/* Filter Card */}
      {filtersVisible && (
        <FilterCard
          value={filter}
          onChange={setFilter}
          onSearch={handleSearch}
          onClear={handleClearFilters}
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
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Rate</th>
              <th className="px-4 py-3 text-left">Description</th>
              <Permission types={["superadmin"]}>
                <th className="px-4 py-3 text-left">Status</th>
              </Permission>
              <Permission types={["superadmin"]}>
                <th className="px-4 py-3 text-left">Action</th>
              </Permission>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No taxes found.
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {(page - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.rate}</td>
                  <td className="px-4 py-3">{row.description}</td>
                  <Permission types={["superadmin"]}>
                    <td className="px-4 py-3">
                      <Switch
                        checked={row.is_active}
                        isLoading={statusLoading[row.id]}
                        onChange={(checked) => toggleStatus(row.id, checked)}
                      />
                    </td>
                  </Permission>
                  <td className="px-4 py-3 flex gap-2">
                    <Permission types={["superadmin"]}>
                      <EditButton path={`/tax/update?id=${row.id}`} />
                    </Permission>
                    <Permission types={["superadmin"]}>
                      <DeleteButton onClick={() => handleDelete(row.id)} />
                    </Permission>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination */}
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

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Tax"
        message="Are you sure you want to delete this tax?"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
      <ConfirmDialog
        open={confirmBulkDeleteOpen}
        title="Delete Selected Taxes"
        message={`Are you sure you want to delete ${selected.size} selected tax(es)?`}
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
