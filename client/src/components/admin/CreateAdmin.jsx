
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiShield } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import API_BASE_URL from "../../config.js";

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    password: "",
    confirm_password: "",
    admin_type: "Admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    // If not SuperAdmin, don't allow access
    if (currentUser.admin_type !== "SuperAdmin") {
      navigate("/admin-dashboard");
    }
  }, [navigate, currentUser.admin_type]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/admin/admin/create`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Admin created successfully!");
      setFormData({ name: "", email: "", mobile_number: "", password: "", confirm_password: "", admin_type: "Admin" });
      setTimeout(() => navigate("/admin-dashboard/manage-admins"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser.admin_type !== "SuperAdmin") return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Create New Admin</h2>
        <p className="text-sm text-slate-500 mt-1">Add a new administrator to the system.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-medium flex items-center gap-3">
          <FiCheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Admin Name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@nativenest.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
            <div className="relative group">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                required
                maxLength={10}
                placeholder="10-digit number"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Admin Category</label>
            <div className="relative group">
              <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <select
                name="admin_type"
                value={formData.admin_type}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all appearance-none cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">SuperAdmin</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/manage-admins")}
            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-sky-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create Admin"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdmin;
