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
    setForm((prev) => ({ ...prev, [field]: value }));
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
      <h1 className="text-2xl font-bold">Create Tax</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm border space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Rate (%)"
            placeholder="Tax rate in percentage"
            value={form.rate}
            onChange={(v) => handleChange("rate", v)}
            required
          />
          <div className="flex items-center gap-3 mt-7">
            <span className="text-gray-700 text-sm">Active</span>
            <Switch
              checked={form.is_active}
              onChange={(val) => handleChange("is_active", val)}
              isLoading={loading}
            />
          </div>
        </div>

        <Textarea
          label="Description"
          placeholder="Enter short description (optional)"
          value={form.description}
          onChange={(v) => handleChange("description", v)}
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/taxes")}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Tax"}
          </button>
        </div>
      </form>
    </div>
  );
}
