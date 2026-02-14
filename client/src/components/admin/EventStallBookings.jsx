// EventStallBookings.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUsers, FaStore, FaBuilding } from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const EventStallBookings = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      // Fetch bookings
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

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin radial-progress text-teal-600 mb-4 inline-block"></div>
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
          <p className="text-gray-500 text-sm mt-1">List of builders who have booked stalls</p>
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
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Builder Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking, index) => (
                <tr key={index} className="group hover:bg-teal-50/30 transition-colors">
                  <td className="px-6 py-5 text-sm text-gray-900 font-medium">{booking.stall_number}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{booking.stall_type_name}</td>
                  <td className="px-6 py-5 text-sm text-gray-900 font-medium">{booking.builder_name}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{booking.mobile_number}</td>
                  <td className="px-6 py-5 text-sm text-gray-700">{booking.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventStallBookings;