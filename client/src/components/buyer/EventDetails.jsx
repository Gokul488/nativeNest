import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaArrowLeft,
    FaCheckCircle,
    FaTicketAlt,
    FaClock,
    FaPhoneAlt,
    FaUserAlt,
    FaInfoCircle,
    FaBuilding,
    FaShareAlt,
    FaRegCalendarCheck
} from "react-icons/fa";
import API_BASE_URL from "../../config.js";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/buyer/events/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setEvent(response.data);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load event details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEventDetails();
    }, [id, token]);

    const handleParticipate = async () => {
        if (!event || event.isRegistered) return;

        setIsRegistering(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/buyer/events/participate`,
                {
                    eventId: event.id,
                    name: user.name || "Guest",
                    phone: user.mobile_number,
                    email: user.email || null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(response.data.message + (response.data.emailSent ? "\n\n✅ Confirmation email sent." : ""));
            setEvent(prev => ({ ...prev, isRegistered: 1 }));
        } catch (err) {
            alert(err.response?.data?.error || "Registration failed.");
        } finally {
            setIsRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[500px] gap-4">
                <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium tracking-tight">Curating your experience...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-xl mx-auto mt-20 p-10 text-center bg-white rounded-3xl shadow-xl border border-gray-100">
                <FaInfoCircle size={40} className="text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{error || "Event not found"}</h3>
                <button onClick={() => navigate(-1)} className="text-teal-600 font-bold hover:underline">Return to Events</button>
            </div>
        );
    }

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const isOneDay = startDate.toDateString() === endDate.toDateString();

    return (
        <div className="max-w-6xl mx-auto pb-20 px-6 pt-10">
            {/* Header Navigation */}
            <div className="flex justify-between items-center mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-semibold"
                >
                    <FaArrowLeft size={14} />
                    <span>Back</span>
                </button>
                <div className="flex gap-3">
                    <button className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all">
                        <FaShareAlt size={16} />
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Hero Section */}
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-100 aspect-[16/9] lg:aspect-auto lg:h-[400px]">
                        {event.banner_image ? (
                            <img src={event.banner_image} alt={event.event_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                <FaRegCalendarCheck className="text-white/10 text-8xl" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                            <span className="inline-block px-3 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-md mb-4">
                                {event.event_type || "Exhibition"}
                            </span>
                            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight tracking-tight mb-6">
                                {event.event_name}
                            </h1>
                            
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-white text-xs font-medium">
                                    <FaMapMarkerAlt className="text-teal-400" />
                                    {event.event_location}, {event.city}
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-white text-xs font-medium">
                                    <FaCalendarAlt className="text-teal-400" />
                                    {startDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                                    {!isOneDay && ` - ${endDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
                                <FaClock size={18} />
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Schedule</p>
                            <p className="text-gray-900 font-bold">
                                {event.start_time?.slice(0, 5) || "09:00"} - {event.end_time?.slice(0, 5) || "18:00"}
                            </p>
                        </div>
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                                <FaBuilding size={18} />
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Participants</p>
                            <p className="text-gray-900 font-bold">{event.stall_count || 0} Premier Builders</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="prose prose-slate max-w-none">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-teal-500"></span>
                            About the Event
                        </h4>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {event.description || "Join us for an exclusive gathering where luxury meets convenience. Discover your next dream property among the finest selections of modern living spaces."}
                        </p>
                    </div>
                </div>

                {/* Sidebar CTA */}
                <div className="space-y-6">
                    <div className="sticky top-10 space-y-6">
                        {/* Registration Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">Secure Your Entry</h3>
                                <p className="text-slate-400 text-sm mb-8">Register now to receive your digital invitation and skip the queue.</p>
                                
                                {event.isRegistered ? (
                                    <div className="flex flex-col items-center py-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                        <FaCheckCircle className="text-emerald-400 mb-2" size={32} />
                                        <span className="text-emerald-400 font-bold text-sm uppercase tracking-widest">Registered</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleParticipate}
                                        disabled={isRegistering}
                                        className="w-full bg-teal-500 hover:bg-teal-400 py-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isRegistering ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <FaTicketAlt />
                                                <span>Get Free Invitation</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Contact Card */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Organizer Contact</p>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                    {event.contact_name?.charAt(0) || "O"}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{event.contact_name || "Official Host"}</p>
                                    <p className="text-xs text-gray-500">Event Coordinator</p>
                                </div>
                            </div>
                            <a
                                href={`tel:${event.contact_phone}`}
                                className="flex items-center justify-center gap-3 w-full py-3 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 rounded-xl transition-all text-sm font-bold text-gray-600"
                            >
                                <FaPhoneAlt size={12} />
                                {event.contact_phone || "Request Support"}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;