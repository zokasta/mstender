// src/Pages/Banks/UpdateBank.jsx

import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";

import Input from "../../components/elements/Input";
import Switch from "../../components/elements/Switch";
import Select from "../../components/elements/Select";
import SelectSearch from "../../components/elements/SelectSearch";

import { toastCfg } from "../../data/toastCfg";
import { ACCOUNT_TYPES } from "./data";

import Token from "../../database/Token";

import { FaArrowLeft, FaUniversity, FaSave } from "react-icons/fa";

export default function UpdateBank() {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  const id = params.get("id");

  const [form, setForm] = useState({
    name: "",
    branch: "",
    account_number: "",
    ifsc_code: "",
    balance: "",
    description: "",
    account_type: "savings",
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  /* =========================================
     FETCH BANK
  ========================================= */

  const fetchBankDetails = async (bankId) => {
    if (!bankId) return;

    setLoading(true);

    try {
      const res = await Token.get(`/banks/${bankId}`);

      setForm({
        name: res.data.data.name || "",

        branch: res.data.data.branch || "",

        account_number: res.data.data.account_number || "",

        ifsc_code: res.data.data.ifsc_code || "",

        balance: res.data.data.balance || "",

        description: res.data.data.description || "",

        account_type: res.data.data.account_type || "savings",

        is_active: res.data.data.is_active || false,
      });
    } catch (err) {
      console.error("Failed to fetch bank details", err);

      toast.error("You do not have permission to edit this bank", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBankDetails(id);
  }, [id]);

  /* =========================================
     HANDLE CHANGE
  ========================================= */

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

  /* =========================================
     SELECT BANK
  ========================================= */

  const handleBankSelect = (val) => {
    if (val) {
      navigate(`/bank/update?id=${val}`);
    } else {
      navigate(`/bank/update`);
    }
  };

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Bank name is required.";
    }

    if (!form.account_type.trim()) {
      newErrors.account_type = "Account type is required.";
    }

    setErrors(newErrors);

    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await Token.put(`/banks/${id}`, {
        ...form,
      });

      toast.success("Bank updated successfully", toastCfg);

      setTimeout(() => navigate("/banks"), 800);
    } catch (err) {
      console.error("Failed to update bank", err);

      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat();

        messages.forEach((msg) => toast.error(msg, toastCfg));

        setErrors(err.response?.data?.errors);
      } else {
        toast.error("Failed to update bank", toastCfg);
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
              Update Bank
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update existing bank account details
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

      {/* SELECT BANK */}

      <div className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder p-6 rounded-[28px] shadow-sm">
        <SelectSearch
          api="/banks"
          method="get"
          label="Select Bank"
          placeholder="Select bank"
          onChange={(e) => handleBankSelect(e)}
          value={id || ""}
          isDefault={false}
          labelKey="name"
        />
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder p-6 rounded-[28px] shadow-sm space-y-6"
      >
        {/* LOADING */}

        {loading ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <>
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
                label="Bank Branch"
                placeholder="Bank Branch"
                value={form.branch}
                onChange={(v) => handleChange("branch", v)}
              />
            </div>

            {/* ACCOUNT DETAILS */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Account Number"
                placeholder="Account Number"
                value={form.account_number}
                onChange={(v) => handleChange("account_number", v)}
                error={errors.account_number}
              />

              <Input
                label="IFSC Code"
                placeholder="Enter IFSC code"
                value={form.ifsc_code}
                onChange={(v) => handleChange("ifsc_code", v)}
                error={errors.ifsc_code}
              />

              <Select
                label="Account Type"
                value={form.account_type}
                required
                error={errors.account_type}
                onChange={(v) => handleChange("account_type", v)}
              >
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

                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
