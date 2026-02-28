import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config.js";
import { FaCheckCircle, FaStoreAlt, FaInfoCircle } from "react-icons/fa";

const StallCheckIn = () => {
  const { eventId, stallId } = useParams();
  const [stallInfo, setStallInfo] = useState(null); // To store fetched names
  const [mobile, setMobile] = useState("");
  const [status, setStatus] = useState("loading"); // Start with loading
  const [message, setMessage] = useState("");

  // Fetch Stall details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/events/stall-details/${stallId}`);
        setStallInfo(response.data);
        setStatus("idle");
      } catch (err) {
        setMessage("Could not load stall details.");
        setStatus("error");
      }
    };
    fetchDetails();
  }, [stallId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
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

  if (status === "loading") {
    return <div className="text-center mt-20 text-teal-600">Loading stall details...</div>;
  }

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto mt-10 sm:mt-20 p-6 sm:p-8 bg-white rounded-3xl shadow-xl text-center border border-teal-100 mx-4">
        <FaCheckCircle className="text-teal-500 text-5xl sm:text-6xl mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Check-in Complete</h2>
        <p className="text-gray-600 text-sm sm:text-base">{message}</p>
        <div className="mt-4 p-4 bg-teal-50 rounded-xl text-xs sm:text-sm text-teal-800">
          Logged for Stall #{stallInfo?.stall_number}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 sm:mt-20 p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-gray-100 mx-4">
      <div className="text-center mb-8">
        <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaStoreAlt className="text-teal-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Stall Check-In</h2>

        {stallInfo && (
          <div className="mt-4 space-y-1">
            <p className="text-teal-700 font-bold text-lg">{stallInfo.event_name}</p>
            <div className="flex justify-center gap-2 text-sm text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">Stall #{stallInfo.stall_number}</span>
              <span className="bg-gray-100 px-2 py-1 rounded">{stallInfo.stall_type_name}</span>
            </div>
            {stallInfo.builder_name && (
              <p className="text-xs text-gray-400 mt-2 italic">Exhibitor: {stallInfo.builder_name}</p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase ml-1">Your Registered Mobile</label>
          <input
            type="tel"
            required
            placeholder="Enter Mobile Number"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
            <FaInfoCircle /> {message}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-all active:scale-95 disabled:bg-gray-400"
        >
          {status === "submitting" ? "Verifying..." : "Confirm Attendance"}
        </button>
      </form>
    </div>
  );
};

export default StallCheckIn;