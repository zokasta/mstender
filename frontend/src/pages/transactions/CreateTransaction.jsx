import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Select from "../../components/elements/Select";
import SelectSearch from "../../components/elements/SelectSearch";

import { toastCfg } from "../../data/toastCfg";
import Token from "../../database/Token";
import TextArea from "../../components/elements/Textarea";

// const TRANSACTION_TYPES = [
//   "invoice payment",
//   "expense",
//   "manual credit",
//   "manual debit",
//   "refund",
// ];

const TRANSACTION_TYPES = [
  { title: "Invoice Payments", key: "invoice payment" },
  { title: "Expense", key: "expense" },
  { title: "Manual Credit (Add Money)", key: "manual credit" },
  { title: "Manual Debit (Deduct Money)", key: "manual debit" },
  { title: "Refund Amount", key: "refund" },
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
  });

  const handleChange = (field, value) => {
    setErrors(() => ({ ...errors, [field]: "" }));
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Read trip_id from URL
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

  const validateForm = () => {
    const newErrors = {};
    if (!form.bank_id) newErrors.bank_id = "Bank is required";
    if (!form.amount || Number(form.amount) <= 0)
      newErrors.amount = "Valid amount is required";
    if (!form.transaction_date)
      newErrors.transaction_date = "Transaction date is required";
    if (form.type === "invoice payment" && !form.invoice_id)
      newErrors.invoice_id = "Invoice is required for invoice payment";

    if (form.type) setErrors(newErrors);

    // show toast notifications
    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

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

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      <h1 className="text-2xl font-bold">Create Transaction</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow border space-y-6"
      >
        {/* Amount + Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            type="text"
            value={form.title}
            onChange={(v) => handleChange("title", v)}
            error={errors.title}
          />

          <Textarea
            error={errors.title}
            label="Description"
            value={form.description}
            onChange={(v) => handleChange("description", v)}
          />
        </div>

        {/* Bank Selection */}
        <SelectSearch
          label="Select Bank"
          api="/banks"
          extraParams={{ status: "Active" }}
          value={form.bank_id}
          onChange={(v) => handleChange("bank_id", v)}
          labelKey="name"
          valueKey="id"
          required
          error={errors.bank_id}
        />

        {/* Type */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.type}
            onChange={(v) => handleChange("type", v)}
            className="w-full h-10 bg-[#f4f6f8] border border-gray-300 rounded-sm px-3"
            error={errors.amount}
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type.key} value={type.key}>
                {type.title}
              </option>
            ))}
          </Select>
        </div>

        {/* Invoice (only show for invoice payment) */}
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

        {/* Amount + Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(v) => handleChange("amount", v)}
            required
            error={errors.amount}
          />

          <Input
            label="Transaction Date"
            type="date"
            value={form.transaction_date}
            onChange={(v) => handleChange("transaction_date", v)}
            required
            errors={errors.transaction_date}
          />
        </div>

        {/* Reference */}
        <Input
          label="Reference No"
          value={form.reference_no}
          onChange={(v) => handleChange("reference_no", v)}
        />

        {/* Remarks */}
        <Textarea
          label="Remarks"
          value={form.remarks}
          onChange={(v) => handleChange("remarks", v)}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/transactions")}
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
            {loading ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
