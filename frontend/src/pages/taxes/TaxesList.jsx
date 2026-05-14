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

import Token from "../../database/Token";

import BulkAction from "../../components/tables/BulkAction";
import Permission from "../../utils/Permission";
import DeleteButton from "../../components/tables/DeleteButton";
import FilterButton from "../../components/tables/FilterButton";

/* =========================================
   STATUS LIST
========================================= */

const STATUS_LIST = ["Active", "Inactive"];

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
              Filter and search tax records
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Search Tax"
            value={value.search}
            onChange={(e) =>
              onChange({
                ...value,
                search: e,
              })
            }
            placeholder="Search tax..."
          />

          <Select
            label="Status"
            value={value.status}
            onChange={(e) =>
              onChange({
                ...value,
                status: e,
              })
            }
          >
            <option value="">All</option>

            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
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
   MAIN
========================================= */

export default function TaxesList() {
  const [taxes, setTaxes] = useState([]);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [filter, setFilter] = useState({
    search: "",
    status: "",
  });

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const [statusLoading, setStatusLoading] = useState({});

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);

  const [bulkStatusValue, setBulkStatusValue] = useState("Active");

  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);

  /* =========================================
     FETCH
  ========================================= */

  const fetchTaxes = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        per_page: rowsPerPage,
        search: filter.search || "",
        status: filter.status || "",
      };

      const res = await Token.get("/taxes", {
        params,
      });

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

  /* =========================================
     TABLE SELECTION
  ========================================= */

  const {
    selected,
    setSelected,
    toggleSelect,
    selectAllOnPage,
    isAllSelected,
    headerCheckboxRef,
  } = useTableSelection(taxes);

  /* =========================================
     FILTERS
  ========================================= */

  const handleSearch = () => {
    setPage(1);

    fetchTaxes();
  };

  const handleClearFilters = () => {
    setFilter({
      search: "",
      status: "",
    });

    setPage(1);

    fetchTaxes();
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
      await Token.delete(`/taxes/${confirmDelete.id}`);

      toast.success("Tax deleted", toastCfg);

      setConfirmDelete({
        open: false,
        id: null,
      });

      fetchTaxes();
    } catch (err) {
      toast.error("Failed to delete tax", toastCfg);
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

  /* =========================================
     SINGLE STATUS
  ========================================= */

  const toggleStatus = async (id, checked) => {
    setStatusLoading((prev) => ({
      ...prev,
      [id]: true,
    }));

    try {
      await Token.patch(`/taxes/${id}/status`, {
        is_active: checked,
      });

      toast.success("Tax status updated", toastCfg);

      fetchTaxes();
    } catch (err) {
      toast.error("Failed to update status", toastCfg);
    } finally {
      setStatusLoading((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  /* =========================================
     PAGINATION
  ========================================= */

  const pageData = useMemo(() => taxes, [taxes]);

  /* =========================================
     RENDER
  ========================================= */

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
            <div className="w-14 h-14 rounded-[20px] bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center text-xl font-black">
              %
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-white">
                Taxes
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all taxes and percentages
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

          <Permission types={["superadmin"]}>
            <AddButton title="Add Tax" path="/tax/create" />
          </Permission>
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

      {/* TABLE */}

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

                <th className="px-5 py-4 text-left font-semibold">Name</th>

                <th className="px-5 py-4 text-left font-semibold">Rate</th>

                <th className="px-5 py-4 text-left font-semibold">
                  Description
                </th>

                <Permission types={["superadmin"]}>
                  <th className="px-5 py-4 text-left font-semibold">Status</th>
                </Permission>

                <Permission types={["superadmin"]}>
                  <th className="px-5 py-4 text-left font-semibold">Action</th>
                </Permission>
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {/* LOADING */}

              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    No taxes found.
                  </td>
                </tr>
              ) : (
                pageData.map((row, idx) => (
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
                        className="h-4 w-4 cursor-pointer"
                      />
                    </td>

                    {/* ID */}

                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {(page - 1) * rowsPerPage + idx + 1}
                    </td>

                    {/* NAME */}

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800 dark:text-white">
                        {row.name}
                      </div>
                    </td>

                    {/* RATE */}

                    <td className="px-5 py-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-semibold">
                        {row.rate}%
                      </div>
                    </td>

                    {/* DESCRIPTION */}

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {row.description}
                    </td>

                    {/* STATUS */}

                    <Permission types={["superadmin"]}>
                      <td className="px-5 py-4">
                        <Switch
                          checked={row.is_active}
                          isLoading={statusLoading[row.id]}
                          onChange={(checked) => toggleStatus(row.id, checked)}
                        />
                      </td>
                    </Permission>

                    {/* ACTION */}

                    <Permission types={["superadmin"]}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <EditButton path={`/tax/update?id=${row.id}`} />

                          <DeleteButton onClick={() => handleDelete(row.id)} />
                        </div>
                      </td>
                    </Permission>
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
        title="Delete Tax"
        message="Are you sure you want to delete this tax?"
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
        title="Delete Selected Taxes"
        message={`Are you sure you want to delete ${selected.size} selected tax(es)?`}
        onConfirm={confirmBulkDeleteNow}
        onCancel={() => setConfirmBulkDeleteOpen(false)}
      />

      {/* BULK STATUS */}

      <Modal
        open={bulkStatusModalOpen}
        title="Change Status"
        onClose={() => setBulkStatusModalOpen(false)}
        footer={
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selected.size} selected
            </div>

            <div className="flex items-center gap-3">
              <button
                className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-surface-light dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 font-medium transition-all"
                onClick={() => setBulkStatusModalOpen(false)}
                disabled={bulkStatusLoading}
              >
                Cancel
              </button>

              <button
                className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={doBulkStatusChange}
                disabled={bulkStatusLoading}
              >
                {bulkStatusLoading ? "Updating..." : "Save"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Status"
            value={bulkStatusValue}
            onChange={(e) => setBulkStatusValue(e)}
          >
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
