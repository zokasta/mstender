// src/Pages/Banks/CreateBank.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import Input from "../../components/elements/Input";
import Switch from "../../components/elements/Switch";
import Select from "../../components/elements/Select";
import { toastCfg } from "../../data/toastCfg";
import { ACCOUNT_TYPES } from "./data";
import Token from "../../database/Token";

export default function CreateBank() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    branch: "",
    account_number: "",
    ifsc_code: "",
    title: "",
    account_type: "",
    is_active: false,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // clear field error
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Bank name is required.";
    if (!form.account_type.trim() || form.account_type === "-- Select Type --")
      newErrors.account_type = "Account type is required.";

    setErrors(newErrors);

    // show toast notifications
    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // stop if invalid

    setLoading(true);
    try {
      await Token.post("/banks", form);
      toast.success("Bank created successfully", toastCfg);
      setTimeout(() => navigate("/banks"), 800);
    } catch (err) {
      errors(err,toastCfg)
      console.error("Error creating bank:", err);

      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msgs) =>
          toast.error(msgs[0], toastCfg)
        );
      } else {
        toast.error("Failed to create bank", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      <h1 className="text-2xl font-bold">Create Bank</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm border space-y-6"
      >
        {/* Bank Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Bank Name"
            placeholder="Enter bank name"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
            error={errors.name}
            required
          />
          <Input
            label="Branch"
            placeholder="Enter branch name"
            value={form.branch}
            onChange={(v) => handleChange("branch", v)}
          />
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Account Number"
            placeholder="Enter account number"
            value={form.account_number}
            onChange={(v) => handleChange("account_number", v)}
          />
          <Input
            label="IFSC Code"
            placeholder="Enter IFSC code"
            value={form.ifsc_code}
            onChange={(v) => handleChange("ifsc_code", v)}
          />
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Account Type<span className="text-red-500 ml-1">*</span>
            </label>
            <Select
              value={form.account_type}
              onChange={(v) => handleChange("account_type", v)}
              className={`w-full h-10 bg-[#f4f6f8] border rounded-sm outline-none px-3 ${
                errors.account_type
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-primary-500"
              }`}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>
            {errors.account_type && (
              <p className="text-xs text-red-500 mt-1">{errors.account_type}</p>
            )}
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-gray-700 text-sm">Active</span>
          <Switch
            checked={form.is_active}
            onChange={(val) => handleChange("is_active", val)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/banks")}
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
            {loading ? "Saving..." : "Save Bank"}
          </button>
        </div>
      </form>
    </div>
  );
}
