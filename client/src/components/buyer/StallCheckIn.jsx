import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config.js";
import { FaCheckCircle, FaStoreAlt } from "react-icons/fa";

const StallCheckIn = () => {
  const { eventId, stallId } = useParams(); // URL now contains unique stallId
  const [mobile, setMobile] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/events/mark-stall-attendance`, {
        eventId,
        stallId,
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
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl text-center border border-teal-100">
        <FaCheckCircle className="text-teal-500 text-6xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Check-in Complete</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaStoreAlt className="text-teal-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Stall Check-In</h2>
        <p className="text-gray-500 text-sm mt-2">Confirm your visit to Stall ID: {stallId}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="tel"
          required
          placeholder="Registered Mobile Number"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        {status === "error" && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{message}</p>}
        <button type="submit" className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold">
          {status === "loading" ? "Verifying..." : "Confirm Attendance"}
        </button>
      </form>
    </div>
  );
};

export default StallCheckIn;