// src/components/ViewBlogs.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaInfoCircle, FaNewspaper } from 'react-icons/fa';
import API_BASE_URL from '../../config.js';

const ViewBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/blogs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) navigate('/login');
          throw new Error('Failed to fetch blogs');
        }

        const data = await response.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [navigate]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog =>
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [blogs, searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) navigate('/login');
        throw new Error('Failed to delete blog');
      }

      setBlogs(blogs.filter((blog) => blog.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header - Aligned with ViewEvents */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Blogs</h2>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {blogs.length} Total
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
          </div>
          <Link
            to="/admin-dashboard/manage-blogs/add"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95 text-sm"
          >
            <FaPlus /> Add Blog
          </Link>
        </div>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            Loading blogs...
          </div>
        )}

        {error && (
          <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
            <FaInfoCircle /> {error}
          </div>
        )}

        {!loading && filteredBlogs.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaNewspaper className="text-4xl opacity-50" />
            <p className="text-lg">No blogs found matching your search.</p>
          </div>
        )}

        {!loading && filteredBlogs.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                    <th className="px-6 py-4 text-left border-b border-gray-200">Blog Title</th>
                    <th className="w-36 px-6 py-4 text-center border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredBlogs.map((blog, index) => (
                    <tr key={blog.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="font-bold text-gray-900 mb-1">{blog.title}</div>
                        <div className="text-xs text-gray-500 italic">
                          Created on: {new Date(blog.created_at || Date.now()).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right border-b border-gray-100">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin-dashboard/manage-blogs/edit/${blog.id}`)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden p-4 space-y-4">
              {filteredBlogs.map((blog, index) => (
                <div key={blog.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-teal-100 text-teal-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="font-bold text-gray-900 truncate max-w-[200px]">{blog.title}</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 italic">
                    Created: {new Date(blog.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/admin-dashboard/manage-blogs/edit/${blog.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold"
                    >
                      <FaTrash size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewBlogs;