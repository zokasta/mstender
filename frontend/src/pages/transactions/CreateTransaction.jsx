// src/Pages/Transactions/CreateTransaction.jsx

import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";

import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Select from "../../components/elements/Select";
import SelectSearch from "../../components/elements/SelectSearch";

import { toastCfg } from "../../data/toastCfg";

import Token from "../../database/Token";

import {
  FaMoneyBillWave,
  FaBuildingColumns,
  FaFileInvoiceDollar,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaRotateLeft,
} from "react-icons/fa6";

/* =========================================
   TRANSACTION TYPES
========================================= */

const TRANSACTION_TYPES = [
  {
    title: "Invoice Payments",
    key: "invoice payment",
    icon: <FaFileInvoiceDollar />,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },

  {
    title: "Expense",
    key: "expense",
    icon: <FaMoneyBillWave />,
    color: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },

  {
    title: "Manual Credit",
    key: "manual credit",
    icon: <FaArrowTrendUp />,
    color:
      "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  },

  {
    title: "Manual Debit",
    key: "manual debit",
    icon: <FaArrowTrendDown />,
    color:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },

  {
    title: "Refund",
    key: "refund",
    icon: <FaRotateLeft />,
    color:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
];

export default function CreateTransaction() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    bank_id: "",
    invoice_id: "",
    type: "invoice payment",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
    reference_no: "",
    remarks: "",
    title: "",
    description: "",
  });

  /* =========================================
     CHANGE
  ========================================= */

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

  /* =========================================
     URL PARAMS
  ========================================= */

  useEffect(() => {
    const invoiceId = searchParams.get("invoice_id");

    if (invoiceId) {
      setForm((prev) => ({
        ...prev,
        invoice_id: invoiceId,
        type: "invoice payment",
      }));
    }
  }, [searchParams]);

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = () => {
    const newErrors = {};

    if (!form.bank_id) {
      newErrors.bank_id = "Bank is required";
    }

    if (!form.amount || Number(form.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }

    if (!form.transaction_date) {
      newErrors.transaction_date = "Transaction date is required";
    }

    if (form.type === "invoice payment" && !form.invoice_id) {
      newErrors.invoice_id = "Invoice is required";
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

      await Token.post("/transactions", form);

      toast.success("Transaction created successfully", toastCfg);

      setTimeout(() => navigate("/transactions"), 800);
    } catch (err) {
      console.error(err);

      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msgs) =>
          toast.error(msgs[0], toastCfg)
        );
      } else {
        toast.error(
          err.response?.data?.message || "Failed to create transaction",
          toastCfg
        );
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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Create Transaction
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage banking and invoice transactions
        </p>
      </div>

      {/* TYPE */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-xl p-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Transaction Type
        </label>

        <div className="flex flex-wrap gap-3">
          {TRANSACTION_TYPES.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => handleChange("type", type.key)}
              className={`px-4 py-2 rounded-lg border text-sm transition-all duration-200 ${
                form.type === type.key
                  ? "bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20"
                  : "bg-surface-soft dark:bg-surface-darkMuted border-surface-border dark:border-surface-darkBorder text-slate-700 dark:text-slate-300 hover:bg-surface-muted dark:hover:bg-surface-dark"
              }`}
            >
              {type.title}
            </button>
          ))}
        </div>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-xl shadow-sm p-6 space-y-6"
      >
        {/* TITLE + AMOUNT */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            type="text"
            placeholder="Transaction title"
            value={form.title}
            onChange={(v) => handleChange("title", v)}
            error={errors.title}
          />

          <Input
            label="Amount"
            type="number"
            placeholder="Enter amount"
            value={form.amount}
            onChange={(v) => handleChange("amount", v)}
            required
            error={errors.amount}
          />
        </div>

        {/* DESCRIPTION */}

        <Textarea
          label="Description"
          placeholder="Write description..."
          value={form.description}
          onChange={(v) => handleChange("description", v)}
          error={errors.description}
        />

        {/* BANK */}

        <SelectSearch
          label="Select Bank"
          api="/banks"
          extraParams={{
            status: "Active",
          }}
          value={form.bank_id}
          onChange={(v) => handleChange("bank_id", v)}
          labelKey="name"
          valueKey="id"
          required
          error={errors.bank_id}
        />

        {/* INVOICE */}

        {form.type === "invoice payment" && (
          <SelectSearch
            label="Select Invoice"
            api="/invoices"
            value={form.invoice_id}
            onChange={(v) => handleChange("invoice_id", v)}
            labelKey="id"
            valueKey="id"
            required
            error={errors.invoice_id}
          />
        )}

        {/* DATE + REF */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Transaction Date"
            type="date"
            value={form.transaction_date}
            onChange={(v) => handleChange("transaction_date", v)}
            required
            error={errors.transaction_date}
          />

          <Input
            label="Reference No"
            placeholder="Reference number"
            value={form.reference_no}
            onChange={(v) => handleChange("reference_no", v)}
          />
        </div>

        {/* REMARKS */}

        <Textarea
          label="Remarks"
          placeholder="Write remarks..."
          value={form.remarks}
          onChange={(v) => handleChange("remarks", v)}
        />

        {/* BUTTONS */}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="px-5 py-2.5 border border-surface-border dark:border-surface-darkBorder rounded-xl bg-surface-soft dark:bg-surface-darkCard hover:bg-surface-muted dark:hover:bg-surface-darkMuted text-slate-700 dark:text-slate-200 transition-all duration-200"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
