// src/components/BuyerEvents.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTicketAlt,
  FaBuilding,
  FaChevronRight
} from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const BuyerEvents = () => {
  const navigate = useNavigate();
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
            {loading ? "…" : events.length} Total
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
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="relative flex-1">
        {loading ? (
          <div className="p-6 space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="hidden xl:block">
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="xl:hidden space-y-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
                  <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-3">
                    <div className="flex-1 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No property events found.</p>
          </div>
        ) : (
          <>
            {/* ── Desktop View Table ── */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="w-14 px-6 py-3 text-left border-b border-gray-200">#</th>
                    <th className="w-1/4 px-6 py-3 text-left border-b border-gray-200">Event Details</th>
                    <th className="w-1/4 px-6 py-3 text-left border-b border-gray-200">Location</th>
                    <th className="w-56 px-4 py-3 text-center border-b border-gray-200">Dates</th>
                    <th className="w-40 px-6 py-3 text-center border-b border-gray-200">Status</th>
                    <th className="w-44 px-6 py-3 text-center border-b border-gray-200">Builders</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredEvents.map((event, index) => (
                    <tr key={event.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-3 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-3 border-b border-gray-100">
                        <div
                          className="font-bold text-gray-900 cursor-pointer hover:text-teal-600 transition-colors"
                          onClick={() => navigate(`/buyer-dashboard/events/${event.id}`)}
                        >
                          {event.event_name}
                        </div>
                      </td>
                      <td className="px-6 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-teal-600 font-medium">
                          <FaMapMarkerAlt size={12} className="shrink-0" />
                          <span className="truncate">
                            {event.event_location ? `${event.event_location}, ` : ""}
                            {event.city}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center border-b border-gray-100">
                        <div className="flex items-center justify-center text-xs text-gray-700 gap-2 whitespace-nowrap font-medium">
                          <FaCalendarAlt className="text-teal-600" />
                          <span>
                            {new Date(event.start_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                            {" – "}
                            {new Date(event.end_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 border-b border-gray-100 text-center">
                        {event.isRegistered ? (
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                            <FaCheckCircle /> Registered
                          </span>
                        ) : (
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                          >
                            <FaTicketAlt /> Participate
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-3 border-b border-gray-100 text-center">
                        {event.isRegistered ? (
                          <button
                            onClick={() => navigate(`/buyer-dashboard/my-events/builders/${event.id}`)}
                            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                          >
                            <FaBuilding size={13} /> View Builders
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xl font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile/Tablet View Cards ── */}
            <div className="xl:hidden flex flex-col gap-4 p-4 sm:p-6 bg-gray-50/30">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h4
                        className="font-bold text-gray-900 text-lg leading-tight cursor-pointer hover:text-teal-600 transition-colors"
                        onClick={() => navigate(`/buyer-dashboard/events/${event.id}`)}
                      >
                        {event.event_name}
                      </h4>
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
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(event.start_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1 text-center pl-2">
                      <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter mb-0.5">End Date</p>
                      <p className="text-sm font-bold text-gray-700">
                        {new Date(event.end_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    {event.isRegistered ? (
                      <>
                        <div className="w-full text-center py-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 flex items-center justify-center gap-2">
                          <FaCheckCircle /> Successfully Registered
                        </div>
                        <button
                          onClick={() => navigate(`/buyer-dashboard/my-events/builders/${event.id}`)}
                          className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-100 active:scale-[0.98] transition-all"
                        >
                          <FaBuilding size={14} /> View Participating Builders <FaChevronRight size={12} />
                        </button>
                      </>
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