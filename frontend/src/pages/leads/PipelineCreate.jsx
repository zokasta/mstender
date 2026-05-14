// src/Pages/Pipelines/CreatePipeline.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Switch from "../../components/elements/Switch";

import { toast, ToastContainer } from "react-toastify";

import Token from "../../database/Token";
import { toastCfg } from "../../data/toastCfg";

export default function CreatePipeline() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  /* ---------------- HANDLE CHANGE ---------------- */

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return toast.warn("Pipeline name is required", toastCfg);
    }

    setLoading(true);

    try {
      await Token.post("/pipelines", {
        name: form.name,
        description: form.description || null,
        is_active: form.is_active,
      });

      toast.success("Pipeline created successfully", toastCfg);

      setTimeout(() => navigate("/pipelines"), 1000);
    } catch (err) {
      console.error("Create pipeline error:", err);

      if (err.response?.data?.message) {
        toast.error(err.response.data.message, toastCfg);
      } else {
        toast.error("Failed to create pipeline", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6 min-h-screen p-1">
      <ToastContainer {...toastCfg} />

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          Create Pipeline
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Create and manage sales workflow pipelines
        </p>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-2xl shadow-sm p-6 space-y-6"
      >
        {/* NAME */}

        <div className="gap-5">
          <Input
            label="Pipeline Name"
            placeholder="Enter pipeline name"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
            required
          />
        </div>

        {/* ACTIVE */}

        <div className="bg-surface-muted dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Active Status
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enable or disable this pipeline
            </p>
          </div>

          <Switch
            checked={form.is_active}
            onChange={(val) => handleChange("is_active", val)}
          />
        </div>

        {/* DESCRIPTION */}

        <div>
          <Textarea
            label="Description"
            placeholder="Enter short description (optional)"
            value={form.description}
            onChange={(v) => handleChange("description", v)}
          />
        </div>

        {/* ACTIONS */}

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-border dark:border-surface-darkBorder">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/pipelines")}
            className="px-5 py-2.5 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkCard hover:bg-surface-muted dark:hover:bg-surface-darkMuted text-slate-700 dark:text-slate-200 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Pipeline"}
          </button>
        </div>
      </form>
    </div>
  );
}
