// src/components/buyerDashboard.jsx
import React, { useState } from "react";
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
  FaUserCheck // Added for check-in icon
} from "react-icons/fa";

import ProfileSettings from "./profileSettings";
import BuyerEvents from "./buyerEvents";
import MyRegisteredEvents from "./MyRegisteredEvents";
import EventBookedBuilders from "./EventBookedBuilders";
import BookmarkedProperties from "./BookmarkedProperties";
import EventCheckIn from "./EventCheckIn";
import StallCheckIn from "./StallCheckIn";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const isActive = (path) => {
    const current = location.pathname;
    // Updated to handle sub-routes correctly
    return current === path || current.startsWith(path + "/");
  };

  return (
    <div className="min-h-screen bg-cream-50 flex relative font-sans">
      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          bg-linear-to-b from-teal-600 to-teal-500 shadow-lg z-50`}
      >
        <div className="p-6 border-b border-teal-400/50">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NativeNest
          </h1>
          <p className="text-sm text-teal-100 mt-1 opacity-90">Buyer Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/buyer-dashboard"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive("/buyer-dashboard") && location.pathname === "/buyer-dashboard" ? "bg-teal-700" : ""}`}
          >
            <FaHome className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </Link>

          <Link
            to="/buyer-dashboard/my-events"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive("/buyer-dashboard/my-events") ? "bg-teal-700" : ""}`}
          >
            <FaCalendarCheck className="w-5 h-5" />
            <span>My Events</span>
          </Link>

          <Link
            to="/buyer-dashboard/events"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive("/buyer-dashboard/events") ? "bg-teal-700" : ""}`}
          >
            <FaCalendarAlt className="w-5 h-5" />
            <span>Explore Events</span>
          </Link>

          <Link
            to="/buyer-dashboard/bookmarks"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive("/buyer-dashboard/bookmarks") ? "bg-teal-700" : ""}`}
          >
            <FaBookmark className="w-5 h-5" />
            <span>Bookmarked Properties</span>
          </Link>

          <Link
            to="/buyer-dashboard/profile-settings"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive("/buyer-dashboard/profile-settings") ? "bg-teal-700" : ""}`}
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

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-72 transition-all duration-300">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="text-teal-600 md:hidden"
            >
              <FaBars className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">
              Buyer Dashboard
            </h2>
          </div>

          <div className="flex items-center space-x-3 bg-teal-100/50 py-2 px-4 rounded-full">
            <FaUser className="text-teal-600 w-5 h-5" />
            <span className="text-teal-800 font-medium">
              Welcome, {user.name || "Buyer"}
            </span>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-3xl font-bold text-gray-800 mb-6">
                    Welcome back, {user.name || "Buyer"}!
                  </h3>
                  <p className="text-gray-600 leading-7 mb-8">
                    Discover upcoming property events, register for expos, and bookmark properties on NativeNest.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                      to="/buyer-dashboard/my-events"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaCalendarCheck className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">My Events</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        View your registered events
                      </p>
                    </Link>

                    <Link
                      to="/buyer-dashboard/events"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaCalendarAlt className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Explore Events</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Discover upcoming property events
                      </p>
                    </Link>

                    <Link
                      to="/buyer-dashboard/profile-settings"
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

            <Route path="/my-events" element={<MyRegisteredEvents />} />
            <Route path="/my-events/builders/:eventId" element={<EventBookedBuilders />} />
            <Route path="/events" element={<BuyerEvents />} />
            <Route path="/bookmarks" element={<BookmarkedProperties />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            
            {/* - Added the Dynamic Event Check-In Route */}
            <Route path="/event-checkin/:eventId" element={<EventCheckIn />} />
            <Route path="/stall-checkin/:eventId/:stallId" element={<StallCheckIn />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default BuyerDashboard;