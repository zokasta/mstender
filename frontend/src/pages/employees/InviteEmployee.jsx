// src/Pages/Employees/EmployeeInvite.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import Button from "../../components/elements/Button";
import Token from "../../database/Token";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";

export default function EmployeeInvite() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    token: "",
    name: "",
    phone: "",
    dob: "",
    gender: "",
    password: "",
    password_confirmation: "",
  });

  // read invite params
  useEffect(() => {
    const username = params.get("username");
    const email = params.get("email");
    const token = params.get("token");

    if (!token || !email) {
      toast.error("Invalid or expired invite link", toastCfg);
      return;
    }

    setForm((prev) => ({
      ...prev,
      username: username || "",
      email: email || "",
      token,
    }));
  }, [params]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.name || !form.password) {
      toast.error("Name and password are required", toastCfg);
      return;
    }

    if (form.password !== form.password_confirmation) {
      toast.error("Passwords do not match", toastCfg);
      return;
    }

    try {
      setLoading(true);

      await Token.post("/employees/accept-invite", {
        token: form.token,
        name: form.name,
        phone: form.phone || null,
        dob: form.dob || null,
        gender: form.gender || null,
        password: form.password,
      });

      toast.success("Account activated successfully", toastCfg);
      navigate("/login");
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, toastCfg);
      } else {
        toast.error("Failed to activate account", toastCfg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e4e3e3] px-4">
      <ToastContainer {...toastCfg} />

      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Complete Your Profile
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Please fill the details below to activate your employee account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Username" value={form.username} disabled />
            <Input label="Email" value={form.email} disabled />
          </div>

          <Input
            label="Full Name"
            placeholder="Your full name"
            value={form.name}
            onChange={(val) => handleChange("name", val)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={(val) => handleChange("phone", val)}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={form.dob}
              onChange={(val) => handleChange("dob", val)}
            />
          </div>

          <Select
            label="Gender"
            value={form.gender}
            onChange={(val) => handleChange("gender", val)}
          >
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="Create password"
              value={form.password}
              onChange={(val) => handleChange("password", val)}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              value={form.password_confirmation}
              onChange={(val) =>
                handleChange("password_confirmation", val)
              }
            />
          </div>

          <Button
            type="submit"
            theme="orange"
            title={loading ? "Activating..." : "Activate Account"}
            disabled={loading}
            className="w-full py-2"
          />
        </form>
      </div>
    </div>
  );
}
