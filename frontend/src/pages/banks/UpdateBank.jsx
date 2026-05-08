// src/Pages/Banks/UpdateBank.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/elements/Input";
import Switch from "../../components/elements/Switch";
import Select from "../../components/elements/Select";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import { ACCOUNT_TYPES } from "./data";
import Token from "../../database/Token";
import SelectSearch from "../../components/elements/SelectSearch";

export default function UpdateBank() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");

  const [form, setForm] = useState({
    name: "",
    branch: "",
    account_number: "",
    ifsc_code: "",
    balance: "",
    description: "",
    account_type: "savings",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch selected bank details
  const fetchBankDetails = async (bankId) => {
    if (!bankId) return;
    setLoading(true);
    try {
      const res = await Token.get(`/banks/${bankId}`);

      setForm({
        name: res.data.data.name || "",
        branch: res.data.data.branch || "",
        account_number: res.data.data.account_number || "",
        ifsc_code: res.data.data.ifsc_code || "",
        balance: res.data.data.balance || "",
        description: res.data.data.description || "",
        account_type: res.data.data.account_type || "savings",
        is_active: res.data.data.is_active || false,
      });
    } catch (err) {
      console.error("Failed to fetch bank details", err);
      toast.error("You do not have permission to edit this bank", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBankDetails(id);
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // clear field error on change
  };

  const handleBankSelect = (val) => {
    if (val) navigate(`/bank/update?id=${val}`);
    else navigate(`/bank/update`);
  };

  // ✅ Validation Logic Added
  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Bank name is required.";
    if (!form.account_type.trim())
      newErrors.account_type = "Account type is required.";
    // if (!form.account_number.trim())
    //   newErrors.account_number = "Account number is required.";
    // if (!form.ifsc_code.trim()) newErrors.ifsc_code = "IFSC code is required.";

    setErrors(newErrors);
    console.log(newErrors)

    // Toast each error
    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // stop if invalid

    try {
      setLoading(true);
      await Token.put(`/banks/${id}`, { ...form });
      toast.success("Bank updated successfully", toastCfg);
      setTimeout(() => navigate("/banks"), 800);
    } catch (err) {
      console.error("Failed to update bank", err);
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat();
        messages.forEach((msg) => toast.error(msg, toastCfg));  
        console.log(err.response?.data?.errors)
        setErrors(err.response?.data?.errors)
      } else {
        toast.error("Failed to update bank", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />
      <h1 className="text-2xl font-bold text-gray-800">Update Bank</h1>

      {/* Bank selector */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <SelectSearch
          api="/banks"
          method="get"
          label="Select Bank"
          placeholder="------ Select Bank ------"
          onChange={(e) => handleBankSelect(e)}
          value={id || ""}
          isDefault={false}
          labelKey="name"
        />
      </div>

      {/* Bank update form */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold mb-4">Bank Details</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bank Name"
                  placeholder="Enter bank name"
                  value={form.name}
                  onChange={(v) => handleChange("name", v)}
                  error={errors.name}
                  required
                />
                <Input
                  label="Bank Branch"
                  placeholder="Bank Branch"
                  value={form.branch}
                  onChange={(v) => handleChange("branch", v)}
                />
                <Input
                  label="Account Number"
                  placeholder="Account Number"
                  value={form.account_number}
                  onChange={(v) => handleChange("account_number", v)}
                  error={errors.account_number}
                />
                <Input
                  label="IFSC Code"
                  placeholder="Enter IFSC code"
                  value={form.ifsc_code}
                  onChange={(v) => handleChange("ifsc_code", v)}
                  error={errors.ifsc_code}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Account Type<span className="text-red-500 ml-1">*</span>
                </label>
                <Select
                  error={errors.account_type}
                  value={form.account_type}
                  onChange={(v) => handleChange("account_type", v)}
                  className={`w-full h-10 bg-[#f4f6f8] border rounded-sm outline-none px-3 ${
                    errors.account_type
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-primary-500"
                  }`}
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Select>
                {errors.account_type && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.account_type}
                  </p>
                )}
              </div>

              {/* Optional Description */}
              {/* <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(v) => handleChange("description", v)}
              /> */}

              <div className="flex items-center gap-3">
                <span className="text-gray-700 text-sm">Active</span>
                <Switch
                  checked={form.is_active}
                  onChange={(val) => handleChange("is_active", val)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/banks")}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
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
