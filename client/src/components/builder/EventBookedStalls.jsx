import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaStoreAlt,
    FaUserAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaExclamationTriangle,
    FaCircle,
    FaBuilding
} from "react-icons/fa";
import API_BASE_URL from "../../config.js";
import axios from "axios";

const EventBookedStalls = () => {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [eventName, setEventName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBookings();
    }, [eventId]);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            // Fetch event name first (or combined if API supports it)
            const eventRes = await axios.get(`${API_BASE_URL}/api/stalls/event/${eventId}/types-availability`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEventName(eventRes.data.eventName);

            const res = await axios.get(`${API_BASE_URL}/api/stalls/event/${eventId}/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data.bookings || []);
        } catch (err) {
            console.error("Error fetching stall bookings:", err);
            setError("Failed to load booked stalls.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
                <p className="font-medium">Loading booked stalls...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Navigation */}
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm"
                >
                    <FaArrowLeft size={12} /> Back
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 flex items-center gap-3">
                            <FaExclamationTriangle className="shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {bookings.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-4">
                            <div className="p-6 bg-gray-50 rounded-full">
                                <FaStoreAlt size={48} className="opacity-20" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">No Stalls Booked By You</h3>
                                <p className="text-sm">You haven't reserved any stalls for this exhibition yet.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-3">
                                <thead>
                                    <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4">
                                        <th className="pb-2 px-6">Stall #</th>
                                        <th className="pb-2 px-6">Category</th>
                                        <th className="pb-2 px-6">Builder</th>
                                        <th className="pb-2 px-6">Contact Info</th>
                                        <th className="pb-2 px-6 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.stall_id} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                            <td className="px-6 py-4 border-y border-l border-gray-100 rounded-l-2xl">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                                        {booking.stall_number}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-y border-gray-100">
                                                <span className="text-sm font-bold text-gray-800">{booking.stall_type_name}</span>
                                            </td>
                                            <td className="px-6 py-4 border-y border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <FaBuilding className="text-gray-400" size={12} />
                                                    <span className="text-sm font-semibold text-gray-700">{booking.builder_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-y border-gray-100">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <FaPhoneAlt size={10} className="text-teal-500" />
                                                        {booking.mobile_number}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <FaEnvelope size={10} className="text-teal-500" />
                                                        {booking.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-y border-r border-gray-100 rounded-r-2xl text-center">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                                    <FaCircle size={6} className="animate-pulse" />
                                                    Confirmed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventBookedStalls;
