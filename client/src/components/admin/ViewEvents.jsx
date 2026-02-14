// Modified ViewEvents.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaTrashAlt, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaStore, 
  FaTable,
  FaUsers 
} from "react-icons/fa";
import API_BASE_URL from '../../config.js';

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
    if (!window.confirm("Are you sure you want to delete this event? This will also remove associated stall types.")) return;

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Property Events</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your upcoming exhibitions and stall allocations</p>
        </div>
        <Link
          to="/admin-dashboard/create-property-event"
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-all shadow-sm hover:shadow-md font-semibold text-sm"
        >
          <FaCalendarAlt className="text-xs" />
          Create New Event
        </Link>
      </div>

      {loading && (
        <div className="p-20 text-center">
          <div className="animate-spin radial-progress text-teal-600 mb-4 inline-block"></div>
          <p className="text-gray-500 font-medium">Fetching events...</p>
        </div>
      )}

      {error && (
        <div className="m-8 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="px-8 py-20 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-gray-400 text-2xl" />
          </div>
          <p className="text-gray-600 font-medium">No events found.</p>
          <p className="text-gray-400 text-sm">Start by creating your first property event.</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Event Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Total Stalls</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Bookings</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Configuration</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((event, index) => (
                <tr key={event.id} className="group hover:bg-teal-50/30 transition-colors">
                  <td className="px-6 py-5 text-sm text-gray-400 font-medium">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <Link
                        to={`/admin-dashboard/manage-events/edit/${event.id}`}
                        className="text-gray-900 font-bold hover:text-teal-600 transition-colors"
                      >
                        {event.event_name}
                      </Link>
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <FaMapMarkerAlt className="text-teal-500" />
                        {event.city}, {event.state}
                      </span>
                      <span className="mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase w-fit">
                        {event.event_type || "General"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                        <FaCalendarAlt className="text-gray-400" />
                        {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <FaClock className="text-gray-400" />
                        {event.start_time || "N/A"} - {event.end_time || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold">
                      <FaStore className="text-[10px]" />
                      {event.stall_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                      <FaUsers className="text-[10px]" />
                      {event.booked_count || 0} / {event.stall_count || 0}
                    </div>
                    <Link
                      to={`/admin-dashboard/event-bookings/${event.id}`}
                      className="block mt-2 text-teal-600 hover:underline text-xs font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Link
                      to={`/admin-dashboard/manage-stall-types/${event.id}`}
                      className="inline-flex items-center gap-2 text-teal-600 hover:text-white border border-teal-600 hover:bg-teal-600 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      <FaTable />
                      Manage Stalls
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete event"
                    >
                      <FaTrashAlt />
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