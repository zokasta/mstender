import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import Textarea from "../../components/elements/Textarea";
import Switch from "../../components/elements/Switch";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import Token from "../../database/Token";
import SelectSearch from "../../components/elements/SelectSearch";

export default function UpdateLead() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get("id");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    remark: "",
    status: "new",
    reschedule_date: "",
    reschedule_time_start: "",
    reschedule_time_end: "",
    note: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* -----------------------------------------
     Fetch Single Lead
  ----------------------------------------- */
  const fetchLeadDetails = async (leadId) => {
    if (!leadId) return;
    setLoading(true);

    try {
      const res = await Token.get(`/leads/${leadId}`);
      const data = res.data;

      setForm({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        remark: data.remark || "",
        status: data.status || "new",

        // ✅ FIX DATE
        reschedule_date: data.reschedule_date
          ? data.reschedule_date.split("T")[0]
          : "",

        // ✅ FIX TIME (remove seconds)
        reschedule_time_start: data.reschedule_start_time
          ? data.reschedule_start_time.slice(0, 5)
          : "",

        reschedule_time_end: data.reschedule_end_time
          ? data.reschedule_end_time.slice(0, 5)
          : "",

        note: data.note || "",
        is_active: data.is_active ?? true,
      });
    } catch (err) {
      console.error(err);
      toast.error("You do not have permission to edit this lead", toastCfg);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) fetchLeadDetails(id);
  }, [id]);

  /* -----------------------------------------
     Helpers
  ----------------------------------------- */
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLeadSelect = (val) => {
    if (val) navigate(`/lead/update?id=${val}`);
    else navigate(`/lead/update`);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!form.status.trim()) newErrors.status = "Status is required.";

    setErrors(newErrors);
    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

  /* -----------------------------------------
     Submit Handler
  ----------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await Token.put(`/leads/${id}`, { ...form });
      toast.success("Lead updated successfully", toastCfg);
      setTimeout(() => navigate("/leads"), 800);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat();
        messages.forEach((msg) => toast.error(msg, toastCfg));
      } else {
        toast.error("Failed to update lead", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------
     UI
  ----------------------------------------- */
  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      <h1 className="text-2xl font-bold text-gray-800">Update Lead</h1>

      {/* Lead selector */}
      <div className="bg-white shadow rounded-lg p-6 border">
        <SelectSearch
          api="/leads"
          method="get"
          label="Select Lead"
          placeholder="---- Select Leads ----"
          labelKey="name"
          onChange={(v) => handleLeadSelect(v)}
          value={id || ""}
          // valueKey="id"
        />
      </div>

      {/* Update Form */}
      <div className="bg-white shadow rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Lead Details</h2>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Name"
                value={form.name}
                onChange={(v) => handleChange("name", v)}
                error={errors.name}
                required
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(v) => handleChange("phone", v)}
                error={errors.phone}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => handleChange("email", v)}
              />
            </div>

            {/* Remark & Note */}
            <Textarea
              label="Remark"
              value={form.remark}
              onChange={(v) => handleChange("remark", v)}
            />

            <Textarea
              label="Note"
              value={form.note}
              onChange={(v) => handleChange("note", v)}
            />

            {/* Reschedule Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                type="date"
                label="Reschedule Date"
                value={form.reschedule_date}
                onChange={(v) => handleChange("reschedule_date", v)}
              />
              <Input
                type="time"
                label="Start Time"
                value={form.reschedule_time_start}
                onChange={(v) => handleChange("reschedule_time_start", v)}
              />
              <Input
                type="time"
                label="End Time"
                value={form.reschedule_time_end}
                onChange={(v) => handleChange("reschedule_time_end", v)}
              />
            </div>

            {/* Status & Active */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.status}
                  onChange={(v) => handleChange("status", v)}
                  className="w-full"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                  <option value="won">Won</option>
                </Select>
                {errors.status && (
                  <p className="text-xs text-red-500 mt-1">{errors.status}</p>
                )}
              </div>

              <div className="flex items-center gap-3 mt-7">
                <span className="text-sm text-gray-700">Active</span>
                <Switch
                  checked={form.is_active}
                  onChange={(val) => handleChange("is_active", val)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/leads")}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
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
