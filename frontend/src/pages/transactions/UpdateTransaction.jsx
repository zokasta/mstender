import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Select from "../../components/elements/Select";
import SelectSearch from "../../components/elements/SelectSearch";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import Token from "../../database/Token";

const TRANSACTION_TYPES = [
  "invoice payment",
  "expense",
  "manual credit",
  "manual debit",
  "refund",
];

export default function UpdateTransaction() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");

  const [form, setForm] = useState({
    bank_id: "",
    invoice_id: "",
    type: "invoice payment",
    amount: "",
    transaction_date: "",
    reference_no: "",
    remarks: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch Transaction Details
  const fetchTransactionDetails = async (transactionId) => {
    if (!transactionId) return;

    setLoading(true);
    try {
      const res = await Token.get(`/transactions/${transactionId}`);
      const data = res.data?.data ?? res.data;

      setForm({
        bank_id: data.bank_id || "",
        invoice_id: data.invoice_id || "",
        type: data.type || "invoice payment",
        amount: data.amount || "",
        transaction_date: data.transaction_date || "",
        reference_no: data.reference_no || "",
        remarks: data.remarks || "",
      });
    } catch (err) {
      console.error("Failed to fetch transaction", err);
      toast.error(
        err.response?.data?.message ||
          "You do not have permission to edit this transaction",
        toastCfg
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTransactionDetails(id);
  }, [id]);

  const handleChange = (field, valueOrEvent) => {
    let value = valueOrEvent;
    if (valueOrEvent?.target) {
      value = valueOrEvent.target.value;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTransactionSelect = (valOrEvent) => {
    const val = valOrEvent?.target ? valOrEvent.target.value : valOrEvent;

    if (val) navigate(`/transaction/update?id=${val}`);
    else navigate(`/transaction/update`);
  };

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

      await Token.put(`/transactions/${id}`, form);

      toast.success("Transaction updated successfully", toastCfg);
      setTimeout(() => navigate("/transactions"), 800);
    } catch (err) {
      console.error("Failed to update transaction", err);

      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msgs) =>
          toast.error(Array.isArray(msgs) ? msgs[0] : msgs, toastCfg)
        );
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message, toastCfg);
      } else {
        toast.error("Failed to update transaction", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-surface-light dark:bg-surface-dark min-h-screen p-1">
      <ToastContainer {...toastCfg} />

      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        Update Transaction
      </h1>

      {/* Transaction Selector */}

      <div className="bg-surface-soft dark:bg-surface-darkCard p-6 rounded-xl shadow-sm border border-surface-border dark:border-surface-darkBorder">
        <SelectSearch
          api="/transactions"
          method="get"
          label="Update Transaction"
          onChange={(e) => handleTransactionSelect(e)}
          value={id || ""}
          labelKey="reference_no"
          placeholder="---- Select Transaction -----"
        />
      </div>

      {/* Update Form */}

        <div className="bg-surface-soft dark:bg-surface-darkCard p-6 rounded-xl shadow-sm border border-surface-border dark:border-surface-darkBorder">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
            Transaction Details
          </h2>

          {loading ? (
            <div className="text-slate-500 dark:text-slate-400">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bank */}

              <SelectSearch
                api="/banks"
                label="Select Bank"
                extraParams={{ status: "Active" }}
                value={form.bank_id}
                onChange={(v) => handleChange("bank_id", v)}
                labelKey="name"
                valueKey="id"
                error={errors.bank_id}
              />

              {/* Type */}

              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>

                <Select
                  value={form.type}
                  onChange={(v) => handleChange("type", v)}
                  className="w-full h-10 bg-surface-soft dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder rounded-md px-3 text-slate-700 dark:text-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Invoice */}

              {form.type === "invoice payment" && (
                <SelectSearch
                  api="/invoices"
                  label="Select Invoice"
                  value={form.invoice_id}
                  onChange={(v) => handleChange("invoice_id", v)}
                  labelKey="invoice_no"
                  valueKey="id"
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
                  error={errors.amount}
                />

                <Input
                  label="Transaction Date"
                  type="date"
                  value={form.transaction_date}
                  onChange={(v) => handleChange("transaction_date", v)}
                  error={errors.transaction_date}
                />
              </div>

              <Input
                label="Reference No"
                value={form.reference_no}
                onChange={(v) => handleChange("reference_no", v)}
              />

              <Textarea
                label="Remarks"
                value={form.remarks}
                onChange={(v) => handleChange("remarks", v)}
              />

              {/* Buttons */}

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
                  className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-200 disabled:opacity-50"
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
