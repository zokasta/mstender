import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Axios from "../../database/Axios"; // your axios instance
import { toast, ToastContainer } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const remember_me = localStorage.getItem('remember_me')
    const token = localStorage.getItem('token')
    if(remember_me && token){
      const user = JSON.parse(localStorage.getItem('user'))

      if (user.type == 'intern'){
        navigate('/leads')
      }
      navigate("/dashboard")
    }
  },[])
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // In your handleSubmit, save full response to localStorage
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.warn("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await Axios.post("auth/login/", {
        email: formData.email,
        password: formData.password,
      });

      const token = res?.data?.token;
      const user = res?.data?.user;
      const types = res?.data?.types || [];

      if (token) {
        // ✅ Save everything to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("types", JSON.stringify(types));

        if (formData.remember){
          localStorage.setItem('remember_me',true)
        }
        toast.success("Login successful 🎉");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg =
        error.response?.data?.detail || error.response?.data?.message ||
        "Unable to login. Please check credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0] select-none">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="bg-white dark:bg-surface-darkCard shadow-lg rounded-xl p-8 w-full max-w-md border border-gray-200 dark:border-surface-darkBorder">
        {/* Logo / Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome Back 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Email Address
            </label>
            <div className="flex items-center border border-gray-300 rounded-md bg-surface-light dark:bg-surface-dark focus-within:border-primary-500 focus-within:border-2">
              <FaEnvelope className="mx-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none h-10 px-2 text-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-md bg-surface-light dark:bg-surface-dark focus-within:border-primary-500 focus-within:border-2">
              <FaLock className="mx-3 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full bg-transparent outline-none h-10 px-2 text-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-gray-600 select-none">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-primary-700 hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold text-white transition 
              ${
                loading
                  ? "bg-primary-400 cursor-not-allowed"
                  : "bg-primary-500 hover:bg-primary-600" 
              }`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-5 text-sm text-gray-600">
          Did you need help?{" "}
          <button
            onClick={() => navigate("https://wa.me/+919714702634")}
            className="text-primary-700 font-medium hover:underline"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
