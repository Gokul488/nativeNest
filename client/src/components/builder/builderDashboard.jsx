// src/components/builderDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  FaBars, FaUser, FaHome, FaBuilding, FaCalendarAlt, FaCog,
  FaEnvelope, FaPlusCircle, FaFireAlt, FaArrowRight, FaChartLine, FaSpinner
} from "react-icons/fa";
import { isAfter, isBefore, addDays } from "date-fns";
import API_BASE_URL from "../../config.js";

// Component Imports
import BuilderProfileSettings from "./builderProfileSettings";
import BuilderEvents from "./BuilderEvents";
import BuilderProperties from "./BuilderProperties";
import PostProperty from "../admin/postProperty";
import EditProperty from "../admin/editProperty";
import StallBooking from "./StallBooking";
import BuilderStallInterests from "./BuilderStallInterests";

/**
 * Animated Stat Counter Component
 * Transitions a number from 0 to the target value
 */
const StatCounter = ({ targetValue, duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!targetValue) return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * targetValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [targetValue, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const BuilderDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const isActive = (path) =>
    location.pathname === path || (path !== "/builder-dashboard/" && location.pathname.startsWith(path))
      ? "bg-teal-700 shadow-inner"
      : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [statsRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/builder/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/builder/events`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setStats(statsRes.data);
        setUpcomingEvents(eventsRes.data.events || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hotEvents = useMemo(() => {
    const today = new Date();
    return upcomingEvents.filter(event => {
      const start = new Date(event.start_date);
      const end = event.end_date ? new Date(event.end_date) : start;
      return (
        (isAfter(today, start) && isBefore(today, addDays(end, 1))) ||
        (isAfter(start, today) && isBefore(start, addDays(today, 15)))
      );
    });
  }, [upcomingEvents]);

  return (
    <div className="min-h-screen bg-gray-50 flex relative font-sans">
      {/* ================= SIDEBAR ================= */}
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} bg-linear-to-b from-teal-600 to-teal-500 shadow-2xl z-50`}>
        <div className="p-6 border-b border-teal-400/40">
          <h1 className="text-3xl font-bold text-white tracking-tight">NativeNest</h1>
          <p className="text-sm text-teal-100 mt-1 opacity-90 uppercase tracking-widest font-bold">Builder Portal</p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {[
            { to: "/builder-dashboard/", label: "Overview", icon: <FaHome /> },
            { to: "/builder-dashboard/my-properties", label: "My Properties", icon: <FaBuilding /> },
            { to: "/builder-dashboard/events", label: "Event Stalls", icon: <FaCalendarAlt /> },
            { to: "/builder-dashboard/profile-settings", label: "Profile Settings", icon: <FaCog /> },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 text-white hover:bg-teal-400/40 ${isActive(item.to)}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-teal-400/40">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition shadow-sm font-bold">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 md:ml-72 transition-all duration-300 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="text-teal-600 md:hidden p-2 hover:bg-teal-50 rounded-lg">
              <FaBars className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-teal-50 py-1.5 px-3 sm:py-2 sm:px-4 rounded-full border border-teal-100">
            <FaUser className="text-teal-600 text-sm sm:text-base" />
            <span className="text-teal-800 font-bold text-xs sm:text-sm uppercase truncate max-w-[120px] sm:max-w-none">
              {user.name || "Builder"}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8">

                {/* Statistics Cards - Standardized Size & Stat Counter (Buyer Interest Count Removed) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {[
                    {
                      label: "Total Properties",
                      val: stats?.totals.properties,
                      icon: <FaBuilding />,
                      color: "text-teal-600",
                      bg: "bg-teal-50",
                      path: "/builder-dashboard/my-properties"
                    },
                    {
                      label: "Events Attended",
                      val: stats?.totals.eventsAttended,
                      icon: <FaCalendarAlt />,
                      color: "text-orange-600",
                      bg: "bg-orange-50",
                      path: "/builder-dashboard/events"
                    },
                  ].map((card, idx) => (
                    <Link
                      key={idx}
                      to={card.path}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all duration-200 hover:shadow-md hover:border-teal-200 group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide group-hover:text-teal-600 transition-colors">
                          {card.label}
                        </p>
                        <h4 className="text-3xl font-bold text-gray-800 mt-1">
                          {loading ? (
                            <FaSpinner className="animate-spin text-sm" />
                          ) : (
                            <StatCounter targetValue={card.val} />
                          )}
                        </h4>
                      </div>
                      <div className={`${card.bg} ${card.color} p-4 rounded-xl text-2xl group-hover:scale-110 transition-transform`}>
                        {card.icon}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Charts & Hot Events */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FaChartLine className="text-teal-600" /> Listing Activity
                      </h3>
                      <span className="text-xs font-bold text-gray-400 uppercase">Last 6 Months</span>
                    </div>
                    <div className="h-72 w-full">
                      {loading ? (
                        <div className="h-full flex items-center justify-center"><FaSpinner className="animate-spin text-teal-500 text-3xl" /></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.monthlyStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="count" name="Properties" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={35}>
                              {stats?.monthlyStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === stats.monthlyStats.length - 1 ? '#0d9488' : '#99f6e4'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {hotEvents.length > 0 && (
                      <div className="bg-linear-to-br from-orange-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                        <FaFireAlt className="absolute -right-4 -bottom-4 text-8xl opacity-20" />
                        <h4 className="text-xl font-bold flex items-center gap-2 mb-2">
                          Trending Events
                        </h4>
                        <p className="text-sm opacity-90 mb-4">
                          {hotEvents.length} exhibitions are currently active or starting soon. Don't miss out on stall bookings!
                        </p>
                        <Link to="/builder-dashboard/events" className="inline-flex items-center gap-2 bg-white text-orange-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors">
                          View & Book <FaArrowRight size={12} />
                        </Link>
                      </div>
                    )}

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Link to="/builder-dashboard/post-property" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors group">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-teal-600 group-hover:scale-110 transition-transform"><FaPlusCircle /></div>
                          <span className="text-sm font-bold text-gray-700">Add New Property</span>
                        </Link>
                        <Link to="/builder-dashboard/events" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors group">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-orange-600 group-hover:scale-110 transition-transform"><FaCalendarAlt /></div>
                          <span className="text-sm font-bold text-gray-700">Book Event Stalls</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            <Route path="/my-properties" element={<BuilderProperties />} />
            <Route path="/events" element={<BuilderEvents />} />
            <Route path="/stall-booking/:id" element={<StallBooking />} />
            <Route path="/profile-settings" element={<BuilderProfileSettings />} />
            <Route path="/interests" element={<BuilderStallInterests />} />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default BuilderDashboard;