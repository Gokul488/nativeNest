import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import API_BASE_URL from "../config.js";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const identifier = formData.get("identifier");
    const password = formData.get("password");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.account_type === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/buyer-dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white overflow-hidden relative flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#011936]">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Log in to your NativeNest account</p>
          </div>

          {error && (
            <div className="p-4 rounded-lg mb-6 text-sm bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiUser className="text-[#2e6171]" /> Mobile / Email *
              </label>
              <input
                type="text"
                name="identifier"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-[#2e6171]"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiLock className="text-[#2e6171]" /> Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#2e6171] to-[#011936] text-white py-3.5 rounded-xl font-bold"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="font-bold text-[#2e6171] hover:underline">
              Register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
