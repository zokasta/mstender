import React, { useEffect, useRef, useState } from "react";

import { toast, ToastContainer } from "react-toastify";

import ReactMoment from "react-moment";

import { FaBirthdayCake, FaFilter, FaUsers } from "react-icons/fa";

import EditButton from "../../components/tables/EditButton";
import Pagination from "../../components/tables/Pagination";

import ConfirmDialog, { Modal } from "../../components/tables/ConfirmDialog";

import { toastCfg } from "../../data/toastCfg";

import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";

import Token from "../../database/Token";

import BulkAction from "../../components/tables/BulkAction";

import Permission from "../../utils/Permission";

import DeleteButton from "../../components/tables/DeleteButton";

import CallButton from "../../components/tables/CallButton";

import EmailButton from "../../components/tables/EmailButton";

import FilterButton from "../../components/tables/FilterButton";

import { useSearchParams } from "react-router-dom";

import ImagePreviewButton from "../../components/tables/ImagePreviewButton";

import WhatsappButton from "../../components/tables/WhatsappButton";

import AddButton from "../../components/tables/AddButton";

/* =========================================
   STATUS
========================================= */

const STATUS_LIST = ["pending", "confirmed", "cancelled", "rejected"];

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
              Filter and search customers
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
            onChange={(e) =>
              onChange({
                ...value,
                search: e,
              })
            }
            placeholder="Search customer..."
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

          <Input
            label="Hometown"
            value={value.hometown}
            onChange={(e) =>
              onChange({
                ...value,
                hometown: e,
              })
            }
            placeholder="Hometown"
          />

          <Input
            type="date"
            label="Joined From"
            value={value.start_date}
            onChange={(e) =>
              onChange({
                ...value,
                start_date: e,
              })
            }
          />

          <Input
            type="date"
            label="Joined To"
            value={value.end_date}
            onChange={(e) =>
              onChange({
                ...value,
                end_date: e,
              })
            }
          />
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

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [filter, setFilter] = useState({
    search: "",
    status: "",
    hometown: "",
    start_date: "",
    end_date: "",
  });

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  const [confirmBulkDeleteOpen, setConfirmBulkDeleteOpen] = useState(false);

  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);

  const [bulkStatusValue, setBulkStatusValue] = useState("pending");

  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);

  const [params] = useSearchParams();

  const groupId = params.get("group_id");

  const {
    selected,
    setSelected,
    toggleSelect,
    selectAllOnPage,
    isAllSelected,
    headerCheckboxRef,
  } = useTableSelection(customers);

  /* =========================================
     FETCH
  ========================================= */

  const fetchCustomers = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        per_page: rowsPerPage,
        search: filter.search || "",
        status: filter.status || "",
        hometown: filter.hometown || "",
        start_date: filter.start_date || "",
        end_date: filter.end_date || "",
      };

      if (groupId) {
        params.group_id = groupId;
      }

      const res = await Token.get("/customers", { params });

      setCustomers(res.data.data || []);

      setTotal(res.data.total || 0);

      setTotalPages(res.data.last_page || 1);
    } catch {
      toast.error("Failed to load customers", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage]);

  /* =========================================
     FILTERS
  ========================================= */

  const handleSearch = () => {
    setPage(1);

    fetchCustomers();

    setFiltersVisible(false);
  };

  const handleClearFilters = () => {
    setFilter({
      search: "",
      status: "",
      hometown: "",
      start_date: "",
      end_date: "",
    });

    setPage(1);

    fetchCustomers();
  };

  /* =========================================
     HELPERS
  ========================================= */

  const isBirthdayToday = (dob) => {
    if (!dob) return false;

    const today = new Date();

    const birthDate = new Date(dob);

    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";

    const birthDate = new Date(dob);

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
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
      await Token.delete(`/customers/${confirmDelete.id}`);

      toast.success("Customer deleted", toastCfg);

      setConfirmDelete({
        open: false,
        id: null,
      });

      fetchCustomers();
    } catch {
      toast.error("Failed to delete customer", toastCfg);
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
      await Token.post("/customers/bulk-delete", {
        ids: Array.from(selected),
      });

      setSelected(new Set());

      setConfirmBulkDeleteOpen(false);

      toast.success("Selected customers deleted", toastCfg);

      fetchCustomers();
    } catch {
      toast.error("Failed to delete customers", toastCfg);
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
      await Token.post("/customers/bulk-status", {
        ids: Array.from(selected),
        status: bulkStatusValue,
      });

      setBulkStatusModalOpen(false);

      setSelected(new Set());

      toast.success("Status updated", toastCfg);

      fetchCustomers();
    } catch {
      toast.error("Failed to change status", toastCfg);
    } finally {
      setBulkStatusLoading(false);
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
              <FaUsers size={20} />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-white">
                Customers
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage and organize customer records
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

          <Permission types={["superadmin", "sales"]}>
            <AddButton title="Add Customer" path="/customer/create" />
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

                <th className="px-5 py-4 text-left font-semibold">Name</th>

                <th className="px-5 py-4 text-left font-semibold">Email</th>

                <th className="px-5 py-4 text-left font-semibold">Phone</th>

                <th className="px-5 py-4 text-left font-semibold">Gender</th>

                <th className="px-5 py-4 text-left font-semibold">Company</th>

                <th className="px-5 py-4 text-left font-semibold">GSTIN</th>

                <th className="px-5 py-4 text-left font-semibold">Hometown</th>

                <th className="px-5 py-4 text-left font-semibold">DOB</th>

                <th className="px-5 py-4 text-left font-semibold">Age</th>

                <th className="px-5 py-4 text-left font-semibold min-w-[250px]">
                  Address
                </th>

                <th className="px-5 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={13}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((row, idx) => (
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
                      {(page - 1) * rowsPerPage + idx + 1}
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

                    {/* EMAIL */}

                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {row.email}
                    </td>

                    {/* PHONE */}

                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {row.phone}
                    </td>

                    {/* GENDER */}

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400 capitalize">
                      {row.gender}
                    </td>

                    {/* COMPANY */}

                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {row.company_name || "-"}
                    </td>

                    {/* GSTIN */}

                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {row.gstin || "-"}
                    </td>

                    {/* HOMETOWN */}

                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {row.hometown}
                    </td>

                    {/* DOB */}

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      <ReactMoment format="DD MMM YYYY">{row.dob}</ReactMoment>
                    </td>

                    {/* AGE */}

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-semibold">
                        {calculateAge(row.dob)} years
                      </span>
                    </td>

                    {/* ADDRESS */}

                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {row.address}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="flex flex-row gap-2 ">
                        <ImagePreviewButton imageUrl={row.identity_image_url} />

                        <WhatsappButton phone={row.phone} />

                        <Permission types={["superadmin", "sales"]}>
                          <CallButton phone={row.phone} />
                        </Permission>

                        <Permission types={["superadmin", "sales"]}>
                          <EmailButton email={row.email} />
                        </Permission>

                        <Permission types={["superadmin", "sales"]}>
                          <EditButton path={`/customer/update?id=${row.id}`} />
                        </Permission>

                        <Permission types={["superadmin", "sales"]}>
                          <DeleteButton onClick={() => handleDelete(row.id)} />
                        </Permission>
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
          total={total}
          onPageChange={setPage}
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
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
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
        title="Delete Selected Customers"
        message={`Are you sure you want to delete ${selected.size} selected customer(s)?`}
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
