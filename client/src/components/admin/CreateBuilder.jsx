import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiBriefcase } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import API_BASE_URL from "../../config.js";
import CountryCodeDropdown from "../common/CountryCodeDropdown.jsx";

const CreateBuilder = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    mobile_number: "",
    password: "",
    confirm_password: "",
    contact_person_2: "",
    email_2: "",
    mobile_number_2: "",
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [countryCode2, setCountryCode2] = useState("+91");
  const [showSecondOwner, setShowSecondOwner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    // If not Admin/SuperAdmin, don't allow access
    if (currentUser.admin_type !== "SuperAdmin" && currentUser.admin_type !== "Admin") {
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
      const payload = { 
        name: formData.name,
        contact_person: formData.contact_person,
        email: formData.email,
        password: formData.password,
        mobile_number: `${countryCode}${formData.mobile_number}`,
        contact_person_2: showSecondOwner && formData.contact_person_2 ? formData.contact_person_2 : null,
        email_2: showSecondOwner && formData.email_2 ? formData.email_2 : null,
        mobile_number_2: showSecondOwner && formData.mobile_number_2 ? `${countryCode2}${formData.mobile_number_2}` : null
      };
      await axios.post(`${API_BASE_URL}/api/builder/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("BuilderAdmin created successfully!");
      setFormData({ name: "", contact_person: "", email: "", mobile_number: "", password: "", confirm_password: "", contact_person_2: "", email_2: "", mobile_number_2: "" });
      setTimeout(() => navigate("/admin-dashboard/manage-builders"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create builder");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser.admin_type !== "SuperAdmin" && currentUser.admin_type !== "Admin") return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Create New BuilderAdmin</h2>
        <p className="text-sm text-slate-500 mt-1">Add a new builder administrator to the system.</p>
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
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Company Name</label>
            <div className="relative group">
              <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Company Name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Contact Person</label>
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                required
                placeholder="Contact Person Name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="builder@nativenest.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
            <div className="flex">
              <CountryCodeDropdown
                selectedCode={countryCode}
                onChange={setCountryCode}
              />
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                required
                maxLength={12}
                placeholder="Number"
                className="flex-1 px-4 py-3 bg-slate-50 border border-l-0 border-slate-200 rounded-r-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Toggle Second Owner */}
          <div className="md:col-span-2 flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              <span className="text-sm font-bold text-slate-700">BuilderAdmin</span>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Add an optional secondary contact person for this builder company.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSecondOwner(!showSecondOwner)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-100 text-xs font-bold transition-all cursor-pointer"
            >
              {showSecondOwner ? "- Remove" : "+ Add"}
            </button>
          </div>

          {showSecondOwner && (
            <>
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">contactperson2</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    name="contact_person_2"
                    value={formData.contact_person_2}
                    onChange={handleChange}
                    placeholder="Second Contact Person Name"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Second Email Address</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    name="email_2"
                    value={formData.email_2}
                    onChange={handleChange}
                    placeholder="secondowner@nativenest.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Second Mobile Number</label>
                <div className="flex w-full md:w-1/2">
                  <CountryCodeDropdown
                    selectedCode={countryCode2}
                    onChange={setCountryCode2}
                  />
                  <input
                    type="tel"
                    name="mobile_number_2"
                    value={formData.mobile_number_2}
                    onChange={handleChange}
                    maxLength={12}
                    placeholder="Number"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-l-0 border-slate-200 rounded-r-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>
              </div>
            </>
          )}

          <div className="md:col-span-2 border-t border-slate-100 pt-4">
            <span className="text-sm font-bold text-slate-700">Credentials</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
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
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin-dashboard/manage-builders")}
            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create BuilderAdmin"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBuilder;
