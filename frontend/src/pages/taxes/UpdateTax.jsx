// src/Pages/Taxes/UpdateTax.jsx

import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";

import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Switch from "../../components/elements/Switch";
import SelectSearch from "../../components/elements/SelectSearch";

import Token from "../../database/Token";

import { toastCfg } from "../../data/toastCfg";

export default function UpdateTax() {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  const id = params.get("id");

  const [form, setForm] = useState({
    name: "",
    code: "",
    rate: "",
    description: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [permission, setPermission] = useState(true);

  /* =========================================
     FETCH TAX
  ========================================= */

  const fetchTaxDetails = async (taxId) => {
    if (!taxId) return;

    setLoading(true);

    try {
      const res = await Token.get(`/taxes/${taxId}`);

      setForm({
        name: res.data.data.name || "",
        code: res.data.data.code || "",
        rate: res.data.data.rate || "",
        description: res.data.data.description || "",
        is_active: res.data.data.is_active || false,
      });

      setPermission(true);
    } catch (err) {
      console.error("Failed to fetch tax details", err);

      toast.error("You do not have permission to edit this tax", toastCfg);

      setPermission(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTaxDetails(id);
  }, [id]);

  /* =========================================
     CHANGE
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

  const handleTaxSelect = (val) => {
    if (val) {
      navigate(`/tax/update?id=${val}`);
    } else {
      navigate(`/tax/update`);
    }
  };

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Tax name is required.";
    }

    if (!form.rate || isNaN(form.rate)) {
      newErrors.rate = "Tax rate must be a valid number.";
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

    if (!permission) {
      return toast.error("No permission to update", toastCfg);
    }

    if (!validateForm()) return;

    try {
      setLoading(true);

      await Token.put(`/taxes/${id}`, {
        ...form,
      });

      toast.success("Tax updated successfully", toastCfg);

      setTimeout(() => navigate("/taxes"), 800);
    } catch (err) {
      console.error("Failed to update tax", err);

      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat();

        messages.forEach((msg) => toast.error(msg, toastCfg));
      } else {
        toast.error("Failed to update tax", toastCfg);
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
          Update Tax
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update and manage tax information
        </p>
      </div>

      {/* SELECT TAX */}

      <div className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
        {/* TOP */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Select Tax
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose a tax to update
          </p>
        </div>

        {/* BODY */}

        <div className="p-6">
          <SelectSearch
            api="/taxes"
            method="get"
            value={id || ""}
            labelKey="name"
            onChange={(e) => handleTaxSelect(e)}
            label="Select Tax"
            placeholder="---- Select Tax ----"
            isDefault={false}
          />
        </div>
      </div>

      {/* FORM */}

      <div className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
        {/* HEADER */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Tax Details
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update tax details below
          </p>
        </div>

        {/* BODY */}

        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* FORM BODY */}

            <div className="p-6 space-y-6">
              {/* ROW */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Tax Name"
                  placeholder="Enter tax name"
                  value={form.name}
                  onChange={(v) => handleChange("name", v)}
                  error={errors.name}
                  required
                />

                <Input
                  label="Tax Code"
                  placeholder="Optional"
                  value={form.code}
                  onChange={(v) => handleChange("code", v)}
                />
              </div>

              {/* RATE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Rate (%)"
                  placeholder="Tax rate"
                  value={form.rate}
                  onChange={(v) => handleChange("rate", v)}
                  error={errors.rate}
                />

                {/* SWITCH */}

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
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}

              <Textarea
                label="Description"
                placeholder="Description"
                value={form.description}
                onChange={(v) => handleChange("description", v)}
              />
            </div>

            {/* FOOTER */}

            <div className="px-6 py-5 border-t border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/taxes")}
                disabled={loading}
                className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-surface-light dark:hover:bg-surface-dark text-gray-700 dark:text-gray-300 font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
      {/* NO PERMISSION */}

      {!permission && id && (
        <div className="border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-[24px] p-5">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            You do not have permission to edit this tax.
          </p>
        </div>
      )}
    </div>
  );
}
