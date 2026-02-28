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
          <div className="absolute inset-0 bg-white/80 z-20 flex flex-col justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            <p className="font-medium text-sm">Loading your registrations...</p>
          </div>
        )}

        {error && (
          <div className="m-4 sm:m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2 text-sm">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="py-24 text-center text-gray-400 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-5xl opacity-20" />
            <p className="text-lg font-medium">No registered events found</p>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <>
            {/* Desktop View Table */}
            <div className="hidden xl:block overflow-x-auto">
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
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
                          {event.event_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-teal-600 font-medium bg-teal-50/50 px-2 py-0.5 rounded-md w-fit">
                          <FaMapMarkerAlt size={10} />
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
                          <span className="flex items-center gap-1 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                            <FaCalendarAlt className="text-teal-500" />
                            {new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <div className="h-2 w-px bg-gray-300"></div>
                          <span className="font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
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

            {/* Mobile/Tablet View Cards */}
            <div className="xl:hidden flex flex-col gap-4 p-4">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">#{String(index + 1).padStart(2, '0')}</span>
                        <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {event.event_type || "Exhibition"}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 leading-tight">{event.event_name}</h4>
                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-teal-500" size={10} /> {event.city}, {event.state}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-gray-100">
                    <div className="text-center border-r border-gray-100 pr-2">
                      <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5">Event Start</p>
                      <p className="text-xs font-bold text-gray-700">{new Date(event.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className="text-center pl-2">
                      <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5">Event End</p>
                      <p className="text-xs font-bold text-gray-700">{new Date(event.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/buyer-dashboard/my-events/builders/${event.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-100 active:scale-95 transition-transform"
                  >
                    <FaBuilding size={14} /> View Participating Builders
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyRegisteredEvents;