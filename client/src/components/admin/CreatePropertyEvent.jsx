// Modified CreatePropertyEvent.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../../config.js';

const CreatePropertyEvent = () => {
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "stall_count" ? parseInt(value) || 0 : value }));
  };

  const handleBannerImageChange = (e) => {
    setBannerImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      if (bannerImage) {
        data.append('banner_image', bannerImage);
      }

      await axios.post(
        `${API_BASE_URL}/api/admin/events`,
        data,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      setSuccess("Event created successfully!");
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to create event. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Create Property Exhibition Event
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Event Name & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="event_name"
              placeholder="e.g., Grand Property Expo 2026"
              value={formData.event_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="Property Expo">Property Expo</option>
              <option value="Property Sale Mela">Property Sale Mela</option>
              <option value="Builder Meet">Builder Meet</option>
              <option value="Open House">Open House</option>
            </select>
          </div>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="event_location"
              placeholder="e.g., Convention Center"
              value={formData.event_location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              placeholder="e.g., Chennai"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              placeholder="e.g., Tamil Nadu"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stall Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Stalls
          </label>
          <input
            type="number"
            name="stall_count"
            placeholder="e.g., 50"
            value={formData.stall_count}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person Name
            </label>
            <input
              type="text"
              name="contact_name"
              placeholder="e.g., John Doe"
              value={formData.contact_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone Number
            </label>
            <input
              type="text"
              name="contact_phone"
              placeholder="e.g., +91 98765 43210"
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Description
          </label>
          <textarea
            name="description"
            placeholder="Provide details about the event, highlights, participating builders, etc."
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerImageChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium px-8 py-4 rounded-lg transition transform hover:scale-105 disabled:scale-100 shadow-lg"
          >
            {isSubmitting ? "Creating Event..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePropertyEvent;