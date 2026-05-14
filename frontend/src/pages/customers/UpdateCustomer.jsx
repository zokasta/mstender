import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Select from "../../components/elements/Select";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import Token from "../../database/Token";
import SelectSearch from "../../components/elements/SelectSearch";

const GENDER_LIST = ["-- Select Gender --", "male", "female"];

export default function UpdateCustomer() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "male",
    address: "",
    hometown: "",
    status: "pending",
    remark: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* -------------------------
     Fetch customer details
  -------------------------- */
  const fetchCustomerDetails = async (customerId) => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await Token.get(`/customers/${customerId}`);

      const data = res.data.data;

      setForm({
        ...data,
        dob: data.dob ? data.dob.split("T")[0] : "",
      });
      console.log(data);
    } catch (err) {
      toast.error("You do not have permission to edit this customer", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomerDetails(id);
  }, [id]);

  /* -------------------------
     Handlers
  -------------------------- */
  const handleChange = (field, valueOrEvent) => {
    const value = valueOrEvent?.target
      ? valueOrEvent.target.value
      : valueOrEvent;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCustomerSelect = (val) => {
    if (val) navigate(`/customer/update?id=${val}`);
    else navigate(`/customer/update`);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.phone) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    Object.values(newErrors).forEach((m) => toast.error(m, toastCfg));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await Token.put(`/customers/${id}`, form);
      toast.success("Customer updated successfully", toastCfg);
      setTimeout(() => navigate("/customers"), 800);
    } catch (err) {
      toast.error("Failed to update customer", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-surface-light dark:bg-surface-dark min-h-screen p-1">
      <ToastContainer {...toastCfg} />

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Update Customer
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update and manage customer information
        </p>
      </div>

      {/* CUSTOMER SELECTOR */}

      <div className="bg-surface-soft dark:bg-surface-darkCard p-6 rounded-xl shadow-sm border border-surface-border dark:border-surface-darkBorder">
        <SelectSearch
          api="/customers"
          method="get"
          onChange={(v) => handleCustomerSelect(v)}
          value={id || ""}
          label="Select Customer"
          placeholder="---- Select Customer ----"
          labelKey="name"
          isDefault={false}
        />
      </div>

      {/* FORM */}

      <div className="bg-surface-soft dark:bg-surface-darkCard p-6 rounded-xl shadow-sm border border-surface-border dark:border-surface-darkBorder">
        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
          Customer Details
        </h2>

        {loading ? (
          <div className="text-slate-500 dark:text-slate-400">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BASIC INFO */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                placeholder="Customer name"
                value={form.name}
                onChange={(v) => handleChange("name", v)}
                error={errors.name}
                required
              />

              <Input
                label="Phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={(v) => handleChange("phone", v)}
                error={errors.phone}
                required
              />
            </div>

            {/* EMAIL + DOB */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                placeholder="Email address"
                value={form.email}
                onChange={(v) => handleChange("email", v)}
              />

              <Input
                label="Dob"
                placeholder="Dob"
                value={form.dob}
                type="date"
                onChange={(v) => handleChange("dob", v)}
              />
            </div>

            {/* GENDER + HOMETOWN */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Select Gender"
                value={form.gender}
                onChange={(v) => handleChange("gender", v)}
                required
                error={errors.gender}
              >
                <option value="">----- Select Gender -----</option>

                <option value="male">Male</option>

                <option value="female">Female</option>
              </Select>

              <Input
                label="Hometown"
                placeholder="Hometown"
                value={form.hometown}
                onChange={(v) => handleChange("hometown", v)}
              />
            </div>

            {/* COMPANY */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                placeholder="Company Name"
                value={form.company_name}
                onChange={(v) => handleChange("company_name", v)}
              />

              <Input
                label="Company GST Number"
                placeholder="Company GST Number"
                value={form.gstin}
                onChange={(v) => handleChange("gstin", v)}
              />
            </div>

            {/* ADDRESS */}

            <Textarea
              label="Address"
              placeholder="Address"
              value={form.address}
              onChange={(v) => handleChange("address", v)}
            />

            {/* REMARK */}

            <Textarea
              label="Remark"
              placeholder="Notes (optional)"
              value={form.remark}
              onChange={(v) => handleChange("remark", v)}
            />

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/customers")}
                className="px-5 py-2.5 border border-surface-border dark:border-surface-darkBorder rounded-xl bg-surface-soft dark:bg-surface-darkCard hover:bg-surface-muted dark:hover:bg-surface-darkMuted text-slate-700 dark:text-slate-200 transition-all duration-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
