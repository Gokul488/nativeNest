// src/components/MyRegisteredEvents.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from '../../config.js';

const MyRegisteredEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view your registered events.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/buyer/events/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data);
      } catch (err) {
        setError("Failed to load your registered events.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">My Registered Events</h2>
        <p className="text-gray-600 mt-2">Events you have successfully registered for</p>
      </div>

      {loading && (
        <div className="p-8 text-center text-gray-500">Loading your events...</div>
      )}

      {error && (
        <div className="mx-6 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          You haven't registered for any events yet.
          <br />
          <span className="text-teal-600 font-medium">Explore available events to get started!</span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRegisteredEvents;