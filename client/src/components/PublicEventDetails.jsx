// src/components/PublicEventDetails.jsx
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
    FaRegCalendarCheck,
    FaChevronRight
} from "react-icons/fa";
import Header from "./header";
import Footer from "./footer";
import API_BASE_URL from "../config.js";

const PublicEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const HEADER_HEIGHT = 72;

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token && user.account_type === 'buyer';

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
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
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
            <div className="flex flex-col justify-center items-center min-h-screen gap-4 bg-slate-50">
                <div className="h-12 w-12 rounded-full border-4 border-[#2e6171]/20 border-t-[#2e6171] animate-spin"></div>
                <p className="text-[#2e6171] font-bold uppercase tracking-widest text-xs">Loading Event details…</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="bg-white rounded-3xl p-12 text-center shadow-[0_4px_32px_rgba(1,25,54,0.06)] border border-slate-100 max-w-lg w-full">
                    <FaInfoCircle size={48} className="text-red-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-[#011936] mb-4">{error || "Event not found"}</h3>
                    <button onClick={() => navigate('/events')} className="bg-[#2e6171] text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-[#2e6171]/20 hover:bg-[#011936] transition-all">← Return to Events</button>
                </div>
            </div>
        );
    }

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const isOneDay = startDate.toDateString() === endDate.toDateString();

    const formatDate = (date) => date.toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' });
    const formatShortDate = (date) => date.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' });

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Header />
            <main style={{ paddingTop: HEADER_HEIGHT }}>
                {/* HERO */}
                <div className="relative w-full overflow-hidden" style={{ height: 'clamp(400px, 50vh, 600px)' }}>
                    {event.banner_image ? (
                        <img src={event.banner_image} alt={event.event_name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" style={{ filter: 'brightness(0.7)' }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#011936] via-[#0d3347] to-[#2e6171]">
                            <FaRegCalendarCheck className="text-white/10 text-9xl absolute" />
                            <div className="text-center z-10 p-4">
                                <h1 className="text-white font-bold text-4xl sm:text-5xl md:text-6xl mb-4 tracking-tight shadow-xl">{event.event_name}</h1>
                                <p className="text-[#7eb8c4] font-semibold text-lg uppercase tracking-widest">{event.city} • {formatShortDate(startDate)}</p>
                            </div>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#011936] to-transparent opacity-80" />
                    
                    <button
                        onClick={() => navigate('/events')}
                        className="absolute top-8 left-8 flex items-center gap-2 font-bold text-sm text-white/90 bg-white/10 backdrop-blur-md border border-white/20 py-3 px-6 rounded-2xl hover:bg-white/20 transition-all shadow-xl"
                    >
                        <FaArrowLeft size={12} /> Back to List
                    </button>

                    {event.banner_image && (
                        <div className="absolute bottom-0 left-0 right-0 px-8 sm:px-12 lg:px-20 pb-12">
                            <span className="inline-flex px-4 py-1.5 rounded-full text-[11px] font-bold uppercase mb-4 bg-[#2e6171] text-white tracking-widest shadow-lg">{event.event_type || "Exhibition"}</span>
                            <h1 className="text-white font-bold text-4xl sm:text-5xl md:text-6xl mb-6 tracking-tight line-clamp-2 max-w-4xl">{event.event_name}</h1>
                            
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                                    <FaMapMarkerAlt className="text-[#7eb8c4]" />
                                    {event.city}
                                </div>
                                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                                    <FaCalendarAlt className="text-[#7eb8c4]" />
                                    {formatShortDate(startDate)}{!isOneDay && ` – ${formatShortDate(endDate)}`}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-16">
                    <div className="grid lg:grid-cols-12 gap-12">
                        
                        {/* MAIN INFO */}
                        <div className="lg:col-span-8 space-y-12">
                             {/* Features Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
                                    { icon: <FaCalendarAlt />, label: 'Event Date', val: isOneDay ? formatDate(startDate) : `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { icon: <FaClock />, label: 'Visiting Hours', val: `${event.start_time?.slice(0, 5) || "09:00"} – ${event.end_time?.slice(0, 5) || "18:00"}`, color: 'text-amber-500', bg: 'bg-amber-50' },
                                    { icon: <FaBuilding />, label: 'Exhibitors', val: `${event.stall_count || 50}+ Property Brands`, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                                        <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                            {item.icon}
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{item.label}</p>
                                        <p className="text-slate-900 font-bold text-lg leading-tight">{item.val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/40">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#2e6171] to-[#011936]" />
                                    <h2 className="text-2xl font-bold text-[#011936] tracking-tight">Event Overview</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">
                                    {event.description || "Register for our exclusive property exhibition and explore the finest residential projects. Our curated selection of builders offers premium living spaces across the city. This is a one-stop destination for home buyers looking for trust, transparency, and top-tier amenities."}
                                </p>
                            </div>

                            {/* Venue */}
                            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
                                <div className="flex items-center gap-4 mb-8 relative z-10">
                                    <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#2e6171] to-[#011936]" />
                                    <h2 className="text-2xl font-bold text-[#011936] tracking-tight">Location & Venue</h2>
                                </div>
                                <div className="flex items-start gap-6 relative z-10">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100 shrink-0">
                                        <FaMapMarkerAlt className="text-[#2e6171] text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-bold text-xl mb-1">{event.event_location}</p>
                                        <p className="text-slate-500 font-semibold">{event.city}, {event.state || 'India'}</p>
                                        <div className="mt-4 inline-flex items-center gap-2 text-[#2e6171] font-bold text-sm hover:underline cursor-pointer">
                                            Open in Google Maps <FaChevronRight size={10} />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                                     <FaMapMarkerAlt size={200} />
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-28 space-y-8">
                                {/* Registration Card */}
                                <div className="bg-gradient-to-br from-[#011936] to-[#2e6171] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
                                    
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-xl">
                                            <FaTicketAlt className="text-[#7eb8c4] text-xl" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4 tracking-tight">Secure Your Invitation</h3>
                                        <p className="text-white/60 text-sm mb-10 leading-relaxed font-medium">Register for free to receive your exclusive event entry pass and get VIP access to pre-launch property updates.</p>

                                        {event.isRegistered ? (
                                            <div className="flex flex-col items-center py-6 rounded-2xl bg-white/5 border border-white/20 backdrop-blur-sm">
                                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                                                    <FaCheckCircle size={24} className="text-green-400" />
                                                </div>
                                                <span className="font-bold text-xs uppercase tracking-widest text-green-400">Successfully Registered</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleParticipate}
                                                disabled={isRegistering}
                                                className="w-full bg-white text-[#011936] py-4 rounded-2xl font-bold text-base shadow-2xl hover:bg-[#7eb8c4] hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {isRegistering ? (
                                                    <div className="h-5 w-5 rounded-full border-2 border-[#011936]/20 border-t-[#011936] animate-spin mx-auto"></div>
                                                ) : (
                                                    isLoggedIn ? "Register for Free" : "Login to Register"
                                                )}
                                            </button>
                                        )}
                                        
                                        {!isLoggedIn && !event.isRegistered && (
                                            <p className="text-center text-white/40 text-[10px] mt-4 font-bold uppercase tracking-widest">Digital Entry Pass Required</p>
                                        )}
                                    </div>
                                </div>

                                {/* Organizer Card */}
                                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8">Event Organizer</p>
                                    
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#2e6171] font-bold text-2xl shadow-inner border border-slate-100">
                                            {event.contact_name?.charAt(0) || <FaUserAlt size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-[#011936] font-bold text-lg leading-none mb-1">{event.contact_name || "Official Host"}</p>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Organizer Support</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <a href={`tel:${event.contact_phone}`} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-slate-50 text-[#2e6171] font-bold text-sm border border-slate-100 hover:bg-[#2e6171] hover:text-white transition-all shadow-sm">
                                            <FaPhoneAlt size={12} /> {event.contact_phone || "Support Helpline"}
                                        </a>
                                        <button className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-slate-400 font-bold text-sm hover:text-[#2e6171] transition-all">
                                            <FaShareAlt size={12} /> Share Event
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PublicEventDetails;
