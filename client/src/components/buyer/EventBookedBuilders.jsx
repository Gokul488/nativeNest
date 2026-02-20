// src/components/EventBookedBuilders.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config.js";

const EventBookedBuilders = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    const fetchBookedBuilders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");

        const res = await axios.get(
          `${API_BASE_URL}/api/buyer/events/${eventId}/booked-builders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBuilders(res.data.builders || []);
        setEventName(res.data.event_name || "Event");
      } catch (err) {
        console.error(err);
        setError("Could not load participating builders.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookedBuilders();
  }, [eventId]);

  const handleRegisterInterest = async (builder) => {
    if (!builder.sample_stall_type_id) {
      alert("No stall type available for this builder.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/buyer/events/stall-interest`,
        {
          eventId,
          stallTypeId: builder.sample_stall_type_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI optimistically
      setBuilders(prev =>
        prev.map(b =>
          b.builder_id === builder.builder_id
            ? { ...b, interest_registered: true }
            : b
        )
      );

      alert(`Interest registered for ${builder.name}!`);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409 || err.response?.data?.error?.includes("already")) {
        alert("You already registered interest for a stall of this builder.");
      } else {
        alert("Failed to register interest. Please try again.");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Builders at {eventName}
          </h2>
          <p className="text-gray-600 mt-1">
            Register interest in builders who booked stalls
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
        >
          Back
        </button>
      </div>

      {loading && <div className="p-12 text-center text-gray-500">Loading...</div>}

      {error && (
        <div className="m-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && builders.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          No builders have booked stalls for this event yet.
        </div>
      )}

      {!loading && !error && builders.length > 0 && (
        <div className="divide-y divide-gray-200">
          {builders.map((b) => (
            <div
              key={b.builder_id}
              className="p-6 hover:bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{b.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {b.stall_count} stall{b.stall_count !== 1 ? "s" : ""} booked
                </p>
                {b.contact_person && (
                  <p className="text-sm text-gray-500 mt-1">
                    {b.contact_person} • {b.mobile_number || "—"}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleRegisterInterest(b)}
                disabled={b.interest_registered}
                className={`min-w-[180px] px-6 py-2.5 rounded-lg font-medium transition ${
                  b.interest_registered
                    ? "bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700 text-white"
                }`}
              >
                {b.interest_registered ? "Interest Registered ✓" : "Register Interest"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventBookedBuilders;