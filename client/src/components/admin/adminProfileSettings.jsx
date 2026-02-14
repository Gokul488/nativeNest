// src/components/adminProfileSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config.js';

const AdminProfileSettings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const admin = response.data;
        setName(admin.name || "");
        setEmail(admin.email || "");
        setMobileNumber(admin.mobile_number || "");

        localStorage.setItem(
          "user",
          JSON.stringify({ ...admin, account_type: "admin" })
        );
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch admin details");
      }
    };

    fetchAdmin();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !mobileNumber) {
      setError("All fields are required");
      return;
    }

    if (mobileNumber.length !== 10 || !/^\d+$/.test(mobileNumber)) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/admin`,
        {
          name,
          email,
          mobile_number: mobileNumber,
          password, // Optional
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify({ ...response.data, account_type: "admin" })
      );

      setSuccess("Profile updated successfully!");
      setPassword(""); // Clear password field
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Admin Profile Settings
      </h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) =>
              setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            maxLength="10"
            pattern="\d{10}"
            title="Mobile number must be 10 digits"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password (leave blank to keep current)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter only if you want to change password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition font-medium text-lg"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfileSettings;