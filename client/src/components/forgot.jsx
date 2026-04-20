import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { motion } from "framer-motion";
import API_BASE_URL from "../config.js";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send reset email");

      setSuccess(data.message || "A new password has been sent to your email.");
      setEmail("");
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
          <path fill="#a0c4ff" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          <path fill="#bde0fe" d="M0,320L48,314.7C96,309,192,299,288,272C384,245,480,203,576,202.7C672,203,768,245,864,250.7C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" opacity="0.5"></path>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-4xl p-8 md:p-10 shadow-2xl border border-white/50 text-center">
          
          <div className="flex justify-center mb-6">
            <div className="bg-[#0a2540] p-3 rounded-xl shadow-lg">
              <FiMail className="text-white text-2xl" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-[#0a2540] mb-2 tracking-tight">Forgot Password</h1>
          <p className="text-slate-500 text-sm mb-8">Enter your registered email to reset your password</p>

          {error && (
            <div className="p-3 rounded-lg mb-4 text-xs bg-red-50 text-red-600 border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg mb-4 text-xs bg-green-50 text-green-600 border border-green-100">
              {success}
            </div>
          )}

          <form onSubmit={handleForgot} className="space-y-6 text-left">
            <div>
              <label className="block text-[11px] font-bold text-[#4a6b8a] uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                  <FiMail size={18} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a2540] hover:bg-[#0d2e50] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-8 text-sm text-slate-500">
            Remembered your password?{" "}
            <Link to="/login" className="font-bold text-[#2e6171] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Forgot;
