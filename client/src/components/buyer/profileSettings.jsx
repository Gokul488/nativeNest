// src/components/profileSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from '../../config.js';
import { FiEye, FiEyeOff } from "react-icons/fi";

const ProfileSettings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data;
        setName(user.name || "");
        setEmail(user.email || "");
        setMobileNumber(user.mobile_number || "");
        localStorage.setItem("user", JSON.stringify(user));
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch user details");
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setError("New password and confirm password do not match");
        return;
      }
      if (password.length < 6) {
        setError("New password must be at least 6 characters long");
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        name,
        email,
        mobile_number: mobileNumber,
      };

      if (password && password.trim() !== "") {
        payload.password = password;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/user`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.name) {
        localStorage.setItem("user", JSON.stringify(response.data));
      } else {
        const refreshed = await axios.get(`${API_BASE_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("user", JSON.stringify(refreshed.data));
      }

      setSuccess("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Profile Settings
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            required
            pattern="\d{10}"
            title="Mobile number must be 10 digits"
            maxLength={10}
          />
        </div>

        {/* New Password with eye toggle */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password (leave blank to keep current)
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter only if you want to change password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* Confirm Password with eye toggle */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            disabled={!password.trim()}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition pr-10 ${
              password && confirmPassword && password !== confirmPassword
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
            }`}
          />
          {password.trim() && (
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className={`bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition font-medium text-lg ${
              password && confirmPassword && password !== confirmPassword
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={password && confirmPassword && password !== confirmPassword}
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;