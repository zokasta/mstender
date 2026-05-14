// src/Pages/Taxes/CreateTax.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Switch from "../../components/elements/Switch";

import { toast, ToastContainer } from "react-toastify";

import Token from "../../database/Token";

import { toastCfg } from "../../data/toastCfg";

export default function CreateTax() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    code: "",
    rate: "",
    description: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return toast.warn("Tax name is required", toastCfg);
    }

    if (form.code === "") {
      return toast.warn("Please enter a tax code", toastCfg);
    }

    if (form.rate === "" || isNaN(parseFloat(form.rate))) {
      return toast.warn("Please enter a valid tax rate", toastCfg);
    }

    setLoading(true);

    try {
      await Token.post("/taxes", {
        name: form.name,
        code: form.code || null,
        rate: parseFloat(form.rate),
        description: form.description || null,
        is_active: form.is_active,
      });

      toast.success("Tax created successfully", toastCfg);

      setTimeout(() => navigate("/taxes"), 1000);
    } catch (err) {
      console.error("Create tax error:", err);

      if (err.response?.data?.message) {
        toast.error(err.response.data.message, toastCfg);
      } else {
        toast.error("Failed to create tax", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-800 dark:text-white">
          Create Tax
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Create and manage tax configuration
        </p>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden"
      >
        {/* TOP */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Tax Information
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill tax details below
          </p>
        </div>

        {/* BODY */}

        <div className="p-6 space-y-6">
          {/* ROW */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Tax Name"
              placeholder="Enter tax name"
              value={form.name}
              onChange={(v) => handleChange("name", v)}
              required
            />

            <Input
              label="Tax Code"
              placeholder="Optional code"
              value={form.code}
              onChange={(v) => handleChange("code", v)}
              required
            />
          </div>

          {/* ROW */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              type="number"
              label="Rate (%)"
              placeholder="Tax rate in percentage"
              value={form.rate}
              onChange={(v) => handleChange("rate", v)}
              required
            />

            {/* ACTIVE */}

            <div className="h-full flex items-end">
              <div className="w-full h-[58px] px-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Active Tax
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Enable or disable tax
                  </p>
                </div>

                <Switch
                  checked={form.is_active}
                  onChange={(val) => handleChange("is_active", val)}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}

          <Textarea
            label="Description"
            placeholder="Enter short description (optional)"
            value={form.description}
            onChange={(v) => handleChange("description", v)}
          />
        </div>

        {/* FOOTER */}

        <div className="px-6 py-5 border-t border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/taxes")}
            className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-surface-light dark:hover:bg-surface-dark text-gray-700 dark:text-gray-300 font-medium transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Tax"}
          </button>
        </div>
      </form>
    </div>
  );
}
