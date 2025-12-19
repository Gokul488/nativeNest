// src/components/BuyerEvents.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

const BuyerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/buyer/events`);
        setEvents(response.data);
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

const handleParticipate = async () => {
  if (!selectedEvent) return;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_BASE_URL}/api/buyer/events/participate`,
      {
        eventId: selectedEvent.id,
        name: user.name || "Guest",
        phone: user.mobile_number,
        email: user.email || null,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Success alert with email note
    let successMessage = response.data.message;
    if (response.data.emailSent) {
      successMessage += "\n\n✅ A confirmation email has been sent to your registered email address.";
    } else {
      successMessage += "\n\nℹ️ No email provided — confirmation sent via registration only.";
    }

    alert(successMessage);

    setSelectedEvent(null);
    // Optional: refresh events list if needed
  } catch (err) {
    const errorMsg = err.response?.data?.error || "Registration failed. Please try again.";
    alert(errorMsg);
  }
};

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">Available Property Events</h2>
        <p className="text-gray-600 mt-2">Explore and register for upcoming property expos and events</p>
      </div>

      {loading && (
        <div className="p-8 text-center text-gray-500">Loading events...</div>
      )}

      {error && (
        <div className="mx-6 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          No events available at the moment. Check back soon!
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {event.event_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {event.event_type || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {event.event_location && `${event.event_location}, `}
                    {event.city}, {event.state}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(event.start_date).toLocaleDateString()} -{" "}
                    {new Date(event.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition font-medium"
                    >
                      Participate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Participation
            </h3>
            <p className="text-gray-700 mb-6">
              Register for <strong>{selectedEvent.event_name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleParticipate}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition font-medium"
              >
                Yes, Register Me
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerEvents;