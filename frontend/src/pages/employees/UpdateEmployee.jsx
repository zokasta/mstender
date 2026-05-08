import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import Token from "../../database/Token";
import SelectSearch from "../../components/elements/SelectSearch";

const GENDER_LIST = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function UpdateEmployee() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Fetch single employee details
  const fetchEmployeeDetails = async (employeeId) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await Token.get(`/employees/${employeeId}`);
      const u = res.data;

      let dob = u.dob || "";
      if (dob && dob.includes("T")) {
        // just in case it comes with time
        dob = dob.split("T")[0];
      }

      setForm({
        name: u.name || "",
        username: u.username || "",
        email: u.email || "",
        phone: u.phone || "",
        gender: u.gender || "",
        dob: dob,
      });
    } catch (err) {
      console.error("Failed to fetch employee details", err);
      toast.error("You do not have permission to edit this employee", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEmployeeDetails(id);
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleEmployeeSelect = (val) => {
    if (val) navigate(`/employee/update?id=${val}`);
    else navigate(`/employee/update`);
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";

    // simple email check
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email format.";
    }

    setErrors(newErrors);
    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Map empty strings to null where appropriate
      const payload = {
        name: form.name,
        username: form.username,
        email: form.email,
        phone: form.phone === "" ? null : form.phone,
        gender: form.gender === "" ? null : form.gender,
        dob: form.dob === "" ? null : form.dob,
      };

      await Token.put(`/employees/${id}`, payload);

      toast.success("Employee updated successfully", toastCfg);
      setTimeout(() => navigate("/employees"), 800);
    } catch (err) {
      console.error("Failed to update employee", err);
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat();
        messages.forEach((msg) => toast.error(msg, toastCfg));
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message, toastCfg);
      } else {
        toast.error("Failed to update employee", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />
      <h1 className="text-2xl font-bold text-gray-800">Update Employee</h1>

      {/* Employee selector */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <SelectSearch
          label="Select Employee"
          placeholder="---- Select Employee"
          onChange={(e) => handleEmployeeSelect(e)}
          api="/employees"
          method="get"
          labelKey="name"
          value={id || ""}
          isDefault={false}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">Employee Details</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                placeholder="Enter full name"
                value={form.name}
                onChange={(v) => handleChange("name", v)}
                error={errors.name}
              />
              <Input
                label="Username"
                placeholder="Enter username"
                value={form.username}
                onChange={(v) => handleChange("username", v)}
                error={errors.username}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={(v) => handleChange("email", v)}
                error={errors.email}
              />
              <Input
                label="Phone"
                placeholder="Enter phone"
                value={form.phone}
                onChange={(v) => handleChange("phone", v)}
                error={errors.phone}
              />
            </div>

            {/* Gender & DOB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Gender
                </label>
                <Select
                  value={form.gender || ""}
                  onChange={(v) => handleChange("gender", v)}
                  className={`w-full h-10 bg-[#f4f6f8] border rounded-sm outline-none px-3 ${
                    errors.gender
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-orange-500"
                  }`}
                >
                  {GENDER_LIST.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </Select>
                {errors.gender && (
                  <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
                )}
              </div>

              <Input
                label="Date of Birth"
                type="date"
                value={form.dob || ""}
                onChange={(v) => handleChange("dob", v)}
                error={errors.dob}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/employees")}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                disabled={loading}
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
