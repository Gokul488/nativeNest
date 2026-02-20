// src/components/builderDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, Routes, Route, useLocation } from "react-router-dom";
import {
  FaBars,
  FaChartBar,
  FaUser,
  FaHome,
  FaBuilding,
  FaCalendarAlt,
  FaCog,
  FaEnvelope,
  FaPlusCircle,
  FaFireAlt,
  FaArrowRight,
} from "react-icons/fa";

import BuilderProfileSettings from "./builderProfileSettings";
import BuilderEvents from "./BuilderEvents";
import BuilderProperties from "./BuilderProperties";
import PostProperty from "../admin/postProperty";      // shared component
import EditProperty from "../admin/editProperty";      // shared component
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
    location.pathname === path || (path !== "/builder-dashboard/" && location.pathname.startsWith(path))
      ? "bg-teal-700"
      : "";

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
        console.error("Events fetch error:", err);
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
    return (
      (isAfter(today, start) && isBefore(today, addDays(end, 1))) ||
      (isAfter(start, today) && isBefore(start, addDays(today, 15)))
    );
  };

  const hotEvents = upcomingEvents.filter(isHotEvent);
  const hasHotEvents = hotEvents.length > 0;

  return (
    <div className="min-h-screen bg-cream-50 flex relative font-sans">
      {/* ================= SIDEBAR ================= */}
      <div
        className={`fixed top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          bg-linear-to-b from-teal-600 to-teal-500 shadow-lg z-50`}
      >
        <div className="p-6 border-b border-teal-400/50">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NativeNest Builder
          </h1>
          <p className="text-sm text-teal-100 mt-1 opacity-90">Builder Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/builder-dashboard/"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/builder-dashboard/"
            )}`}
          >
            <FaHome className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </Link>

          <Link
            to="/builder-dashboard/my-properties"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/builder-dashboard/my-properties"
            )}`}
          >
            <FaBuilding className="w-5 h-5" />
            <span>My Properties</span>
          </Link>

          <Link
            to="/builder-dashboard/events"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/builder-dashboard/events"
            )}`}
          >
            <FaCalendarAlt className="w-5 h-5" />
            <span>Event Stalls</span>
          </Link>

          <Link
            to="/builder-dashboard/profile-settings"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/builder-dashboard/profile-settings"
            )}`}
          >
            <FaCog className="w-5 h-5" />
            <span>Profile Settings</span>
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-teal-400/50">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full py-3 px-4 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition font-medium"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 md:ml-72 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="text-teal-600 md:hidden">
              <FaBars className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">
              Builder Dashboard
            </h2>
          </div>

          <div className="flex items-center space-x-3 bg-teal-100/50 py-2 px-4 rounded-full">
            <FaUser className="text-teal-600 w-5 h-5" />
            <span className="text-teal-800 font-medium">
              Welcome, {user.name || "Builder"}
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 max-w-7xl mx-auto">
          <Routes>
            {/* Overview / Home */}
            <Route
              path="/"
              element={
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-3xl font-bold text-gray-800 mb-6">
                    Welcome to Builder Panel
                  </h3>
                  <p className="text-gray-600 leading-7 mb-8">
                    Manage your property listings, book stalls for upcoming real
                    estate events, update profile, and reach more buyers through
                    NativeNest.
                  </p>

                  {/* Hot Events Banner (builder-specific) */}
                  {!eventsLoading && hasHotEvents && (
                    <div className="mb-10 p-6 bg-linear-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-500 text-white rounded-full">
                          <FaFireAlt className="text-xl" />
                        </div>
                        <h4 className="text-xl font-bold text-orange-800">
                          {hotEvents.length} Active / Upcoming Event{hotEvents.length !== 1 ? "s" : ""}
                        </h4>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Limited stalls available — showcase your projects to
                        thousands of verified buyers.
                      </p>
                      <Link
                        to="/builder-dashboard/events"
                        className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition"
                      >
                        View & Book Stalls <FaArrowRight />
                      </Link>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                      to="/builder-dashboard/my-properties"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaBuilding className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">My Properties</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Manage your listed properties
                      </p>
                    </Link>

                    <Link
                      to="/builder-dashboard/post-property"
                      className="bg-indigo-50 p-6 rounded-lg text-center hover:bg-indigo-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaPlusCircle className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Add New Property</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Post a new listing
                      </p>
                    </Link>

                    <Link
                      to="/builder-dashboard/events"
                      className="bg-orange-50 p-6 rounded-lg text-center hover:bg-orange-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaCalendarAlt className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Event Stalls</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Book stalls for exhibitions
                      </p>
                    </Link>

                    <Link
                      to="/builder-dashboard/profile-settings"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaCog className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Profile Settings</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Update your account details
                      </p>
                    </Link>
                  </div>
                </div>
              }
            />

            <Route path="/my-properties" element={<BuilderProperties />} />
            <Route path="/events" element={<BuilderEvents />} />
            <Route path="/stall-booking/:id" element={<StallBooking />} />
            <Route path="/profile-settings" element={<BuilderProfileSettings />} />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default BuilderDashboard;