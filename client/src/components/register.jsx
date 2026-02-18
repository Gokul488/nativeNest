// register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLock, FiType, FiEye, FiEyeOff, FiUserPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import API_BASE_URL from "../config.js";

const Register = () => {
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState("");
  const navigate = useNavigate();

  const accountTypes = ["buyer", "admin", "builder"];

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
      contact_person: formData.get("contact_person"),
    };

    // Only include contact_person when builder is selected
      if (payload.account_type === "builder") {
        payload.contact_person = formData.get("contact_person")?.trim() || "";
      }

      // Optional: client-side validation before sending
      if (payload.account_type === "builder" && !payload.contact_person) {
        setError("Contact person is required for builders");
        setLoading(false);
        return;
      }

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
      } else if (data.user.account_type === "builder") {
        navigate("/builder-dashboard");
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
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#f0f7f9] overflow-x-hidden">
      {/* Background Graphic Pattern */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <svg
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <path
            fill="#a0c4ff"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
          <path
            fill="#bde0fe"
            d="M0,320L48,314.7C96,309,192,299,288,272C384,245,480,203,576,202.7C672,203,768,245,864,250.7C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            opacity="0.5"
          ></path>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-4xl p-6 md:p-10 shadow-2xl border border-white/50">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-[#0a2540] mb-1 tracking-tight">
              Create Account
            </h1>
            <p className="text-slate-500 text-sm">Join the community and get started</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg mb-6 text-xs bg-red-50 text-red-600 border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#4a6b8a] uppercase tracking-wider mb-1.5 ml-1">
                  Full Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <FiUser size={16} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-[#4a6b8a] uppercase tracking-wider mb-1.5 ml-1">
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <FiMail size={16} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-bold text-[#4a6b8a] uppercase tracking-wider mb-1.5 ml-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <FiPhone size={16} />
                  </span>
                  <input
                    type="tel"
                    name="mobile_number"
                    placeholder="9876543210"
                    required
                    pattern="\d{10}"
                    maxLength={10}
                    onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Account Type */}
                <div>
                  <label className="block text-[11px] font-bold text-[#4a6b8a] uppercase tracking-wider mb-1.5 ml-1">
                    ACCOUNT TYPE *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                      <FiType size={16} />
                    </span>
                    <select
                      name="account_type"
                      required
                      value={accountType}                    // ← controlled value (very important!)
                      onChange={(e) => {
                        setAccountType(e.target.value);
                        console.log("Account type changed to:", e.target.value); // ← debug
                      }}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      {accountTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contact Person – shown only for builder */}
                {accountType === "builder" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-[11px] font-bold text-[#4a6b8a] uppercase tracking-wider mb-1.5 ml-1">
                      Contact Person Name *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <FiUserPlus size={16} />
                      </span>
                      <input
                        type="text"
                        name="contact_person" // This must match the backend req.body key
                        placeholder="Primary contact for this business"
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                      />
                    </div>
                  </motion.div>
                )}

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#4a6b8a] uppercase tracking-wider mb-1.5 ml-1">
                  Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <FiLock size={16} />
                  </span>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#4a6b8a] uppercase tracking-wider mb-1.5 ml-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <FiLock size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-xs bg-[#0a2540] hover:bg-[#0d2e50] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Register Now"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#2e6171] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;