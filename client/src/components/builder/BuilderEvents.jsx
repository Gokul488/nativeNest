// src/components/BuilderEvents.jsx
import React, { useState, useEffect, useMemo } from "react";
import { format, isSameMonth, isSameYear } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaStoreAlt,
  FaChevronRight,
  FaUsers,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import API_BASE_URL from '../../config.js';
import axios from "axios";

const formatDateRange = (start, end) => {
  if (!start) return "TBD";
  if (!end || start === end) return format(new Date(start), "dd MMM yyyy");
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isSameMonth(startDate, endDate) && isSameYear(startDate, endDate)) {
    return `${format(startDate, "dd")} – ${format(endDate, "dd MMM yyyy")}`;
  }
  return `${format(startDate, "dd MMM")} – ${format(endDate, "dd MMM yyyy")}`;
};

const isEventCompleted = (endDate) => {
  if (!endDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(endDate) < today;
};

const BuilderEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "start_date", direction: "asc" });
  const [activeTab, setActiveTab] = useState("active");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const response = await axios.get(`${API_BASE_URL}/api/builder/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(response.data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [navigate]);



  const activeEvents = useMemo(() => events.filter(e => !isEventCompleted(e.end_date)), [events]);
  const completedEvents = useMemo(() => events.filter(e => isEventCompleted(e.end_date)), [events]);

  const filteredAndSortedEvents = useMemo(() => {
    const pool = activeTab === "completed" ? completedEvents : activeEvents;
    let result = [...pool];
    if (searchQuery) {
      result = result.filter(e =>
        e.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.city?.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [activeEvents, completedEvents, activeTab, searchQuery, sortConfig]);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSearchQuery("");
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-2 opacity-20" />;
    return sortConfig.direction === "asc"
      ? <FaSortUp className="ml-2 text-teal-600" />
      : <FaSortDown className="ml-2 text-teal-600" />;
  };

  const isCompleted = activeTab === "completed";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">

      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col xl:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Property Exhibitions</h2>
            <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold border border-teal-100">
              {activeEvents.length} Live Events
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Select an exhibition to reserve your stall space</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search exhibitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {[
            { key: "active", icon: <FaClock className="mr-2 h-5 w-5" />, label: `Active Events (${activeEvents.length})` },
            { key: "completed", icon: <FaCheckCircle className="mr-2 h-5 w-5" />, label: `Completed Events (${completedEvents.length})` },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTabSwitch(key)}
              className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === key
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {icon}{label}
            </button>
          ))}
        </nav>
      </div>

      {/* All content below — fades as one unit, never unmounts */}
      <div className="flex-1 flex flex-col">
        {/* Completed banner — expands/collapses without layout jump */}

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col justify-center items-center gap-3 text-gray-500 py-24">
            <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            <p className="font-medium text-sm">Fetching upcoming events...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="m-4 sm:m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2 text-sm">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredAndSortedEvents.length === 0 && (
          <div className="flex-1 py-24 text-center text-gray-400 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-5xl opacity-20" />
            <p className="text-lg font-medium">
              {searchQuery
                ? "No exhibitions found matching your search."
                : isCompleted
                  ? "No completed exhibitions yet."
                  : "No active exhibitions available right now."}
            </p>
          </div>
        )}

        {/* Table — stable DOM, no conditional unmounting */}
        {!loading && !error && filteredAndSortedEvents.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className={`text-[11px] font-bold uppercase tracking-wider ${isCompleted ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"}`}>
                  <tr>
                    <th className="w-16 px-6 py-3 text-left border-b border-gray-200">#</th>
                    <th onClick={() => requestSort("event_name")} className="w-1/4 px-6 py-3 text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">Exhibition Name {getSortIcon("event_name")}</div>
                    </th>
                    <th onClick={() => requestSort("city")} className="w-40 px-6 py-3 text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">City {getSortIcon("city")}</div>
                    </th>
                    <th className="w-1/4 px-6 py-3 text-left border-b border-gray-200">Schedule</th>
                    <th className="w-32 px-6 py-3 text-center border-b border-gray-200">Visitors</th>
                    {/* Always in DOM — hidden via style to prevent column reflow */}
                    <th
                      className="w-32 px-6 py-3 text-center border-b border-gray-200"
                      style={{ display: isCompleted ? "none" : "" }}
                    >
                      Book Stall
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredAndSortedEvents.map((event, index) => (
                    <tr key={event.id} className={`transition-colors group ${isCompleted ? "hover:bg-green-50/40" : "hover:bg-gray-50"}`}>
                      <td className="px-6 py-3 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/builder-dashboard/events/${event.id}`}
                            className={`font-bold text-gray-900 transition-colors cursor-pointer hover:underline ${isCompleted ? "hover:text-green-600" : "group-hover:text-teal-600"}`}
                          >
                            {event.event_name}
                          </Link>
                          {isCompleted && (
                            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                              Done
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <span className={isCompleted ? "text-green-400" : "text-teal-600/70"}>
                            <FaMapMarkerAlt size={12} />
                          </span>
                          {event.city || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-1.5 text-sm text-gray-800 font-semibold">
                          <FaCalendarAlt className={`text-[11px] ${isCompleted ? "text-green-400" : "text-gray-400"}`} />
                          {formatDateRange(event.start_date, event.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center border-b border-gray-100">
                        <Link
                          to={`/builder-dashboard/interests?eventId=${event.id}`}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-90"
                          title="View Buyer Interests"
                        >
                          <FaUsers size={18} />
                        </Link>
                      </td>
                      <td
                        className="px-6 py-3 text-center border-b border-gray-100"
                        style={{ display: isCompleted ? "none" : "" }}
                      >
                        <Link
                          to={`/builder-dashboard/stall-booking/${event.id}`}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm group/btn active:scale-90"
                          title="Proceed to Booking"
                        >
                          <FaStoreAlt size={18} className="group-hover/btn:hidden" />
                          <FaChevronRight size={16} className="hidden group-hover/btn:block" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="xl:hidden grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {filteredAndSortedEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`border rounded-2xl p-4 shadow-sm space-y-4 ${isCompleted ? "bg-green-50/40 border-green-100" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isCompleted ? "text-green-600 bg-green-50" : "text-teal-600 bg-teal-50"}`}>
                          <FaMapMarkerAlt size={8} /> {event.city || "N/A"}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Done
                          </span>
                        )}
                      </div>
                      <Link to={`/builder-dashboard/events/${event.id}`}>
                        <h4 className={`font-bold text-gray-900 leading-tight transition-colors ${isCompleted ? "hover:text-green-600" : "hover:text-teal-600"}`}>
                          {event.event_name}
                        </h4>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs p-2 rounded-lg border bg-white border-gray-100 text-gray-600">
                    <FaCalendarAlt className={isCompleted ? "text-green-400" : "text-teal-500"} />
                    <span className="font-semibold">{formatDateRange(event.start_date, event.end_date)}</span>
                  </div>

                  <div
                    className="grid gap-3 pt-2"
                    style={{ gridTemplateColumns: isCompleted ? "1fr" : "1fr 1fr" }}
                  >
                    <Link
                      to={`/builder-dashboard/interests?eventId=${event.id}`}
                      className="flex items-center justify-center gap-2 py-2.5 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs border border-orange-100 active:scale-95 transition-transform"
                    >
                      <FaUsers size={14} /> Visitors
                    </Link>
                    <div style={{ display: isCompleted ? "none" : "" }}>
                      <Link
                        to={`/builder-dashboard/stall-booking/${event.id}`}
                        className="flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-100 active:scale-95 transition-transform w-full"
                      >
                        <FaStoreAlt size={14} /> Book Stall
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuilderEvents;