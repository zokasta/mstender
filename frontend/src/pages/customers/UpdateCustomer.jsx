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
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />
      <h1 className="text-2xl font-bold">Update Customer</h1>

      {/* Customer selector */}
      <div className="bg-white p-6 rounded-lg shadow border">
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

      {/* Update form */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Customer Details</h2>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
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
              <Select
                label="select gender"
                value={form.gender}
                onChange={(v) => handleChange("gender", v)}
                required
                error={errors.gender}
              >
                <option value="--- select gender ----">
                  ----- select gender ------
                </option>
                <option value="male">male</option>
                <option value="female">female</option>
              </Select>
              <Input
                label="Hometown"
                placeholder="Hometown"
                value={form.hometown}
                onChange={(v) => handleChange("hometown", v)}
              />
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

            {/* Address */}
            <Textarea
              label="Address"
              placeholder="Address"
              value={form.address}
              onChange={(v) => handleChange("address", v)}
            />

            {/* Remark */}
            <Textarea
              label="Remark"
              placeholder="Notes (optional)"
              value={form.remark}
              onChange={(v) => handleChange("remark", v)}
            /> 

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/customers")}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-500 text-white rounded"
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
