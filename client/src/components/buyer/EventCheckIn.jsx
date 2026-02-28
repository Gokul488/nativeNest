import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config.js";
import { FaCheckCircle, FaUserCheck } from "react-icons/fa";

const EventCheckIn = () => {
  const { eventId } = useParams();
  const [mobile, setMobile] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/events/mark-attendance`, {
        eventId,
        mobile_number: mobile
      });
      setMessage(response.data.message);
      setStatus("success");
    } catch (err) {
      setMessage(err.response?.data?.error || "Verification failed");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto mt-10 sm:mt-20 p-6 sm:p-8 bg-white rounded-3xl shadow-xl text-center border border-green-100 mx-4">
        <FaCheckCircle className="text-green-500 text-5xl sm:text-6xl mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Verified!</h2>
        <p className="text-gray-600 text-sm sm:text-base">{message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 sm:mt-20 p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-gray-100 mx-4">
      <div className="text-center mb-8">
        <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUserCheck className="text-teal-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Event Check-In</h2>
        <p className="text-gray-500 text-sm mt-2">Enter your registered mobile number to confirm attendance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
          <input
            type="tel"
            required
            placeholder="e.g. 9876543210"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        {status === "error" && (
          <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 disabled:bg-gray-400"
        >
          {status === "loading" ? "Verifying..." : "Confirm Attendance"}
        </button>
      </form>
    </div>
  );
};

export default EventCheckIn;