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

import { FaArrowLeft, FaUniversity, FaSave } from "react-icons/fa";

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
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Bank name is required.";
    }

    if (
      !form.account_type.trim() ||
      form.account_type === "-- Select Type --"
    ) {
      newErrors.account_type = "Account type is required.";
    }

    setErrors(newErrors);

    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await Token.post("/banks", form);

      toast.success("Bank created successfully", toastCfg);

      setTimeout(() => navigate("/banks"), 800);
    } catch (err) {
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

      {/* HEADER */}

      <div className="flex items-center justify-between gap-4">
        {/* LEFT */}

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
            <FaUniversity size={18} />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-white">
              Create Bank
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add new bank account details
            </p>
          </div>
        </div>

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => navigate("/banks")}
          className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 hover:text-primary-500 font-semibold transition-all flex items-center gap-3 shadow-sm"
        >
          <FaArrowLeft size={12} />
          Back
        </button>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder p-6 rounded-[28px] shadow-sm space-y-6"
      >
        {/* BANK INFO */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        {/* ACCOUNT DETAILS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

          <Select
            label="Account Type"
            value={form.account_type}
            required
            error={errors.account_type}
            onChange={(v) => handleChange("account_type", v)}
          >
            <option value="">Select account type</option>

            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Select>
        </div>

        {/* ACTIVE */}

        <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-light dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white">
              Active Status
            </h4>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enable this bank account
            </p>
          </div>

          <Switch
            checked={form.is_active}
            onChange={(val) => handleChange("is_active", val)}
          />
        </div>

        {/* ACTIONS */}

        <div className="flex items-center justify-end gap-3 pt-2">
          {/* CANCEL */}

          <button
            type="button"
            onClick={() => navigate("/banks")}
            disabled={loading}
            className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-dark hover:bg-surface-light dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 font-semibold transition-all"
          >
            Cancel
          </button>

          {/* SAVE */}

          <button
            type="submit"
            disabled={loading}
            className={`h-11 px-5 rounded-2xl text-white font-semibold flex items-center gap-3 transition-all shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/20"
            }`}
          >
            <FaSave size={13} />

            {loading ? "Saving..." : "Save Bank"}
          </button>
        </div>
      </form>
    </div>
  );
}
