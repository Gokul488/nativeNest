// src/components/AddEditStallType.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaLayerGroup, FaRupeeSign, FaHashtag, FaSave, FaExclamationCircle } from 'react-icons/fa';
import API_BASE_URL from '../../config.js';

const AddEditStallType = () => {
  const { eventId, typeId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!typeId;

  const [formData, setFormData] = useState({
    stall_type_name: "",
    no_of_stalls: "",
    stall_price: "",
  });

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
    setError("");
    setSuccess("");

    if (previewRemaining < 0) {
      setError(`Event capacity exceeded by ${Math.abs(previewRemaining)} stalls`);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = isEditing 
        ? `${API_BASE_URL}/api/stalls/types/${typeId}/event/${eventId}`
        : `${API_BASE_URL}/api/stalls/types/event/${eventId}`;
      
      const method = isEditing ? "put" : "post";
      await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });
      
      setSuccess(isEditing ? "Stall type updated successfully!" : "Stall type created successfully!");
      
      setTimeout(() => {
        navigate(`/admin-dashboard/manage-stall-types/${eventId}`);
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to save stall type");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px] text-gray-500">
      <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mr-3"></div>
      Loading form details...
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header / Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          to={`/admin-dashboard/manage-stall-types/${eventId}`}
          className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm"
        >
          <FaArrowLeft size={12} /> Back to Stall Management
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-600 text-white rounded-lg shadow-teal-200 shadow-lg">
              <FaLayerGroup size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? "Edit Stall Type" : "Add New Stall Type"}
              </h2>
              <p className="text-gray-500 text-sm">Configure the inventory and pricing for this event</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 flex items-center gap-3">
              <FaExclamationCircle className="shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 border border-green-200 flex items-center gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Stall Name */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-teal-600">
                  Stall Type Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaLayerGroup size={16} />
                  </div>
                  <input
                    type="text"
                    name="stall_type_name"
                    value={formData.stall_type_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-gray-50/30"
                    placeholder="e.g. Premium Corner Stall"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Number of Stalls */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-teal-600">
                    Quantity
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaHashtag size={16} />
                    </div>
                    <input
                      type="number"
                      name="no_of_stalls"
                      value={formData.no_of_stalls}
                      onChange={handleChange}
                      min="1"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-gray-50/30"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 ${
                    previewRemaining < 0 ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-700"
                  }`}>
                    Remaining Capacity: {previewRemaining}
                  </div>
                </div>

                {/* Price */}
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-teal-600">
                    Price per Stall
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaRupeeSign size={16} />
                    </div>
                    <input
                      type="number"
                      name="stall_price"
                      value={formData.stall_price}
                      onChange={handleChange}
                      min="0"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none bg-gray-50/30"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Centered Button Container */}
            <div className="pt-8 border-t border-gray-100 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-1/4 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-teal-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaSave size={18} />
                    {isEditing ? "Update" : "Create"}
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

export default AddEditStallType;