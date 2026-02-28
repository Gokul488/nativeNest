import React, { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import {
  FaBars,
  FaUser,
  FaHome,
  FaCog,
  FaCalendarAlt,
  FaCalendarCheck,
  FaBookmark,
  FaSpinner,
  FaChartBar,
  FaPlusCircle
} from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../../config.js";

import ProfileSettings from "./profileSettings";
import BuyerEvents from "./buyerEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import EventBookedBuilders from "./EventBookedBuilders";
import BookmarkedProperties from "./BookmarkedProperties";
import EventCheckIn from "./EventCheckIn";
import StallCheckIn from "./StallCheckIn";

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
  const [stats, setStats] = useState({ myEvents: 0, totalEvents: 0, bookmarks: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchBuyerStats();
  }, []);

  const fetchBuyerStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching buyer stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const isActive = (path) =>
    location.pathname === path || (path !== "/buyer-dashboard" && location.pathname.startsWith(path))
      ? "bg-teal-700 shadow-inner"
      : "";

  return (
    <div className="min-h-screen bg-gray-50 flex relative font-sans">
      {/* ================= SIDEBAR (Admin Aesthetic) ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          bg-linear-to-b from-teal-600 to-teal-500 shadow-2xl z-50`}
      >
        <div className="p-6 border-b border-teal-400/40">
          <h1 className="text-3xl font-bold text-white tracking-tight">NativeNest</h1>
          <p className="text-sm text-teal-100 mt-1 opacity-90 uppercase tracking-widest font-bold">Buyer Portal</p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {[
            { to: "/buyer-dashboard", label: "Overview", icon: <FaHome /> },
            { to: "/buyer-dashboard/bookmarks", label: "Saved Properties", icon: <FaBookmark /> },
            { to: "/buyer-dashboard/events", label: "Explore Events", icon: <FaCalendarAlt /> },
            { to: "/buyer-dashboard/my-events", label: "My Events", icon: <FaCalendarCheck /> },
            { to: "/buyer-dashboard/profile-settings", label: "Profile Settings", icon: <FaCog /> },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeSidebar}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 text-white hover:bg-teal-400/40 ${isActive(link.to)}`}
            >
              {link.icon}
              <span className="truncate">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-teal-400/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition font-medium shadow-sm"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 md:ml-72 transition-all duration-300">
        <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-teal-600 md:hidden"
            >
              <FaBars className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-3 bg-teal-50 py-2 px-4 rounded-full">
            <FaUser className="text-teal-600 w-5 h-5" />
            <span className="text-teal-800 font-bold text-sm uppercase">
              Welcome, {user.name || "Buyer"}
            </span>
          </div>
        </header>

        <main className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <div className="space-y-8">
                  {/* Statistics Cards - Integrated with StatCounter logic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { 
                        label: "Registered Events", 
                        val: stats.myEvents, 
                        icon: <FaCalendarCheck />, 
                        color: "text-blue-600", 
                        bg: "bg-blue-50",
                        path: "/buyer-dashboard/my-events" 
                      },
                      { 
                        label: "Available Events", 
                        val: stats.totalEvents, 
                        icon: <FaCalendarAlt />, 
                        color: "text-orange-600", 
                        bg: "bg-orange-50",
                        path: "/buyer-dashboard/events" 
                      },
                      { 
                        label: "Saved Properties", 
                        val: stats.bookmarks, 
                        icon: <FaBookmark />, 
                        color: "text-teal-600", 
                        bg: "bg-teal-50",
                        path: "/buyer-dashboard/bookmarks" 
                      },
                    ].map((card, idx) => (
                      <Link 
                        key={idx} 
                        to={card.path}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all duration-200 hover:shadow-md hover:border-teal-200 group"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide group-hover:text-teal-600">{card.label}</p>
                          <h4 className="text-3xl font-bold text-gray-800 mt-1">
                            {loadingStats ? (
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

                  {/* Welcome Area & Quick Actions - Mirrored from Admin Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        Great to see you, {user.name}!
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        Stay ahead in your property search. Here you can track all the events you've registered for, 
                        manage your saved properties, and discover new opportunities across NativeNest.
                      </p>
                      <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-xl">
                        <p className="text-teal-800 text-sm font-medium italic">
                          "Find a place where your story can unfold. Your journey to a new home starts with the right connections."
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                        <div className="grid gap-3">
                          <Link to="/buyer-dashboard/events" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors group">
                            <FaPlusCircle className="text-teal-600 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-semibold text-gray-700">Explore Events</span>
                          </Link>
                          <Link to="/buyer-dashboard/profile-settings" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors group">
                            <FaPlusCircle className="text-teal-600 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-semibold text-gray-700">Edit Profile</span>
                          </Link>
                        </div>
                      </div>

                      <div className="bg-linear-to-br from-teal-600 to-teal-700 p-6 rounded-2xl text-white shadow-lg">
                         <h4 className="font-bold flex items-center gap-2 mb-2"><FaChartBar /> Dashboard Tip</h4>
                         <p className="text-sm text-teal-50 leading-relaxed">
                           Use the "Saved Properties" section to keep track of listings you liked during events. It makes comparing options much easier later!
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />

            <Route path="/my-events" element={<MyRegisteredEvents />} />
            <Route path="/my-events/builders/:eventId" element={<EventBookedBuilders />} />
            <Route path="/events" element={<BuyerEvents />} />
            <Route path="/bookmarks" element={<BookmarkedProperties />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/event-checkin/:eventId" element={<EventCheckIn />} />
            <Route path="/stall-checkin/:eventId/:stallId" element={<StallCheckIn />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default BuyerDashboard;