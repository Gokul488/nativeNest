// src/components/MyRegisteredEvents.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from '../../config.js';

const MyRegisteredEvents = () => {
  const navigate = useNavigate();
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

        const res = await axios.get(`${API_BASE_URL}/api/buyer/events/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
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
        <p className="text-gray-600 mt-2">
          Events you have successfully registered for
        </p>
      </div>

      {loading && (
        <div className="p-8 text-center text-gray-500">
          Loading your events...
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          You haven't registered for any events yet.<br />
          <span className="text-teal-600 font-medium">
            Explore upcoming events to get started!
          </span>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="divide-y divide-gray-200">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-6 hover:bg-gray-50 transition"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.event_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.event_type} • {event.city}, {event.state}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(event.start_date).toLocaleDateString('en-IN')} –{" "}
                    {new Date(event.end_date).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/buyer-dashboard/my-events/builders/${event.id}`)}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium min-w-[170px] bg-teal-600 hover:bg-teal-700 text-white transition"
                >
                  View Participating Builders
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegisteredEvents;