// src/Pages/Taxes/UpdateTax.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Switch from "../../components/elements/Switch";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import Token from "../../database/Token";
import SelectSearch from "../../components/elements/SelectSearch";

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

  // 🔹 Fetch single tax details
  const fetchTaxDetails = async (taxId) => {
    if (!taxId) return;
    setLoading(true);
    try {
      const res = await Token.get(`/taxes/${taxId}`);
      console.log(res)
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

  // 🔹 Handle input change
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTaxSelect = (val) => {
    if (val) navigate(`/tax/update?id=${val}`);
    else navigate(`/tax/update`);
  };

  // 🔹 Validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Tax name is required.";
    if (!form.rate || isNaN(form.rate))
      newErrors.rate = "Tax rate must be a valid number.";

    setErrors(newErrors);
    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Submit (Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!permission) return toast.error("No permission to update", toastCfg);
    if (!validateForm()) return;

    try {
      setLoading(true);
      await Token.put(`/taxes/${id}`, { ...form });
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
      <h1 className="text-2xl font-bold text-gray-800">Update Tax</h1>

      {/* Tax selector */}
      <div className="bg-white p-6 rounded-lg shadow border">
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

      {/* Tax update form */}
      {id && permission && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Tax Details</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Input
                  label="Rate (%)"
                  placeholder="Tax rate"
                  value={form.rate}
                  onChange={(v) => handleChange("rate", v)}
                  error={errors.rate}
                />
              </div>

              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(v) => handleChange("description", v)}
              />

              <div className="flex items-center gap-3">
                <span className="text-gray-700 text-sm">Active</span>
                <Switch
                  checked={form.is_active}
                  onChange={(val) => handleChange("is_active", val)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/taxes")}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!permission && id && (
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          You do not have permission to edit this tax.
        </div>
      )}
    </div>
  );
}
