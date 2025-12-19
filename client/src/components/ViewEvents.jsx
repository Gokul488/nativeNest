// src/components/ViewEvents.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrashAlt, FaCalendarAlt } from "react-icons/fa";
import API_BASE_URL from "../config";

const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load events.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(events.filter((event) => event.id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Failed to delete event.");
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">All Property Events</h2>
        <Link
          to="/admin-dashboard/create-property-event"
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-medium flex items-center gap-2"
        >
          <FaCalendarAlt />
          Create New Event
        </Link>
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
          No events found. Create your first event!
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
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
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event, index) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/admin-dashboard/manage-events/edit/${event.id}`}
                      className="text-teal-600 hover:text-teal-800 hover:underline font-medium"
                    >
                      {event.event_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {event.event_type || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {event.event_location}, {event.city}, {event.state}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(event.start_date).toLocaleDateString()} -{" "}
                    {new Date(event.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {event.start_time || "-"} to {event.end_time || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-xl">
                        delete
                      </span>
                    </button>
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

export default ViewEvents;