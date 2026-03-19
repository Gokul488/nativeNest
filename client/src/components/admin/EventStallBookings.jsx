// EventStallBookings.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaStore, FaQrcode, FaDownload } from "react-icons/fa";
import { Search, Loader2, AlertCircle, Users, QrCode, X, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import API_BASE_URL from '../../config.js';
import FRONTEND_URL from "../../frontendConfig.js";
import Pagination from "../common/Pagination.jsx";

const EventStallBookings = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showQRModal, setShowQRModal] = useState(false);
  const [activeQR, setActiveQR] = useState(null);

  useEffect(() => { fetchEventAndBookings(); }, [eventId]);

  const fetchEventAndBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const eventRes = await axios.get(`${API_BASE_URL}/api/admin/events/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
      setEvent(eventRes.data);
      const bookingsRes = await axios.get(`${API_BASE_URL}/api/stalls/event/${eventId}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b =>
      b.builder_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.stall_number?.toString().includes(searchQuery) ||
      b.mobile_number?.includes(searchQuery) ||
      b.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookings, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const openQR = (booking) => {
    setActiveQR({
      stallNumber: booking.stall_number,
      builder: booking.builder_name,
      url: `${FRONTEND_URL}/buyer-dashboard/stall-checkin/${eventId}/${booking.stall_id}`
    });
    setShowQRModal(true);
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[400px] gap-3 text-slate-400">
      <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      <span className="text-sm font-semibold">Fetching bookings…</span>
    </div>
  );

  if (error) return (
    <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="font-medium text-sm">{error}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <FaStore className="text-indigo-500 text-base" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              Stall Bookings
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {event?.event_name || `Event #${eventId}`}
            </p>
          </div>
          <span className="ml-1 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            {bookings.length} Bookings
          </span>
        </div>

        <div className="relative w-full lg:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search builder, stall, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1">
        {filteredBookings.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No bookings found</p>
            <p className="text-sm text-slate-400">No stall bookings for this event yet.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4 text-left w-14">#</th>
                    <th className="px-6 py-4 text-left">Stall No.</th>
                    <th className="px-6 py-4 text-left">Builder Name</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Contact</th>
                    <th className="px-6 py-4 text-center">QR Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedBookings.map((booking, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={index} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-300">
                          {String(globalIndex).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-2.5">
                          <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700">
                            #{booking.stall_number}
                          </span>
                        </td>
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-800">
                          {booking.builder_name}
                        </td>
                        <td className="px-6 py-2.5">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                            {booking.stall_type_name}
                          </span>
                        </td>
                        <td className="px-6 py-2.5">
                          <div className="text-sm text-slate-500 font-medium">{booking.mobile_number}</div>
                          <div className="text-xs text-slate-400">{booking.email}</div>
                        </td>
                        <td className="px-6 py-2.5 text-center">
                          <button
                            onClick={() => openQR(booking)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-lg hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all text-xs font-bold"
                            title="Generate QR"
                          >
                            <QrCode size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden p-4 space-y-3">
              {paginatedBookings.map((booking, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div key={index} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {globalIndex}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">#{booking.stall_number} · {booking.builder_name}</p>
                          <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-medium mt-0.5">
                            {booking.stall_type_name}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => openQR(booking)}
                        className="p-2 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all"
                      >
                        <QrCode size={15} />
                      </button>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                      <div>{booking.mobile_number}</div>
                      <div className="text-slate-400 truncate">{booking.email}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredBookings.length}
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
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl text-center">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={22} />
            </button>
            <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaStore className="text-purple-500 text-xl" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Stall Check-in</h3>
            <p className="text-sm text-slate-500 mb-6">
              Stall #{activeQR.stallNumber} · {activeQR.builder}
            </p>
            <div className="bg-white p-4 border border-slate-200 rounded-xl inline-block mb-6">
              <QRCodeCanvas id="stall-qr-canvas" value={activeQR.url} size={200} level="H" includeMargin={true} />
            </div>
            <button
              onClick={() => {
                const canvas = document.getElementById("stall-qr-canvas");
                const link = document.createElement("a");
                link.href = canvas.toDataURL();
                link.download = `QR-Stall-${activeQR.stallNumber}-${activeQR.builder}.png`;
                link.click();
              }}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              <Download size={16} /> Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventStallBookings;