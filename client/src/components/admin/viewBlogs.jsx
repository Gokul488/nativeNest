// src/components/ViewBlogs.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaNewspaper } from 'react-icons/fa';
import API_BASE_URL from '../../config.js';
import DeleteDialog from '../DeleteDialog';
import Pagination from '../common/Pagination.jsx';
import { Search, Loader2, AlertCircle, Pencil, Trash2, Newspaper } from 'lucide-react';

const ViewBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBlogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBlogs, currentPage]);

  const handleDelete = (id) => {
    setBlogToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/blogs/${blogToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) navigate('/login');
        throw new Error('Failed to delete blog');
      }

      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete));
      setShowDeleteDialog(false);
      setBlogToDelete(null);
    } catch (err) {
      setError(err.message);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left: icon + title + badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              Manage Blogs
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Create and manage all published blog posts
            </p>
          </div>
          <span className="ml-1 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            {blogs.length} Total
          </span>
        </div>

        {/* Right: search + add */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Link
            to="/admin-dashboard/manage-blogs/add"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm active:scale-95 text-sm"
          >
            <FaPlus className="w-3 h-3" /> Add Blog
          </Link>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1">

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
            <span className="text-sm font-semibold">Loading blogs…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredBlogs.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No blogs found</p>
            <p className="text-sm text-slate-400 max-w-xs text-center">
              {searchQuery ? `No results matching "${searchQuery}"` : "No blog posts have been added yet."}
            </p>
          </div>
        )}

        {/* Table + cards */}
        {!loading && filteredBlogs.length > 0 && (
          <div className="flex flex-col">

            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="w-14 px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Blog Title</th>
                    <th className="w-36 px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedBlogs.map((blog, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={blog.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">

                        {/* # */}
                        <td className="px-6 py-4 text-sm font-bold text-slate-300">
                          {String(globalIndex).padStart(2, '0')}
                        </td>

                        {/* Blog Title */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <Newspaper className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{blog.title}</div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {new Date(blog.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => navigate(`/admin-dashboard/manage-blogs/edit/${blog.id}`)}
                              className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden p-4 space-y-3">
              {paginatedBlogs.map((blog, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div key={blog.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 hover:border-indigo-200 transition-colors">
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {globalIndex}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm max-w-[200px] truncate">{blog.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {new Date(blog.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin-dashboard/manage-blogs/edit/${blog.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-100 transition"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredBlogs.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              activeColor="indigo"
            />
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Delete Blog?"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
      />
    </div>
  );
};

export default ViewBlogs;