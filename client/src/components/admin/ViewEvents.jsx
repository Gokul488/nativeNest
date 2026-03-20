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
} from "react-icons/fa";
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
  Pencil,
  QrCode,
  Download,
  X,
} from "lucide-react";
import API_BASE_URL from "../../config.js";
import FRONTEND_URL from "../../frontendConfig.js";
import Pagination from "../common/Pagination.jsx";

const formatDateRange = (start, end) => {
  if (!start || !end) return "—";
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(start).toLocaleDateString("en-IN", options)} – ${new Date(end).toLocaleDateString("en-IN", options)}`;
};

const isEventCompleted = (endDate) => {
  if (!endDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(endDate) < today;
};

const ViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeQR, setActiveQR] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "start_date", direction: "desc" });
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const activeEvents = useMemo(() => events.filter(e => !isEventCompleted(e.end_date)), [events]);
  const completedEvents = useMemo(() => events.filter(e => isEventCompleted(e.end_date)), [events]);

  const filteredAndSortedEvents = useMemo(() => {
    const pool = activeTab === "completed" ? completedEvents : activeEvents;
    let result = [...pool];
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
  }, [activeEvents, completedEvents, activeTab, searchQuery, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig, activeTab]);

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

  const isCompleted = activeTab === "completed";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* Left: search + create */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Link
            to="/admin-dashboard/create-property-event"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm active:scale-95 text-sm whitespace-nowrap"
          >
            <CalendarDays className="w-4 h-4" /> Create Event
          </Link>
        </div>

        {/* Right: total count */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Manage and track all property events
            </p>
          </div>
          <span className="italic ml-1 bg-indigo-50 text-indigo-600 text-md font-bold px-3 py-1 rounded-full border border-indigo-100">
            {events.length} Events  
          </span>
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
                : isCompleted
                  ? "No completed events yet."
                  : "No active events. Create one to get started!"}
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
                      <span className="inline-flex items-center">Event Name {getSortIcon("event_name")}</span>
                    </th>
                    <th
                      className="w-1/4 px-6 py-4 text-left cursor-pointer hover:text-indigo-600 transition-colors select-none"
                      onClick={() => requestSort("start_date")}
                    >
                      <span className="inline-flex items-center">Event Date {getSortIcon("start_date")}</span>
                    </th>
                    <th className="w-24 px-4 py-4 text-center">Stalls</th>
                    <th className="w-24 px-4 py-4 text-center">Bookings</th>
                    <th className="w-24 px-4 py-4 text-center">People</th>
                    <th className="w-32 px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedEvents.map((event, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr
                        key={event.id}
                        className={`transition-colors duration-150 group ${
                          isCompleted ? "hover:bg-green-50/30" : "hover:bg-slate-50/60"
                        }`}
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-sm font-bold text-slate-300">
                          {String(globalIndex).padStart(2, "0")}
                        </td>

                        {/* Event Name */}
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-800 text-sm" title={event.event_name}>
                                {event.event_name}
                              </span>
                              {event.city && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <FaMapMarkerAlt className="text-slate-300 text-[9px]" />
                                  <span className="text-xs text-slate-400 font-medium">{event.city}</span>
                                </div>
                              )}
                            </div>
                            {isCompleted && (
                              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                Done
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Event Date */}
                        <td className="px-6 py-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600">
                            <FaCalendarAlt className="text-indigo-400 text-[10px]" />
                            {formatDateRange(event.start_date, event.end_date)}
                          </div>
                        </td>

                        {/* Stalls */}
                        <td className="px-4 py-3 text-center">
                          <Link
                            to={`/admin-dashboard/manage-stall-types/${event.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            {event.stall_count || 0}
                          </Link>
                        </td>

                        {/* Bookings */}
                        <td className="px-4 py-3 text-center">
                          <Link
                            to={`/admin-dashboard/event-bookings/${event.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            {event.booked_stall_count || 0}
                          </Link>
                        </td>

                        {/* People */}
                        <td className="px-4 py-3 text-center">
                          <Link
                            to={`/admin-dashboard/events/${event.id}/participants`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold hover:bg-purple-600 hover:text-white transition-all"
                          >
                            View
                          </Link>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3">
                          <div className="flex justify-center gap-1.5">
                            {!isCompleted && (
                              <button
                                onClick={() => navigate(`/admin-dashboard/manage-events/edit/${event.id}`)}
                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => openQR(event)}
                              className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition"
                              title="Attendance QR"
                            >
                              <QrCode size={15} />
                            </button>
                            <button
                              onClick={() => handleDownload(event.id, event.event_name)}
                              className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg transition"
                              title="Download Invitation"
                            >
                              <Download size={15} />
                            </button>
                          </div>
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
                    className={`rounded-2xl p-5 border space-y-4 bg-white hover:border-indigo-200 transition-colors ${
                      isCompleted ? "border-green-100" : "border-slate-100"
                    }`}
                  >
                    {/* Card Header */}
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
                          <div className="font-bold text-slate-900 text-sm leading-tight">{event.event_name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <FaMapMarkerAlt className="text-slate-300 text-[9px]" />
                            <span className="text-xs text-indigo-500 font-semibold">{event.city}</span>
                          </div>
                        </div>
                      </div>
                      {isCompleted && (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">
                          Done
                        </span>
                      )}
                    </div>

                    {/* Date row */}
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-600 w-full">
                      <FaCalendarAlt className="text-indigo-400 shrink-0" />
                      <span>{formatDateRange(event.start_date, event.end_date)}</span>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        to={`/admin-dashboard/manage-stall-types/${event.id}`}
                        className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group"
                      >
                        <FaStore className="text-indigo-500 group-hover:scale-110 transition-transform text-sm" />
                        <span className="text-xs font-bold text-slate-800">{event.stall_count || 0}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-tight">Stalls</span>
                      </Link>
                      <Link
                        to={`/admin-dashboard/event-bookings/${event.id}`}
                        className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group"
                      >
                        <FaTicketAlt className="text-indigo-600 group-hover:scale-110 transition-transform text-sm" />
                        <span className="text-xs font-bold text-slate-800">{event.booked_stall_count || 0}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-tight">Booked</span>
                      </Link>
                      <Link
                        to={`/admin-dashboard/events/${event.id}/participants`}
                        className="flex flex-col items-center justify-center gap-1 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-sm transition-all group"
                      >
                        <FaUserCheck className="text-purple-500 group-hover:scale-110 transition-transform text-sm" />
                        <span className="text-xs font-bold text-slate-800">View</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-tight">People</span>
                      </Link>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      {!isCompleted && (
                        <button
                          onClick={() => navigate(`/admin-dashboard/manage-events/edit/${event.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => openQR(event)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors"
                      >
                        <QrCode size={12} /> QR Code
                      </button>
                      <button
                        onClick={() => handleDownload(event.id, event.event_name)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-500 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                      >
                        <Download size={12} /> PDF
                      </button>
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

      {/* ── QR Modal ── */}
      {showQRModal && activeQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={22} />
            </button>
            <div className="text-center">
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">Check-in QR Code</h3>
              <p className="text-sm text-slate-500 mb-6">{activeQR.name}</p>
              <div className="bg-white p-4 border border-slate-200 rounded-xl inline-block mb-6">
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
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
              >
                <Download size={16} /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEvents;