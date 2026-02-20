// src/components/adminDashboard.jsx
import React, { useState } from "react";
import { Link, useNavigate, Routes, Route, useLocation } from "react-router-dom";
import AdminProfileSettings from "./adminProfileSettings";
import AddBlog from "./addBlog";
import ViewBlogs from "./viewBlogs";
import EditBlog from "./editBlog";
import PostProperty from "./postProperty";
import ViewProperties from "./viewProperties";
import EditProperty from "./editProperty";
import CreatePropertyEvent from "./CreatePropertyEvent";
import ViewEvents from "./ViewEvents";
import EditPropertyEvent from "./EditPropertyEvent";
import MostViewedProperties from "./MostViewedProperties";
import PropertyViewers from "./PropertyViewers";
import ManageUsers from "./ManageUsers";
import EventParticipants from "./EventParticipants";
import ViewEnquiries from "./ViewEnquiries";
import ManageStallTypes from "./ManageStallTypes";
import EventStallBookings from "./EventStallBookings";

import {
  FaBars,
  FaChartBar,
  FaUser,
  FaHome,
  FaUsers,
  FaBuilding,
  FaBlog,
  FaCog,
  FaCalendarAlt,
  FaEnvelope,
  FaPlusCircle,
} from "react-icons/fa";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const isActive = (path) =>
    location.pathname === path || (path !== "/admin-dashboard/" && location.pathname.startsWith(path)) 
      ? "bg-teal-700" 
      : "";

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
            NativeNest Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-hidden">
          <Link
            to="/admin-dashboard/"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/admin-dashboard/"
            )}`}
          >
            <FaHome className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </Link>

          <Link
            to="/admin-dashboard/manage-users"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/admin-dashboard/manage-users"
            )}`}
          >
            <FaUsers className="w-5 h-5" />
            <span>Manage Users</span>
          </Link>

          <Link
            to="/admin-dashboard/manage-properties"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/admin-dashboard/manage-properties"
            )}`}
          >
            <FaBuilding className="w-5 h-5" />
            <span>Manage Properties</span>
          </Link>

          <Link
            to="/admin-dashboard/manage-blogs"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/admin-dashboard/manage-blogs"
            )}`}
          >
            <FaBlog className="w-5 h-5" />
            <span>Manage Blogs</span>
          </Link>

          <Link
            to="/admin-dashboard/manage-events"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/admin-dashboard/manage-events"
            )}`}
          >
            <FaCalendarAlt className="w-5 h-5" />
            <span>Manage Events</span>
          </Link>

          <Link
            to="/admin-dashboard/analytics/most-viewed"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/admin-dashboard/analytics"
            )}`}
          >
            <FaChartBar className="w-5 h-5" />
            <span>Analytics</span>
          </Link>

          <Link
            to="/admin-dashboard/enquiries"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/admin-dashboard/enquiries"
            )}`}
          >
            <FaEnvelope className="w-5 h-5" />
            <span>View Enquiries</span>
          </Link>

          <Link
            to="/admin-dashboard/profile-settings"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${isActive(
              "/admin-dashboard/profile-settings"
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
              Admin Dashboard
            </h2>
          </div>

          <div className="flex items-center space-x-3 bg-teal-100/50 py-2 px-4 rounded-full">
            <FaUser className="text-teal-600 w-5 h-5" />
            <span className="text-teal-800 font-medium">
              Welcome, {user.name || "Admin"}
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-3xl font-bold text-gray-800 mb-6">
                    Welcome to Admin Panel
                  </h3>
                  <p className="text-gray-600 leading-7 mb-8">
                    Easily oversee NativeNest operations. Manage user accounts, moderate property listings, publish blogs, and coordinate upcoming real estate events from one central hub.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Manage Users Card */}
                    <Link
                      to="/admin-dashboard/manage-users"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaUsers className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Manage Users</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        View and manage registered buyers and sellers
                      </p>
                    </Link>

                    {/* Manage Properties Card */}
                    <Link
                      to="/admin-dashboard/manage-properties"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaBuilding className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Manage Properties</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Approve, edit, or remove property listings
                      </p>
                    </Link>

                    {/* Manage Events Card */}
                    <Link
                      to="/admin-dashboard/manage-events"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaCalendarAlt className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Manage Events</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Create and organize property sale melas
                      </p>
                    </Link>

                    {/* Analytics Card */}
                    <Link
                      to="/admin-dashboard/analytics/most-viewed"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaChartBar className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Analytics</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        View property traffic and engagement stats
                      </p>
                    </Link>

                    {/* Enquiries Card */}
                    <Link
                      to="/admin-dashboard/enquiries"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaEnvelope className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">View Enquiries</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Respond to user messages and leads
                      </p>
                    </Link>

                    {/* Profile Card */}
                    <Link
                      to="/admin-dashboard/profile-settings"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaCog className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Profile Settings</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Update your administrator credentials
                      </p>
                    </Link>
                  </div>
                </div>
              }
            />

            {/* Manage Users */}
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/events/:eventId/participants" element={<EventParticipants />} />

            {/* Properties Management */}
            <Route path="/manage-properties">
              <Route index element={<ViewProperties />} />
              <Route path="add" element={<PostProperty />} />
              <Route path="edit/:id" element={<EditProperty />} />
            </Route>

            {/* Blog Management */}
            <Route path="/manage-blogs">
              <Route index element={<ViewBlogs />} />
              <Route path="add" element={<AddBlog />} />
              <Route path="edit/:id" element={<EditBlog />} />
            </Route>

            {/* Event Management */}
            <Route path="/manage-events">
              <Route index element={<ViewEvents />} />
              <Route path="edit/:id" element={<EditPropertyEvent />} />
            </Route>

            <Route path="/event-bookings/:eventId" element={<EventStallBookings />} />
            <Route path="/create-property-event" element={<CreatePropertyEvent />} />
            <Route path="/manage-stall-types/:eventId" element={<ManageStallTypes />} />
            <Route path="/analytics/most-viewed" element={<MostViewedProperties />} />
            <Route path="/property/:propertyId/viewers" element={<PropertyViewers />} />
            <Route path="/enquiries" element={<ViewEnquiries />} />
            <Route path="/profile-settings" element={<AdminProfileSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;