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
  FaUsers
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

const BuilderEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "start_date", direction: "asc" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

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

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];
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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      <div className="p-6 border-b border-gray-200 flex flex-col xl:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Property Exhibitions</h2>
            <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold border border-teal-100">
              {events.length} Live Events
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

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex flex-col justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            <p className="font-medium text-sm">Fetching upcoming events...</p>
          </div>
        )}

        {error && (
          <div className="m-4 sm:m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2 text-sm">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {!loading && !error && filteredAndSortedEvents.length === 0 && (
          <div className="py-24 text-center text-gray-400 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-5xl opacity-20" />
            <p className="text-lg font-medium">No exhibitions found</p>
          </div>
        )}

        {!loading && !error && filteredAndSortedEvents.length > 0 && (
          <>
            {/* Desktop View Table */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="w-16 px-6 py-4 text-left border-b border-gray-200">#</th>
                    <th onClick={() => requestSort("event_name")} className="w-1/3 px-6 py-4 text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">Exhibition Details {getSortIcon("event_name")}</div>
                    </th>
                    <th className="w-1/4 px-6 py-4 text-left border-b border-gray-200">Schedule</th>
                    <th className="w-32 px-6 py-4 text-center border-b border-gray-200">Visitors</th>
                    <th className="w-32 px-6 py-4 text-center border-b border-gray-200">Book Stall</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredAndSortedEvents.map((event, index) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="font-bold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors cursor-default">
                          {event.event_name}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-teal-600 font-medium bg-teal-50 px-1.5 py-0.5 rounded">
                            <FaMapMarkerAlt className="text-[10px]" /> {event.city || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-800 font-semibold">
                            <FaCalendarAlt className="text-gray-400 text-[11px]" />
                            {formatDateRange(event.start_date, event.end_date)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center border-b border-gray-100">
                        <Link
                          to={`/builder-dashboard/interests?eventId=${event.id}`}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm group/btn active:scale-90"
                          title="View Buyer Interests"
                        >
                          <FaUsers size={18} />
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-center border-b border-gray-100">
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

            {/* Mobile/Tablet View Cards */}
            <div className="xl:hidden grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {filteredAndSortedEvents.map((event, index) => (
                <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">#{String(index + 1).padStart(2, '0')}</span>
                        <span className="flex items-center gap-1 text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded uppercase uppercase tracking-wider">
                          <FaMapMarkerAlt size={8} /> {event.city || "N/A"}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 leading-tight">{event.event_name}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                    <FaCalendarAlt className="text-teal-500" />
                    <span className="font-semibold">{formatDateRange(event.start_date, event.end_date)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      to={`/builder-dashboard/interests?eventId=${event.id}`}
                      className="flex items-center justify-center gap-2 py-2.5 bg-orange-50 text-orange-600 rounded-xl font-bold text-xs border border-orange-100 active:scale-95 transition-transform"
                    >
                      <FaUsers size={14} /> Visitors
                    </Link>
                    <Link
                      to={`/builder-dashboard/stall-booking/${event.id}`}
                      className="flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-100 active:scale-95 transition-transform"
                    >
                      <FaStoreAlt size={14} /> Book Stall
                    </Link>
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