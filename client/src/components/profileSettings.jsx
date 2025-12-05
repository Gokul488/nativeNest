import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from './config.js';
const ProfileSettings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("buyer");
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
        setAccountType(user.account_type || "buyer");
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
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/user`,
        { name, email, mobile_number: mobileNumber, password, account_type: accountType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      localStorage.setItem("user", JSON.stringify(response.data));
      setSuccess("Profile updated successfully!");
      setPassword(""); // Clear password field after successful update
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-8">Profile Settings</h2>
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
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              required
              pattern="\d{10}"
              title="Mobile number must be 10 digits"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep unchanged)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              required
            >
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
              <option value="agent">Agent</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium mx-auto"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;