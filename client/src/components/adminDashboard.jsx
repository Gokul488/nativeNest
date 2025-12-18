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
import CreatePropertyEvent from "./createPropertyEvent";

import { FaBars, FaUser, FaHome, FaUsers, FaBuilding, FaBlog, FaCog, FaCalendarAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-cream-50 flex relative font-sans">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-linear-to-b from-teal-600 to-teal-500 shadow-lg z-50`}
      >
        <div className="p-6 border-b border-teal-400/50">
          <h1 className="text-2xl font-bold text-white tracking-tight">NativeNest Admin</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/admin-dashboard/"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname === '/admin-dashboard/' || location.pathname === '/admin-dashboard' ? 'bg-teal-700' : ''
            }`}
          >
            <FaHome className="w-5 h-5" />
            <span>Dashboard Overview</span>
          </Link>

          <Link
            to="/admin-dashboard/manage-users"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname.startsWith('/admin-dashboard/manage-users') ? 'bg-teal-700' : ''
            }`}
          >
            <FaUsers className="w-5 h-5" />
            <span>Manage Users</span>
          </Link>

          <Link
            to="/admin-dashboard/manage-properties"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname.startsWith('/admin-dashboard/manage-properties') ? 'bg-teal-700' : ''
            }`}
          >
            <FaBuilding className="w-5 h-5" />
            <span>Manage Properties</span>
          </Link>

          <Link
            to="/admin-dashboard/manage-blogs"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname.startsWith('/admin-dashboard/manage-blogs') ? 'bg-teal-700' : ''
            }`}
          >
            <FaBlog className="w-5 h-5" />
            <span>Manage Blogs</span>
          </Link>
          

          <Link
            to="/admin-dashboard/create-property-event"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname === '/admin-dashboard/create-property-event' ? 'bg-teal-700' : ''
            }`}
          >
            <FaCalendarAlt className="w-5 h-5" />
            <span>Event Creation</span>
          </Link>

          <Link
            to="/admin-dashboard/profile-settings"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname === '/admin-dashboard/profile-settings' ? 'bg-teal-700' : ''
            }`}
          >
            <FaCog className="w-5 h-5" />
            <span>Profile Settings</span>
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-teal-400/50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-start space-x-3 w-full py-3 px-4 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition duration-200 text-sm font-medium"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={closeSidebar}></div>
      )}

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300 ease-in-out md:ml-72">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="text-teal-600 focus:outline-none md:hidden">
              <FaBars className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">Admin Dashboard</h2>
          </div>
          <div className="flex items-center space-x-3 bg-teal-100/50 py-2 px-4 rounded-full">
            <FaUser className="text-teal-600 w-5 h-5" />
            <span className="text-teal-800 font-medium">Welcome, {user.name || "Admin"}</span>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          <Routes>
            {/* Dashboard Home */}
            <Route
              path="/"
              element={
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">Welcome, Admin!</h3>
                  <p className="text-gray-600 leading-7 mb-8">
                    You have full control over NativeNest. Manage users, properties, blogs, and monitor platform activity.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Manage Users Card */}
                    <Link
                      to="/admin-dashboard/manage-users"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaUsers className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Manage Users</h4>
                      <p className="text-sm text-gray-600 mt-2">View and manage all registered users</p>
                    </Link>

                    {/* Manage Properties Card - Now Clickable */}
                    <Link
                      to="/admin-dashboard/manage-properties"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaBuilding className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Manage Properties</h4>
                      <p className="text-sm text-gray-600 mt-2">Add, edit, or remove property listings</p>
                    </Link>

                    {/* Manage Blogs Card - Now Clickable */}
                    <Link
                      to="/admin-dashboard/manage-blogs"
                      className="bg-teal-50 p-6 rounded-lg text-center hover:bg-teal-100 transition transform hover:scale-105 cursor-pointer"
                    >
                      <FaBlog className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-800">Manage Blogs</h4>
                      <p className="text-sm text-gray-600 mt-2">Create and manage blog posts</p>
                    </Link>
                  </div>
                </div>
              }
            />

            {/* User Management Placeholder */}
            <Route
              path="/manage-users"
              element={<div className="text-center py-12 text-gray-500 text-xl">User Management Coming Soon...</div>}
            />

            {/* Property Management Routes */}
            <Route path="/manage-properties">
              <Route index element={<ViewProperties />} />
              <Route path="add" element={<PostProperty />} />
              <Route path="edit/:id" element={<EditProperty />} />
            </Route>

            {/* Blog Management Routes */}
            <Route path="/manage-blogs">
              <Route index element={<ViewBlogs />} />
              <Route path="add" element={<AddBlog />} />
              <Route path="edit/:id" element={<EditBlog />} />
            </Route>


            {/* Create Property Event */}
            <Route path="/create-property-event" element={<CreatePropertyEvent />} />

            {/* Profile Settings */}
            <Route path="/profile-settings" element={<AdminProfileSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;