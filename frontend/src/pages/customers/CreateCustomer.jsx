// src/Pages/Customers/CreateCustomer.jsx

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";

import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Select from "../../components/elements/Select";

import { toastCfg } from "../../data/toastCfg";

import Token from "../../database/Token";

/* =========================================
   CUSTOMER STATUS
========================================= */

const CUSTOMER_STATUS = ["pending", "confirmed", "cancelled", "rejected"];

export default function CreateCustomer() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    hometown: "",
    company_name: "",
    gstin: "",
    address: "",
    remark: "",
    status: "pending",
  });

  /* =========================================
     HANDLE CHANGE
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

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    /* REQUIRED */

    if (!form.name.trim()) {
      newErrors.name = "Customer name is required.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    /* GST */

    if (form.gstin?.trim()) {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

      if (!gstRegex.test(form.gstin.trim().toUpperCase())) {
        newErrors.gstin = "Invalid GSTIN format.";
      }
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

    setLoading(true);

    try {
      await Token.post("/customers", form);

      toast.success("Customer created successfully", toastCfg);

      setTimeout(() => {
        navigate("/customers");
      }, 800);
    } catch (err) {
      console.error(err);

      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msgs) =>
          toast.error(msgs[0], toastCfg)
        );
      } else {
        toast.error("Failed to create customer", toastCfg);
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

      {/* =====================================
          HEADER
      ===================================== */}

      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          Create Customer
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Create and manage customer records
        </p>
      </div>

      {/* =====================================
          FORM CARD
      ===================================== */}

      <form
        onSubmit={handleSubmit}
        className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[28px] shadow-sm overflow-hidden"
      >
        {/* =====================================
            HEADER
        ===================================== */}

        <div className="px-6 py-5 border-b border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Customer Information
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fill all required customer details
          </p>
        </div>

        {/* =====================================
            BODY
        ===================================== */}

        <div className="p-6 space-y-8">
          {/* =====================================
              BASIC INFO
          ===================================== */}

          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Basic Information
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Customer personal details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <Input
                label="Customer Name"
                placeholder="Enter customer name"
                value={form.name}
                onChange={(v) => handleChange("name", v)}
                error={errors.name}
                required
              />

              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(v) => handleChange("phone", v)}
                error={errors.phone}
                required
              />

              <Input
                label="Email Address"
                placeholder="Enter email"
                type="email"
                value={form.email}
                onChange={(v) => handleChange("email", v)}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={form.dob}
                onChange={(v) => handleChange("dob", v)}
              />

              <Select
                label="Gender"
                value={form.gender}
                onChange={(v) => handleChange("gender", v)}
                error={errors.gender}
              >
                <option value="">---- Select Gender ----</option>

                <option value="male">Male</option>

                <option value="female">Female</option>
              </Select>

              <Input
                label="Hometown"
                placeholder="Enter hometown"
                value={form.hometown}
                onChange={(v) => handleChange("hometown", v)}
              />
            </div>
          </div>

          {/* =====================================
              COMPANY INFO
          ===================================== */}

          <div>
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Company Information
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Optional business details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Company Name"
                placeholder="Enter company name"
                value={form.company_name}
                onChange={(v) => handleChange("company_name", v)}
              />

              <Input
                label="GST Number"
                placeholder="Enter GST number"
                value={form.gstin}
                onChange={(v) => handleChange("gstin", v)}
                error={errors.gstin}
              />
            </div>
          </div>

          {/* =====================================
              ADDRESS
          ===================================== */}

          <div>
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Address
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Customer location information
              </p>
            </div>

            <Textarea
              label="Address"
              placeholder="Enter customer address"
              value={form.address}
              onChange={(v) => handleChange("address", v)}
            />
          </div>

          {/* =====================================
              REMARKS
          ===================================== */}

          <div>
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Remarks
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Internal customer notes
              </p>
            </div>

            <Textarea
              label="Remark"
              placeholder="Write notes here..."
              value={form.remark}
              onChange={(v) => handleChange("remark", v)}
            />
          </div>

          {/* =====================================
              STATUS
          ===================================== */}

          <div>
            <div className="mb-5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Customer Status
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Set customer workflow state
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Status"
                value={form.status}
                onChange={(v) => handleChange("status", v)}
              >
                {CUSTOMER_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* =====================================
            FOOTER
        ===================================== */}

        <div className="px-6 py-5 border-t border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            disabled={loading}
            className="h-11 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-surface-light dark:hover:bg-surface-dark text-slate-700 dark:text-slate-300 font-medium transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="h-11 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
