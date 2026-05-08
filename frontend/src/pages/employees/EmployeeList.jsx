import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  FaTrash,
  FaFilter,
  FaChevronDown,
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaInfoCircle,
  FaBirthdayCake,
} from "react-icons/fa";

import { toastCfg } from "../../data/toastCfg";
import AddButton from "../../components/tables/AddButton";
import Dropdown from "../../components/tables/Dropdown";
import Pagination from "../../components/tables/Pagination";
import IconButton from "../../components/tables/IconButton";
import ConfirmDialog, { Modal } from "../../components/tables/ConfirmDialog";
import BadgeIcon from "../../components/tables/BadgeButton";
import Switch from "../../components/elements/Switch";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import Token from "../../database/Token";
import CallButton from "../../components/tables/CallButton";
import List from "@mui/material/List";
import EditButton from "../../components/tables/EditButton";
import EmailButton from "../../components/tables/EmailButton";
import DeleteButton from "../../components/tables/DeleteButton";
import FilterButton from "../../components/tables/FilterButton";
import BulkAction from "../../components/tables/BulkAction";
import Permission from "../../utils/Permission";

const STATUS_LIST = ["Active", "Inactive", "On Leave", "Terminated"];

function FilterCard({ value, onChange, onSearch, onClear, onCancel }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border overflow-x-auto max-w-[calc(100dvw-256px)]">
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Search (name / email / username)"
          value={value.search}
          onChange={(v) => onChange({ ...value, search: v })}
          placeholder="Search..."
        />

        <Input
          label="Phone"
          value={value.phone}
          onChange={(v) => onChange({ ...value, phone: v })}
          placeholder="Phone contains..."
        />

        <Select
          label="Status"
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

      <div className="mt-4 flex items-center justify-end gap-2">
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

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filter, setFilter] = useState({ search: "", phone: "", status: "" });

  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading,setIsLoading] = useState({toggleBan:false})

  // modals
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState(null);

  // header checkbox ref for indeterminate
  const headerCheckboxRef = useRef(null);

  /* -------------------------
     API: fetch employees
  ------------------------- */
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

      // expect res.data.data, res.data.total, res.data.last_page
      const data = res.data || {};
      setEmployees(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.last_page || 1);

      // clear selection of rows not present
      setSelected((prev) => {
        const next = new Set(prev);
        const idsOnPage = new Set((data.data || []).map((r) => r.id));
        // remove any selected ids that are not on current page or still present in dataset
        for (const id of Array.from(next)) {
          // keep selection even if not on current page — comment out the following if you prefer clear
          if (
            !idsOnPage.has(id) &&
            !(data.data || []).some((d) => d.id === id)
          ) {
            next.delete(id);
          }
        }
        return next;
      });
    } catch (err) {
      toast.error("Failed to load employees", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage]);

  /* -------------------------
     Filter/search handlers
  ------------------------- */
  const doSearch = () => {
    setPage(1);
    fetchEmployees();
    setFiltersVisible(false);
  };
  const doClear = () => {
    setFilter({ search: "", phone: "", status: "" });
    setPage(1);
    fetchEmployees();
  };

  /* -------------------------
     Selection helpers
  ------------------------- */
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

  /* -------------------------
     Delete handlers
  ------------------------- */
  const handleDelete = (id) => setConfirmDelete({ open: true, id });

  const confirmDeleteNow = async () => {
    try {
      await Token.delete(`/employees/${confirmDelete.id}`);
      toast.success("Employee deleted", toastCfg);
      setConfirmDelete({ open: false, id: null });
      // refetch page
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to delete employee", toastCfg);
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return toast.warn("No rows selected", toastCfg);
    setConfirmBulkDeleteOpen(true);
  };

  const confirmBulkDeleteNow = async () => {
    try {
      await Token.post("/employees/bulk-delete", { ids: Array.from(selected) });
      setSelected(new Set());
      setConfirmBulkDeleteOpen(false);
      toast.success("Selected employees deleted", toastCfg);
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to delete employees", toastCfg);
    }
  };

  /* -------------------------
     Toggle ban (switch)
  ------------------------- */
  const toggleBan = async (userId) => {
    setIsLoading({...isLoading,toggleBan:userId})
    try {
      await Token.patch(`/employees/${userId}/toggle-ban`);
      toast.success("User ban toggled", toastCfg);
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to toggle ban", toastCfg);
    }finally{
      setIsLoading({...isLoading,toggleBan:false})

    }
  };

  /* -------------------------
     Details modal
  ------------------------- */
  const openDetails = async (id) => {
    setShowDetails(true);
    setLoadingDetails(true);
    try {
      const res = await Token.get(`/users/${id}`);
      setEmployeeDetails(res.data || null);
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msgs) =>
          toast.error(msgs[0], toastCfg)
        );
      } else {
        toast.error("Failed to create bank", toastCfg);
      }
      toast.error("Failed to load details", toastCfg);
    } finally {
      setLoadingDetails(false);
    }
  };

  /* -------------------------
     Helpers
  ------------------------- */
  const isBirthdayToday = (dob) => {
    if (!dob) return false;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  };

  const formatGender = (g) => {
    if (!g) return "";
    return String(g).charAt(0).toUpperCase() + String(g).slice(1);
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <div className="flex items-center gap-3">
          <FilterButton onClick={() => setFiltersVisible((s) => !s)} />
          <BulkAction
            list={[
              {
                title: "Bulk Delete",
                onClick: handleBulkDelete,
                api: "/api/employees/bulk-delete",
                method: "post",
              },
              // {
              //   title: "Change Status (bulk)",
              //   onClick: openBulkStatusModal,
              //   api: "/api/employees/bulk-status",
              //   method: "post",
              // },
            ]}
          />
          <Permission api="/api/employees" method="post">
            <AddButton title="Add Employee" path="/employees/create" />
          </Permission>
        </div>
      </div>

      {filtersVisible && (
        <FilterCard
          value={filter}
          onChange={setFilter}
          onSearch={doSearch}
          onClear={doClear}
          onCancel={() => setFiltersVisible(false)}
        />
      )}

      {/* Top bar */}
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
                  className="h-4 w-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Gender</th>
              <th className="px-4 py-3 text-left">DOB</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Banned</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((row, idx) => {
                const index = (page - 1) * rowsPerPage + idx + 1;
                const checked = selected.has(row.id);
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(row.id)}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">{index}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span>{row.name}</span>
                      {isBirthdayToday(row.dob) && (
                        <span
                          title="Birthday today!"
                          className="text-orange-500"
                        >
                          <FaBirthdayCake />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.username || "-"}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.phone || "-"}</td>
                    <td className="px-4 py-3">{formatGender(row.gender)}</td>
                    <td className="px-4 py-3">
                      {row.dob ? new Date(row.dob).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeIcon status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={!!row.is_banned}
                        onChange={() => toggleBan(row.id)}
                        isLoading={isLoading.toggleBan === row.id}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* <IconButton title="Edit">
                          <FaEdit className="text-blue-600" />
                        </IconButton> */}

                        {/* <IconButton title="Call">
                          <FaPhone className="text-green-600" />
                        </IconButton> */}
                        {/* <CallButton phone={row.phone} /> */}
                        {/* <IconButton title="Email">
                          <FaEnvelope className="text-yellow-600" />
                        </IconButton> */}
                        {/* <EmailButton email={row.email} /> */}
                        {/* <IconButton title="Details" onClick={() => openDetails(row.id)}>
                          <FaInfoCircle className="text-gray-700" />
                        </IconButton> */}
                        <Permission api="/api/employees/{id}" method="put">
                          <EditButton path={`/employee/update?id=${row.id}`} />
                        </Permission>
                        <Permission api="/api/employees/{id}" method="delete">
                          <DeleteButton onClick={() => handleDelete(row.id)} />
                        </Permission>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom pagination */}
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

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Employee"
        message="Are you sure you want to delete this employee?"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />

      <ConfirmDialog
        open={confirmBulkDeleteOpen}
        title="Delete Selected Employees"
        message={`Are you sure you want to delete ${selected.size} selected employee(s)?`}
        onConfirm={confirmBulkDeleteNow}
        onCancel={() => setConfirmBulkDeleteOpen(false)}
      />

      {/* Details modal */}
      <Modal
        open={showDetails}
        title="Employee Details"
        onClose={() => setShowDetails(false)}
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              Close
            </button>
          </div>
        }
      >
        {loadingDetails ? (
          <p className="text-gray-500">Loading details...</p>
        ) : (
          employeeDetails && (
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Name:</strong> {employeeDetails.name}
              </p>
              <p>
                <strong>Username:</strong> {employeeDetails.username}
              </p>
              <p>
                <strong>Email:</strong> {employeeDetails.email}
              </p>
              <p>
                <strong>Phone:</strong> {employeeDetails.phone}
              </p>
              <p>
                <strong>Gender:</strong> {formatGender(employeeDetails.gender)}
              </p>
              <p>
                <strong>DOB:</strong> {employeeDetails.dob}
              </p>
              <p>
                <strong>Status:</strong> {employeeDetails.status}
              </p>
              <p>
                <strong>Banned:</strong> {employeeDetails.isBan ? "Yes" : "No"}
              </p>
              {/* Add more fields as returned by API */}
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
