
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
    setForm((prev) => ({ ...prev, [field]: value }));
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
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      <h1 className="text-2xl font-bold">Create Pipeline</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm border space-y-6"
      >
        {/* NAME */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Pipeline Name"
            placeholder="Enter pipeline name"
            value={form.name}
            onChange={(v) => handleChange("name", v)}
            required
          />
        </div>

        {/* ACTIVE */}
        <div className="flex items-center gap-3">
          <span className="text-gray-700 text-sm">Active</span>
          <Switch
            checked={form.is_active}
            onChange={(val) => handleChange("is_active", val)}
            isLoading={loading}
          />
        </div>

        {/* DESCRIPTION */}
        <Textarea
          label="Description"
          placeholder="Enter short description (optional)"
          value={form.description}
          onChange={(v) => handleChange("description", v)}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/pipelines")}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Pipeline"}
          </button>
        </div>
      </form>
    </div>
  );
}
