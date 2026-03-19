// src/components/builder/BuilderEvents.jsx
import React, { useState, useEffect, useMemo } from "react";
import { format, isSameMonth, isSameYear } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CalendarDays,
  Clock,
  CheckCircle2,
  MapPin,
  Users,
  Store,
  ChevronRight,
  Info,
} from "lucide-react";
import API_BASE_URL from "../../config.js";
import Pagination from "../common/Pagination.jsx";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, sortConfig]);

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedEvents, currentPage]);

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
    if (sortConfig.key !== key) return <ChevronsUpDown className="ml-1.5 w-3.5 h-3.5 opacity-40" />;
    return sortConfig.direction === "asc"
      ? <ChevronUp className="ml-1.5 w-3.5 h-3.5 text-indigo-500" />
      : <ChevronDown className="ml-1.5 w-3.5 h-3.5 text-indigo-500" />;
  };

  const isCompleted = activeTab === "completed";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
      
      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              Property Exhibitions
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Select an exhibition to reserve your stall space
            </p>
          </div>
          <span className="ml-1 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            {activeEvents.length} Live
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search exhibitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Tab Toggle ── */}
      <div className="border-b border-slate-100 px-8">
        <nav className="-mb-px flex gap-6">
          {[
            { key: "active", icon: <Clock className="w-4 h-4" />, label: `Active Events`, count: activeEvents.length },
            { key: "completed", icon: <CheckCircle2 className="w-4 h-4" />, label: `Completed`, count: completedEvents.length },
          ].map(({ key, icon, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTabSwitch(key)}
              className={`inline-flex items-center gap-2 py-3.5 px-1 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === key
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              {icon}
              {label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === key ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col">
        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col justify-center items-center gap-3 text-slate-400 py-24">
            <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
            <span className="text-sm font-semibold">Fetching upcoming events…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredAndSortedEvents.length === 0 && (
          <div className="flex-1 py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No exhibitions found</p>
            <p className="text-sm text-slate-400 max-w-xs text-center">
              {searchQuery
                ? `No exhibitions matching "${searchQuery}"`
                : isCompleted
                  ? "No completed exhibitions yet."
                  : "No active exhibitions available right now."}
            </p>
          </div>
        )}

        {/* Table + Cards */}
        {!loading && !error && filteredAndSortedEvents.length > 0 && (
          <div className="flex flex-col h-full">
            {/* Desktop Table */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="w-16 px-6 py-4 text-left">#</th>
                    <th onClick={() => requestSort("event_name")} className="w-1/4 px-6 py-4 text-left cursor-pointer hover:text-indigo-600 transition-colors select-none">
                      <span className="inline-flex items-center">Exhibition Name {getSortIcon("event_name")}</span>
                    </th>
                    <th onClick={() => requestSort("city")} className="w-40 px-6 py-4 text-left cursor-pointer hover:text-indigo-600 transition-colors select-none">
                      <span className="inline-flex items-center">City {getSortIcon("city")}</span>
                    </th>
                    <th className="w-1/4 px-6 py-4 text-left">Schedule</th>
                    <th className="w-24 px-4 py-4 text-center">Visitors</th>
                    {!isCompleted && <th className="w-32 px-6 py-4 text-center">Book Stall</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedEvents.map((event, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={event.id} className={`transition-colors duration-150 group ${isCompleted ? "hover:bg-green-50/30" : "hover:bg-slate-50/60"}`}>
                        <td className="px-6 py-4 text-sm font-bold text-slate-300">
                          {String(globalIndex).padStart(2, "0")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/builder-dashboard/events/${event.id}`}
                              className="font-bold text-slate-800 text-sm hover:underline hover:text-indigo-600 transition-colors"
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                            <MapPin className="text-slate-300 w-3.5 h-3.5" />
                            {event.city || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600">
                            <CalendarDays className="text-indigo-400 w-3.5 h-3.5" />
                            {formatDateRange(event.start_date, event.end_date)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            to={`/builder-dashboard/interests?eventId=${event.id}`}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="View Buyer Interests"
                          >
                            <Users size={18} />
                          </Link>
                        </td>
                        {!isCompleted && (
                          <td className="px-6 py-4 text-center">
                            <Link
                              to={`/builder-dashboard/stall-booking/${event.id}`}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm group/btn active:scale-90"
                              title="Proceed to Booking"
                            >
                              <Store size={18} className="group-hover/btn:hidden" />
                              <ChevronRight size={18} className="hidden group-hover/btn:block" />
                            </Link>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="xl:hidden p-4 space-y-3">
              {paginatedEvents.map((event, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div
                    key={event.id}
                    className={`rounded-2xl p-5 border space-y-4 bg-white hover:border-indigo-200 transition-colors ${
                      isCompleted ? "border-green-100" : "border-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border ${
                          isCompleted
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        }`}>
                          {globalIndex}
                        </span>
                        <div>
                          <Link to={`/builder-dashboard/events/${event.id}`}>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight hover:text-indigo-600 transition-colors">
                              {event.event_name}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="text-slate-300 w-3 h-3" />
                            <span className="text-xs text-indigo-500 font-semibold">{event.city || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                      {isCompleted && (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">
                          Done
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-600 w-full">
                      <CalendarDays className="text-indigo-400 w-4 h-4" />
                      <span>{formatDateRange(event.start_date, event.end_date)}</span>
                    </div>

                    <div className={`grid gap-3 pt-1 ${isCompleted ? "grid-cols-1" : "grid-cols-2"}`}>
                      <Link
                        to={`/builder-dashboard/interests?eventId=${event.id}`}
                        className="flex items-center justify-center gap-2 py-2.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-xl text-xs font-bold hover:bg-orange-100 transition-colors"
                      >
                        <Users size={14} /> Visitors
                      </Link>
                      {!isCompleted && (
                        <Link
                          to={`/builder-dashboard/stall-booking/${event.id}`}
                          className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 active:scale-[0.98] transition-all"
                        >
                          <Store size={14} /> Book Stall
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalItems={filteredAndSortedEvents.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              activeColor="indigo"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderEvents;