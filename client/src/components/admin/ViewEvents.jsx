// src/components/ViewEvents.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStore,
  FaDownload,
  FaQrcode,
  FaTimes,
  FaEdit,
  FaTicketAlt,
  FaUserCheck,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import API_BASE_URL from "../../config.js";
import FRONTEND_URL from "../../frontendConfig.js";

const formatDateRange = (start, end) => {
  if (!start || !end) return "—";
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(start).toLocaleDateString("en-IN", options)} – ${new Date(end).toLocaleDateString("en-IN", options)}`;
};

const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeQR, setActiveQR] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "start_date", direction: "desc" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const response = await axios.get(`${API_BASE_URL}/api/admin/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        else setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [navigate]);

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];
    if (searchQuery) {
      result = result.filter(e => 
        e.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [events, searchQuery, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-2 opacity-20" />;
    return sortConfig.direction === "asc" ? <FaSortUp className="ml-2 text-teal-600" /> : <FaSortDown className="ml-2 text-teal-600" />;
  };

  const handleDownload = async (eventId, eventName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/events/${eventId}/invitation.pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invitation-${eventName.replace(/\s+/g, "-")}.pdf`;
      link.click();
    } catch (err) { alert("Failed to download PDF."); }
  };

  const openQR = (event) => {
    setActiveQR({ name: event.event_name, url: `${FRONTEND_URL}/buyer-dashboard/event-checkin/${event.id}` });
    setShowQRModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Property Events</h2>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {events.length} Total
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
          </div>
          <Link
            to="/admin-dashboard/create-property-event"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95 text-sm"
          >
            <FaCalendarAlt /> Create Event
          </Link>
        </div>
      </div>

      {/* Table Content */}
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

        {!loading && !error && filteredAndSortedEvents.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No events found matching your search.</p>
          </div>
        )}

        {!loading && !error && filteredAndSortedEvents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                  <th onClick={() => requestSort("event_name")} className="w-1/3 px-6 py-4 text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">Event Details {getSortIcon("event_name")}</div>
                  </th>
                  <th className="w-28 px-4 py-4 text-center border-b border-gray-200">Total Stalls</th>
                  <th className="w-28 px-4 py-4 text-center border-b border-gray-200">Bookings</th>
                  <th className="w-28 px-4 py-4 text-center border-b border-gray-200">Participants</th>
                  <th className="w-36 px-6 py-4 text-center border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredAndSortedEvents.map((event, index) => (
                  <tr key={event.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-5 border-b border-gray-100">
                      <div className="font-bold text-gray-900 mb-1">{event.event_name}</div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-teal-600 font-medium">
                          <FaMapMarkerAlt /> {event.city}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <FaCalendarAlt /> {formatDateRange(event.start_date, event.end_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center border-b border-gray-100">
                      <Link to={`/admin-dashboard/manage-stall-types/${event.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-bold hover:bg-teal-600 hover:text-white transition-all">
                        <FaStore /> {event.stall_count || 0}
                      </Link>
                    </td>
                    <td className="px-4 py-5 text-center border-b border-gray-100">
                      <Link to={`/admin-dashboard/event-bookings/${event.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">
                        <FaTicketAlt /> {event.booked_stall_count || 0}
                      </Link>
                    </td>
                    <td className="px-4 py-5 text-center border-b border-gray-100">
                      <Link to={`/admin-dashboard/events/${event.id}/participants`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-md text-xs font-bold hover:bg-purple-600 hover:text-white transition-all">
                        <FaUserCheck /> View
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-right border-b border-gray-100">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => navigate(`/admin-dashboard/manage-events/edit/${event.id}`)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Edit">
                          <FaEdit size={18} />
                        </button>
                        <button onClick={() => openQR(event)} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition" title="Attendance QR">
                          <FaQrcode size={18} />
                        </button>
                        <button onClick={() => handleDownload(event.id, event.event_name)} className="p-2 text-teal-500 hover:bg-teal-50 rounded-lg transition" title="Download Invitation">
                          <FaDownload size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQRModal && activeQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in duration-200">
            <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes size={24} />
            </button>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Check-in QR Code</h3>
              <p className="text-sm text-gray-500 mb-6">{activeQR.name}</p>
              <div className="bg-white p-4 border rounded-xl inline-block mb-6">
                <QRCodeCanvas id="event-qr-code" value={activeQR.url} size={200} level="H" includeMargin={true} />
              </div>
              <button
                onClick={() => {
                  const canvas = document.getElementById("event-qr-code");
                  const link = document.createElement("a");
                  link.href = canvas.toDataURL();
                  link.download = `QR-${activeQR.name}.png`;
                  link.click();
                }}
                className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700"
              >
                <FaDownload /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEvents;