import React, { useState, useEffect } from "react";
import { Link, useNavigate, Routes, Route, useLocation } from "react-router-dom";
import {
  FaBars,
  FaUser,
  FaHome,
  FaCog,
  FaBuilding,
  FaCalendarAlt,
  FaPlus,
  FaFireAlt,
  FaArrowRight,
  FaSignOutAlt,
} from "react-icons/fa";

import BuilderProfileSettings from "./builderProfileSettings";
import BuilderEvents from "./BuilderEvents";
import BuilderProperties from "./BuilderProperties";
import PostProperty from "../admin/postProperty";
import EditProperty from "../admin/editProperty";
import StallBooking from "./StallBooking";
import axios from "axios";
import { format, isAfter, isBefore, addDays } from "date-fns";
import API_BASE_URL from "../../config.js";

const BuilderDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const isActive = (path) =>
    location.pathname === path 
      ? "bg-white/10 text-white border-l-4 border-white shadow-sm" 
      : "text-teal-50 hover:bg-white/5 hover:text-white";

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(`${API_BASE_URL}/api/builder/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingEvents(response.data.events || []);
      } catch (err) {
        console.error("Banner fetch error:", err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchUpcomingEvents();
  }, []);

  const isHotEvent = (event) => {
    const today = new Date();
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : start;
    return (isAfter(today, start) && isBefore(today, addDays(end, 1))) ||
           (isAfter(start, today) && isBefore(start, addDays(today, 15)));
  };

  const hotEvents = upcomingEvents.filter(isHotEvent);
  const hasHotEvents = hotEvents.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative font-sans text-slate-900">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 flex flex-col transition-all duration-300 ease-in-out z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        bg-[#0F172A] shadow-2xl`}
      >
        <div className="p-8">
          <h1 className="text-xl font-black text-white tracking-widest uppercase italic">
            Native<span className="text-teal-400">Nest</span>
          </h1>
          <p className="text-[10px] text-teal-500 font-bold tracking-[0.2em] mt-1">BUILDER PORTAL</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <SidebarItem to="/builder-dashboard/" icon={<FaHome />} label="Overview" active={isActive("/builder-dashboard/")} onClick={closeSidebar} />
          <SidebarItem to="/builder-dashboard/my-properties" icon={<FaBuilding />} label="Properties" active={isActive("/builder-dashboard/my-properties")} onClick={closeSidebar} />
          <SidebarItem to="/builder-dashboard/events" icon={<FaCalendarAlt />} label="Event Stalls" active={isActive("/builder-dashboard/events")} onClick={closeSidebar} />
          <SidebarItem to="/builder-dashboard/profile-settings" icon={<FaCog />} label="Settings" active={isActive("/builder-dashboard/profile-settings")} onClick={closeSidebar} />
        </nav>

        <div className="p-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full py-3 px-4 rounded-xl text-teal-100 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 md:ml-72 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 px-8 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="p-2 bg-slate-100 rounded-lg text-slate-600 md:hidden">
              <FaBars />
            </button>
            <h2 className="text-lg font-bold text-slate-800">Workspace</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{user.name || "Builder User"}</span>
              <span className="text-xs text-slate-500 capitalize">{user.role || "Verified Builder"}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
              {user.name?.charAt(0) || "B"}
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8 animate-in fade-in duration-700">
                {/* ── PREMIUM HOT EVENTS BANNER ── */}
                {!eventsLoading && hasHotEvents && (
                  <div className="relative group overflow-hidden bg-slate-900 rounded-4xl shadow-2xl border border-white/10">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-orange-500/20 to-transparent skew-x-12 transform translate-x-20"></div>
                    
                    <div className="relative px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-start gap-6">
                        <div className="p-4 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/40 animate-bounce-slow">
                          <FaFireAlt className="text-3xl text-white" />
                        </div>
                        <div>
                          <div className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs font-bold tracking-widest uppercase mb-2">
                            Limited Stalls Available
                          </div>
                          <h3 className="text-3xl font-black text-white tracking-tight">
                            {hotEvents.length} Active Exhibition{hotEvents.length !== 1 ? "s" : ""}
                          </h3>
                          <p className="text-slate-400 mt-1 max-w-md">
                            Showcase your properties to thousands of verified buyers this week.
                          </p>
                        </div>
                      </div>

                      <Link to="/builder-dashboard/events" className="group/btn relative inline-flex items-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black transition-all hover:pr-12 hover:bg-teal-400 active:scale-95 shadow-xl">
                        BOOK NOW
                        <FaArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Welcome & Stats Teaser */}
                <section>
                  <div className="flex flex-col mb-8">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                      Welcome, <span className="text-teal-600">{user.name?.split(" ")[0] || "Builder"}</span>.
                    </h3>
                    <p className="text-slate-500 font-medium mt-1">Here is what's happening with your properties today.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard to="/builder-dashboard/my-properties" icon={<FaBuilding />} title="My Listings" desc="Manage properties" color="teal" />
                    <DashboardCard to="/builder-dashboard/post-property" icon={<FaPlus />} title="New Listing" desc="Add new property" color="indigo" />
                    <DashboardCard to="/builder-dashboard/events" icon={<FaCalendarAlt />} title="Exhibitions" desc="View events calendar" color="orange" />
                    <DashboardCard to="/builder-dashboard/profile-settings" icon={<FaCog />} title="Preferences" desc="Account & Security" color="slate" />
                  </div>
                </section>

                {/* Upcoming Events Preview */}
                {!eventsLoading && upcomingEvents.length > 0 && (
                  <section className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-end mb-8">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">Nearby Events</h4>
                        <p className="text-slate-500 text-sm">Targeted exposure in your region</p>
                      </div>
                      <Link to="/builder-dashboard/events" className="text-teal-600 font-bold hover:text-teal-700 underline-offset-4 hover:underline transition-all">View All</Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {upcomingEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-teal-200 transition-all duration-300">
                          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2">{event.city}</p>
                          <h5 className="font-bold text-slate-800 mb-4 group-hover:text-teal-700">{event.event_name}</h5>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-medium text-slate-500">{format(new Date(event.start_date), "MMM dd, yyyy")}</span>
                            <Link to={`/builder-dashboard/stall-booking/${event.id}`} className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors">
                              <FaArrowRight size={12} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            } />
            <Route path="/events" element={<BuilderEvents />} />
            <Route path="/stall-booking/:id" element={<StallBooking />} />
            <Route path="/profile-settings" element={<BuilderProfileSettings />} />
            <Route path="/my-properties" element={<BuilderProperties />} />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
          </Routes>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={closeSidebar} />}
      
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

// Sub-components for cleaner code
const SidebarItem = ({ to, icon, label, active, onClick }) => (
  <Link to={to} onClick={onClick} className={`flex items-center space-x-4 py-3.5 px-6 rounded-xl transition-all duration-300 font-semibold tracking-wide ${active}`}>
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
  </Link>
);

const DashboardCard = ({ to, icon, title, desc, color }) => {
  const colors = {
    teal: "bg-teal-50 text-teal-600",
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <Link to={to} className="group bg-white p-8 rounded-4xl border border-slate-200 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 ${colors[color]}`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h4 className="text-lg font-black text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 mt-1 font-medium">{desc}</p>
    </Link>
  );
};

export default BuilderDashboard;