// src/Pages/Pipelines/PipelineUpdate.jsx

import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";

import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Switch from "../../components/elements/Switch";
import SelectSearch from "../../components/elements/SelectSearch";

import Token from "../../database/Token";

import { toastCfg } from "../../data/toastCfg";

export default function PipelineUpdate() {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  const id = params.get("id");

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);


  /* =========================================
     FETCH PIPELINE
  ========================================= */

  const fetchPipelineDetails = async (pipelineId) => {
    if (!pipelineId) return;

    setLoading(true);

    try {
      const res = await Token.get(`/pipelines/${pipelineId}`);

      setForm({
        name: res.data.data.pipeline.name || "",
        description: res.data.data.pipeline.description || "",
        is_active: res.data.data.pipeline.is_active || false,
      });

    } catch (err) {
      console.error("Failed to fetch pipeline details", err);

      toast.error("You do not have permission to edit this pipeline", toastCfg);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPipelineDetails(id);
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

  const handlePipelineSelect = (val) => {
    if (val) {
      navigate(`/pipeline/update?id=${val}`);
    } else {
      navigate(`/pipeline/update`);
    }
  };

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Pipeline name is required.";
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

      await Token.put(`/pipelines/${id}`, {
        ...form,
      });

      toast.success("Pipeline updated successfully", toastCfg);

      setTimeout(() => navigate("/pipelines"), 800);
    } catch (err) {
      console.error("Failed to update pipeline", err);

      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat();

        messages.forEach((msg) => toast.error(msg, toastCfg));
      } else {
        toast.error("Failed to update pipeline", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="space-y-6 min-h-screen p-1">
      <ToastContainer {...toastCfg} />

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          Update Pipeline
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update and manage pipeline information
        </p>
      </div>

      {/* SELECT PIPELINE */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm">
        {/* TOP */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Select Pipeline
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose a pipeline to update
          </p>
        </div>

        {/* BODY */}

        <div className="bg-surface-soft dark:bg-surface-darkCard p-6 rounded-xl shadow-sm border border-surface-border dark:border-surface-darkBorder">
          <SelectSearch
            api="/pipelines"
            method="get"
            label="Update Pipelines"
            onChange={(e) => handlePipelineSelect(e)}
            value={id || ""}
            labelKey="name"
            placeholder="---- Select Pipeline -----"
          />
        </div>
      </div>

      {/* FORM */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
        {/* HEADER */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Pipeline Details
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update pipeline details below
          </p>
        </div>

        {/* BODY */}

        {loading ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* FORM BODY */}

            <div className="p-6 space-y-6">
              {/* ROW */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Pipeline Name"
                  placeholder="Enter pipeline name"
                  value={form.name}
                  onChange={(v) => handleChange("name", v)}
                  error={errors.name}
                  required
                />

                {/* SWITCH */}

                <div className="h-full flex items-end">
                  <div className="w-full h-[58px] px-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Active Pipeline
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Enable or disable pipeline
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

            <div className="px-6 py-5 border-t border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/pipelines")}
                disabled={loading}
                className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-surface-light dark:hover:bg-surface-dark text-slate-700 dark:text-slate-300 font-medium transition-all disabled:opacity-50"
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
    </div>
  );
}
