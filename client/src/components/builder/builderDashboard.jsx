// src/components/builder/builderDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  LayoutDashboard, Building2, CalendarDays, Settings, LogOut, Menu, User, Loader2,
  Flame, PlusCircle, ArrowRight, TrendingUp, Sparkles 
} from "lucide-react";
import { isAfter, isBefore, addDays } from "date-fns";
import API_BASE_URL from "../../config.js";

// Component Imports
import BuilderProfileSettings from "./builderProfileSettings";
import BuilderEvents from "./BuilderEvents";
import BuilderProperties from "./BuilderProperties";
import PostProperty from "../../components/admin/postProperty";
import EditProperty from "../../components/admin/editProperty";
import StallBooking from "./StallBooking";
import BuilderStallInterests from "./BuilderStallInterests";
import LogoutDialog from "../../components/LogoutDialog";
import EventDetails from "../buyer/EventDetails";
import EventBookedStalls from "./EventBookedStalls";
import PropertyPreview from "../common/PropertyPreview";

/**
 * Animated Stat Counter Component
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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const isActive = (path) =>
    location.pathname === path || (path !== "/builder-dashboard/" && location.pathname.startsWith(path));

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

  const navLinks = [
    { to: "/builder-dashboard/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: "/builder-dashboard/my-properties", label: "My Properties", icon: <Building2 className="w-5 h-5" /> },
    { to: "/builder-dashboard/events", label: "Event Stalls", icon: <CalendarDays className="w-5 h-5" /> },
    { to: "/builder-dashboard/profile-settings", label: "Profile Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const subRouteLabels = [
    { match: /\/post-property/,        label: "Add Property",       icon: <Building2 className="w-5 h-5" /> },
    { match: /\/edit-property\//,      label: "Edit Property",      icon: <Building2 className="w-5 h-5" /> },
    { match: /\/events\/.*\/.*/, label: "Event Details",       icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/stall-booking\//,      label: "Stall Booking",      icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/event-bookings\//,     label: "Booked Stalls",      icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/interests/,            label: "Stall Interests",    icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/property-preview\//,   label: "Property Preview",   icon: <Building2 className="w-5 h-5" /> },
  ];

  const activePage = (() => {
    const subMatch = subRouteLabels.find(r => r.match.test(location.pathname));
    if (subMatch) return subMatch;
    return navLinks.find(link =>
      link.to === "/builder-dashboard/"
        ? location.pathname === "/builder-dashboard/"
        : location.pathname.startsWith(link.to)
    ) || navLinks[0];
  })();

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
    <div className="min-h-screen bg-slate-50 flex relative text-slate-500" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* ================= SIDEBAR ================= */}
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      <div 
        className={`fixed top-0 left-0 h-full w-[280px] flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-gradient-to-b from-slate-800 to-slate-900 shadow-[0_4px_24px_rgba(15,23,42,0.15)] z-50`}
      >
        <div className="p-8 pb-6 border-b border-slate-700/50">
          <h1 className="text-3xl font-bold text-white tracking-[-1px]">NativeNest</h1>
          <p className="text-[11px] text-sky-400 mt-1 uppercase tracking-widest font-semibold">Builder Portal</p>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide hover:scrollbar-show transition-all space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeSidebar}
                className={`flex items-center gap-3 py-3 px-4 rounded-[14px] text-sm font-medium transition-all duration-200 group ${
                  active 
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className={`${active ? "text-white" : "text-slate-400 group-hover:text-white"} transition-colors`}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-8 mt-auto">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full py-3 px-4 rounded-[14px] text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 md:ml-[280px] w-full min-w-0 transition-all duration-300 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 p-4 px-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="text-slate-500 hover:text-sky-500 transition-colors md:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-slate-500">
              {activePage.icon}
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{activePage.label}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium text-sm hidden sm:block">
              Welcome, <span className="text-slate-900">{user.name || "Builder"}</span>
            </span>
            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center border border-sky-100 shadow-sm text-sky-500">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-[1600px] mx-auto w-full flex-1">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8 animate-in fade-in duration-500">
                
                {/* Statistics Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {[
                    {
                      label: "Total Properties",
                      val: stats?.totals.properties,
                      icon: <Building2 className="w-6 h-6" />,
                      color: "text-sky-500",
                      bg: "bg-sky-50",
                      path: "/builder-dashboard/my-properties"
                    },
                    {
                      label: "Events Attended",
                      val: stats?.totals.eventsAttended,
                      icon: <CalendarDays className="w-6 h-6" />,
                      color: "text-indigo-500",
                      bg: "bg-indigo-50",
                      path: "/builder-dashboard/events"
                    },
                  ].map((card, idx) => (
                    <Link
                      key={idx}
                      to={card.path}
                      className="bg-white p-6 rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-slate-200 flex items-center justify-between transition-all duration-300 hover:border-sky-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:scale-[1.02] group"
                    >
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                          {card.label}
                        </p>
                        <h4 className="text-[32px] font-bold text-slate-900 mt-3 leading-none group-hover:text-emerald-500 transition-colors duration-300">
                          {loading ? (
                            <Loader2 className="animate-spin w-6 h-6 text-slate-400 mt-2" />
                          ) : (
                            <StatCounter targetValue={card.val} />
                          )}
                        </h4>
                      </div>
                      <div className={`${card.bg} ${card.color} w-[56px] h-[56px] rounded-[16px] flex items-center justify-center group-hover:scale-[1.1] transition-transform duration-300`}>
                        {card.icon}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Charts & Hot Events */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-7 rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-slate-200 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-sky-500" /> Listing Activity
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Last 6 Months</span>
                    </div>
                    <div className="flex-1 w-full min-h-[320px]">
                      {loading ? (
                        <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-sky-500 w-8 h-8" /></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis 
                              dataKey="month" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} 
                              dy={15} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }} 
                              dx={-10}
                            />
                            <Tooltip 
                              cursor={{ fill: '#F8FAFC' }} 
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: '1px solid #E2E8F0', 
                                boxShadow: '0 10px 15px -3px rgba(15,23,42,0.08)',
                                color: '#0F172A',
                                fontWeight: 500,
                                fontFamily: '"Inter", sans-serif'
                              }} 
                            />
                            <Bar dataKey="count" name="Properties" fill="#0EA5E9" radius={[6, 6, 0, 0]} barSize={24}>
                              {stats?.monthlyStats?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === stats?.monthlyStats.length - 1 ? '#0EA5E9' : '#7DD3FC'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 flex flex-col">
                    {hotEvents.length > 0 && (
                      <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-7 rounded-[20px] shadow-[0_4px_12px_rgba(249,115,22,0.15)] relative overflow-hidden">
                        <Flame className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 text-white" />
                        <h4 className="text-xl font-bold flex items-center gap-2 mb-3 text-white z-10 relative">
                          <Flame className="w-5 h-5 text-orange-200" /> Trending Events
                        </h4>
                        <p className="text-sm text-white/90 mb-6 z-10 relative font-medium leading-relaxed">
                          {hotEvents.length} exhibitions are currently active or starting soon. Don't miss out on stall bookings!
                        </p>
                        <Link to="/builder-dashboard/events" className="inline-flex items-center gap-2 bg-white text-orange-600 px-5 py-2.5 rounded-[12px] font-bold text-sm hover:scale-[1.02] transition-transform z-10 relative shadow-sm">
                          View & Book <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}

                    <div className="bg-white p-7 rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-slate-200 flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-5">Quick Actions</h3>
                      <div className="grid gap-3">
                        <Link to="/builder-dashboard/post-property" className="flex items-center gap-4 p-4 rounded-[16px] bg-slate-50 hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-all duration-200 group cursor-pointer">
                          <div className="bg-sky-50 p-2.5 rounded-xl shadow-sm text-sky-500 group-hover:scale-110 transition-all duration-300">
                            <PlusCircle className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-sky-700">Add New Property</span>
                        </Link>
                        <Link to="/builder-dashboard/events" className="flex items-center gap-4 p-4 rounded-[16px] bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all duration-200 group cursor-pointer">
                          <div className="bg-indigo-50 p-2.5 rounded-xl shadow-sm text-indigo-500 group-hover:scale-110 transition-all duration-300">
                            <CalendarDays className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Book Event Stalls</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            <Route path="/my-properties" element={<BuilderProperties />} />
            <Route path="/events" element={<BuilderEvents />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/stall-booking/:id" element={<StallBooking />} />
            <Route path="/event-bookings/:id" element={<EventBookedStalls />} />
            <Route path="/profile-settings" element={<BuilderProfileSettings />} />
            <Route path="/interests" element={<BuilderStallInterests />} />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
            <Route path="/property-preview/:id" element={<PropertyPreview />} />
          </Routes>
        </main>
      </div>
      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
};

export default BuilderDashboard;