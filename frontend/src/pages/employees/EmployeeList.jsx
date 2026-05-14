import React, { useEffect, useRef, useState } from "react";

import { toast, ToastContainer } from "react-toastify";

import {
  FaBirthdayCake,
  FaFilter,
  FaUsersCog,
  FaUserSlash,
} from "react-icons/fa";

import { toastCfg } from "../../data/toastCfg";

import AddButton from "../../components/tables/AddButton";

import Pagination from "../../components/tables/Pagination";

import ConfirmDialog, { Modal } from "../../components/tables/ConfirmDialog";

import BadgeIcon from "../../components/tables/BadgeButton";

import Switch from "../../components/elements/Switch";

import Input from "../../components/elements/Input";

import Select from "../../components/elements/Select";

import Token from "../../database/Token";

import EditButton from "../../components/tables/EditButton";

import FilterButton from "../../components/tables/FilterButton";

import BulkAction from "../../components/tables/BulkAction";

const STATUS_LIST = ["active", "inactive", "suspended"];

const BAN_LIST = ["true", "false"];

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
              Filter and search employees
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

          <Input
            label="Phone"
            value={value.phone}
            onChange={(v) =>
              onChange({
                ...value,
                phone: v,
              })
            }
            placeholder="Phone number..."
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

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);

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

  const [isLoading, setIsLoading] = useState({
    toggleBan: false,
  });

  /* =========================================
     MODALS
  ========================================= */

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);

  const [bulkBanModalOpen, setBulkBanModalOpen] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

  const [loadingDetails, setLoadingDetails] = useState(false);

  const [employeeDetails, setEmployeeDetails] = useState(null);

  const [bulkStatusValue, setBulkStatusValue] = useState("active");

  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);

  const [bulkBanValue, setBulkBanValue] = useState("false");

  const [bulkBanLoading, setBulkBanLoading] = useState(false);

  const headerCheckboxRef = useRef(null);

  /* =========================================
     FETCH
  ========================================= */

  const fetchEmployees = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        per_page: rowsPerPage,
        search: filter.search || "",
        phone: filter.phone || "",
        status: filter.status || "",
      };

      const res = await Token.get("/employees", { params });

      const data = res.data || {};

      setEmployees(data.data || []);

      setTotal(data.total || 0);

      setTotalPages(data.last_page || 1);
    } catch {
      toast.error("Failed to load employees", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage]);

  /* =========================================
     FILTERS
  ========================================= */

  const doSearch = () => {
    setPage(1);

    fetchEmployees();

    setFiltersVisible(false);
  };

  const doClear = () => {
    setFilter({
      search: "",
      phone: "",
      status: "",
    });

    setPage(1);

    fetchEmployees();
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

      employees.forEach((r) => {
        if (checked) next.add(r.id);
        else next.delete(r.id);
      });

      return next;
    });
  };

  const isAllSelected =
    employees.length > 0 && employees.every((r) => selected.has(r.id));

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
      await Token.delete(`/employees/${confirmDelete.id}`);

      toast.success("Employee deleted", toastCfg);

      setConfirmDelete({
        open: false,
        id: null,
      });

      fetchEmployees();
    } catch {
      toast.error("Failed to delete employee", toastCfg);
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

  const handleBulkBan = () => {
    if (selected.size === 0) {
      return toast.warn("No rows selected", toastCfg);
    }

    setBulkBanModalOpen(true);
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
      await Token.post("/employees/bulk-status", {
        ids: Array.from(selected),
        status: bulkStatusValue,
      });

      setBulkStatusModalOpen(false);

      setSelected(new Set());

      toast.success("Status updated", toastCfg);

      fetchEmployees();
    } catch {
      toast.error("Failed to update status", toastCfg);
    } finally {
      setBulkStatusLoading(false);
    }
  };

  const doBulkBanChange = async () => {
    if (bulkBanLoading) return;

    setBulkBanLoading(true);

    try {
      await Token.post("/employees/bulk-ban", {
        ids: Array.from(selected),
        is_banned: bulkBanValue === "true",
      });

      setBulkBanModalOpen(false);

      setSelected(new Set());

      toast.success("Ban status updated", toastCfg);

      fetchEmployees();
    } catch {
      toast.error("Failed to update ban status", toastCfg);
    } finally {
      setBulkBanLoading(false);
    }
  };

  const confirmBulkDeleteNow = async () => {
    try {
      await Token.post("/employees/bulk-delete", {
        ids: Array.from(selected),
      });

      setSelected(new Set());

      setConfirmBulkDeleteOpen(false);

      toast.success("Selected employees deleted", toastCfg);

      fetchEmployees();
    } catch {
      toast.error("Failed to delete employees", toastCfg);
    }
  };

  /* =========================================
     TOGGLE BAN
  ========================================= */

  const toggleBan = async (userId) => {
    setIsLoading({
      ...isLoading,
      toggleBan: userId,
    });

    try {
      await Token.patch(`/employees/${userId}/toggle-ban`);

      toast.success("User ban updated", toastCfg);

      fetchEmployees();
    } catch {
      toast.error("Failed to update ban", toastCfg);
    } finally {
      setIsLoading({
        ...isLoading,
        toggleBan: false,
      });
    }
  };

  /* =========================================
     DETAILS
  ========================================= */

  const openDetails = async (id) => {
    setShowDetails(true);

    setLoadingDetails(true);

    try {
      const res = await Token.get(`/users/${id}`);

      setEmployeeDetails(res.data || null);
    } catch {
      toast.error("Failed to load details", toastCfg);
    } finally {
      setLoadingDetails(false);
    }
  };

  /* =========================================
     HELPERS
  ========================================= */

  const isBirthdayToday = (dob) => {
    if (!dob) return false;

    const d = new Date(dob);

    if (Number.isNaN(d.getTime())) return false;

    const today = new Date();

    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  };

  const formatGender = (g) => {
    if (!g) return "-";

    return String(g).charAt(0).toUpperCase() + String(g).slice(1);
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
                Employees
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage employees and permissions
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
                title: "Change Ban",
                onClick: handleBulkBan,
              },
              {
                title: "Bulk Delete",
                onClick: handleBulkDelete,
              },
            ]}
          />

          <AddButton title="Add Employee" path="/employees/create" />
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

                <th className="px-5 py-4 text-left font-semibold">Employee</th>

                <th className="px-5 py-4 text-left font-semibold">Username</th>

                <th className="px-5 py-4 text-left font-semibold">Email</th>

                <th className="px-5 py-4 text-left font-semibold">Phone</th>

                <th className="px-5 py-4 text-left font-semibold">Gender</th>

                <th className="px-5 py-4 text-left font-semibold">DOB</th>

                <th className="px-5 py-4 text-left font-semibold">Status</th>

                <th className="px-5 py-4 text-left font-semibold">Banned</th>

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
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((row, idx) => {
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

                      {/* NAME */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {isBirthdayToday(row.dob) && (
                            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/20 text-pink-500 flex items-center justify-center animate-bounce">
                              <FaBirthdayCake size={14} />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {row.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* USERNAME */}

                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {row.username || "-"}
                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {row.email}
                      </td>

                      {/* PHONE */}

                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {row.phone || "-"}
                      </td>

                      {/* GENDER */}

                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                        {formatGender(row.gender)}
                      </td>

                      {/* DOB */}

                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {row.dob ? new Date(row.dob).toLocaleDateString() : "-"}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <BadgeIcon status={row.status} />
                      </td>

                      {/* BAN */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={!!row.is_banned}
                            onChange={() => toggleBan(row.id)}
                            isLoading={isLoading.toggleBan === row.id}
                          />

                          {row.is_banned && (
                            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                              <FaUserSlash size={12} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetails(row.id)}
                            className="h-10 px-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
                          >
                            View
                          </button>

                          <EditButton path={`/employee/update?id=${row.id}`} />
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
        title="Delete Employee"
        message="Are you sure you want to delete this employee?"
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
        title="Delete Selected Employees"
        message={`Are you sure you want to delete ${selected.size} selected employee(s)?`}
        onConfirm={confirmBulkDeleteNow}
        onCancel={() => setConfirmBulkDeleteOpen(false)}
      />

      {/* DETAILS */}

      <Modal
        open={showDetails}
        title="Employee Details"
        onClose={() => setShowDetails(false)}
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setShowDetails(false)}
              className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all"
            >
              Close
            </button>
          </div>
        }
      >
        {loadingDetails ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            Loading details...
          </div>
        ) : (
          employeeDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-darkMuted">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                  Name
                </p>

                <p className="text-base font-semibold text-gray-800 dark:text-white">
                  {employeeDetails.name}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-darkMuted">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                  Username
                </p>

                <p className="text-base font-semibold text-gray-800 dark:text-white">
                  {employeeDetails.username}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-darkMuted">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                  Email
                </p>

                <p className="text-base font-semibold text-gray-800 dark:text-white">
                  {employeeDetails.email}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-darkMuted">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                  Phone
                </p>

                <p className="text-base font-semibold text-gray-800 dark:text-white">
                  {employeeDetails.phone}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-darkMuted">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                  Gender
                </p>

                <p className="text-base font-semibold text-gray-800 dark:text-white">
                  {formatGender(employeeDetails.gender)}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-light dark:bg-surface-darkMuted">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                  Status
                </p>

                <div className="mt-1">
                  <BadgeIcon status={employeeDetails.status} />
                </div>
              </div>
            </div>
          )
        )}
      </Modal>

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

      {/* BULK BAN */}

      <Modal
        open={bulkBanModalOpen}
        title="Change Ban Status"
        onClose={() => setBulkBanModalOpen(false)}
        footer={
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selected.size} selected
            </div>

            <div className="flex items-center gap-3">
              <button
                className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-surface-light dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 font-medium transition-all"
                onClick={() => setBulkBanModalOpen(false)}
                disabled={bulkBanLoading}
              >
                Cancel
              </button>

              <button
                className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                onClick={doBulkBanChange}
                disabled={bulkBanLoading}
              >
                {bulkBanLoading ? "Updating..." : "Save"}
              </button>
            </div>
          </div>
        }
      >
        <Select
          label="Select Ban Status"
          value={bulkBanValue}
          onChange={(e) => setBulkBanValue(e)}
        >
          {BAN_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}
