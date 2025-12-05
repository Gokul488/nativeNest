import React, { useState } from "react";
import { Link, useNavigate, Routes, Route, useLocation } from "react-router-dom";
import PostProperty from './postProperty';
import ViewProperties from "./viewProperties";
import EditProperty from "./editProperty";
import ProfileSettings from "./profileSettings";
import AddBlog from "./addBlog";
import ViewBlogs from "./viewBlogs";
import EditBlog from "./editBlog";
import { FaBars, FaUser, FaHome, FaPlus, FaList, FaCog } from 'react-icons/fa';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex relative font-sans">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-linear-to-b from-teal-600 to-teal-500 shadow-lg z-50`}
      >
        <div className="p-6 border-b border-teal-400/50">
          <h1 className="text-2xl font-bold text-white tracking-tight text-balance">NativeNest Seller</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/seller-dashboard/"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname === '/seller-dashboard/' ? 'bg-teal-700' : ''
            }`}
          >
            <FaHome className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/seller-dashboard/post-property"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname === '/seller-dashboard/post-property' ? 'bg-teal-700' : ''
            }`}
          >
            <FaPlus className="w-5 h-5" />
            <span>Post a New Property</span>
          </Link>
          <Link
            to="/seller-dashboard/view-properties"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname === '/seller-dashboard/view-properties' ? 'bg-teal-700' : ''
            }`}
          >
            <FaList className="w-5 h-5" />
            <span>My Properties</span>
          </Link>
          <Link
            to="/seller-dashboard/add-blog"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname === '/seller-dashboard/add-blog' ? 'bg-teal-700' : ''
            }`}
          >
            <FaPlus className="w-5 h-5" />
            <span>Add Blog</span>
          </Link>
          <Link
            to="/seller-dashboard/view-blogs"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname === '/seller-dashboard/view-blogs' ? 'bg-teal-700' : ''
            }`}
          >
            <FaList className="w-5 h-5" />
            <span>My Blogs</span>
          </Link>
          <Link
            to="/seller-dashboard/profile-settings"
            onClick={closeSidebar}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition duration-200 text-white hover:bg-teal-400/50 ${
              location.pathname === '/seller-dashboard/profile-settings' ? 'bg-teal-700' : ''
            }`}
          >
            <FaCog className="w-5 h-5" />
            <span>Profile Settings</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto border-t border-teal-400/50">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full py-3 px-4 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition duration-200 text-sm font-medium"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300 ease-in-out md:ml-72">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="text-teal-600 focus:outline-none md:hidden">
              <FaBars className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">Seller Dashboard</h2>
          </div>
          <div className="flex items-center space-x-3 bg-teal-100/50 py-2 px-4 rounded-full">
            <FaUser className="text-teal-600 w-5 h-5" />
            <span className="text-teal-800 font-medium">Welcome, {user.name || "Seller"}</span>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold tracking-tight text-gray-800 mb-4">Welcome to Your Dashboard</h3>
                  <p className="text-gray-600 leading-7">Manage your properties, post new listings, or view your existing ones with ease.</p>
                </div>
              }
            />
            <Route path="/post-property" element={<PostProperty />} />
            <Route path="/view-properties" element={<ViewProperties />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
            <Route path="/add-blog" element={<AddBlog />} />
            <Route path="/view-blogs" element={<ViewBlogs />} />
            <Route path="/edit-blog/:id" element={<EditBlog />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;