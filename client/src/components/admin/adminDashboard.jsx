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
import SoldProperties from "./SoldProperties";
import LogoutDialog from "../LogoutDialog";

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
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
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
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

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

  return (
    <div className="min-h-screen bg-slate-50 flex relative text-slate-500" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* ================= SIDEBAR ================= */}
      <div 
        className={`fixed top-0 left-0 h-full w-[280px] flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-gradient-to-b from-slate-800 to-slate-900 shadow-[0_4px_24px_rgba(15,23,42,0.15)] z-50`}
      >
        <div className="p-8 pb-6 border-b border-slate-700/50">
          <h1 className="text-3xl font-bold text-white tracking-[-1px]">NativeNest</h1>
          <p className="text-[11px] text-sky-400 mt-1 uppercase tracking-widest font-semibold">Admin Portal</p>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide hover:scrollbar-show transition-all">
          <div className="space-y-1">
            {[
              { to: "/admin-dashboard/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
              { to: "/admin-dashboard/manage-users", label: "Manage Users", icon: <Users className="w-5 h-5" /> },
              { to: "/admin-dashboard/manage-builders", label: "Manage Builders", icon: <HardHat className="w-5 h-5" /> },
              { to: "/admin-dashboard/manage-properties", label: "Manage Properties", icon: <Building2 className="w-5 h-5" /> },
              { to: "/admin-dashboard/manage-blogs", label: "Manage Blogs", icon: <Newspaper className="w-5 h-5" /> },
              { to: "/admin-dashboard/manage-events", label: "Manage Events", icon: <CalendarDays className="w-5 h-5" /> },
              { to: "/admin-dashboard/analytics/most-viewed", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
              { to: "/admin-dashboard/enquiries", label: "View Enquiries", icon: <MessageSquare className="w-5 h-5" /> },
              { to: "/admin-dashboard/profile-settings", label: "Profile Settings", icon: <Settings className="w-5 h-5" /> },
            ].map((link) => {
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
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>
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

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        ></div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 md:ml-[280px] w-full min-w-0 transition-all duration-300 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 p-4 px-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="text-slate-500 hover:text-sky-500 transition-colors md:hidden">
              <Menu className="w-6 h-6" />
            </button>

          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium text-sm hidden sm:block">
              Welcome, <span className="text-slate-900">{user.name || "Admin"}</span>
            </span>
            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center border border-sky-100 shadow-sm text-sky-500">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex-1">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8 animate-in fade-in duration-500">
                
                {/* Title Section */}
                <div>
                  <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                  <p className="text-[15px] text-slate-500 mt-1">Monitor your platform's key metrics and activities</p>
                </div>

                {/* Statistics Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                  {[
                    {
                      label: "Total Properties",
                      val: totalProperties,
                      icon: <Home className="w-5 h-5" />,
                      color: "text-sky-500",
                      bg: "bg-sky-50",
                      path: "/admin-dashboard/manage-properties"
                    },
                    {
                      label: "Active Users",
                      val: totalUsers,
                      icon: <Users className="w-5 h-5" />,
                      color: "text-indigo-500",
                      bg: "bg-indigo-50",
                      path: "/admin-dashboard/manage-users"
                    },
                    {
                      label: "Registered Builders",
                      val: activeBuilders,
                      icon: <Building2 className="w-5 h-5" />,
                      color: "text-teal-500",
                      bg: "bg-teal-50",
                      path: "/admin-dashboard/manage-builders"
                    },
                    {
                      label: "Published Blogs",
                      val: publishedBlogs,
                      icon: <FileText className="w-5 h-5" />,
                      color: "text-amber-500",
                      bg: "bg-amber-50",
                      path: "/admin-dashboard/manage-blogs"
                    },
                    {
                      label: "Total Events",
                      val: totalEvents,
                      icon: <CalendarDays className="w-5 h-5" />,
                      color: "text-purple-500",
                      bg: "bg-purple-50",
                      path: "/admin-dashboard/manage-events"
                    },
                  ].map((card, idx) => (
                    <Link
                      key={idx}
                      to={card.path}
                      className="bg-white p-5 rounded-[22px] shadow-sm border border-slate-100 flex flex-col justify-between transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:scale-[1.02] group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-3">{card.label}</p>
                          <h4 className="text-[28px] font-bold text-slate-900 leading-none h-7">
                            {loadingStats ? (
                              <Loader2 className="animate-spin w-5 h-5 text-slate-400" />
                            ) : (
                              <StatCounter targetValue={card.val} />
                            )}
                          </h4>
                        </div>
                        <div className={`${card.bg} ${card.color} w-12 h-12 rounded-[14px] flex items-center justify-center transition-transform duration-300 group-hover:bg-opacity-80`}>
                          {card.icon}
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-1.5 text-emerald-500 text-[12px] font-bold tracking-tight opacity-90 group-hover:opacity-100 transition-opacity">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>View details</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* 2-Column Dashboard Below */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Chart */}
                  <div className="lg:col-span-2 bg-white p-7 rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-slate-200 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-sky-500" />
                        Registration Growth
                        <span className="text-sm font-medium text-slate-500 ml-2 font-normal">(Last 6 Months)</span>
                      </h3>
                    </div>
                    
                    <div className="flex-1 w-full min-h-[320px]">
                      {loadingStats ? (
                        <div className="h-full flex items-center justify-center">
                          <Loader2 className="animate-spin text-sky-500 w-8 h-8" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            <Legend 
                              iconType="circle" 
                              wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500, color: '#64748B' }} 
                            />
                            <Bar dataKey="properties" name="Properties" fill="#0EA5E9" radius={[6, 6, 0, 0]} barSize={20} />
                            <Bar dataKey="buyers" name="Users" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Quick Actions & Tip */}
                  <div className="space-y-6 flex flex-col">
                    
                    {/* Quick Actions Card */}
                    <div className="bg-white p-7 rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-5">Quick Actions</h3>
                      <div className="grid gap-3">
                        <Link to="/admin-dashboard/manage-properties/add" className="flex items-center gap-4 p-4 rounded-[16px] bg-slate-50 hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-all duration-200 group cursor-pointer">
                          <div className="bg-sky-50 p-2.5 rounded-xl shadow-sm text-sky-500 group-hover:scale-110 transition-all duration-300">
                            <PlusCircle className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-sky-700">Add New Property</span>
                        </Link>
                        <Link to="/admin-dashboard/create-property-event" className="flex items-center gap-4 p-4 rounded-[16px] bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all duration-200 group cursor-pointer">
                          <div className="bg-indigo-50 p-2.5 rounded-xl shadow-sm text-indigo-500 group-hover:scale-110 transition-all duration-300">
                            <CalendarDays className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Create Property Event</span>
                        </Link>
                        <Link to="/admin-dashboard/manage-blogs/add" className="flex items-center gap-4 p-4 rounded-[16px] bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all duration-200 group cursor-pointer">
                          <div className="bg-amber-50 p-2.5 rounded-xl shadow-sm text-amber-600 group-hover:scale-110 transition-all duration-300">
                            <PenTool className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">Write New Blog</span>
                        </Link>
                      </div>
                    </div>

                    {/* Analytics Tip Box */}
                    <div className="bg-gradient-to-br from-sky-50 to-white p-7 rounded-[20px] border border-sky-100 shadow-[0_4px_12px_rgba(14,165,233,0.06)] relative overflow-hidden flex-1">
                      {/* Subtle background decoration */}
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-200/40 rounded-full blur-2xl"></div>
                      
                      <h4 className="font-bold flex items-center gap-2 mb-3 text-sky-900 z-10 relative">
                        <Lightbulb className="w-5 h-5 text-sky-500" /> 
                        Analytics Tip
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium z-10 relative">
                        Check the Analytics tab regularly to identify which property types are gaining the most traction in specific cities. Optimize future developments based on these trends.
                      </p>
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
            <Route path="/sold-properties" element={<SoldProperties />} />
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
      
      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;