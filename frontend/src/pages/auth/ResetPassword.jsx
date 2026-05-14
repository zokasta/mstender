import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Input from "../../components/elements/Input";
import Button from "../../components/elements/Button";
import Token from "../../database/Token";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      return toast.error("Passwords do not match", toastCfg);
    }

    try {
      await Token.post("/auth/reset-password", {
        token,
        ...form,
      });

      toast.success("Password reset successfully", toastCfg);
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Reset failed",
        toastCfg
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer {...toastCfg} />

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-surface-darkCard p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">Reset Password</h2>

        <Input
          label="New Password"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
        />

        <Input
          label="Confirm Password"
          type="password"
          value={form.password_confirmation}
          onChange={(v) =>
            setForm({ ...form, password_confirmation: v })
          }
        />

        <Button
          theme="primary"
          title="Reset Password"
          className="w-full"
        />
      </form>
    </div>
  );
}
