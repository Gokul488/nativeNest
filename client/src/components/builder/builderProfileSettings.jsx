// src/components/builder/builderProfileSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config.js";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiBriefcase } from "react-icons/fi";
import { Settings, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const BuilderProfileSettings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBuilder = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/builder`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const builder = response.data;
        setName(builder.name || "");
        setEmail(builder.email || "");
        setMobileNumber(builder.mobile_number || "");
        setContactPerson(builder.contact_person || "");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch builder details");
      }
    };
    fetchBuilder();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (password && password !== confirmPassword) {
      setError("New password and confirm password do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name,
        email,
        mobile_number: mobileNumber,
        contact_person: contactPerson,
      };
      if (password.trim()) payload.password = password;

      const response = await axios.put(`${API_BASE_URL}/api/builder`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.builder) {
        localStorage.setItem("user", JSON.stringify(response.data.builder));
        setSuccess("Profile updated successfully!");
      }
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";

  const labelClass =
    "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-500 transition-colors";

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 md:px-0">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              Builder Profile Settings
            </h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Manage your company profile and contact information
            </p>
          </div>
        </div>

        {/* ── Form Body ── */}
        <div className="px-6 py-5">
          {/* Alerts */}
          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2.5 rounded-xl mb-4 border border-red-100 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 px-3 py-2.5 rounded-xl mb-4 border border-green-100 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1: Company Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="group">
                <label className={labelClass}>Company Name</label>
                <div className="relative">
                  <FiBriefcase
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
                    size={14}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div className="group">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <FiMail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
                    size={14}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Mobile + Contact Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="group">
                <label className={labelClass}>Mobile Number</label>
                <div className="relative">
                  <FiPhone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
                    size={14}
                  />
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className={inputClass}
                    maxLength="10"
                    required
                  />
                </div>
              </div>
              <div className="group">
                <label className={labelClass}>Contact Person</label>
                <div className="relative">
                  <FiUser
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
                    size={14}
                  />
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password divider */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Change Password
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Row 3: Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              <div className="group">
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <FiLock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
                    size={14}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <FiLock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
                    size={14}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!password.trim()}
                    placeholder={
                      !password.trim()
                        ? "Enter new password first"
                        : "Re-enter new password"
                    }
                    className={`${inputClass} pr-10 disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {password.trim() && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={14} />
                      ) : (
                        <FiEye size={14} />
                      )}
                    </button>
                  )}
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Passwords do not match
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting || (password && password !== confirmPassword)}
                className="w-full sm:w-2/5 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuilderProfileSettings;