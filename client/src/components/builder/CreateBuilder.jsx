// client/src/components/builder/CreateBuilder.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiPlus, FiTrash2 } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import API_BASE_URL from "../../config.js";
import CountryCodeDropdown from "../common/CountryCodeDropdown.jsx";

const CreateBuilder = () => {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const [subBuilders, setSubBuilders] = useState([{
    name: "",
    email: "",
    mobile_number: "",
    countryCode: "+91",
    password: "",
    showPassword: false
  }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // If not a builder account, redirect
    if (currentUser.account_type !== "builder") {
      navigate("/builder-dashboard");
    }
  }, [navigate, currentUser.account_type]);

  const handleAddBuilder = () => {
    setSubBuilders([...subBuilders, {
      name: "",
      email: "",
      mobile_number: "",
      countryCode: "+91",
      password: "",
      showPassword: false
    }]);
  };

  const handleRemoveBuilder = (index) => {
    setSubBuilders(subBuilders.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...subBuilders];
    updated[index][field] = value;
    setSubBuilders(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    for (let i = 0; i < subBuilders.length; i++) {
      const b = subBuilders[i];
      if (!b.name || !b.email || !b.mobile_number || !b.password) {
        setError(`Please fill all fields for Builder #${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        subBuilders: subBuilders.map(b => ({
          name: b.name,
          email: b.email,
          mobile_number: `${b.countryCode}${b.mobile_number}`,
          password: b.password
        }))
      };

      await axios.post(`${API_BASE_URL}/api/builder/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess("Builders created successfully!");
      setSubBuilders([{ name: "", email: "", mobile_number: "", countryCode: "+91", password: "", showPassword: false }]);
      setTimeout(() => navigate("/builder-dashboard/manage-builders"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create builders");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser.account_type !== "builder") return null;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Create New Builders</h2>
        <p className="text-sm text-slate-500 mt-1">Add new sub-builders/team members to your company.</p>
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
        {subBuilders.map((builder, index) => (
          <div key={index} className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl relative group">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-700">Builder #{index + 1}</h3>
              {subBuilders.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBuilder(index)}
                  className="text-red-400 hover:text-red-600 transition-colors bg-red-50 p-2 rounded-xl"
                  title="Remove Builder"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Builder Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={builder.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    required
                    placeholder="Name"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={builder.email}
                    onChange={(e) => handleChange(index, "email", e.target.value)}
                    required
                    placeholder="builder@example.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
                <div className="flex">
                  <CountryCodeDropdown
                    selectedCode={builder.countryCode}
                    onChange={(code) => handleChange(index, "countryCode", code)}
                  />
                  <input
                    type="tel"
                    value={builder.mobile_number}
                    onChange={(e) => handleChange(index, "mobile_number", e.target.value)}
                    required
                    maxLength={12}
                    placeholder="Mobile Number"
                    className="flex-1 px-4 py-2.5 bg-white border border-l-0 border-slate-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={builder.showPassword ? "text" : "password"}
                    value={builder.password}
                    onChange={(e) => handleChange(index, "password", e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange(index, "showPassword", !builder.showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {builder.showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={handleAddBuilder}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-full text-sm font-bold border border-sky-100 transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" /> Add Another Builder
          </button>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/builder-dashboard/manage-builders")}
            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-sky-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save Builders"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBuilder;
