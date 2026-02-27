// src/components/EditPropertyEvent.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaCloudUploadAlt, 
  FaImage,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaEdit
} from 'react-icons/fa';
import API_BASE_URL from '../../config.js';

const EditPropertyEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    event_name: "",
    event_type: "Property Sale Mela",
    event_location: "",
    city: "",
    state: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    description: "",
    contact_name: "",
    contact_phone: "",
    stall_count: 0,
  });

  const [bannerImage, setBannerImage] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication missing. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/admin/events/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const event = response.data;
        setFormData({
          ...event,
          start_date: event.start_date ? event.start_date.split('T')[0] : "",
          end_date: event.end_date ? event.end_date.split('T')[0] : "",
          stall_count: event.stall_count || 0,
        });
        setCurrentBanner(event.banner_image);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load event data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
        ...prev, 
        [name]: name === "stall_count" ? parseInt(value) || 0 : value 
    }));
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size exceeds 5MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(file);
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate('/login'); return; }

      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      if (bannerImage) {
        data.append('banner_image', bannerImage);
      }

      await axios.put(
        `${API_BASE_URL}/api/admin/events/${id}`,
        data,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      setSuccess("Event updated successfully!");
      setTimeout(() => {
        navigate("/admin-dashboard/manage-events");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 font-medium">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
        Loading event data...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px] font-sans">
      {/* Top Header - Consistent Design */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin-dashboard/manage-events" 
            className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-200 text-gray-600"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Edit Event</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Event Management System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
            <FaEdit /> Editor Mode
          </span>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3">
            <FaExclamationTriangle /> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center gap-3">
            <FaCheckCircle /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-semibold text-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Event Type
              </label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-semibold text-gray-800 bg-white"
              >
                <option value="Property Expo">Property Expo</option>
                <option value="Property Sale Mela">Property Sale Mela</option>
                <option value="Builder Meet">Builder Meet</option>
                <option value="Open House">Open House</option>
              </select>
            </div>
          </div>

          {/* Section 2: Location Details */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
            <h3 className="text-gray-800 font-bold flex items-center gap-2"><FaMapMarkerAlt className="text-teal-600"/> Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Venue Location</label>
                    <input type="text" name="event_location" value={formData.event_location} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-teal-500 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-teal-500 outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-teal-500 outline-none" />
                </div>
            </div>
          </div>

          {/* Section 3: Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Schedule Dates</label>
               <div className="grid grid-cols-2 gap-4">
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-500 outline-none" />
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required className="px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-500 outline-none" />
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Timings</label>
               <div className="grid grid-cols-2 gap-4">
                  <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-500 outline-none" />
                  <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-500 outline-none" />
               </div>
            </div>
          </div>

          {/* Section 4: Contact & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><FaUser/> Contact Person</label>
              <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><FaPhoneAlt/> Phone</label>
              <input type="text" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Stall Count</label>
              <input type="number" name="stall_count" value={formData.stall_count} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-teal-500 outline-none" />
            </div>
          </div>

          {/* Section 5: Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Event Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-gray-700 resize-none"
            />
          </div>

          {/* Section 6: Image Upload & Preview */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Update Banner Image</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="relative group">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-teal-50 hover:border-teal-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-teal-500 mb-3 transition-colors" />
                    <p className="mb-1 text-sm text-gray-600 font-semibold">Change banner image</p>
                    <p className="text-xs text-gray-400">PNG, JPG or WebP (Max 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleBannerImageChange} />
                </label>
              </div>

              <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 h-48 group bg-gray-50">
                <img 
                  src={previewUrl || currentBanner} 
                  alt="Banner Preview" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">
                    <FaImage className="inline mr-2" /> {previewUrl ? "New Preview" : "Current Banner"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex items-center gap-3 bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg hover:shadow-teal-200 transform hover:-translate-y-1 active:translate-y-0 disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Updating Event...</span>
                </>
              ) : (
                <>
                  <span>Save Changes</span>
                  <FaCheckCircle className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyEvent;