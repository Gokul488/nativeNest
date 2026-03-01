// src/components/ViewEnquiries.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaSearch,
  FaTrash,
  FaInfoCircle,
  FaExclamationTriangle,
  FaUser,
  FaEnvelope,
  FaClock
} from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const ITEMS_PER_PAGE = 10;

const ViewEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact`);
        if (!response.ok) throw new Error("Failed to fetch enquiries");
        const data = await response.json();
        const messages = data.messages || data || [];
        setEnquiries(messages);
      } catch (err) {
        setError("Failed to load contact enquiries.");
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(
      (enq) =>
        enq.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        enq.email?.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [searchTerm, enquiries]);

  const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_BASE_URL}/api/contact/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status === 200 || response.status === 204) {
        setEnquiries(prev => prev.filter((enq) => enq.id !== id));
      }
    } catch (err) {
      alert("Failed to delete enquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header - Aligned with ViewEvents Style */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Contact Enquiries</h2>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {enquiries.length} Total
          </span>
        </div>

        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            Loading enquiries...
          </div>
        )}

        {error && (
          <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {!loading && !error && filteredEnquiries.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No enquiries found matching your search.</p>
          </div>
        )}

        {!loading && !error && filteredEnquiries.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                    <th className="w-1/4 px-6 py-4 text-left border-b border-gray-200">User Details</th>
                    <th className="px-6 py-4 text-left border-b border-gray-200">Message Content</th>
                    <th className="w-40 px-6 py-4 text-right border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paginatedEnquiries.map((enquiry, index) => (
                    <tr key={enquiry.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(startIndex + index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                          <FaUser className="text-teal-600 text-[10px]" /> {enquiry.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <FaEnvelope className="text-[10px]" /> {enquiry.email}
                        </div>
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="text-sm text-gray-700 line-clamp-2 italic mb-2">"{enquiry.message}"</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-semibold">
                          <FaClock /> {new Date(enquiry.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right border-b border-gray-100">
                        <button
                          onClick={() => handleDelete(enquiry.id)}
                          disabled={deletingId === enquiry.id}
                          className={`p-2 rounded-lg transition-all ${deletingId === enquiry.id
                            ? "opacity-50 cursor-not-allowed"
                            : "text-red-500 hover:bg-red-50"
                            }`}
                          title="Delete Enquiry"
                        >
                          <FaTrash size={16} className={deletingId === enquiry.id ? "animate-pulse" : ""} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="xl:hidden p-4 space-y-4">
              {paginatedEnquiries.map((enquiry, index) => (
                <div key={enquiry.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-teal-100 text-teal-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" title="Enquiry Number">
                        {startIndex + index + 1}
                      </div>
                      <div className="font-bold text-gray-900 truncate max-w-[150px]">{enquiry.name}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(enquiry.id)}
                      disabled={deletingId === enquiry.id}
                      className="text-red-500 hover:bg-red-50 p-1 rounded-md transition"
                    >
                      <FaTrash size={14} className={deletingId === enquiry.id ? "animate-pulse" : ""} />
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <FaEnvelope className="text-gray-400" />
                      <span className="truncate">{enquiry.email}</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm italic py-2">
                      "{enquiry.message}"
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-semibold justify-end">
                      <FaClock /> {new Date(enquiry.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination - Simplified Aligned with ViewEvents Layout */}
      {!loading && totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50/50">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredEnquiries.length)} of {filteredEnquiries.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-100 disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-100 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEnquiries;