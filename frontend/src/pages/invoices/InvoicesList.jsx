import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";

import AddButton from "../../components/tables/AddButton";
import Pagination from "../../components/tables/Pagination";
import ConfirmDialog, { Modal } from "../../components/tables/ConfirmDialog";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import DeleteButton from "../../components/tables/DeleteButton";
import SeeInvoiceButton from "../../components/tables/SeeInvoiceButton";
import AddPaymentButton from "../../components/tables/AddPaymentButton";
import BadgeButton from "../../components/tables/BadgeButton";
import Token from "../../database/Token";
import FilterButton from "../../components/tables/FilterButton";
import BulkAction from "../../components/tables/BulkAction";
import Permission from "../../utils/Permission";
import BulkExportDropdown from "../../components/tables/ExportDropdown";

/* -------------------------
   Constants
-------------------------- */
// const STATUS_LIST = ["Pending", "Paid", "Overdue", "Cancelled"];
const STATUS_LIST = [
  "---- Select Status -----",
  "draft",
  "overdue",
  "cancelled",
  "uncollectible",
];

/* -------------------------
   ✅ Custom hook for table selection
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
   Filter Card
-------------------------- */
function FilterCard({ value, onChange, onSearch, onClear, onCancel }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            Search (Invoice / Customer)
          </label>
          <Input
            value={value.search}
            onChange={(v) => onChange({ ...value, search: v })}
            placeholder="Search invoice..."
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600">
            Status
          </label>
          <Select
            value={value.status}
            onChange={(v) => onChange({ ...value, status: v })}
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
   Invoice List
-------------------------- */
export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filter, setFilter] = useState({ search: "", status: "" });

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState("Pending");
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);

  const {
    selected,
    setSelected,
    toggleSelect,
    selectAllOnPage,
    isAllSelected,
    headerCheckboxRef,
  } = useTableSelection(invoices);
  /* -------------------------
     Fetch invoices
  -------------------------- */
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: rowsPerPage,
        search: filter.search,
        status: filter.status,
      };

      const res = await Token.get("/invoices", { params });

      setInvoices(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.last_page || 1);
    } catch {
      toast.error("Failed to load invoices", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, rowsPerPage]);

  /* -------------------------
     Actions
  -------------------------- */
  const handleDelete = (id) => setConfirmDelete({ open: true, id });

  const confirmDeleteNow = async () => {
    try {
      await Token.delete(`/invoices/${confirmDelete.id}`);
      toast.success("Invoice deleted", toastCfg);
      setConfirmDelete({ open: false, id: null });
      fetchInvoices();
    } catch {
      toast.error("Failed to delete invoice", toastCfg);
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return toast.warn("No rows selected", toastCfg);
    setConfirmBulkDeleteOpen(true);
  };

  const confirmBulkDeleteNow = async () => {
    try {
      await Token.post("/invoices/bulk-delete", {
        ids: Array.from(selected),
      });
      setSelected(new Set());
      setConfirmBulkDeleteOpen(false);
      toast.success("Selected invoices deleted", toastCfg);
      fetchInvoices();
    } catch {
      toast.error("Failed to delete invoices", toastCfg);
    }
  };

  const openBulkStatusModal = () => {
    if (selected.size === 0) return toast.warn("No rows selected", toastCfg);
    setBulkStatusModalOpen(true);
  };

  const doBulkStatusChange = async () => {
    if (bulkStatusLoading) return;

    setBulkStatusLoading(true);
    try {
      await Token.post("/invoices/bulk-status", {
        ids: Array.from(selected),
        status: bulkStatusValue,
      });
      setBulkStatusModalOpen(false);
      setSelected(new Set());
      toast.success("Status updated", toastCfg);
      fetchInvoices();
    } catch {
      toast.error("Failed to update status", toastCfg);
    } finally {
      setBulkStatusLoading(false);
    }
  };

  /* -------------------------
     Filter handlers
  -------------------------- */
  const handleSearch = () => {
    setPage(1);
    fetchInvoices();
    setFiltersVisible(false);
  };

  const handleClearFilters = () => {
    setFilter({ search: "", status: "" });
    setPage(1);
    fetchInvoices();
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex items-center gap-3">
          <BulkExportDropdown selected={selected} />

          <FilterButton onClick={() => setFiltersVisible((s) => !s)} />

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
          <Permission types={["superadmin", "sales"]}>
            <AddButton title="Add Invoice" path="/invoice/create" />
          </Permission>
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
              <th className="px-4 py-3 text-left">Invoice No</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Due Amount</th>
              <th className="px-4 py-3 text-left">Due Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((row, idx) => (
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
                  <td className="px-4 py-3">{row.invoice_no || row.id}</td>
                  <td className="px-4 py-3">{row.customer_name}</td>
                  <td className="px-4 py-3">₹{row.total}</td>
                  <td className="px-4 py-3">₹{row.due_amount}</td>
                  <td className="px-4 py-3">{row.due_date || "-"}</td>
                  <td className="px-4 py-3">
                    <BadgeButton status={row.status} />
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {/* <EditButton path={`/invoice/update?id=${row.id}`} /> */}

                    <Permission types={["superadmin", "sales"]}>
                      <SeeInvoiceButton path={`/invoice/view?id=${row.id}&remember_token=${row.remember_token}`}/>
                    </Permission>
                    <Permission types={["superadmin", "sales"]}>
                      <AddPaymentButton
                        path={`/transaction/create?invoice_id=${row.id}`}
                      />
                    </Permission>
                    <Permission types={["superadmin", "sales"]}>
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

      {/* Dialogs */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice?"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />

      <ConfirmDialog
        open={confirmBulkDeleteOpen}
        title="Delete Selected Invoices"
        message={`Are you sure you want to delete ${selected.size} invoice(s)?`}
        onConfirm={confirmBulkDeleteNow}
        onCancel={() => setConfirmBulkDeleteOpen(false)}
      />

      <Modal
        open={bulkStatusModalOpen}
        title="Change status for selected invoices"
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
                className="px-3 py-1 bg-orange-500 text-white rounded
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
