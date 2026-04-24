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
import EditBuyer from "./EditBuyer";
import EventParticipants from "./EventParticipants";
import ViewEnquiries from "./ViewEnquiries";
import ManageStallTypes from "./ManageStallTypes";
import EventStallBookings from "./EventStallBookings";
import ManageBuilders from "./ManageBuilders";
import AddEditStallType from "./AddEditStallType";
import SoldProperties from "./SoldProperties";
import PropertyPreview from "../common/PropertyPreview";
import EventDetails from "../buyer/EventDetails";
import PropertyUnits from "./PropertyUnits";
import LogoutDialog from "../LogoutDialog";
import CreateAdmin from "./CreateAdmin";
import ManageAdmins from "./ManageAdmins";

// Lucide Icons
import {
  LayoutDashboard, Users, HardHat, Building2, Newspaper, CalendarDays,
  BarChart3, MessageSquare, Settings, LogOut, Menu, User, Loader2,
  PlusCircle, PenTool, Lightbulb, TrendingUp, Home, FileText, Briefcase
} from "lucide-react";

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
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchDashboardStats();
    fetchAdminDetails();
  }, []);

  const fetchAdminDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/api/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error("Error fetching admin details", err);
    }
  };

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
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("activeRole");
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path || (path !== "/admin-dashboard/" && location.pathname.startsWith(path));

  // Default mock data if empty
  const mockMonthlyData = [
    { month: 'Jan', properties: 40, buyers: 24 },
    { month: 'Feb', properties: 30, buyers: 13 },
    { month: 'Mar', properties: 20, buyers: 58 },
    { month: 'Apr', properties: 27, buyers: 39 },
    { month: 'May', properties: 18, buyers: 48 },
    { month: 'Jun', properties: 23, buyers: 38 },
  ];

  const chartData = stats?.monthlyStats?.length > 0 ? stats.monthlyStats : mockMonthlyData;

  const totalProperties = stats?.totals?.properties || 0;
  const totalUsers = stats?.totals?.users || 0;
  const activeBuilders = stats?.totals?.builders || 0;
  const publishedBlogs = stats?.totals?.blogs || 0;
  const totalEvents = stats?.totals?.events || 0;

  const navLinks = [
    { to: "/admin-dashboard/", label: "Summary", icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: "/admin-dashboard/manage-properties", label: "Manage Properties", icon: <Building2 className="w-5 h-5" /> },
    { to: "/admin-dashboard/manage-events", label: "Manage Events", icon: <CalendarDays className="w-5 h-5" /> },
    { to: "/admin-dashboard/manage-builders", label: "Manage Builders", icon: <HardHat className="w-5 h-5" /> },
    { to: "/admin-dashboard/manage-users", label: "Manage Users", icon: <Users className="w-5 h-5" /> },
    { to: "/admin-dashboard/manage-blogs", label: "Manage Blogs", icon: <Newspaper className="w-5 h-5" /> },
    { to: "/admin-dashboard/analytics/most-viewed", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { to: "/admin-dashboard/enquiries", label: "View Enquiries", icon: <MessageSquare className="w-5 h-5" /> },
    ...(user.admin_type === "SuperAdmin" ? [{ to: "/admin-dashboard/manage-admins", label: "Manage Admins", icon: <User className="w-5 h-5" /> }] : []),
    { to: "/admin-dashboard/profile-settings", label: "Profile Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const subRouteLabels = [
    { match: /\/manage-blogs\/add/, label: "Add Blog", icon: <Newspaper className="w-5 h-5" /> },
    { match: /\/manage-blogs\/edit\//, label: "Edit Blog", icon: <Newspaper className="w-5 h-5" /> },
    { match: /\/manage-properties\/add/, label: "Add Property", icon: <Building2 className="w-5 h-5" /> },
    { match: /\/manage-properties\/edit\//, label: "Edit Property", icon: <Building2 className="w-5 h-5" /> },
    { match: /\/manage-events\/edit\//, label: "Edit Event", icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/create-property-event/, label: "Create Event", icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/manage-stall-types\/.*\/add/, label: "Add Stall Type", icon: <FileText className="w-5 h-5" /> },
    { match: /\/manage-stall-types\/.*\/edit\//, label: "Edit Stall Type", icon: <FileText className="w-5 h-5" /> },
    { match: /\/manage-stall-types\//, label: "Manage Stall Types", icon: <FileText className="w-5 h-5" /> },
    { match: /\/event-bookings\//, label: "Event Stall Bookings", icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/events\/.*\/participants/, label: "Event Participants", icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/events\/\d+$/, label: "Event Details", icon: <CalendarDays className="w-5 h-5" /> },
    { match: /\/property\/.*\/viewers/, label: "Property Viewers", icon: <Building2 className="w-5 h-5" /> },
    { match: /\/property-preview\//, label: "Property Preview", icon: <Building2 className="w-5 h-5" /> },
    { match: /\/manage-users\/edit\//, label: "Edit Buyer", icon: <Users className="w-5 h-5" /> },
    { match: /\/manage-admins\/create/, label: "Add Admin", icon: <User className="w-5 h-5" /> },
    { match: /\/sold-properties/, label: "Sold Properties", icon: <Briefcase className="w-5 h-5" /> },
  ];

  const activePage = (() => {
    const subMatch = subRouteLabels.find(r => r.match.test(location.pathname));
    if (subMatch) return subMatch;
    return navLinks.find(link =>
      link.to === "/admin-dashboard/"
        ? location.pathname === link.to
        : location.pathname.startsWith(link.to)
    ) || navLinks[0];
  })();

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col shadow-2xl
      `}>
        {/* Sidebar Header */}
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">NativeNest</h1>
              <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive(link.to)
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <span className={`${isActive(link.to) ? "text-white" : "text-slate-400 group-hover:text-sky-400"} transition-colors`}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-6 border-t border-slate-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex p-2 bg-sky-50 text-sky-500 rounded-lg">
                {activePage.icon}
              </div>
              <h2 className="text-lg font-bold text-slate-800">{activePage.label}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-700 leading-none">Welcome, {user.name}</span>
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-tighter mt-1">{user.admin_type || 'Administrator'}</span>
            </div>
            <div className="w-10 h-10 bg-sky-50 rounded-full border-2 border-sky-100 flex items-center justify-center text-sky-500 shadow-sm">
              <User className="w-6 h-6" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                  {[
                    { label: "Total Properties", value: totalProperties, icon: <Building2 />, color: "sky" },
                    { label: "Total Users", value: totalUsers, icon: <Users />, color: "indigo" },
                    { label: "Active Builders", value: activeBuilders, icon: <HardHat />, color: "amber" },
                    { label: "Published Blogs", value: publishedBlogs, icon: <Newspaper />, color: "emerald" },
                    { label: "Total Events", value: totalEvents, icon: <CalendarDays />, color: "violet" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                      <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">
                        <StatCounter targetValue={stat.value} />
                      </h3>
                    </div>
                  ))}
                </div>

                {/* Main Dashboard Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Chart Card */}
                  <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Growth Overview</h3>
                        <p className="text-sm text-slate-400 mt-1">Properties & user growth trends</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-sky-500" />
                          <span className="text-xs font-bold text-slate-500 uppercase">Properties</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-indigo-400" />
                          <span className="text-xs font-bold text-slate-500 uppercase">Buyers</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.6} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                          />
                          <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{
                              borderRadius: '16px',
                              border: 'none',
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              padding: '12px'
                            }}
                          />
                          <Bar
                            dataKey="properties"
                            fill="url(#barGradient)"
                            radius={[6, 6, 0, 0]}
                            barSize={30}
                          />
                          <Bar
                            dataKey="buyers"
                            fill="#818cf8"
                            radius={[6, 6, 0, 0]}
                            barSize={30}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Quick Actions / Recent Activity Placeholder */}
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-full">
                      <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          { label: "Post New Property", icon: <PlusCircle />, path: "/admin-dashboard/manage-properties/add", color: "sky" },
                          { label: "Write Blog Post", icon: <PenTool />, path: "/admin-dashboard/manage-blogs/add", color: "indigo" },
                          { label: "Create New Event", icon: <CalendarDays />, path: "/admin-dashboard/create-property-event", color: "emerald" },
                          { label: "View Enquiries", icon: <MessageSquare />, path: "/admin-dashboard/enquiries", color: "amber" },
                        ].map((action, i) => (
                          <button
                            key={i}
                            onClick={() => navigate(action.path)}
                            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-sky-100 hover:bg-sky-50 transition-all duration-200 group w-full text-left"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-${action.color}-50 text-${action.color}-500 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              {action.icon}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            {/* Content Routes */}
            <Route path="/profile-settings" element={<AdminProfileSettings />} />
            <Route path="/manage-blogs/add" element={<AddBlog />} />
            <Route path="/manage-blogs" element={<ViewBlogs />} />
            <Route path="/manage-blogs/edit/:id" element={<EditBlog />} />
            <Route path="/manage-properties/add" element={<PostProperty />} />
            <Route path="/manage-properties" element={<ViewProperties />} />
            <Route path="/manage-properties/edit/:id" element={<EditProperty />} />
            <Route path="/create-property-event" element={<CreatePropertyEvent />} />
            <Route path="/manage-events" element={<ViewEvents />} />
            <Route path="/manage-events/edit/:id" element={<EditPropertyEvent />} />
            <Route path="/analytics/most-viewed" element={<MostViewedProperties />} />
            <Route path="/property/:id/viewers" element={<PropertyViewers />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/manage-users/edit/:userId" element={<EditBuyer />} />
            <Route path="/events/:eventId/participants" element={<EventParticipants />} />
            <Route path="/enquiries" element={<ViewEnquiries />} />
            <Route path="/manage-stall-types/:eventId" element={<ManageStallTypes />} />
            <Route path="/event-bookings/:eventId" element={<EventStallBookings />} />
            <Route path="/manage-builders" element={<ManageBuilders />} />
            <Route path="/manage-stall-types/:eventId/add" element={<AddEditStallType />} />
            <Route path="/manage-stall-types/:eventId/edit/:stallId" element={<AddEditStallType />} />
            <Route path="/sold-properties" element={<SoldProperties />} />
            <Route path="/property-preview/:id" element={<PropertyPreview />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/manage-properties/units/:id" element={<PropertyUnits />} />
            <Route path="/manage-admins" element={<ManageAdmins />} />
            <Route path="/manage-admins/create" element={<CreateAdmin />} />
          </Routes>
        </div>
      </main>

      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default AdminDashboard;