// ManageStallTypes.jsx — with correct preview remaining calculation

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE_URL from '../../config.js';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.07 } },
};

const ManageStallTypes = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [stallTypes, setStallTypes] = useState([]);
  const [eventTotal, setEventTotal] = useState(0);
  const [usedStalls, setUsedStalls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    stall_type_name: "",
    no_of_stalls: "",
    stall_price: "",
  });

  const [editingId, setEditingId] = useState(null);

  const fetchStallTypes = useCallback(async () => {
    if (!eventId) {
      setError("No event ID provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get(
        `${API_BASE_URL}/api/stalls/types/event/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const types = res.data.stallTypes || [];
      setStallTypes(types);
      setEventTotal(res.data.eventTotalStalls || 0);

      const totalUsed = types.reduce((sum, t) => sum + Number(t.no_of_stalls), 0);
      setUsedStalls(totalUsed);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stall types");
      if ([401, 403].includes(err.response?.status)) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [eventId, navigate]);

  useEffect(() => {
    fetchStallTypes();
  }, [fetchStallTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "no_of_stalls" || name === "stall_price"
          ? value === "" ? "" : Number(value)
          : value,
    }));
  };

  const resetForm = () => {
    setFormData({ stall_type_name: "", no_of_stalls: "", stall_price: "" });
    setEditingId(null);
    setError("");
  };

  // ────────────────────────────────────────────────
  //  PREVIEW REMAINING CALCULATION (this fixes the bug)
  // ────────────────────────────────────────────────
  const getPreviewRemaining = () => {
    let previewAllocated = usedStalls;

    if (editingId) {
      const originalType = stallTypes.find((t) => t.stall_type_id === editingId);
      if (originalType) {
        previewAllocated -= Number(originalType.no_of_stalls || 0);
      }
    }

    // Add what user is currently typing (or 0 if empty/invalid)
    previewAllocated += Number(formData.no_of_stalls || 0);

    return eventTotal - previewAllocated;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!formData.stall_type_name.trim()) {
      setError("Stall type name is required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.no_of_stalls || formData.no_of_stalls < 0) {
      setError("Valid number of stalls required");
      setIsSubmitting(false);
      return;
    }
    if (!formData.stall_price || formData.stall_price < 0) {
      setError("Valid price required");
      setIsSubmitting(false);
      return;
    }

    const preview = getPreviewRemaining();
    if (preview < 0) {
      setError(`Cannot save — would exceed capacity by ${Math.abs(preview)} stalls`);
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const base = `${API_BASE_URL}/api/stalls/types`;

      if (editingId) {
        await axios.put(`${base}/${editingId}/event/${eventId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Stall type updated ✓");
      } else {
        await axios.post(`${base}/event/${eventId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Stall type created ✓");
      }

      fetchStallTypes();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (type) => {
    setFormData({
      stall_type_name: type.stall_type_name,
      no_of_stalls: Number(type.no_of_stalls),
      stall_price: Number(type.stall_price),
    });
    setEditingId(type.stall_type_id);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this stall type?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/api/stalls/types/${id}/event/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Stall type removed");
      fetchStallTypes();
    } catch {
      setError("Delete failed");
    }
  };

  // Current real remaining (saved data)
  const currentRemaining = eventTotal - usedStalls;
  const isOverCapacity = currentRemaining < 0;

  // Preview value shown under input field
  const previewRemaining = getPreviewRemaining();
  const previewIsNegative = previewRemaining < 0;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50/60"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="text-gray-400 text-lg flex items-center gap-3"
        >
          <span>↻</span> Loading stall types...
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 group"
          >
            ← Back to Event
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Manage Stall Types
              </h1>
              <p className="mt-2 text-gray-600">
                Configure categories & pricing for this event
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={resetForm}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              + New Stall Type
            </motion.button>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {(error || success) && (
            <motion.div
              key={error ? "error" : "success"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3">
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3">
                  ✓ {success}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Capacity Overview (shows CURRENT saved state) */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-10 bg-white rounded-2xl shadow border border-gray-200/70 overflow-hidden"
        >
          <div className="px-6 py-5 bg-gray-50/80 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Event Capacity
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Stalls</p>
              <p className="text-3xl font-bold text-teal-700 mt-1">{eventTotal}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Allocated</p>
              <p className="text-3xl font-bold text-amber-700 mt-1">{usedStalls}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  isOverCapacity ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {currentRemaining}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-12 bg-white rounded-2xl shadow border border-gray-200/70 overflow-hidden"
        >
          <div className="px-6 py-5 bg-gray-50/80 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? "Edit Stall Type" : "Add New Stall Type"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="stall_type_name"
                  value={formData.stall_type_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Food • Merch • Sponsor..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="no_of_stalls"
                  value={formData.no_of_stalls}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all appearance-none"
                  placeholder="0"
                />
                <p
                  className={`mt-1.5 text-xs ${
                    previewIsNegative ? "text-red-600 font-medium" : "text-gray-500"
                  }`}
                >
                  Preview available after save: {previewRemaining}
                  {previewIsNegative && "  → over capacity!"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price / Stall (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stall_price"
                  value={formData.stall_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all appearance-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-8 py-3.5 rounded-xl font-medium text-white shadow-md transition-all ${
                  isSubmitting
                    ? "bg-teal-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingId
                  ? "Update Type"
                  : "Create Type"}
              </motion.button>

              {editingId && (
                <motion.button
                  type="button"
                  onClick={resetForm}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Table */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="bg-white rounded-2xl shadow border border-gray-200/70 overflow-hidden"
        >
          <div className="px-6 py-5 bg-gray-50/80 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Existing Stall Types ({stallTypes.length})
            </h2>
          </div>

          {stallTypes.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              className="p-12 text-center text-gray-500"
            >
              <p className="text-lg font-medium mb-2">No stall types yet</p>
              <p>Start by adding one above ↑</p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stallTypes.map((type) => (
                    <motion.tr
                      key={type.stall_type_id}
                      variants={fadeInUp}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {type.stall_type_name}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {type.no_of_stalls}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        ₹{Number(type.stall_price).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(type)}
                          className="text-teal-600 hover:text-teal-800 mr-5 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(type.stall_type_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ManageStallTypes;