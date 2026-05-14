// src/Pages/Employees/UpdateEmployee.jsx

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import SelectSearch from "../../components/elements/SelectSearch";

import { toast, ToastContainer } from "react-toastify";

import { toastCfg } from "../../data/toastCfg";

import Token from "../../database/Token";

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

  /* =========================================
     FETCH EMPLOYEE
  ========================================= */

  const fetchEmployeeDetails = async (employeeId) => {
    if (!employeeId) return;

    setLoading(true);

    try {
      const res = await Token.get(`/employees/${employeeId}`);

      const u = res.data;

      let dob = u.dob || "";

      if (dob && dob.includes("T")) {
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

  const handleEmployeeSelect = (val) => {
    if (val) {
      navigate(`/employee/update?id=${val}`);
    } else {
      navigate(`/employee/update`);
    }
  };

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!form.username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email format.";
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

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="space-y-6 bg-surface-light dark:bg-surface-dark min-h-screen p-1">
      <ToastContainer {...toastCfg} />

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          Update Employee
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update and manage employee information
        </p>
      </div>

      {/* SELECT EMPLOYEE */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
        {/* TOP */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Select Employee
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose employee to update
          </p>
        </div>

        {/* BODY */}

        <div className="p-6">
          <SelectSearch
            label="Select Employee"
            placeholder="---- Select Employee ----"
            onChange={(e) => handleEmployeeSelect(e)}
            api="/employees"
            method="get"
            labelKey="name"
            value={id || ""}
            isDefault={false}
          />
        </div>
      </div>

      {/* FORM */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
        {/* HEADER */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Employee Details
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update employee information
          </p>
        </div>

        {/* BODY */}

        {loading ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-8">
              {/* BASIC INFO */}

              <div>
                <div className="mb-5">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Basic Information
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Employee personal details
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <Input
                    label="Full Name"
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
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(v) => handleChange("phone", v)}
                    error={errors.phone}
                  />

                  {/* GENDER */}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Gender
                    </label>

                    <Select
                      value={form.gender || ""}
                      onChange={(v) => handleChange("gender", v)}
                      className={`w-full h-11 px-4 rounded-2xl border bg-surface-soft dark:bg-surface-darkMuted outline-none transition-all ${
                        errors.gender
                          ? "border-red-500 focus:border-red-500"
                          : "border-surface-border dark:border-surface-darkBorder focus:border-primary-500"
                      }`}
                    >
                      {GENDER_LIST.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </Select>

                    {errors.gender && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.gender}
                      </p>
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
              </div>
            </div>

            {/* FOOTER */}

            <div className="px-6 py-5 border-t border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/employees")}
                disabled={loading}
                className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-surface-light dark:hover:bg-surface-dark text-slate-700 dark:text-slate-300 font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
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
