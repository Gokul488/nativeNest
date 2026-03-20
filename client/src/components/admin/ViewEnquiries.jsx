import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaClock, FaTrash } from "react-icons/fa";
import {
  Search,
  Loader2,
  AlertCircle,
  Trash2,
  Mail,
  MessageSquare,
} from "lucide-react";
import API_BASE_URL from '../../config.js';
import DeleteDialog from '../DeleteDialog';
import Pagination from '../common/Pagination.jsx';

const ViewEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact`);
        if (!response.ok) throw new Error("Failed to fetch enquiries");
        const data = await response.json();
        setEnquiries(data.messages || data || []);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedEnquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEnquiries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEnquiries, currentPage]);

  const handleDelete = (id) => {
    setEnquiryToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!enquiryToDelete) return;
    setDeletingId(enquiryToDelete);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_BASE_URL}/api/contact/${enquiryToDelete}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status === 200 || response.status === 204) {
        setEnquiries(prev => prev.filter((enq) => enq.id !== enquiryToDelete));
      }
      setShowDeleteDialog(false);
      setEnquiryToDelete(null);
    } catch (err) {
      alert("Failed to delete enquiry.");
      setShowDeleteDialog(false);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left: search */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Right: total count */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              View and manage all incoming contact messages
            </p>
          </div>
          <span className="italic ml-1 bg-indigo-50 text-indigo-600 text-md font-bold px-3 py-1 rounded-full border border-indigo-100">
            {enquiries.length} Enquiries
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1">

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
            <span className="text-sm font-semibold">Loading enquiries…</span>
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
        {!loading && !error && filteredEnquiries.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No enquiries found</p>
            <p className="text-sm text-slate-400 max-w-xs text-center">
              {searchTerm ? `No results matching "${searchTerm}"` : "No contact enquiries received yet."}
            </p>
          </div>
        )}

        {/* Table + cards */}
        {!loading && !error && filteredEnquiries.length > 0 && (
          <div className="flex flex-col">

            {/* ── Desktop Table ── */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="w-14 px-6 py-4 text-left">#</th>
                    <th className="w-1/4 px-6 py-4 text-left">User Details</th>
                    <th className="px-6 py-4 text-left">Message Content</th>
                    <th className="w-24 px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedEnquiries.map((enquiry, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={enquiry.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">

                        {/* # */}
                        <td className="px-6 py-4 text-sm font-bold text-slate-300">
                          {String(globalIndex).padStart(2, '0')}
                        </td>

                        {/* User Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-1">
                            <FaUser className="text-indigo-400 text-[10px] shrink-0" />
                            <span className="font-bold text-slate-800 text-sm">{enquiry.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail className="w-3 h-3 text-slate-300 shrink-0" />
                            <span className="truncate">{enquiry.email}</span>
                          </div>
                        </td>

                        {/* Message Content */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 line-clamp-2 italic mb-1.5">
                            "{enquiry.message}"
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-500">
                            <FaClock className="text-[9px]" />
                            {new Date(enquiry.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(enquiry.id)}
                            disabled={deletingId === enquiry.id}
                            className={`p-2 rounded-lg transition-all ${
                              deletingId === enquiry.id
                                ? "opacity-40 cursor-not-allowed"
                                : "text-red-400 hover:bg-red-50 hover:text-red-500"
                            }`}
                            title="Delete Enquiry"
                          >
                            <Trash2 size={15} className={deletingId === enquiry.id ? "animate-pulse" : ""} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="xl:hidden p-4 space-y-3">
              {paginatedEnquiries.map((enquiry, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div key={enquiry.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 hover:border-indigo-200 transition-colors">

                    {/* Card Header */}
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {globalIndex}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm truncate max-w-[160px]">{enquiry.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-300" />
                            <span className="text-xs text-slate-400 truncate max-w-[140px]">{enquiry.email}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(enquiry.id)}
                        disabled={deletingId === enquiry.id}
                        className={`p-1.5 rounded-lg transition ${
                          deletingId === enquiry.id
                            ? "opacity-40 cursor-not-allowed"
                            : "text-red-400 hover:bg-red-50"
                        }`}
                      >
                        <Trash2 size={14} className={deletingId === enquiry.id ? "animate-pulse" : ""} />
                      </button>
                    </div>

                    {/* Message */}
                    <div className="bg-white p-3 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                      "{enquiry.message}"
                    </div>

                    {/* Timestamp */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-500">
                      <FaClock className="text-[9px]" />
                      {new Date(enquiry.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredEnquiries.length}
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
        title="Delete Enquiry?"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
      />
    </div>
  );
};

export default ViewEnquiries;