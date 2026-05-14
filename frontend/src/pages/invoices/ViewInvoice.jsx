import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import html2pdf from "html2pdf.js";
import Axios from "../../database/Axios";
import ReactMoment from "react-moment";
import Token from "../../database/Token";
import CardUI from "../../common/UI/CardUI";

export default function ViewInvoice() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const rememberToken = params.get("remember_token");

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  const invoiceRef = useRef();

  /* -------------------------
     Fetch invoice
  -------------------------- */
  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await Axios.get("/invoices/view", {
        params: {
          id,
          remember_token: rememberToken,
        },
      });

      setInvoice(res.data.data);
    } catch {
      toast.error("Invalid or unauthorized invoice", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && rememberToken) fetchInvoice();
  }, [id, rememberToken]);

  /* -------------------------
     Actions
  -------------------------- */
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = invoiceRef.current;

    const opt = {
      margin: 0,
      filename: `Invoice-${invoice?.invoice_no || invoice?.id}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="p-6 text-gray-500 dark:text-gray-400">Loading invoice...</div>
      </div>
    );

  if (!invoice)
    return <div className="p-6 text-red-500">Invoice not found</div>;

  const subTotal = invoice.sub_total || 0;
  const discount = invoice.discount_amount || 0;
  const taxTotal = invoice.tax_total || 0;
  const roundOff = invoice.round_off || 0;

  return (
    <div className="bg-surface-muted dark:bg-surface-darkMuted min-h-screen py-6">
      <ToastContainer {...toastCfg} />

      {/* ACTION BAR */}

      {/* 
        Todo: hear i know this is really bad code but i will fix that 
         again sorry bro
      */}

      {localStorage.getItem("token") && (
        <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center print:hidden">
          {/* LEFT SIDE BUTTON (Only if token exists) */}
          <Link to={`/customers?group_id=${invoice.group_id}`}>
            <button className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600">
              View Customers
            </button>
          </Link>

          {/* RIGHT SIDE BUTTONS */}
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border rounded bg-white dark:bg-surface-darkCard"
            >
              Print
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-primary-500 text-white rounded"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
      {!localStorage.getItem("token") && (
        <div className="max-w-4xl mx-auto mb-4 flex justify-end gap-3 print:hidden">
          <button
            //   onClick={handlePrint}
            className="px-4 py-2 border rounded bg-white dark:bg-surface-darkCard"
          >
            Print
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-primary-500 text-white rounded"
          >
            Download PDF
          </button>
        </div>
      )}

      {/* INVOICE */}
      <div
        ref={invoiceRef}
        className="max-w-4xl mx-auto bg-white dark:bg-surface-darkCard p-8 shadow print:shadow-none"
      >
        {/* HEADER */}
        <div className="flex justify-between mb-8">
          <div>
            {/* LOGO */}
            <h1 className="text-2xl font-bold">Company Name</h1>
            <p className="text-sm text-gray-600">
              Company Address Line 1
              <br />
              Phone: +91 XXXXXXXX
            </p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-semibold">INVOICE</h2>
            <p className="text-sm">Invoice No: {invoice.invoice_no}</p>
            <p className="text-sm">
              Date:{" "}
              <ReactMoment format="DD MMM yyyy">
                {invoice.invoice_date}
              </ReactMoment>
            </p>
            {invoice.due_date && (
              <p className="text-sm">
                Due Date: 
                <ReactMoment format="DD MMM yyyy">
                  {invoice.due_date}
                </ReactMoment>
              </p>
            )}
          </div>
        </div>

        {/* BILL TO */}
        <div className="mb-6">
          <h3 className="font-semibold mb-1">Bill To</h3>
          <p>{invoice.customer_name}</p>
          <p className="text-sm text-gray-600">{invoice.customer_address}</p>
          <p className="text-sm">{invoice.customer_phone}</p>
          <p className="text-sm">{invoice.customer_email}</p>
        </div>

        {/* ITEMS */}
        <table className="w-full border mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Description</th>
              <th className="border px-3 py-2 text-right">Qty</th>
              <th className="border px-3 py-2 text-right">Price</th>
              <th className="border px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td className="border px-3 py-2">{item.title}</td>
                <td className="border px-3 py-2 text-right">{item.qty}</td>
                <td className="border px-3 py-2 text-right">₹{item.price}</td>
                <td className="border px-3 py-2 text-right">₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SUMMARY */}
        <div className="flex justify-between">
          {/* NOTES */}
          <div className="w-1/2">
            {invoice.notes && (
              <>
                <h4 className="font-semibold">Notes</h4>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </>
            )}
          </div>

          {/* TOTALS */}
          <div className="w-1/3">
            <div className="flex justify-between mb-1">
              <span>Sub Total</span>
              <span>₹{subTotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between mb-1">
                <span>Discount</span>
                <span>- ₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between mb-1">
              <span>Total Before Tax</span>
              <span>₹{invoice.before_tax}</span>
            </div>

            {invoice.taxes?.map((t) => (
              <div key={t.id} className="flex justify-between mb-1">
                <span>
                  {t.name} ({t.rate}%)
                </span>
                <span>+ ₹{t.amount}</span>
              </div>
            ))}

            {roundOff !== 0 && (
              <div className="flex justify-between mb-1">
                <span>Round Off</span>
                <span>₹{roundOff}</span>
              </div>
            )}

            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>₹{invoice.total}</span>
            </div>
          </div>
        </div>

        {/* SIGNATURE */}
        <div className="mt-12 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Digitally signed invoice</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Verify using secure link</p>
          </div>

          <div className="text-right">
            <p className="font-semibold">Authorized Sign</p>
            <div className="mt-8 border-t w-40"></div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Terms & Conditions apply • This is a system generated invoice
        </div>
      </div>
      <CardUI className="max-w-4xl mx-auto mt-4 p-6 border border-gray-200 dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Payment Summary
          </h3>

          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${
              invoice.status === "paid"
                ? "bg-green-100 text-green-700"
                : invoice.status === "partially paid"
                ? "bg-yellow-100 text-yellow-700"
                : invoice.status === "overdue"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {invoice.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          {/* Total */}
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Amount</p>
            <p className="font-semibold text-gray-800 dark:text-white">₹{invoice.total}</p>
          </div>

          {/* Paid */}
          <div>
            <p className="text-gray-500 dark:text-gray-400">Paid Amount</p>
            <p className="font-semibold text-green-600">
              ₹{invoice.paid_amount}
            </p>
          </div>

          {/* Due */}
          <div>
            <p className="text-gray-500 dark:text-gray-400">Due Amount</p>
            <p
              className={`font-semibold ${
                invoice.due_amount > 0 ? "text-red-600" : "text-gray-700"
              }`}
            >
              ₹{invoice.due_amount}
            </p>
          </div>

          {/* Due Date */}
          <div>
            <p className="text-gray-500 dark:text-gray-400">Due Date</p>
            <p
              className={`font-semibold ${
                invoice.due_amount > 0 &&
                new Date(invoice.due_date) < new Date()
                  ? "text-red-600"
                  : "text-gray-800 dark:text-white"
              }`}
            >
              {invoice.due_date ? (
                <ReactMoment format="DD MMM yyyy">
                  {invoice.due_date}
                </ReactMoment>
              ) : (
                "-"
              )}
            </p>
          </div>
        </div>

        {/* Overdue Warning */}
        {invoice.due_amount > 0 &&
          invoice.due_date &&
          new Date(invoice.due_date) < new Date() && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ⚠ This invoice is overdue. Immediate payment required.
            </div>
          )}
      </CardUI>
    </div>
  );
}
