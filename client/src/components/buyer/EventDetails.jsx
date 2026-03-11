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
            <div className="flex flex-col justify-center items-center min-h-[500px] gap-4" style={{ background: '#f5f3ee' }}>
                <div className="h-11 w-11 rounded-full" style={{ border: '2px solid rgba(46,97,113,0.2)', borderTopColor: '#2e6171', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: '#2e6171', fontSize: '0.85rem', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>Loading event…</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-lg mx-auto mt-20 p-10 text-center bg-white rounded-3xl" style={{ boxShadow: '0 4px 32px rgba(1,25,54,0.08)' }}>
                <FaInfoCircle size={36} style={{ color: '#e87c7c', margin: '0 auto 1rem' }} />
                <h3 className="text-xl font-bold mb-3" style={{ color: '#011936' }}>{error || "Event not found"}</h3>
                <button onClick={() => navigate(-1)} className="font-semibold text-sm" style={{ color: '#2e6171' }}>← Return to Events</button>
            </div>
        );
    }

    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const isOneDay = startDate.toDateString() === endDate.toDateString();

    const formatDate = (date) => date.toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' });
    const formatShortDate = (date) => date.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' });

    return (
        <div className="min-h-screen" style={{ background: '#f5f3ee' }}>

            {/* ── HERO ── */}
            <div className="relative w-full overflow-hidden" style={{ height: 'clamp(380px, 52vh, 600px)' }}>
                {event.banner_image ? (
                    <img src={event.banner_image} alt={event.event_name} className="w-full h-full object-cover" style={{ filter: 'brightness(0.72)' }} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #011936 0%, #0d3347 60%, #2e6171 100%)' }}>
                        <FaRegCalendarCheck style={{ color: 'rgba(255,255,255,0.07)', fontSize: '9rem' }} />
                    </div>
                )}

                {/* Gradient overlays */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(1,25,54,0.95) 0%, rgba(1,25,54,0.4) 55%, transparent 100%)' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(1,25,54,0.3) 0%, transparent 60%)' }} />

                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 flex items-center gap-2 font-semibold text-sm transition-all"
                    style={{ color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)', padding: '8px 18px', borderRadius: '100px', letterSpacing: '0.03em' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                >
                    <FaArrowLeft size={11} /> Back
                </button>

                {/* Share */}
                <button
                    className="absolute top-6 right-6 flex items-center justify-center transition-all"
                    style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%', color: 'rgba(255,255,255,0.8)' }}
                >
                    <FaShareAlt size={14} />
                </button>

                {/* Hero content */}
                <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 lg:px-14 pb-10">
                    {/* Event type badge */}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-4"
                        style={{ background: 'rgba(46,97,113,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', letterSpacing: '0.12em' }}>
                        {event.event_type || "Exhibition"}
                    </span>

                    <h1 className="text-white font-bold mb-5"
                        style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', lineHeight: 1.18, letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0,0,0,0.25)', maxWidth: '700px' }}>
                        {event.event_name}
                    </h1>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-2.5">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                            <FaMapMarkerAlt style={{ color: '#7eb8c4' }} />
                            {event.event_location}, {event.city}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                            <FaCalendarAlt style={{ color: '#7eb8c4' }} />
                            {formatShortDate(startDate)}{!isOneDay && ` – ${formatShortDate(endDate)}`}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                            <FaClock style={{ color: '#7eb8c4' }} />
                            {event.start_time?.slice(0, 5) || "09:00"} – {event.end_time?.slice(0, 5) || "18:00"}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* ── LEFT / MAIN ── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Stats row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                {
                                    icon: <FaCalendarAlt />,
                                    label: 'Date',
                                    value: isOneDay ? formatDate(startDate) : `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`,
                                    accent: '#2e6171',
                                    bg: 'rgba(46,97,113,0.08)',
                                },
                                {
                                    icon: <FaClock />,
                                    label: 'Timings',
                                    value: `${event.start_time?.slice(0, 5) || "09:00"} – ${event.end_time?.slice(0, 5) || "18:00"}`,
                                    accent: '#b45309',
                                    bg: 'rgba(180,83,9,0.07)',
                                },
                                {
                                    icon: <FaBuilding />,
                                    label: 'Builders',
                                    value: `${event.stall_count || 0} Stalls`,
                                    accent: '#065f46',
                                    bg: 'rgba(6,95,70,0.07)',
                                },
                            ].map(({ icon, label, value, accent, bg }) => (
                                <div key={label} className="rounded-2xl p-5 bg-white flex flex-col gap-3"
                                    style={{ boxShadow: '0 2px 16px rgba(1,25,54,0.06)', border: '1px solid rgba(1,25,54,0.06)' }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                                        style={{ background: bg, color: accent }}>
                                        {icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#9ca3af' }}>{label}</p>
                                        <p className="font-bold text-sm leading-snug" style={{ color: '#011936' }}>{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* About section */}
                        <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 2px 16px rgba(1,25,54,0.06)', border: '1px solid rgba(1,25,54,0.06)' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
                                <h2 className="font-bold text-lg" style={{ color: '#011936', letterSpacing: '-0.01em' }}>About the Event</h2>
                            </div>
                            <p className="leading-relaxed text-[15px]" style={{ color: '#4b5563' }}>
                                {event.description || "Join us for an exclusive gathering where luxury meets convenience. Discover your next dream property among the finest selections of modern living spaces."}
                            </p>
                        </div>

                        {/* Location detail */}
                        <div className="bg-white rounded-3xl p-8" style={{ boxShadow: '0 2px 16px rgba(1,25,54,0.06)', border: '1px solid rgba(1,25,54,0.06)' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
                                <h2 className="font-bold text-lg" style={{ color: '#011936', letterSpacing: '-0.01em' }}>Venue</h2>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(46,97,113,0.08)' }}>
                                    <FaMapMarkerAlt style={{ color: '#2e6171' }} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm mb-0.5" style={{ color: '#011936' }}>{event.event_location}</p>
                                    <p className="text-sm" style={{ color: '#6b7280' }}>{event.city}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <div className="space-y-5">
                        <div className="sticky top-8 space-y-5">

                            {/* Registration card */}
                            <div className="rounded-3xl p-7 relative overflow-hidden text-white"
                                style={{ background: 'linear-gradient(135deg, #011936 0%, #0d3347 55%, #2e6171 100%)', boxShadow: '0 8px 40px rgba(1,25,54,0.28)' }}>

                                {/* Subtle decorative ring */}
                                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
                                    style={{ border: '1px solid rgba(255,255,255,0.07)' }} />
                                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
                                    style={{ border: '1px solid rgba(255,255,255,0.05)' }} />

                                <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <FaTicketAlt style={{ color: '#7eb8c4' }} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-1.5">Secure Your Entry</h3>
                                    <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        Register now to receive your digital invitation and skip the queue.
                                    </p>

                                    {user?.account_type !== "builder" && (
                                        event.isRegistered ? (
                                            <div className="flex flex-col items-center py-5 rounded-2xl" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                                                <FaCheckCircle size={28} style={{ color: '#34d399', marginBottom: '8px' }} />
                                                <span className="font-bold text-xs uppercase tracking-widest" style={{ color: '#34d399' }}>You're Registered</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleParticipate}
                                                disabled={isRegistering}
                                                className="w-full flex items-center justify-center gap-2.5 font-bold text-sm py-4 rounded-2xl transition-all disabled:opacity-50"
                                                style={{ background: 'linear-gradient(135deg, #2e6171, #3a7d91)', color: 'white', boxShadow: '0 6px 20px rgba(46,97,113,0.4)', letterSpacing: '0.03em' }}
                                                onMouseEnter={e => !isRegistering && (e.currentTarget.style.boxShadow = '0 8px 28px rgba(46,97,113,0.55)')}
                                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,97,113,0.4)'}
                                            >
                                                {isRegistering ? (
                                                    <div className="h-4 w-4 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />
                                                ) : (
                                                    <><FaTicketAlt size={13} /> Get Free Invitation</>
                                                )}
                                            </button>
                                        )
                                    )}

                                    {user?.account_type === "builder" && (
                                        <div className="flex flex-col items-center py-5 rounded-2xl" style={{ background: 'rgba(46,97,113,0.15)', border: '1px solid rgba(46,97,113,0.3)' }}>
                                            <FaInfoCircle size={24} style={{ color: '#7eb8c4', marginBottom: '8px' }} />
                                            <span className="text-xs text-center px-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                                Book your exhibition stall from the builder dashboard.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact card */}
                            <div className="bg-white rounded-3xl p-7" style={{ boxShadow: '0 2px 16px rgba(1,25,54,0.06)', border: '1px solid rgba(1,25,54,0.06)' }}>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-5" style={{ color: '#9ca3af' }}>Organizer</p>

                                <div className="flex items-center gap-3.5 mb-6">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, rgba(46,97,113,0.12), rgba(1,25,54,0.08))', color: '#2e6171' }}>
                                        {event.contact_name?.charAt(0)?.toUpperCase() || "O"}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: '#011936' }}>{event.contact_name || "Official Host"}</p>
                                        <p className="text-xs" style={{ color: '#9ca3af' }}>Event Coordinator</p>
                                    </div>
                                </div>

                                <a
                                    href={`tel:${event.contact_phone}`}
                                    className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sm font-bold transition-all"
                                    style={{ background: '#f5f3ee', color: '#2e6171', border: '1px solid #e8e4da' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(46,97,113,0.08)'; e.currentTarget.style.borderColor = 'rgba(46,97,113,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#f5f3ee'; e.currentTarget.style.borderColor = '#e8e4da'; }}
                                >
                                    <FaPhoneAlt size={11} />
                                    {event.contact_phone || "Request Support"}
                                </a>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default EventDetails;