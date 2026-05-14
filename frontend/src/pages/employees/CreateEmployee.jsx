// src/Pages/Employees/CreateEmployee.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";

import Token from "../../database/Token";

import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";

import Button from "../../components/elements/Button";

import env from "../../data/env";

import CardUI from "../../common/UI/CardUI";

import CopyLinkButton from "../../components/tables/CopyLinkButton";
import CloseButton from "../../components/tables/CloseButton";

const mapStatusToDb = (status) => {
  switch (status) {
    case "Active":
      return "active";

    case "Inactive":
      return "inactive";

    case "On Leave":
      return "pending";

    case "Terminated":
      return "suspended";

    default:
      return "active";
  }
};

export default function CreateEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    type: "employee",
    status: "Active",
    password: "",
  });

  const [form2, setForm2] = useState({
    email: "",
    username: "",
    type: "",
  });

  const [loading, setLoading] = useState({
    employee: false,
    quick: false,
  });

  const [errors, setErrors] = useState({});

  const [inviteLink, setInviteLink] = useState("");

  /* ---------------- HANDLE CHANGE ---------------- */

  const handleChange = (field, value) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChange2 = (field, value) => {
    setForm2((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Employee name is required.";
    }

    if (!form.username.trim()) {
      newErrors.username = "Employee username is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Employee email is required.";
    }

    if (!form.password.trim()) {
      newErrors.password = "Employee password is required.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Employee phone number is required.";
    }

    if (!form.type.trim()) {
      newErrors.type = "Employee type is required.";
    }

    setErrors(newErrors);

    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (loading.employee) return;

    const payload = {
      name: form.name,
      username: form.username,
      email: form.email,
      phone: form.phone || null,
      dob: form.dob || null,
      gender: form.gender || null,
      status: mapStatusToDb(form.status),
      password: form.password,
    };

    try {
      setLoading({
        ...loading,
        employee: true,
      });

      await Token.post("/employees", payload);

      toast.success("Employee created successfully", toastCfg);

      navigate("/employees");
    } catch (error) {
      console.error("Failed to create employee:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        const firstKey = Object.keys(errors)[0];

        const firstMsg = errors[firstKey]?.[0];

        toast.error(firstMsg || "Validation error", toastCfg);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, toastCfg);
      } else {
        toast.error("Failed to create employee", toastCfg);
      }
    } finally {
      setLoading({
        ...loading,
        employee: false,
      });
    }
  };

  /* ---------------- QUICK INVITE ---------------- */

  const handleGenerateInvite = async () => {
    try {
      setLoading({
        ...loading,
        quick: true,
      });

      const response = await Token.post("/employees/quick-assign", form2);

      const dummyLink = `${env.BASE_URL}/invite?username=${form2.username}&email=${form2.email}&token=${response.data.invite_token}`;

      setInviteLink(dummyLink);

      toast.success("Invite link generated", toastCfg);
    } catch (error) {
      console.error("Failed to create employee:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        const firstKey = Object.keys(errors)[0];

        const firstMsg = errors[firstKey]?.[0];

        toast.error(firstMsg || "Validation error", toastCfg);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, toastCfg);
      } else {
        toast.error("Failed to create employee", toastCfg);
      }
    }

    setLoading({
      ...loading,
      quick: false,
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6 min-h-screen p-1">
      <ToastContainer {...toastCfg} />

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          Create Employee
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add and manage employee accounts
        </p>
      </div>

      {/* EMPLOYEE FORM */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
        {/* HEADER */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Employee Details
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fill employee information below
          </p>
        </div>

        {/* BODY */}

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* FIELDS */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <Input
                placeholder="Full Name"
                label="Name"
                value={form.name}
                onChange={(val) => handleChange("name", val)}
                required
                error={errors.name}
              />

              <Input
                placeholder="Username"
                label="Username"
                value={form.username}
                onChange={(val) => handleChange("username", val)}
                required
                error={errors.username}
              />

              <Input
                placeholder="Email Address"
                label="Email"
                type="email"
                value={form.email}
                onChange={(val) => handleChange("email", val)}
                required
                error={errors.email}
              />

              <Input
                placeholder="Phone Number"
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(val) => handleChange("phone", val)}
                required
                error={errors.phone}
              />

              <Input
                placeholder="Date of Birth"
                label="DOB"
                type="date"
                value={form.dob}
                onChange={(val) => handleChange("dob", val)}
              />

              <Select
                label="Gender"
                value={form.gender}
                onChange={(val) => handleChange("gender", val)}
              >
                <option value="">-- Select Gender --</option>

                <option value="male">Male</option>

                <option value="female">Female</option>
              </Select>

              <Select
                label="Type"
                value={form.type}
                onChange={(val) => handleChange("type", val)}
              >
                <option value="">-- Select Type --</option>

                <option value="intern">Intern</option>

                <option value="sales">Sales</option>

                <option value="superadmin">Superadmin</option>
              </Select>

              <Select
                label="Status"
                value={form.status}
                onChange={(val) => handleChange("status", val)}
              >
                <option value="Active">Active</option>

                <option value="Inactive">Inactive</option>

                <option value="On Leave">On Leave</option>

                <option value="Terminated">Terminated</option>
              </Select>

              <Input
                placeholder="Initial Password"
                label="Password"
                type="password"
                value={form.password}
                onChange={(val) => handleChange("password", val)}
                required
                error={errors.password}
              />
            </div>
          </div>

          {/* FOOTER */}

          <div className="px-6 py-5 border-t border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-surface-light dark:hover:bg-surface-dark text-slate-700 dark:text-slate-300 font-medium transition-all duration-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading.employee}
              className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
            >
              {loading.employee ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>

      {/* INVITE LINK */}

      {inviteLink && (
        <CardUI>
          <div className="p-5 border border-surface-border dark:border-surface-darkBorder rounded-2xl bg-surface-muted dark:bg-surface-darkMuted">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Invite Link Generated
            </p>

            <a
              href={inviteLink}
              target="_blank"
              rel="noreferrer"
              className="text-primary-500 underline text-sm break-all mt-3 block"
            >
              {inviteLink}
            </a>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              This link will also be sent to employee email
            </p>
          </div>

          <div className="grid grid-cols-2 w-fit gap-2 mt-4">
            <CopyLinkButton url={inviteLink} color="bg-primary-500" />

            <CloseButton
              onClick={() => {
                setForm2({
                  email: "",
                  username: "",
                  type: "",
                });

                setInviteLink("");
              }}
            />
          </div>
        </CardUI>
      )}

      {/* QUICK CREATE */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden">
        {/* HEADER */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Quick Create Employee
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate invite link for employee self registration
          </p>
        </div>

        {/* BODY */}

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
            <Select
              label="Employee Type"
              value={form2.type}
              onChange={(val) => handleChange2("type", val)}
            >
              <option value="">---- Select Type -----</option>

              <option value="intern">Intern</option>

              <option value="sales">Sales</option>

              <option value="superadmin">Superadmin</option>
            </Select>

            <Input
              label="Username"
              placeholder="Employee username"
              type="text"
              value={form2.username}
              onChange={(val) => handleChange2("username", val)}
            />

            <Input
              label="Email"
              placeholder="Employee Email"
              type="email"
              value={form2.email}
              onChange={(val) => handleChange2("email", val)}
            />
          </div>

          <div className="mt-5">
            <Button
              theme="primary"
              onClick={handleGenerateInvite}
              title={loading.quick ? "Generating..." : "Generate Invite Link"}
              className="h-11 px-5 rounded-2xl"
              disabled={loading.quick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
