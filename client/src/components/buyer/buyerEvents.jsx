// src/components/BuyerEvents.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTicketAlt
} from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const BuyerEvents = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/buyer/events`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setEvents(response.data);
      } catch (err) {
        setError("Failed to load events. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [token]);

  const filteredEvents = useMemo(() => {
    return events.filter(e =>
      e.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const handleParticipate = async () => {
    if (!selectedEvent) return;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/buyer/events/participate`,
        {
          eventId: selectedEvent.id,
          name: user.name || "Guest",
          phone: user.mobile_number,
          email: user.email || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message + (response.data.emailSent ? "\n\n✅ Confirmation email sent." : ""));

      setEvents((prev) =>
        prev.map((ev) => ev.id === selectedEvent.id ? { ...ev, isRegistered: 1 } : ev)
      );
      setSelectedEvent(null);
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Available Events</h2>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {events.length} Total
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event name or city..."
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
            Loading events...
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
            <p className="text-lg">No property events found.</p>
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <>
            {/* Desktop View Table - Only for large screens */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                    <th className="w-1/3 px-6 py-4 text-left border-b border-gray-200">Event Details</th>
                    <th className="w-40 px-4 py-4 text-center border-b border-gray-200">Type</th>
                    <th className="w-48 px-4 py-4 text-center border-b border-gray-200">Dates</th>
                    <th className="w-40 px-6 py-4 text-center border-b border-gray-200">Status</th>
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
                            {event.event_location ? `${event.event_location}, ` : ""}
                            {event.city}
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
                          <span className="flex items-center gap-1 font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                            <FaCalendarAlt className="text-teal-500" />
                            {new Date(event.start_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                          </span>
                          <div className="h-2 w-px bg-gray-300"></div>
                          <span className="font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                            {new Date(event.end_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100 text-center">
                        {event.isRegistered ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                            <FaCheckCircle /> Registered
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                          >
                            <FaTicketAlt /> Participate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet View Cards - For viewports below xl (1280px) */}
            <div className="xl:hidden flex flex-col gap-4 p-4 sm:p-6 bg-gray-50/30">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-bold border border-teal-100 uppercase tracking-widest">
                          {event.event_type || "Exhibition"}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{event.event_name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-teal-500" size={12} />
                        {event.event_location ? `${event.event_location}, ` : ""}{event.city}
                      </p>
                    </div>
                    {event.isRegistered && (
                      <span className="bg-green-100 text-green-700 p-2 rounded-full shadow-sm">
                        <FaCheckCircle size={18} />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex-1 text-center border-r border-gray-200 pr-2">
                      <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter mb-0.5">Start Date</p>
                      <p className="text-sm font-bold text-gray-700">{new Date(event.start_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className="flex-1 text-center pl-2">
                      <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter mb-0.5">End Date</p>
                      <p className="text-sm font-bold text-gray-700">{new Date(event.end_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    {event.isRegistered ? (
                      <div className="w-full text-center py-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 flex items-center justify-center gap-2">
                        <FaCheckCircle /> Successfully Registered
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-100 active:scale-[0.98] transition-all"
                      >
                        <FaTicketAlt size={14} /> Participate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
                <FaCalendarAlt size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirm Participation
              </h3>
              <p className="text-gray-500 mb-8">
                Are you sure you want to register for <br />
                <strong className="text-gray-800">{selectedEvent.event_name}</strong>?
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleParticipate}
                className="flex-1 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all active:scale-95"
              >
                Yes, Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerEvents;