// src/components/AddEditStallType.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaRupeeSign } from 'react-icons/fa';
import { Layers, Hash, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';
import API_BASE_URL from '../../config.js';

const AddEditStallType = () => {
  const { eventId, typeId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!typeId;

  const [formData, setFormData] = useState({ stall_type_name: "", no_of_stalls: "", stall_price: "" });
  const [eventData, setEventData] = useState({ total: 0, usedByOthers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/stalls/types/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const types = res.data.stallTypes || [];
        const total = res.data.eventTotalStalls || 0;
        const usedByOthers = types
          .filter(t => t.stall_type_id !== Number(typeId))
          .reduce((sum, t) => sum + Number(t.no_of_stalls), 0);
        setEventData({ total, usedByOthers });
        if (isEditing) {
          const currentType = types.find(t => t.stall_type_id === Number(typeId));
          if (currentType) {
            setFormData({
              stall_type_name: currentType.stall_type_name,
              no_of_stalls: currentType.no_of_stalls,
              stall_price: currentType.stall_price,
            });
          }
        }
      } catch (err) {
        setError("Failed to initialize form data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, typeId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "stall_type_name" ? value : value === "" ? "" : Number(value)
    }));
  };

  const previewRemaining = eventData.total - (eventData.usedByOthers + Number(formData.no_of_stalls || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (previewRemaining < 0) { setError(`Event capacity exceeded by ${Math.abs(previewRemaining)} stalls`); return; }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${API_BASE_URL}/api/stalls/types/${typeId}/event/${eventId}`
        : `${API_BASE_URL}/api/stalls/types/event/${eventId}`;
      await axios[isEditing ? "put" : "post"](url, formData, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(isEditing ? "Stall type updated successfully!" : "Stall type created successfully!");
      setTimeout(() => navigate(`/admin-dashboard/manage-stall-types/${eventId}`), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save stall type");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[400px] gap-3 text-slate-400">
      <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      <span className="text-sm font-semibold">Loading form details…</span>
    </div>
  );

  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-focus-within:text-indigo-500 transition-colors";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <div className="mb-4 flex items-center">
        <Link
          to={`/admin-dashboard/manage-stall-types/${eventId}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors font-medium text-sm"
        >
          <FaArrowLeft size={11} /> Back to Stall Management
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              {isEditing ? "Edit Stall Type" : "Add New Stall Type"}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Configure the inventory and pricing for this event
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="px-6 py-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-2.5 rounded-xl mb-5 border border-red-100 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 px-3 py-2.5 rounded-xl mb-5 border border-green-100 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stall Name */}
            <div className="group">
              <label className={labelClass}>Stall Type Name</label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  name="stall_type_name"
                  value={formData.stall_type_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Premium Corner Stall"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="group">
                <label className={labelClass}>Quantity</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="number"
                    name="no_of_stalls"
                    value={formData.no_of_stalls}
                    onChange={handleChange}
                    min="1"
                    className={inputClass}
                    placeholder="0"
                    required
                  />
                </div>
                <div className={`mt-2 px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border ${
                  previewRemaining < 0
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-indigo-50 text-indigo-600 border-indigo-100"
                }`}>
                  Remaining Capacity: {previewRemaining}
                </div>
              </div>

              {/* Price */}
              <div className="group">
                <label className={labelClass}>Price per Stall</label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={14} />
                  <input
                    type="number"
                    name="stall_price"
                    value={formData.stall_price}
                    onChange={handleChange}
                    min="0"
                    className={inputClass}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-2/5 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Save className="w-4 h-4" /> {isEditing ? "Update" : "Create"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditStallType;