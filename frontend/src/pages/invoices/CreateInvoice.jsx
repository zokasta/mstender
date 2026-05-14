import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import { MdDelete } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import Token from "../../database/Token";
import Textarea from "../../components/elements/Textarea";
import SelectSearch from "../../components/elements/SelectSearch";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [errors, setErrors] = useState({});

  const [params] = useSearchParams();
  const customerId = params.get("customer_id");
  /* -------------------------
     FORM STATE
  -------------------------- */

  const today = new Date();

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const [form, setForm] = useState({
    customer_id: "",

    // Bill To
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",

    invoice_no: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: formatDate(addDays(today, 7)),

    items: [{ title: "", qty: 1, price: 0 }],

    discount: {
      title: "",
      type: "amount",
      value: 0,
    }, // { title, type, value }

    taxes: [], // [{ tax_id, mode }]

    round_off: {
      enabled: false,
      type: null, // "ceil" | "floor"
      value: 0,
    },

    notes: "",

    payments: [],
  });

  /* -------------------------
     FETCH DATA
  -------------------------- */

  useEffect(() => {
    fetchTaxes();
    fetchCustomers();
  }, []);

  useEffect(() => {
    console.log(form);
  }, [form]);

  const fetchCustomers = async () => {
    const res = await Token.get("/customers");
    setCustomers(res.data?.data ?? []);
  };

  const fetchTaxes = async () => {
    const res = await Token.get("/taxes");
    setTaxes((res.data?.data ?? []).filter((t) => t.is_active));
  };

  /* -------------------------
     CUSTOMER AUTO FILL
  -------------------------- */
  const handleCustomerSelect = (id) => {
    const c = customers.find((x) => x.id == id);
    if (!c) return;

    setForm((p) => ({
      ...p,
      customer_id: id,
      customer_name: c.name,
      customer_email: c.email,
      customer_phone: c.phone,
      customer_address: c.address,
    }));
  };

  const addPayment = () => {
    setForm((p) => ({
      ...p,
      payments: [
        ...p.payments,
        {
          bank_id: "",
          amount: 0,
          transaction_date: new Date().toISOString().split("T")[0],
        },
      ],
    }));
  };

  const updatePayment = (index, field, value) => {
    const arr = [...form.payments];
    arr[index][field] = value;
    setForm((p) => ({ ...p, payments: arr }));
  };

  const removePayment = (index) => {
    setForm((p) => ({
      ...p,
      payments: p.payments.filter((_, i) => i !== index),
    }));
  };

  /* -------------------------
     ITEMS
  -------------------------- */
  const addItem = () =>
    setForm((p) => ({
      ...p,
      items: [...p.items, { title: "", qty: 1, price: 0 }],
    }));

  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;
    setForm((p) => ({ ...p, items }));
  };

  const removeItem = (i) =>
    setForm((p) => ({
      ...p,
      items: p.items.filter((_, idx) => idx !== i),
    }));

  /* -------------------------
     DISCOUNT
  -------------------------- */
  const subTotal = form.items.reduce(
    (s, i) => s + Number(i.qty) * Number(i.price),
    0
  );

  const discountAmount =
    form.discount && form.discount.value
      ? form.discount.type === "percentage"
        ? (subTotal * Number(form.discount.value)) / 100
        : Number(form.discount.value)
      : 0;

  /* -------------------------
     CALCULATIONS
  -------------------------- */

  const beforeTax = Math.max(subTotal - discountAmount, 0);

  const taxBreakup = form.taxes
    .map((row) => {
      const tax = taxes.find((t) => t.id === Number(row.tax_id));
      if (!tax) return null;

      const amount =
        row.mode === "included"
          ? (beforeTax * tax.rate) / (100 + tax.rate)
          : (beforeTax * tax.rate) / 100;

      return {
        id: tax.id,
        name: tax.name,
        rate: tax.rate,
        mode: row.mode,
        amount,
      };
    })
    .filter(Boolean);

  const totalTax = taxBreakup.reduce((s, t) => s + t.amount, 0);

  // total excluded tax
  const excludedTaxTotal = taxBreakup
    .filter((t) => t.mode === "excluded")
    .reduce((s, t) => s + t.amount, 0);
  const rawTotal = beforeTax + excludedTaxTotal;

  let roundOffValue = 0;
  let finalTotal = rawTotal;

  if (form.round_off.enabled && form.round_off.type) {
    if (form.round_off.type === "ceil") {
      finalTotal = Math.ceil(rawTotal);
    } else if (form.round_off.type === "floor") {
      finalTotal = Math.floor(rawTotal);
    }

    roundOffValue = finalTotal - rawTotal;
  }

  const total = finalTotal;

  // final total
  // const total = beforeTax + excludedTaxTotal + Number(form.round_off || 0);

  /* -------------------------
     SUBMIT
  -------------------------- */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await Token.post("/invoices", {
        ...form,
        sub_total: subTotal,
        discount_amount: discountAmount,
        before_tax: beforeTax,
        tax_total: totalTax,
        total,
      });

      toast.success("Invoice created", toastCfg);
      setTimeout(() => navigate("/invoices"), 800);
    } catch (err) {
      if (err.response?.data?.errors) {
        const backendErrors = {};

        Object.entries(err.response.data.errors).forEach(([key, value]) => {
          backendErrors[key] = value[0];
        });

        setErrors(backendErrors);
      } else {
        toast.error(
          err.response?.data?.message || "Failed to create invoice",
          toastCfg
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // CUSTOMER
    if (!form.customer_name?.trim()) {
      newErrors.customer_name = "Customer name is required";
    }
    if (!form.invoice_no?.trim()) {
      newErrors.customer_name = "Invoice No is required";
    }

    // ITEMS
    form.items.forEach((item, i) => {
      if (!item.title?.trim()) {
        newErrors[`items.${i}.title`] = "Item title is required";
      }

      if (Number(item.qty) < 1) {
        newErrors[`items.${i}.qty`] = "Qty must be at least 1";
      }

      if (Number(item.price) < 1) {
        newErrors[`items.${i}.price`] = "Price must be at least 1";
      }
    });

    // DISCOUNT
    if (form.discount) {
    if(form.discount.value >0){
      if (!form.discount.title?.trim()) {
        newErrors.discount_title = "Discount title is required";
      }
    }

      if (!form.discount.type) {
        newErrors.discount_type = "Discount type is required";
      }

      if (Number(form.discount.value) < 0) {
        newErrors.discount_value = "Discount cannot be negative";
      }

      if (
        form.discount.type === "percentage" &&
        Number(form.discount.value) > 100
      ) {
        newErrors.discount_value = "Percentage cannot exceed 100%";
      }
    }

    // TAX
    form.taxes.forEach((tax, i) => {
      if (!tax.tax_id) {
        newErrors[`taxes.${i}.tax_id`] = "Select tax";
      }
      if (!tax.mode) {
        newErrors[`taxes.${i}.mode`] = "Select tax mode";
      }
    });

    // PAYMENTS (Multiple)
    if (form.payments && form.payments.length > 0) {
      form.payments.forEach((pay, i) => {
        if (!pay.bank_id) {
          newErrors[`payments.${i}.bank_id`] = "Bank is required";
        }

        if (!pay.amount || Number(pay.amount) <= 0) {
          newErrors[`payments.${i}.amount`] = "Valid payment amount required";
        }

        if (!pay.transaction_date) {
          newErrors[`payments.${i}.transaction_date`] =
            "Transaction date is required";
        }
      });
    }

    setErrors(newErrors);

    // Optional: show first error as toast
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0], toastCfg);
    }

    return Object.keys(newErrors).length === 0;
  };

  /* -------------------------
     UI
  -------------------------- */
  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />
      <h1 className="text-2xl font-bold">Create Invoice</h1>

      {/* INVOICE INFO */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded border space-y-4">
        <h2 className="font-semibold">Invoice Info</h2>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Invoice No"
            value={form.invoice_no}
            onChange={(v) => setForm((p) => ({ ...p, invoice_no: v }))}
            error={errors.customer_name}
            required
          />

          <Input
            type="date"
            label="Invoice Date"
            value={form.invoice_date}
            onChange={(v) => setForm((p) => ({ ...p, invoice_date: v }))}
          />

          <Input
            type="date"
            label="Due Date"
            value={form.due_date}
            onChange={(v) => setForm((p) => ({ ...p, due_date: v }))}
          />
        </div>
      </div>

      {/* CUSTOMER SECTION */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded border space-y-4">
        <h2 className="font-semibold">Customer</h2>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Customer"
            value={form.customer_id}
            onChange={handleCustomerSelect}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Name"
            value={form.customer_name}
            onChange={(v) => setForm((p) => ({ ...p, customer_name: v }))}
            required
            error={errors.customer_name}
          />
          <Input
            label="Phone"
            value={form.customer_phone}
            onChange={(v) => setForm((p) => ({ ...p, customer_phone: v }))}
          />
          <Input
            label="Email"
            value={form.customer_email}
            onChange={(v) => setForm((p) => ({ ...p, customer_email: v }))}
          />
          <Input
            label="Address"
            value={form.customer_address}
            onChange={(v) => setForm((p) => ({ ...p, customer_address: v }))}
          />
        </div>
      </div>

      {/* ITEMS */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded border space-y-4">
        <h2 className="font-semibold">Items</h2>

        {form.items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_50px] gap-2">
            <Input
              label="Title"
              value={item.title}
              required
              onChange={(v) => updateItem(i, "title", v)}
              error={errors[`items.${i}.title`]}
            />

            <Input
              type="number"
              label="Qty"
              required
              value={item.qty}
              onChange={(v) => updateItem(i, "qty", v)}
              error={errors[`items.${i}.qty`]}
            />

            <Input
              type="number"
              label="Price"
              value={item.price}
              required
              onChange={(v) => updateItem(i, "price", v)}
              error={errors[`items.${i}.price`]}
            />

            <Input type="number" label="Amount" value={item.price * item.qty} />
            <button onClick={() => removeItem(i)} className="text-red-500 mt-6">
              <MdDelete className="w-6 h-6" />
            </button>
          </div>
        ))}

        <button onClick={addItem} className="text-primary-500">
          + Add Item
        </button>
      </div>

      {/* DISCOUNT */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded border">
        <h2 className="font-semibold mb-4">Discounts</h2>
        {!form.discount ? (
          <button
            className="text-primary-500"
            onClick={() =>
              setForm((p) => ({
                ...p,
                discount: { title: "", type: "amount", value: 0 },
              }))
            }
          >
            + Add Discount
          </button>
        ) : (
          <div className="grid grid-cols-[1fr_1fr_1fr_50px] gap-4">
            <Input
              label="Title"
              value={form.discount.title}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  discount: { ...p.discount, title: v },
                }))
              }
            />
            <Select
              label="Type"
              value={form.discount.type}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  discount: { ...p.discount, type: v },
                }))
              }
            >
              <option value="">-- Select Discount Type --</option>
              <option value="amount">Amount</option>
              <option value="percentage">Percentage</option>
            </Select>
            <Input
              type="number"
              label={
                form.discount.type === "percentage" ? "Percentage" : "Value"
              }
              value={form.discount.value}
              onChange={(v) => {
                if (form.discount.type === "percentage" && v > 100) {
                  return;
                } else if (form.discount.type === "amount" && v > subTotal) {
                  return;
                }
                setForm((p) => ({
                  ...p,
                  discount: { ...p.discount, value: v },
                }));
              }}
            />
            <button
              onClick={() => setForm((p) => ({ ...p, discount: null }))}
              className="text-red-500 mt-6"
            >
              <MdDelete className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* TAXES */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded border space-y-3">
        <h2 className="font-semibold">Taxes</h2>

        {form.taxes.map((t, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_50px] gap-3">
            <Select
              label="Tax Type"
              value={t.mode}
              required
              onChange={(v) => {
                const arr = [...form.taxes];
                arr[i].mode = v;
                setForm((p) => ({ ...p, taxes: arr }));
              }}
            >
              <option value="excluded">Excluded</option>
              <option value="included">Included</option>
            </Select>

            <Select
              label="Select Tax"
              value={t.tax_id}
              required
              onChange={(v) => {
                const arr = [...form.taxes];
                arr[i].tax_id = Number(v); // 🔥 IMPORTANT
                setForm((p) => ({ ...p, taxes: arr }));
              }}
            >
              <option value="">Select Tax</option>
              {taxes.map((tx) => (
                <option key={tx.id} value={tx.id}>
                  {tx.name} ({tx.rate}%)
                </option>
              ))}
            </Select>
            <button
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  taxes: p.taxes.filter((_, idx) => idx !== i),
                }))
              }
              className="text-red-500 mt-6"
            >
              <MdDelete className="w-6 h-6" />
            </button>
          </div>
        ))}

        <button
          className="text-primary-500"
          onClick={() =>
            setForm((p) => ({
              ...p,
              taxes: [...p.taxes, { tax_id: "", mode: "excluded" }],
            }))
          }
        >
          + Add Tax
        </button>
      </div>

      <div className="bg-white dark:bg-surface-darkCard p-6 rounded border space-y-4">
        <h2 className="font-semibold">Payments</h2>

        {form.payments.map((pay, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_50px] gap-4">
            <Input
              type="text"
              label="Title"
              value={pay.title}
              onChange={(v) => updatePayment(i, "title", v)}
            />
            <SelectSearch
              label="Bank"
              api="/banks"
              extraParams={{ status: "Active" }}
              method="get"
              labelKey="name"
              valueKey="id"
              value={pay.bank_id}
              onChange={(v) => updatePayment(i, "bank_id", v)}
              required
            />

            <Input
              type="number"
              label="Amount"
              value={pay.amount}
              onChange={(v) => updatePayment(i, "amount", v)}
              required
            />

            <Input
              type="date"
              label="Transaction Date"
              value={pay.transaction_date}
              onChange={(v) => updatePayment(i, "transaction_date", v)}
              required
            />

            <button
              onClick={() => removePayment(i)}
              className="text-red-500 mt-6"
            >
              <MdDelete className="w-6 h-6" />
            </button>
          </div>
        ))}

        <button className="text-primary-500" onClick={addPayment}>
          + Add Payment
        </button>
      </div>

      <div className="grid grid-cols-[1fr_448px] gap-6">
        <div className="bg-gray-50 rounded border p-6">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Notes
          </label>
          <Textarea
            value={form.notes}
            onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
          />
        </div>
        {/* SUMMARY (RIGHT) */}
        <div className="bg-gray-50 rounded border p-6">
          <div>Subtotal: ₹{subTotal.toFixed(2)}</div>
          {discountAmount > 0 && (
            <div>Discount: -₹{discountAmount.toFixed(2)}</div>
          )}
          {form.taxes.length !== 0 && (
            <div>Before Tax: ₹{beforeTax.toFixed(2)}</div>
          )}

          {taxBreakup.map((t) => (
            <div key={t.id}>
              {t.mode === "included" && "(included)"} {t.name} ({t.rate}%): ₹
              {t.amount.toFixed(2)}
            </div>
          ))}

          <div className="space-y-2">
            {!form.round_off.enabled ? (
              <button
                className="text-primary-500"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    round_off: { enabled: true, type: "ceil", value: 0 },
                  }))
                }
              >
                + Add Round Off
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 border rounded ${
                    form.round_off.type === "floor"
                      ? "bg-primary-500 text-white"
                      : "bg-white dark:bg-surface-darkCard"
                  }`}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      round_off: { ...p.round_off, type: "floor" },
                    }))
                  }
                >
                  Floor
                </button>

                <button
                  className={`px-3 py-1 border rounded ${
                    form.round_off.type === "ceil"
                      ? "bg-primary-500 text-white"
                      : "bg-white dark:bg-surface-darkCard"
                  }`}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      round_off: { ...p.round_off, type: "ceil" },
                    }))
                  }
                >
                  Ceil
                </button>

                <button
                  className="text-red-500"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      round_off: { enabled: false, type: null, value: 0 },
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            )}

            {roundOffValue !== 0 && (
              <div>Round Off: ₹{roundOffValue.toFixed(2)}</div>
            )}
          </div>

          <div className="font-bold text-lg">Total: ₹{total.toFixed(2)}</div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() =>
            setForm({ ...form, items: [{ title: "", qty: 1, price: 0 }] })
          }
          className="border px-4 py-2 rounded bg-white dark:bg-surface-darkCard"
        >
          Clear
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-primary-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Create Invoice"}
        </button>
      </div>
    </div>
  );
}
