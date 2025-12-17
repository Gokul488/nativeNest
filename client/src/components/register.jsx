import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {FiUser, FiMail, FiPhone, FiLock, FiType, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import API_BASE_URL from "../config.js";

const Register = () => {
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ HARD CODED account types
  const accountTypes = ["buyer", "admin"];

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      mobile_number: formData.get("mobile_number"),
      password: formData.get("password"),
      confirm_password: formData.get("confirm_password"),
      account_type: formData.get("account_type"),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

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
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-[#2e6171]/70 to-[#011936]/70 rounded-full blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#011936]">Create Account</h1>
            <p className="text-gray-600 mt-2">Join NativeNest today</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg mb-6 text-sm font-medium bg-red-50 text-red-700 border border-red-200"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiType className="text-[#2e6171]" /> Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-[#2e6171]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiMail className="text-[#2e6171]" /> Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-[#2e6171]"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiPhone className="text-[#2e6171]" /> Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile_number"
                required
                maxLength="10"
                pattern="\d{10}"
                onInput={(e) =>
                  (e.target.value = e.target.value.replace(/\D/g, ""))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-[#2e6171]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiLock className="text-[#2e6171]" /> Password *
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500"
                >
                  {showRegPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiLock className="text-[#2e6171]" /> Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiUser className="text-[#2e6171]" /> Account Type *
              </label>
              <select
                name="account_type"
                required
                defaultValue=""
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-[#2e6171]"
              >
                <option value="" disabled>Select account type</option>
                {accountTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#2e6171] to-[#011936] text-white py-3.5 rounded-xl font-bold"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#2e6171] hover:underline">
              Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;