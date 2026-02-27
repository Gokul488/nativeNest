// src/components/builderProfileSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config.js';
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiSettings, FiCheckCircle, FiAlertCircle, FiBriefcase } from "react-icons/fi";

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
      const payload = { name, email, mobile_number: mobileNumber, contact_person: contactPerson };
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

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-600 text-white rounded-lg shadow-teal-200 shadow-lg">
              <FiSettings size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Builder Profile Settings</h2>
              <p className="text-gray-500 text-sm">Manage your company profile and contact information</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 flex items-center gap-3">
              <FiAlertCircle className="shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 border border-green-200 flex items-center gap-3">
              <FiCheckCircle className="shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-teal-600">Company Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiBriefcase size={18} /></div>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-gray-50/30" required />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-teal-600">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiMail size={18} /></div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-gray-50/30" required />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-teal-600">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiPhone size={18} /></div>
                  <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-gray-50/30" maxLength="10" required />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-teal-600">Contact Person</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiUser size={18} /></div>
                  <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-gray-50/30" required />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-teal-600">New Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiLock size={18} /></div>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Keep blank to stay same" className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-gray-50/30" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}</button>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-teal-600">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiLock size={18} /></div>
                  <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={!password.trim()} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-gray-50/30 disabled:opacity-50" />
                  {password.trim() && <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}</button>}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 flex justify-center">
              <button type="submit" disabled={isSubmitting || (password && password !== confirmPassword)} className="w-full sm:w-1/2 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {isSubmitting ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FiCheckCircle size={18} />Update</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuilderProfileSettings;