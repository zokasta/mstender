// src/Pages/Leads/CreateLead.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Select from "../../components/elements/Select";
import Switch from "../../components/elements/Switch";
import { toast, ToastContainer } from "react-toastify";

import Token from "../../database/Token";
import { toastCfg } from "../../data/toastCfg";

export default function CreateLead() {
  const navigate = useNavigate();

  const [pipelines, setPipelines] = useState([]);
  const [stages, setStages] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pipeline_id: "",
    stage_id: "",
    details: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------------- FETCH PIPELINES ---------------- */
  const fetchPipelines = async () => {
    try {
      const res = await Token.get("/pipelines");
      setPipelines(res.data || []);
    } catch {
      toast.error("Failed to load pipelines", toastCfg);
    }
  };

  /* ---------------- FETCH STAGES ---------------- */
  const fetchStages = async (pipelineId) => {
    if (!pipelineId) {
      setStages([]);
      return;
    }

    try {
      const res = await Token.get(
        `/pipeline-stages/pipeline/${pipelineId}`
      );
      setStages(res.data || []);
    } catch {
      toast.error("Failed to load stages", toastCfg);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    fetchStages(form.pipeline_id);
  }, [form.pipeline_id]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return toast.warn("Lead name is required", toastCfg);
    }

    if (!form.pipeline_id) {
      return toast.warn("Please select a pipeline", toastCfg);
    }

    setLoading(true);

    try {
      await Token.post("/leads", {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        pipeline_id: form.pipeline_id,
        stage_id: form.stage_id || null,
        details: form.details || null,
      });

      toast.success("Lead created successfully", toastCfg);
      setTimeout(() => navigate("/leads"), 1000);
    } catch (err) {
      console.error("Create lead error:", err);

      if (err.response?.data?.message) {
        toast.error(err.response.data.message, toastCfg);
      } else {
        toast.error("Failed to create lead", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      <h1 className="text-2xl font-bold">Create Lead</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-surface-darkCard p-6 rounded-lg shadow-sm border space-y-6"
      >
        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            placeholder="Enter name"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
            required
          />

          <Input
            label="Phone"
            placeholder="Enter phone"
            value={form.phone}
            onChange={(v) => handleChange("phone", v)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            placeholder="Enter email"
            value={form.email}
            onChange={(v) => handleChange("email", v)}
          />

          <Select
            label="Pipeline"
            value={form.pipeline_id}
            onChange={(v) => handleChange("pipeline_id", v)}
            required
          >
            <option value="">Select Pipeline</option>
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        {/* STAGE */}
        <Select
          label="Stage"
          value={form.stage_id}
          onChange={(v) => handleChange("stage_id", v)}
        >
          <option value="">Select Stage</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        {/* DESCRIPTION */}
        <Textarea
          label="Details"
          placeholder="Enter details"
          value={form.details}
          onChange={(v) => handleChange("details", v)}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/leads")}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}