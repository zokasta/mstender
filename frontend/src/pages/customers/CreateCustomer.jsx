import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Select from "../../components/elements/Select";
import { toastCfg } from "../../data/toastCfg";
import Token from "../../database/Token";

// ✅ Customer Status List (same as CustomersList)
const CUSTOMER_STATUS = ["pending", "confirmed", "cancelled", "rejected"];

export default function CreateCustomer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pickups, setPickups] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    hometown: "",
    remark: "",
    status: "pending",
  });

  /* -------------------------
     Handle change
  -------------------------- */
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /* -------------------------
     Validation
  -------------------------- */
  const validateForm = () => {
    const newErrors = {};

    /**
     * ===========================================
     * REQUIRED
     * ===========================================
     */
    if (!form.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required.";
    }

    /**
     * ===========================================
     * GST VALIDATION
     * ===========================================
     */
    if (form.gstin?.trim()) {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

      if (!gstRegex.test(form.gstin.trim().toUpperCase())) {
        newErrors.gstin = "Invalid GSTIN format.";
      }
    }

    setErrors(newErrors);

    Object.values(newErrors).forEach((msg) => {
      toast.error(msg, toastCfg);
    });

    return Object.keys(newErrors).length === 0;
  };

  /* -------------------------
     Submit
  -------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await Token.post("/customers", form);
      toast.success("Customer created successfully", toastCfg);
      setTimeout(() => navigate("/customers"), 800);
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msgs) =>
          toast.error(msgs[0], toastCfg)
        );
      } else {
        toast.error("Failed to create customer", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      <h1 className="text-2xl font-bold">Create Customer</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm border space-y-6"
      >
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

        {/* Status */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.status}
            onChange={(v) => handleChange("status", v)}
            className="w-full h-10 bg-[#f4f6f8] border border-gray-300 rounded-sm outline-none px-3 focus:border-primary-500"
          >
            {CUSTOMER_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="px-4 py-2 border rounded hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
