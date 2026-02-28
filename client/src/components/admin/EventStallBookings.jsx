// EventStallBookings.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUsers, FaStore, FaBuilding, FaQrcode, FaTimes, FaDownload } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import API_BASE_URL from '../../config.js';
import FRONTEND_URL from "../../frontendConfig.js";

const EventStallBookings = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal State for QR Code
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeQR, setActiveQR] = useState(null);

  useEffect(() => {
    fetchEventAndBookings();
  }, [eventId]);

  const fetchEventAndBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch event details
      const eventRes = await axios.get(`${API_BASE_URL}/api/admin/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvent(eventRes.data);

      // Fetch bookings (Ensure your backend returns stall_id in this list)
      const bookingsRes = await axios.get(`${API_BASE_URL}/api/stalls/event/${eventId}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load bookings.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const openQR = (booking) => {
    setActiveQR({
      stallNumber: booking.stall_number,
      builder: booking.builder_name,
      url: `${FRONTEND_URL}/buyer-dashboard/stall-checkin/${eventId}/${booking.stall_id}`
    });
    setShowQRModal(true);
  };

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full mb-4 inline-block"></div>
        <p className="text-gray-500 font-medium">Fetching bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-8 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center gap-3">
        <span className="material-symbols-outlined">error</span>
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Stall Bookings for {event?.event_name || `Event #${eventId}`}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage builders and generate unique stall check-in QR codes</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="px-8 py-20 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUsers className="text-gray-400 text-2xl" />
          </div>
          <p className="text-gray-600 font-medium">No bookings yet.</p>
          <p className="text-gray-400 text-sm">Builders have not booked any stalls for this event.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stall Number</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Builder Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">QR Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking, index) => (
                <tr key={index} className="group hover:bg-teal-50/30 transition-colors">
                  <td className="px-6 py-5 text-sm text-gray-900 font-bold">
                    #{booking.stall_number}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-900 font-medium">
                    {booking.builder_name}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{booking.stall_type_name}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    <div>{booking.mobile_number}</div>
                    <div className="text-xs text-gray-400">{booking.email}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                  <button 
                    onClick={() => openQR(booking)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-600 hover:text-white transition-all text-xs font-bold"
                    title="Generate QR"
                  >
                    {/* Increased size from default to 20 or 24 depending on your preference */}
                    <FaQrcode size={22} /> 
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR MODAL */}
      {showQRModal && activeQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in duration-200">
            <button 
              onClick={() => setShowQRModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={24} />
            </button>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStore className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Stall Check-in</h3>
              <p className="text-sm text-gray-500 mb-6">
                Stall #{activeQR.stallNumber} • {activeQR.builder}
              </p>
              
              <div className="bg-white p-4 border-2 border-dashed border-gray-200 rounded-2xl inline-block mb-6">
                <QRCodeCanvas 
                  id="stall-qr-canvas" 
                  value={activeQR.url} 
                  size={200} 
                  level="H" 
                  includeMargin={true} 
                />
              </div>

              <button
                onClick={() => {
                  const canvas = document.getElementById("stall-qr-canvas");
                  const link = document.createElement("a");
                  link.href = canvas.toDataURL();
                  link.download = `QR-Stall-${activeQR.stallNumber}-${activeQR.builder}.png`;
                  link.click();
                }}
                className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all"
              >
                <FaDownload /> Download Image
              </button>
              
              <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest">
                NativeNest Attendance System
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventStallBookings;