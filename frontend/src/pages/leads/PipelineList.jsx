import React, { useEffect, useRef, useState } from "react";

import { toast, ToastContainer } from "react-toastify";
import ReactMoment from "react-moment";
import { FaFilter, FaUsersCog } from "react-icons/fa";

import { toastCfg } from "../../data/toastCfg";
import AddButton from "../../components/tables/AddButton";
import Pagination from "../../components/tables/Pagination";
import ConfirmDialog, { Modal } from "../../components/tables/ConfirmDialog";
import Switch from "../../components/elements/Switch";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import Token from "../../database/Token";
import EditButton from "../../components/tables/EditButton";
import FilterButton from "../../components/tables/FilterButton";
import BulkAction from "../../components/tables/BulkAction";
import DeleteButton from "../../components/tables/DeleteButton";
import SeeInvoiceButton from "../../components/tables/SeeInvoiceButton";

const STATUS_LIST = ["true", "false"];

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
              Filter and search Pipelines
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <Input
            label="Search"
            value={value.search}
            onChange={(v) =>
              onChange({
                ...value,
                search: v,
              })
            }
            placeholder="Search name, email or username..."
          />

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
   MAIN
========================================= */

export default function PipelinesList() {
  const [Pipelines, setPipelines] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filter, setFilter] = useState({
    search: "",
    phone: "",
    status: "",
  });

  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState({ toggleBan: false });

  /* =========================================
     MODALS
  ========================================= */

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState("active");
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);
  const headerCheckboxRef = useRef(null);

  /* =========================================
     FETCH
  ========================================= */

  const fetchPipelines = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        per_page: rowsPerPage,
        search: filter.search || "",
        phone: filter.phone || "",
        status: filter.status || "",
      };

      const res = await Token.get("/pipelines", { params });

      const data = res.data.data || {};

      setPipelines(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.last_page || 1);
    } catch {
      toast.error("Failed to load Pipelines", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, [page, rowsPerPage]);

  /* =========================================
     FILTERS
  ========================================= */

  const doSearch = () => {
    setPage(1);

    fetchPipelines();

    setFiltersVisible(false);
  };

  const doClear = () => {
    setFilter({
      search: "",
      phone: "",
      status: "",
    });

    setPage(1);
    fetchPipelines();
  };

  /* =========================================
     SELECTION
  ========================================= */

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

      Pipelines.forEach((r) => {
        if (checked) next.add(r.id);
        else next.delete(r.id);
      });

      return next;
    });
  };

  const isAllSelected =
    Pipelines.length > 0 && Pipelines.every((r) => selected.has(r.id));

  const isPartiallySelected = selected.size > 0 && !isAllSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

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
      await Token.delete(`/pipelines/${confirmDelete.id}`);

      toast.success("Pipeline deleted", toastCfg);

      setConfirmDelete({
        open: false,
        id: null,
      });

      fetchPipelines();
    } catch {
      toast.error("Failed to delete Pipeline", toastCfg);
    }
  };

  /* =========================================
     BULK
  ========================================= */

  const handleBulkStatus = () => {
    if (selected.size === 0) {
      return toast.warn("No rows selected", toastCfg);
    }

    setBulkStatusModalOpen(true);
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) {
      return toast.warn("No rows selected", toastCfg);
    }

    setConfirmBulkDeleteOpen(true);
  };

  const doBulkStatusChange = async () => {
    if (bulkStatusLoading) return;

    setBulkStatusLoading(true);

    try {
      await Token.post("/pipelines/bulk-status", {
        ids: Array.from(selected),
        is_active: bulkStatusValue === true,
      });

      setBulkStatusModalOpen(false);

      setSelected(new Set());

      toast.success("Status updated", toastCfg);

      fetchPipelines();
    } catch {
      toast.error("Failed to update status", toastCfg);
    } finally {
      setBulkStatusLoading(false);
    }
  };

  const confirmBulkDeleteNow = async () => {
    try {
      await Token.post("/pipelines/bulk-delete", {
        ids: Array.from(selected),
      });

      setSelected(new Set());

      setConfirmBulkDeleteOpen(false);

      toast.success("Selected Pipelines deleted", toastCfg);

      fetchPipelines();
    } catch {
      toast.error("Failed to delete Pipelines", toastCfg);
    }
  };

  /* =========================================
     TOGGLE BAN
  ========================================= */

  const toggleBan = async (pipelineId) => {
    setIsLoading({
      ...isLoading,
      toggleBan: pipelineId,
    });

    try {
      await Token.patch(`/pipelines/${pipelineId}/toggle-active`);

      toast.success("User ban updated", toastCfg);

      fetchPipelines();
    } catch {
      toast.error("Failed to update ban", toastCfg);
    } finally {
      setIsLoading({
        ...isLoading,
        pipelineId: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* =========================================
         HEADER
      ========================================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* LEFT */}

        <div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[20px] bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
              <FaUsersCog size={20} />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-white">
                Pipelines
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage Pipelines and permissions
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
                title: "Change Status",
                onClick: handleBulkStatus,
              },
              {
                title: "Bulk Delete",
                onClick: handleBulkDelete,
              },
            ]}
          />

          <AddButton title="Add Pipeline" path="/pipeline/create" />
        </div>
      </div>

      {/* FILTER */}

      {filtersVisible && (
        <FilterCard
          value={filter}
          onChange={setFilter}
          onSearch={doSearch}
          onClear={doClear}
          onCancel={() => setFiltersVisible(false)}
        />
      )}

      {/* =========================================
         TABLE
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
              className="w-4 h-4 rounded border-gray-300 float-left"
            />

            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {selected.size} selected
            </span>
          </div>

          <div className="w-full lg:w-auto">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              rowsPerPage={rowsPerPage}
              onRowsChange={(n) => {
                setRowsPerPage(n);

                setPage(1);
              }}
            />
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto scroll-bar">
          <table className="min-w-full">
            {/* HEAD */}

            <thead>
              <tr className="bg-surface-light dark:bg-surface-darkMuted text-gray-600 dark:text-gray-300 text-sm">
                <th className="float-left py-4 px-5">
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
                <th className="px-5 py-4 text-left font-semibold">
                  Description
                </th>
                <th className="px-5 py-4 text-left font-semibold">
                  Total Leads
                </th>
                <th className="px-5 py-4 text-left font-semibold">
                  Created At
                </th>
                <th className="px-5 py-4 text-left font-semibold">Is Active</th>
                <th className="px-5 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : Pipelines.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    No Pipelines found.
                  </td>
                </tr>
              ) : (
                Pipelines.map((row, idx) => {
                  const index = (page - 1) * rowsPerPage + idx + 1;

                  return (
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

                      {/* INDEX */}

                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {index}
                      </td>

                      {/* USERNAME */}

                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {row.name}
                      </td>

                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300 max-w-[300px] w-min">
                        {row.description}
                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {row.total_lead_count}
                      </td>

                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        <ReactMoment format="dd MMM YYYY" to={row.created_at}>
                          {" "}
                          {row.created_at}
                        </ReactMoment>
                      </td>

                      {/* BAN */}

                      <td className="px-5 py-4">
                        <Switch
                          checked={!!row.is_active}
                          onChange={() => toggleBan(row.id)}
                          isLoading={isLoading.is_active === row.id}
                        />
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <SeeInvoiceButton
                            path={`/leads?pipeline_id=${row.id}`}
                          />
                          <EditButton path={`/pipeline/update?id=${row.id}`} />
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
                  );
                })
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
          total={total}
          onPageChange={(p) => setPage(Math.max(1, Math.min(totalPages, p)))}
          rowsPerPage={rowsPerPage}
          onRowsChange={(n) => {
            setRowsPerPage(n);

            setPage(1);
          }}
        />
      </div>

      {/* DELETE */}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Pipeline"
        message="Are you sure you want to delete this Pipeline?"
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
        title="Delete Selected Pipelines"
        message={`Are you sure you want to delete ${selected.size} selected Pipeline(s)?`}
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
                className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                onClick={doBulkStatusChange}
                disabled={bulkStatusLoading}
              >
                {bulkStatusLoading ? "Updating..." : "Save"}
              </button>
            </div>
          </div>
        }
      >
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
      </Modal>
    </div>
  );
}
