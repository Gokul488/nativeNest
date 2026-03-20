// src/components/BuyerEvents.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTicketAlt,
  FaBuilding,
  FaChevronRight,
} from "react-icons/fa";
import {
  Search,
  Loader2,
  AlertCircle,
  CalendarDays,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import API_BASE_URL from "../../config.js";

const formatDateRange = (start, end) => {
  if (!start || !end) return "—";
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(start).toLocaleDateString("en-IN", options)} – ${new Date(
    end
  ).toLocaleDateString("en-IN", options)}`;
};

const BuyerEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "start_date", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/buyer/events`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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

  const filteredAndSortedEvents = useMemo(() => {
    let result = [...events];
    if (searchQuery) {
      result = result.filter(
        (e) =>
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedEvents, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedEvents.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ChevronsUpDown className="ml-1.5 w-3.5 h-3.5 opacity-40" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1.5 w-3.5 h-3.5 text-indigo-500" />
    ) : (
      <ChevronDown className="ml-1.5 w-3.5 h-3.5 text-indigo-500" />
    );
  };

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

      alert(
        response.data.message +
          (response.data.emailSent ? "\n\n✅ Confirmation email sent." : "")
      );

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEvent.id ? { ...ev, isRegistered: 1 } : ev
        )
      );
      setSelectedEvent(null);
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* Left: search */}
        <div className="relative flex-1 sm:w-72 lg:flex-none group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            disabled={loading}
          />
        </div>

        {/* Right: count */}
        <div className="italic flex items-center gap-3">
          <span className="bg-indigo-50 text-indigo-600 text-md font-bold px-3 py-1 rounded-full border border-indigo-100 italic">
            {loading ? "…" : events.length} Events
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col">

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col justify-center items-center gap-3 text-slate-400 py-24">
            <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
            <span className="text-sm font-semibold">Loading events…</span>
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
            <p className="text-lg font-bold text-slate-800">No events found</p>
            <p className="text-sm text-slate-400 max-w-xs text-center">
              {searchQuery
                ? `No events matching "${searchQuery}"`
                : "No property events available at the moment."}
            </p>
          </div>
        )}

        {/* Table + Cards */}
        {!loading && !error && filteredAndSortedEvents.length > 0 && (
          <div className="flex flex-col">

            {/* ── Desktop Table ── */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="w-12 px-4 py-4 text-left">#</th>
                    <th
                      className="w-1/4 px-6 py-4 text-left cursor-pointer hover:text-indigo-600 transition-colors select-none"
                      onClick={() => requestSort("event_name")}
                    >
                      <span className="inline-flex items-center">
                        Event Name {getSortIcon("event_name")}
                      </span>
                    </th>
                    <th className="w-1/5 px-6 py-4 text-left">Location</th>
                    <th
                      className="w-56 px-6 py-4 text-left cursor-pointer hover:text-indigo-600 transition-colors select-none"
                      onClick={() => requestSort("start_date")}
                    >
                      <span className="inline-flex items-center">
                        Dates {getSortIcon("start_date")}
                      </span>
                    </th>
                    <th className="w-36 px-6 py-4 text-center">Status</th>
                    <th className="w-40 px-6 py-4 text-center">Builders</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEvents.map((event, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr
                        key={event.id}
                        className="transition-colors duration-150 group hover:bg-slate-50/60"
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-sm font-bold text-slate-300 border-b border-slate-100">
                          {String(globalIndex).padStart(2, "0")}
                        </td>

                        {/* Event Name */}
                        <td className="px-6 py-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span
                              className="font-bold text-slate-800 text-sm cursor-pointer hover:text-indigo-600 transition-colors"
                              onClick={() =>
                                navigate(`/buyer-dashboard/events/${event.id}`)
                              }
                              title={event.event_name}
                            >
                              {event.event_name}
                            </span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-3 border-b border-slate-100">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <FaMapMarkerAlt className="text-slate-300 text-[9px] shrink-0" />
                            <span className="truncate">
                              {event.event_location
                                ? `${event.event_location}, `
                                : ""}
                              {event.city}
                            </span>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-3 border-b border-slate-100">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600">
                            <FaCalendarAlt className="text-indigo-400 text-[10px]" />
                            {formatDateRange(event.start_date, event.end_date)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-3 text-center border-b border-slate-100">
                          {event.isRegistered ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                              <FaCheckCircle className="text-[10px]" /> Registered
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
                            >
                              <FaTicketAlt className="text-[10px]" /> Participate
                            </button>
                          )}
                        </td>

                        {/* Builders */}
                        <td className="px-6 py-3 text-center border-b border-slate-100">
                          {event.isRegistered ? (
                            <button
                              onClick={() =>
                                navigate(
                                  `/buyer-dashboard/my-events/builders/${event.id}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              <FaBuilding className="text-[10px]" /> View
                            </button>
                          ) : (
                            <span className="text-slate-300 text-lg font-bold">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="xl:hidden p-4 space-y-3">
              {paginatedEvents.map((event, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div
                    key={event.id}
                    className="rounded-2xl p-5 border space-y-4 bg-white hover:border-indigo-200 transition-colors border-slate-100"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border bg-indigo-50 text-indigo-600 border-indigo-100">
                          {globalIndex}
                        </span>
                        <div>
                          <div
                            className="font-bold text-slate-900 text-sm leading-tight cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() =>
                              navigate(`/buyer-dashboard/events/${event.id}`)
                            }
                          >
                            {event.event_name}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <FaMapMarkerAlt className="text-slate-300 text-[9px]" />
                            <span className="text-xs text-indigo-500 font-semibold">
                              {event.event_location
                                ? `${event.event_location}, `
                                : ""}
                              {event.city}
                            </span>
                          </div>
                        </div>
                      </div>
                      {event.isRegistered && (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">
                          Registered
                        </span>
                      )}
                    </div>

                    {/* Date row */}
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-600 w-full">
                      <FaCalendarAlt className="text-indigo-400 shrink-0" />
                      <span>{formatDateRange(event.start_date, event.end_date)}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      {event.isRegistered ? (
                        <>
                          <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-bold">
                            <FaCheckCircle size={12} /> Registered
                          </div>
                          <button
                            onClick={() =>
                              navigate(
                                `/buyer-dashboard/my-events/builders/${event.id}`
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                          >
                            <FaBuilding size={12} /> View Builders
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                        >
                          <FaTicketAlt size={12} /> Participate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium">
                  Showing{" "}
                  <span className="font-bold text-slate-600">
                    {(currentPage - 1) * itemsPerPage + 1}–
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedEvents.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-slate-600">
                    {filteredAndSortedEvents.length}
                  </span>{" "}
                  events
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1
                    )
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1)
                        acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-slate-300 text-xs">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                            currentPage === item
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={22} />
            </button>
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                Confirm Participation
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to register for{" "}
                <span className="font-bold text-slate-800">
                  {selectedEvent.event_name}
                </span>
                ?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleParticipate}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95 text-sm"
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