import { useState } from "react";
import Input from "../../components/elements/Input";
import Button from "../../components/elements/Button";
import Token from "../../database/Token";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required", toastCfg);

    try {
      setLoading(true);
      const res = await Token.post("/auth/forgot-password", { email });

      toast.success("Reset link sent to your email", toastCfg);
      console.log(res.data.reset_link); // for testing
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send reset link",
        toastCfg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e4e3e3]">
      <ToastContainer {...toastCfg} />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold text-gray-800">
          Forgot Password
        </h2>

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={setEmail}
        />

        <Button
          theme="primary"
          type="submit"
          title={loading ? "Sending..." : "Send Reset Link"}
          disabled={loading}
          className="w-full"
        />
      </form>
    </div>
  );
}
