// CustomersList.jsx
import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import EditButton from "../../components/tables/EditButton";
import Pagination from "../../components/tables/Pagination";
import ConfirmDialog, { Modal } from "../../components/tables/ConfirmDialog";
import { toastCfg } from "../../data/toastCfg";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import Token from "../../database/Token";
import ReactMoment from "react-moment";
import BulkAction from "../../components/tables/BulkAction";
import Permission from "../../utils/Permission";
import DeleteButton from "../../components/tables/DeleteButton";
import CallButton from "../../components/tables/CallButton";
import EmailButton from "../../components/tables/EmailButton";
import FilterButton from "../../components/tables/FilterButton";
import { FaBirthdayCake } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import ImagePreviewButton from "../../components/tables/ImagePreviewButton";
import WhatsappButton from "../../components/tables/WhatsappButton";
import AddButton from "../../components/tables/AddButton";

/* -------------------------
   Status options (customers)
-------------------------- */
const STATUS_LIST = ["pending", "confirmed", "cancelled", "rejected"];

/* -------------------------
   Custom hook for table selection
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
   Filter card
-------------------------- */
function FilterCard({ value, onChange, onSearch, onClear, onCancel }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Search (Name / Email / Phone)"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e })}
          placeholder="Search customer..."
        />
        <Select
          label="Status"
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
        <Input
          label="Joined (From)"
          value={value.start_date}
          type="date"
          onChange={(e) => onChange({ ...value, start_date: e })}
        />
        <Input
          label="Joined (To)"
          value={value.end_date}
          type="date"
          onChange={(e) => onChange({ ...value, end_date: e })}
        />
        <Input
          label="Hometown"
          value={value.hometown}
          onChange={(e) => onChange({ ...value, hometown: e })}
          placeholder="Hometown"
        />
        <Input
          label="Pickup Location"
          value={value.pickup}
          onChange={(e) => onChange({ ...value, pickup: e })}
          placeholder="Pickup"
        />
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
   Main CustomersList component
-------------------------- */
export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filter, setFilter] = useState({
    search: "",
    status: "",
    hometown: "",
    pickup: "",
    start_date: "",
    end_date: "",
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
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

  /* -------------------------
     Fetch customers
  -------------------------- */
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: rowsPerPage,
        search: filter.search || "",
        status: filter.status || "",
        hometown: filter.hometown || "",
        pickup: filter.pickup || "",
        start_date: filter.start_date || "",
        end_date: filter.end_date || "",
      };
      if (groupId) {
        params.group_id = groupId;
      }

      const res = await Token.get("/customers", { params });
      // expects { data: [...], total, last_page }
      setCustomers(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.last_page || 1);
    } catch (err) {
      toast.error("Failed to load customers", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  /* -------------------------
     Filters
  -------------------------- */
  const handleSearch = () => {
    setPage(1);
    fetchCustomers();
  };

  const isBirthdayToday = (dob) => {
    if (!dob) return false;

    const today = new Date();
    const birthDate = new Date(dob);

    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  };

  const handleClearFilters = () => {
    setFilter({
      search: "",
      status: "",
      hometown: "",
      pickup: "",
      start_date: "",
      end_date: "",
    });
    setPage(1);
    fetchCustomers();
  };

  /* -------------------------
     Delete (single + bulk)
  -------------------------- */
  const handleDelete = (id) => setConfirmDelete({ open: true, id });

  const confirmDeleteNow = async () => {
    try {
      await Token.delete(`/customers/${confirmDelete.id}`);
      toast.success("Customer deleted", toastCfg);
      setConfirmDelete({ open: false, id: null });
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to delete customer", toastCfg);
    }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return toast.warn("No rows selected", toastCfg);
    setConfirmBulkDeleteOpen(true);
  };

  const confirmBulkDeleteNow = async () => {
    try {
      await Token.post("/customers/bulk-delete", { ids: Array.from(selected) });
      setSelected(new Set());
      setConfirmBulkDeleteOpen(false);
      toast.success("Selected customers deleted", toastCfg);
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to delete customers", toastCfg);
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
    if (bulkStatusLoading) return;

    setBulkStatusLoading(true);
    try {
      await Token.post("/customers/bulk-status", {
        ids: Array.from(selected),
        status: bulkStatusValue,
      });
      setBulkStatusModalOpen(false);
      setSelected(new Set());
      toast.success("Status updated for selected customers", toastCfg);
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to change status", toastCfg);
    } finally {
      setBulkStatusLoading(false);
    }
  };

  const calculateAge = (dob) => {
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

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
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
          <Permission types={["superadmin", "sales"]}>
            <AddButton title="Add Customer" path="/customer/create" />
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

      {/* Top pagination & selection bar */}
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto scroll-bar">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3 float-left">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  checked={isAllSelected}
                  onChange={(e) => selectAllOnPage(e.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Gender</th>
              <th className="px-4 py-3 text-left">Hometown</th>
              <th className="px-4 py-3 text-left">Pickup</th>
              <th className="px-4 py-3 text-left">DOB</th>
              <th className="px-4 py-3 text-left">Age</th>
              <th className="px-4 py-3 text-left min-w-52">Address</th>
              <th className="px-4 py-3 text-left">Joined</th>
              {/* <th className="px-4 py-3 text-left">Status</th> */}
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((row, idx) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {(page - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isBirthdayToday(row.dob) && (
                        <FaBirthdayCake
                          className="text-pink-500 animate-bounce"
                          size={18}
                        />
                      )}
                      <span>{row.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.phone}</td>
                  <td className="px-4 py-3">{row.gender}</td>
                  <td className="px-4 py-3">{row.hometown}</td>
                  <td className="px-4 py-3">
                    {row.pickup?.location ?? row.pickup?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ReactMoment to={row.dob} format="DD MMM yyyy" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {calculateAge(row.dob)} years
                  </td>
                  <td className="px-4 py-3">{row.address}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ReactMoment format="DD MMM YYYY">
                      {row.created_at ?? row.updated_at ?? row.dob}
                    </ReactMoment>
                  </td>
                  {/* <td className="px-4 py-3">
                    <BadgeIcon status={row.status} />
                  </td> */}
                  <td className="px-4 py-3">
                    <div className="p-3 flex gap-2">
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
                        <DeleteButton
                          onClick={() =>
                            setConfirmDelete({ open: true, id: row.id })
                          }
                        />
                      </Permission>
                    </div>
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
        total={total}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsChange={(n) => {
          setRowsPerPage(n);
          setPage(1);
        }}
      />

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />

      <ConfirmDialog
        open={confirmBulkDeleteOpen}
        title="Delete Selected Customers"
        message={`Are you sure you want to delete ${selected.size} selected customer(s)?`}
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
