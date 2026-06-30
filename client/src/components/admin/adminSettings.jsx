// src/components/admin/adminSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config.js';
import { Settings, CheckCircle2, AlertCircle, Loader2, MessageSquare, ShieldAlert } from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    whatsapp_send_to_builder: false
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Check if the current user is SuperAdmin
    const user = JSON.parse(localStorage.getItem("user")) || {};
    setUserRole(user.admin_type || "");

    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSettings({
          whatsapp_send_to_builder: response.data.whatsapp_send_to_builder === true || response.data.whatsapp_send_to_builder === "true"
        });
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch application settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = () => {
    setSettings(prev => ({
      ...prev,
      whatsapp_send_to_builder: !prev.whatsapp_send_to_builder
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Settings updated successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (userRole !== "SuperAdmin") {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-lg">
        <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-black text-slate-800">Access Restricted</h3>
        <p className="text-slate-400 text-sm mt-2">
          Only users with SuperAdmin privileges are authorized to access and modify application settings.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 md:px-0">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 shadow-sm border border-sky-100/50">
              <Settings className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Application Settings</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Configure global behavior and notification paths for NativeNest
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-6 border border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-2xl mb-6 border border-green-100 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Setting Item */}
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md hover:border-sky-100">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Route WhatsApp Messages to Builder</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    When enabled, "I'm Interested" button clicks on the property detail pages will open chat windows to both the <strong>SuperAdmin</strong> and the <strong>builder</strong> (who posted the listing). If disabled, it opens to the SuperAdmin only.
                  </p>
                </div>
              </div>

              {/* IOS Styled Switch Toggle */}
              <div className="flex items-center shrink-0">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={settings.whatsapp_send_to_builder}
                    onChange={handleToggle}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-1/3 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Settings
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

export default AdminSettings;
