// src/components/buyer/buyerDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import {
  LayoutDashboard, Bookmark, CalendarDays, Settings, LogOut, Menu, User, Loader2,
  ArrowLeft, Compass, Sparkles
} from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config.js";

import ProfileSettings from "./profileSettings";
import BuyerEvents from "./buyerEvents";
import BookmarkedProperties from "./BookmarkedProperties";
import EventCheckIn from "./EventCheckIn";
import StallCheckIn from "./StallCheckIn";
import EventDetails from "./EventDetails";
import LogoutDialog from "../../components/LogoutDialog";
import EventBookedBuilders from "./EventBookedBuilders";

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

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalEvents: 0, bookmarks: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    fetchBuyerStats();
  }, []);

  const fetchBuyerStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats({
        totalEvents: res.data.totalEvents || 0,
        bookmarks: res.data.bookmarks || 0
      });
    } catch (err) {
      console.error("Error fetching buyer stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("activeRole");
    navigate("/", { replace: true });
  };

  const isActive = (path) => {
    const isRoot = path === "/buyer-dashboard" || path === "/buyer-dashboard/";
    if (isRoot) {
      return (location.pathname === "/buyer-dashboard" || location.pathname === "/buyer-dashboard/");
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { to: "/buyer-dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: "/buyer-dashboard/bookmarks", label: "Saved Properties", icon: <Bookmark className="w-5 h-5" /> },
    { to: "/buyer-dashboard/events", label: "Explore Events", icon: <CalendarDays className="w-5 h-5" /> },
    { to: "/buyer-dashboard/profile-settings", label: "Profile Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const subRouteLabels = [
    { match: /\/events\/.*\/.*/, label: "Event Details", icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/events\//, label: "Event Details", icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/my-events\/builders\//, label: "Event Builders", icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/event-checkin\//, label: "Event Check-In", icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/stall-checkin\//, label: "Stall Check-In", icon: <CalendarDays className="w-5 h-5" /> },
  ];

  const activePage = (() => {
    const subMatch = subRouteLabels.find(r => r.match.test(location.pathname));
    if (subMatch) return subMatch;
    return navLinks.find(link =>
      link.to === "/buyer-dashboard" || link.to === "/buyer-dashboard/"
        ? location.pathname === "/buyer-dashboard" || location.pathname === "/buyer-dashboard/"
        : location.pathname.startsWith(link.to)
    ) || navLinks[0];
  })();

  return (
    <div className="min-h-screen bg-slate-50 flex relative text-slate-500" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* ================= SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          bg-gradient-to-b from-slate-800 to-slate-900 shadow-[0_4px_24px_rgba(15,23,42,0.15)] z-50`}
      >
        <div className="p-8 pb-6 border-b border-slate-700/50">
          <h1 className="text-3xl font-bold text-white tracking-[-1px]">NativeNest</h1>
          <p className="text-[11px] text-sky-400 mt-1 uppercase tracking-widest font-semibold">Buyer Portal</p>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide hover:scrollbar-show transition-all space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeSidebar}
                className={`flex items-center gap-3 py-3 px-4 rounded-[14px] text-sm font-medium transition-all duration-200 group ${active
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <span className={`${active ? "text-white" : "text-slate-400 group-hover:text-white"} transition-colors`}>{link.icon}</span>
                <span className="truncate">{link.label}</span>
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

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 md:ml-[280px] w-full min-w-0 transition-all duration-300 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 p-4 px-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-slate-500 hover:text-sky-500 transition-colors md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-slate-500">
              {activePage.icon}
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{activePage.label}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-sky-50 py-1.5 px-4 rounded-full border border-sky-100">
            <User className="text-sky-600 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sky-900 font-bold text-xs sm:text-sm uppercase truncate max-w-[100px] sm:max-w-none">
              Welcome, {user.name || "Buyer"}
            </span>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-[1600px] w-full mx-auto flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <div className="space-y-8 animate-in fade-in duration-500">

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {[
                      {
                        label: "Available Events",
                        val: stats.totalEvents,
                        icon: <CalendarDays className="w-6 h-6" />,
                        color: "text-sky-500",
                        bg: "bg-sky-50",
                        path: "/buyer-dashboard/events"
                      },
                      {
                        label: "Saved Properties",
                        val: stats.bookmarks,
                        icon: <Bookmark className="w-6 h-6" />,
                        color: "text-indigo-500",
                        bg: "bg-indigo-50",
                        path: "/buyer-dashboard/bookmarks"
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
                            {loadingStats ? (
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

                  {/* Welcome Area & Quick Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Intro Card */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-slate-200 relative overflow-hidden flex flex-col justify-center min-h-[320px]">
                      {/* Decorative fade */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3"></div>

                      <div className="relative z-10">
                        <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-[-0.5px]">
                          Great to see you, {user.name || "Buyer"}!
                        </h3>
                        <p className="text-slate-600 leading-relaxed mb-8 max-w-lg text-[15px]">
                          Stay ahead in your property search. Manage your saved properties,
                          discover upcoming events and connect with builders across NativeNest.
                        </p>
                        <div className="bg-gradient-to-r from-sky-50 to-white border-l-4 border-sky-400 p-5 rounded-r-[16px] max-w-xl shadow-[0_2px_8px_rgba(14,165,233,0.04)]">
                          <p className="text-sky-900 text-[14px] font-medium italic">
                            "Find a place where your story can unfold. Your journey to a new home starts with the right connections."
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 flex flex-col">
                      <div className="bg-white p-7 rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-5">Quick Links</h3>
                        <div className="grid gap-3">
                          <Link to="/buy" className="flex items-center gap-4 p-4 rounded-[16px] bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all duration-200 group cursor-pointer">
                            <div className="bg-emerald-50 p-2.5 rounded-xl shadow-sm border border-emerald-100/50 text-emerald-600 group-hover:scale-110 transition-all duration-300">
                              <Compass className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Browse Properties</span>
                          </Link>
                          <Link to="/buyer-dashboard/events" className="flex items-center gap-4 p-4 rounded-[16px] bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all duration-200 group cursor-pointer">
                            <div className="bg-indigo-50 p-2.5 rounded-xl shadow-sm border border-indigo-100/50 text-indigo-600 group-hover:scale-110 transition-all duration-300">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Explore Events</span>
                          </Link>
                          <Link to="/buyer-dashboard/profile-settings" className="flex items-center gap-4 p-4 rounded-[16px] bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200 group cursor-pointer">
                            <div className="bg-slate-100 p-2.5 rounded-xl shadow-sm border border-slate-200/50 text-slate-600 group-hover:scale-110 transition-all duration-300">
                              <Settings className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Edit Profile</span>
                          </Link>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-50 to-white p-7 rounded-[20px] border border-indigo-100 shadow-[0_4px_12px_rgba(99,102,241,0.04)] relative overflow-hidden flex-1">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-200/40 rounded-full blur-2xl"></div>
                        <h4 className="font-bold flex items-center gap-2 mb-3 text-indigo-900 z-10 relative">
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          Dashboard Tip
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium z-10 relative">
                          Use the "Saved Properties" section to keep track of listings you liked during events. It makes comparing options much easier later!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />

            <Route path="/events" element={<BuyerEvents />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/my-events/builders/:eventId" element={<EventBookedBuilders />} />
            <Route path="/bookmarks" element={<BookmarkedProperties />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/event-checkin/:eventId" element={<EventCheckIn />} />
            <Route path="/stall-checkin/:eventId/:stallId" element={<StallCheckIn />} />
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

export default BuyerDashboard;