// src/components/adminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import API_BASE_URL from "../../config.js";

// Page Imports
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
import ManageBuilders from "./ManageBuilders";
import AddEditStallType from "./AddEditStallType";

import {
  FaBars, FaChartBar, FaUser, FaHome, FaUsers, FaBuilding, 
  FaBlog, FaCog, FaCalendarAlt, FaEnvelope, FaSpinner, FaPlusCircle
} from "react-icons/fa";

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const isActive = (path) =>
    location.pathname === path || (path !== "/admin-dashboard/" && location.pathname.startsWith(path))
      ? "bg-teal-700 shadow-inner"
      : "";

  return (
    <div className="min-h-screen bg-gray-50 flex relative font-sans">
      {/* ================= SIDEBAR ================= */}
      <div className={`fixed top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} bg-linear-to-b from-teal-600 to-teal-500 shadow-2xl z-50`}>
        <div className="p-6 border-b border-teal-400/40">
          <h1 className="text-3xl font-bold text-white tracking-tight">NativeNest</h1>
          <p className="text-sm text-teal-100 mt-1 opacity-90 uppercase tracking-widest font-bold">Admin Portal</p>
        </div>

        <nav className="flex-1 px-3 py-5 overflow-y-auto scrollbar-hide hover:scrollbar-show transition-all">
          <div className="space-y-1.5">
            {[
              { to: "/admin-dashboard/", label: "Overview", icon: <FaHome /> },
              { to: "/admin-dashboard/manage-users", label: "Manage Users", icon: <FaUsers /> },
              { to: "/admin-dashboard/manage-builders", label: "Manage Builders", icon: <FaBuilding /> },
              { to: "/admin-dashboard/manage-properties", label: "Manage Properties", icon: <FaBuilding /> },
              { to: "/admin-dashboard/manage-blogs", label: "Manage Blogs", icon: <FaBlog /> },
              { to: "/admin-dashboard/manage-events", label: "Manage Events", icon: <FaCalendarAlt /> },
              { to: "/admin-dashboard/analytics/most-viewed", label: "Analytics", icon: <FaChartBar /> },
              { to: "/admin-dashboard/enquiries", label: "View Enquiries", icon: <FaEnvelope /> },
              { to: "/admin-dashboard/profile-settings", label: "Profile Settings", icon: <FaCog /> },
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
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-teal-400/40">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition font-medium shadow-sm">
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 md:ml-72 transition-all duration-300">
        <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="text-teal-600 md:hidden">
              <FaBars className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-3 bg-teal-50 py-2 px-4 rounded-full">
            <FaUser className="text-teal-600 w-5 h-5" />
            <span className="text-teal-800 font-bold text-sm uppercase">Welcome, {user.name || "Admin"}</span>
          </div>
        </header>

        <main className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8">
                {/* Statistics Cards - Enhanced with Stat Counters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { 
                        label: "Total Properties", 
                        val: stats?.totals.properties, 
                        icon: <FaBuilding />, 
                        color: "text-blue-600", 
                        bg: "bg-blue-50",
                        path: "/admin-dashboard/manage-properties" 
                    },
                    { 
                        label: "Registered Users", 
                        val: stats?.totals.users, 
                        icon: <FaUsers />, 
                        color: "text-teal-600", 
                        bg: "bg-teal-50",
                        path: "/admin-dashboard/manage-users" 
                    },
                    { 
                        label: "Active Builders", 
                        val: stats?.totals.builders, 
                        icon: <FaBuilding />, 
                        color: "text-purple-600", 
                        bg: "bg-purple-50",
                        path: "/admin-dashboard/manage-builders" 
                    },
                    { 
                        label: "Planned Events", 
                        val: stats?.totals.events, 
                        icon: <FaCalendarAlt />, 
                        color: "text-orange-600", 
                        bg: "bg-orange-50",
                        path: "/admin-dashboard/manage-events" 
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

                {/* Charts & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Registration Growth (Last 6 Months)</h3>
                    <div className="h-80 w-full">
                      {loadingStats ? (
                         <div className="h-full flex items-center justify-center"><FaSpinner className="animate-spin text-teal-500 text-3xl" /></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.monthlyStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                            <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                            <Bar dataKey="properties" name="Properties" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={24} />
                            <Bar dataKey="buyers" name="Users" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="grid gap-3">
                        <Link to="/admin-dashboard/manage-properties/add" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors group">
                          <FaPlusCircle className="text-teal-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-semibold text-gray-700">Add New Property</span>
                        </Link>
                        <Link to="/admin-dashboard/create-property-event" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors group">
                          <FaPlusCircle className="text-teal-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-semibold text-gray-700">Create Event</span>
                        </Link>
                        <Link to="/admin-dashboard/manage-blogs/add" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-teal-50 transition-colors group">
                          <FaPlusCircle className="text-teal-600 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-semibold text-gray-700">Write New Blog</span>
                        </Link>
                      </div>
                    </div>

                    <div className="bg-linear-to-br from-teal-600 to-teal-700 p-6 rounded-2xl text-white shadow-lg">
                       <h4 className="font-bold flex items-center gap-2 mb-2"><FaChartBar /> Analytics Tip</h4>
                       <p className="text-sm text-teal-50 leading-relaxed">Check the "Analytics" tab regularly to identify which property types are gaining the most traction in specific cities.</p>
                    </div>
                  </div>
                </div>
              </div>
            } />

            {/* Sub-Routes Mapping */}
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/events/:eventId/participants" element={<EventParticipants />} />
            <Route path="/manage-builders" element={<ManageBuilders />} />
            <Route path="/manage-properties">
              <Route index element={<ViewProperties />} />
              <Route path="add" element={<PostProperty />} />
              <Route path="edit/:id" element={<EditProperty />} />
            </Route>
            <Route path="/manage-blogs">
              <Route index element={<ViewBlogs />} />
              <Route path="add" element={<AddBlog />} />
              <Route path="edit/:id" element={<EditBlog />} />
            </Route>
            <Route path="/manage-events">
              <Route index element={<ViewEvents />} />
              <Route path="edit/:id" element={<EditPropertyEvent />} />
            </Route>
            <Route path="/event-bookings/:eventId" element={<EventStallBookings />} />
            <Route path="/create-property-event" element={<CreatePropertyEvent />} />
            <Route path="/manage-stall-types/:eventId" element={<ManageStallTypes />} />
            <Route path="/manage-stall-types/:eventId/add" element={<AddEditStallType />} />
            <Route path="/manage-stall-types/:eventId/edit/:typeId" element={<AddEditStallType />} />
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