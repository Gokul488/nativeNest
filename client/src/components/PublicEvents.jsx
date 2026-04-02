// src/components/PublicEvents.jsx
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
import Header from "./header";
import Footer from "./footer";
import API_BASE_URL from "../config.js";

const formatDateRange = (start, end) => {
  if (!start || !end) return "—";
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(start).toLocaleDateString("en-IN", options)} – ${new Date(
    end
  ).toLocaleDateString("en-IN", options)}`;
};

const PublicEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "start_date", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const HEADER_HEIGHT = 72;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token && user.account_type === 'buyer';

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
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
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
    <div className="w-full min-h-screen bg-slate-50 font-sans">
      <Header />
      <main style={{ paddingTop: HEADER_HEIGHT }}>
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-[#21414a] to-[#011936] py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Our Upcoming Events</h1>
            <p className="text-[#7eb8c4] text-lg max-w-2xl mx-auto">Explore premium property exhibitions and connect with top builders. Your dream home is just one event away.</p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
            {/* ── Header ── */}
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/50">
              {/* Left: search */}
              <div className="relative flex-1 sm:w-72 lg:flex-none group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2e6171] transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2e6171]/20 focus:border-[#2e6171] transition-all"
                  disabled={loading}
                />
              </div>

              {/* Right: count */}
              <div className="flex items-center gap-3">
                <span className="bg-[#2e6171]/10 text-[#2e6171] text-xs font-bold px-4 py-1.5 rounded-full border border-[#2e6171]/20 uppercase tracking-widest">
                  {loading ? "…" : filteredAndSortedEvents.length} Events Available
                </span>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 flex flex-col">
              {loading && (
                <div className="flex-1 flex flex-col justify-center items-center gap-3 text-slate-400 py-32">
                  <Loader2 className="animate-spin h-8 w-8 text-[#2e6171]" />
                  <span className="text-sm font-bold uppercase tracking-widest text-[#2e6171]">Loading events…</span>
                </div>
              )}

              {!loading && error && (
                <div className="m-8 bg-red-50 text-red-600 p-5 rounded-2xl border border-red-100 flex items-center gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-semibold text-sm">{error}</span>
                </div>
              )}

              {!loading && !error && filteredAndSortedEvents.length === 0 && (
                <div className="flex-1 py-32 flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2 border border-slate-100 shadow-inner">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-xl font-bold text-slate-800">No events found</p>
                  <p className="text-sm text-slate-400 max-w-xs text-center">
                    {searchQuery
                      ? `No events matching "${searchQuery}"`
                      : "We are planning new property exhibitions. Stay tuned!"}
                  </p>
                </div>
              )}

              {/* Grid / List View */}
              {!loading && !error && filteredAndSortedEvents.length > 0 && (
                <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group bg-white rounded-2xl border border-slate-100 p-5 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-[#2e6171]/20 transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-[#2e6171]/10 p-2.5 rounded-xl text-[#2e6171] group-hover:bg-[#2e6171] group-hover:text-white transition-colors duration-300">
                          <CalendarDays className="w-6 h-6" />
                        </div>
                        {event.isRegistered ? (
                          <span className="text-[10px] bg-green-50 text-green-600 font-bold px-2 py-1 rounded-full border border-green-100 uppercase tracking-wider">Registered</span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-full uppercase tracking-wider">{event.event_type || 'Exhibition'}</span>
                        )}
                      </div>

                      <h3 className="font-bold text-[#011936] text-lg mb-2 line-clamp-2 leading-tight group-hover:text-[#2e6171] transition-colors">{event.event_name}</h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <FaMapMarkerAlt className="text-slate-300" size={12} />
                          <span className="truncate">{event.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#2e6171] font-bold text-xs uppercase tracking-wider">
                          <FaCalendarAlt className="text-[#2e6171]/50" size={12} />
                          <span>{formatDateRange(event.start_date, event.end_date)}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                         <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Entry Free</div>
                         <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-[#2e6171] group-hover:text-[#2e6171] transition-all">
                            <FaChevronRight size={10} />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center px-6 py-8 border-t border-slate-50">
                   <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                    >
                      <FaChevronRight className="rotate-180" size={12} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((item) => (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          currentPage === item
                            ? "bg-[#2e6171] text-white shadow-lg shadow-[#2e6171]/30"
                            : "text-slate-500 hover:bg-slate-50 border border-slate-100"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                    >
                      <FaChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Confirmation Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2e6171]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="w-8 h-8 text-[#2e6171]" />
              </div>
              <h3 className="text-2xl font-bold text-[#011936] mb-2">
                Join the Event
              </h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                {isLoggedIn 
                  ? `Would you like to register for "${selectedEvent.event_name}"?`
                  : "Please login to register for this event and get your unique digital entry code."}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleParticipate}
                className="w-full py-4 bg-[#2e6171] text-white font-bold rounded-2xl hover:bg-[#011936] transition-all shadow-lg shadow-[#2e6171]/20 active:scale-[0.98]"
              >
                {isLoggedIn ? "Yes, Register Now" : "Login to Register"}
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-4 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicEvents;
