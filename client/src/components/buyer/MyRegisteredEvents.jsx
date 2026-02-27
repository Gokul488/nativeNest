// src/components/MyRegisteredEvents.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaSearch, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaBuilding,
  FaChevronRight
} from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const MyRegisteredEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredEvents = useMemo(() => {
    return events.filter(e => 
      e.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">My Registered Events</h2>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {events.length} Registered
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your registered events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            Loading your events...
          </div>
        )}

        {error && (
          <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No registered events found.</p>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                  <th className="w-1/3 px-6 py-4 text-left border-b border-gray-200">Event Details</th>
                  <th className="w-40 px-4 py-4 text-center border-b border-gray-200">Type</th>
                  <th className="w-48 px-4 py-4 text-center border-b border-gray-200">Date Range</th>
                  <th className="w-48 px-6 py-4 text-center border-b border-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredEvents.map((event, index) => (
                  <tr key={event.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-5 border-b border-gray-100">
                      <div className="font-bold text-gray-900 mb-1">{event.event_name}</div>
                      <div className="flex items-center gap-2 text-xs text-teal-600 font-medium">
                        <FaMapMarkerAlt size={12} />
                        <span className="truncate">
                          {event.city}, {event.state}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center border-b border-gray-100">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        {event.event_type || "Exhibition"}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center border-b border-gray-100">
                      <div className="flex flex-col items-center text-xs text-gray-600 gap-1">
                        <span className="flex items-center gap-1 font-medium">
                          <FaCalendarAlt className="text-teal-500" />
                          {new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <div className="h-2 w-px bg-gray-300"></div>
                        <span className="font-medium">
                          {new Date(event.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 border-b border-gray-100 text-center">
                      <button
                        onClick={() => navigate(`/buyer-dashboard/my-events/builders/${event.id}`)}
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                      >
                        <FaBuilding /> View Builders <FaChevronRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegisteredEvents;