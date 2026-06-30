// client/src/components/builder/ManageBuilders.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config.js";
import Pagination from "../common/Pagination.jsx";

import {
  Search,
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  LayoutGrid,
  Phone,
  Mail,
  X,
  User,
  Edit,
  Trash2,
  PlusCircle
} from "lucide-react";

const ManageBuilders = () => {
  const [builders, setBuilders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBuilder, setEditingBuilder] = useState(null);
  const [showSecondOwnerEdit, setShowSecondOwnerEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    mobile_number: "",
    contact_person_2: "",
    email_2: "",
    mobile_number_2: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchBuilders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const res = await axios.get(`${API_BASE_URL}/api/builder/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuilders(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setError("Failed to load builders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilders();
  }, [navigate]);

  const handleEditClick = (builder) => {
    setEditingBuilder(builder);
    setEditForm({
      name: builder.name || "",
      contact_person: builder.contact_person || "",
      email: builder.email || "",
      mobile_number: builder.mobile_number || "",
      contact_person_2: builder.contact_person_2 || "",
      email_2: builder.email_2 || "",
      mobile_number_2: builder.mobile_number_2 || ""
    });
    setShowSecondOwnerEdit(!!(builder.contact_person_2 || builder.email_2 || builder.mobile_number_2));
    setEditError("");
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: editForm.name,
        contact_person: editForm.contact_person,
        email: editForm.email,
        mobile_number: editForm.mobile_number,
        contact_person_2: showSecondOwnerEdit && editForm.contact_person_2 ? editForm.contact_person_2 : null,
        email_2: showSecondOwnerEdit && editForm.email_2 ? editForm.email_2 : null,
        mobile_number_2: showSecondOwnerEdit && editForm.mobile_number_2 ? editForm.mobile_number_2 : null
      };
      await axios.put(`${API_BASE_URL}/api/builder/${editingBuilder.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchBuilders();
      setEditingBuilder(null);
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update builder");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (builderId) => {
    if (!window.confirm("Are you sure you want to remove this builder?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/builder/${builderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBuilders(builders.filter(b => b.id !== builderId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete builder");
    }
  };

  const filteredAndSortedBuilders = useMemo(() => {
    let result = [...builders];
    if (searchQuery) {
      result = result.filter((b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.mobile_number && b.mobile_number.includes(searchQuery)) ||
        (b.email && b.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [builders, searchQuery, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  const paginatedBuilders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBuilders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedBuilders, currentPage]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronsUpDown className="ml-1.5 w-3.5 h-3.5 opacity-40" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1.5 w-3.5 h-3.5 text-indigo-500" />
    ) : (
      <ChevronDown className="ml-1.5 w-3.5 h-3.5 text-indigo-500" />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Left: search */}
          <div className="relative w-full lg:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              type="text"
              placeholder="Search builders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
            />
          </div>

          <span className="hidden sm:inline-flex bg-sky-50 text-sky-600 text-sm font-bold px-3 py-1 rounded-full border border-sky-100 whitespace-nowrap">
            {builders.length} Builders
          </span>
        </div>

        <button
          onClick={() => navigate("/builder-dashboard/manage-builders/create")}
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500 text-white rounded-full text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Createbuilder
        </button>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1">

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin h-7 w-7 text-sky-500" />
            <span className="text-sm font-semibold text-slate-600">Loading builders…</span>
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
        {!loading && !error && filteredAndSortedBuilders.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No builders found</p>
            <p className="text-sm text-slate-400 max-w-xs text-center">
              No results matching "{searchQuery}"
            </p>
          </div>
        )}

        {/* Table + cards */}
        {!loading && !error && filteredAndSortedBuilders.length > 0 && (
          <div className="flex flex-col">

            <div className="hidden xl:block overflow-x-auto scrollbar-hide">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-3 py-2.5 text-left w-12">S.No</th>
                    <th
                      className="px-3 py-2.5 text-left cursor-pointer hover:text-sky-600 transition-colors select-none"
                      onClick={() => requestSort("name")}
                    >
                      <span className="inline-flex items-center">Name {getSortIcon("name")}</span>
                    </th>
                    <th className="px-3 py-2.5 text-left">Contact / Role</th>
                    <th className="px-3 py-2.5 text-left w-36">Mobile</th>
                    <th className="px-3 py-2.5 text-left">Email Address</th>
                    <th
                      className="px-3 py-2.5 text-center cursor-pointer hover:text-sky-600 transition-colors select-none"
                      onClick={() => requestSort("created_at")}
                    >
                      <span className="inline-flex items-center justify-center">Registered {getSortIcon("created_at")}</span>
                    </th>
                    <th className="px-3 py-2.5 text-right font-bold uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedBuilders.map((builder, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr
                        key={builder.id || index}
                        className="hover:bg-slate-50/60 transition-colors duration-150 group"
                      >
                        {/* # */}
                        <td className="px-3 py-2.5 text-sm font-bold text-slate-300">
                          {String(globalIndex).padStart(2, "0")}
                        </td>

                        {/* Name */}
                        <td className="px-3 py-2.5 font-bold text-slate-850">
                          {builder.name}
                        </td>

                        {/* Contact Person */}
                        <td className="px-3 py-2.5 text-sm text-slate-800 font-bold">
                          <div>{builder.contact_person && builder.contact_person !== builder.name ? builder.contact_person : "Sub-Builder"}</div>
                          {builder.contact_person_2 && (
                            <div className="text-xs text-slate-400 font-medium mt-1 pt-1 border-t border-slate-100">{builder.contact_person_2}</div>
                          )}
                        </td>

                        {/* Mobile */}
                        <td className="px-3 py-2.5 text-sm text-slate-500 font-medium w-36">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span className="truncate">{builder.mobile_number || "—"}</span>
                          </div>
                          {builder.mobile_number_2 && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1 pt-1 border-t border-slate-100 w-36">
                              <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              <span className="truncate">{builder.mobile_number_2}</span>
                            </div>
                          )}
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2.5 text-sm text-slate-500 font-medium max-w-[240px]">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span className="truncate">{builder.email || "—"}</span>
                          </div>
                          {builder.email_2 && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1 pt-1 border-t border-slate-100 max-w-[240px]">
                              <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              <span className="truncate">{builder.email_2}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-2.5 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-bold border border-slate-100">
                            {new Date(builder.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).toUpperCase()}
                          </span>
                        </td>

                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditClick(builder)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all cursor-pointer"
                              title="Edit Builder"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(builder.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                              title="Delete Builder"
                            >
                              <Trash2 className="w-4 h-4" />
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
            <div className="xl:hidden p-4 space-y-3">
              {paginatedBuilders.map((builder, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div
                    key={builder.id || index}
                    className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 hover:border-sky-200 transition-colors"
                  >
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-xs font-bold text-sky-600">
                          {globalIndex}
                        </span>
                        <div className="font-bold text-slate-900 text-sm">
                          {builder.name}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-[10px] font-bold">
                        {new Date(builder.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        }).toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-sky-500 shrink-0" />
                          <span className="font-bold text-slate-800">{builder.contact_person || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 pl-6">
                          <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          <span>{builder.mobile_number || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 pl-6 overflow-hidden">
                          <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                          <span className="truncate">{builder.email || "—"}</span>
                        </div>
                      </div>

                      {builder.contact_person_2 && (
                        <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-100 space-y-2">
                          <div className="flex items-center gap-2.5">
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700">{builder.contact_person_2} (contactperson2)</span>
                          </div>
                          {builder.mobile_number_2 && (
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 pl-6">
                              <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              <span>{builder.mobile_number_2}</span>
                            </div>
                          )}
                          {builder.email_2 && (
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 pl-6 overflow-hidden">
                              <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              <span className="truncate">{builder.email_2}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditClick(builder)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl border border-sky-100 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit Details
                        </button>
                        <button
                          onClick={() => handleDelete(builder.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredAndSortedBuilders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              activeColor="sky"
            />
          </div>
        )}
      </div>

      {/* Edit Builder Modal */}
      {editingBuilder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleUpdateSubmit}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Edit Builder Details</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {editingBuilder.name}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingBuilder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-505 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</label>
                  <input
                    type="text"
                    name="contact_person"
                    value={editForm.contact_person}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-505 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-505 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobile_number"
                    value={editForm.mobile_number}
                    onChange={handleEditFormChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-505 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Toggle Second Owner in Edit */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <span className="text-xs font-bold text-slate-700">Createbuilder</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecondOwnerEdit(!showSecondOwnerEdit)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg border border-sky-100 text-[10px] font-bold transition-all cursor-pointer"
                >
                  {showSecondOwnerEdit ? "- Remove" : "+ Add"}
                </button>
              </div>

              {showSecondOwnerEdit && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">contactperson2</label>
                    <input
                      type="text"
                      name="contact_person_2"
                      value={editForm.contact_person_2}
                      onChange={handleEditFormChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-505 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Second Email</label>
                    <input
                      type="email"
                      name="email_2"
                      value={editForm.email_2}
                      onChange={handleEditFormChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-505 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Second Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile_number_2"
                      value={editForm.mobile_number_2}
                      onChange={handleEditFormChange}
                      placeholder="+91..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-505 transition-all font-semibold"
                    />
                  </div>
                </div>
              )}

            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingBuilder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/10 hover:bg-sky-600 transition-all disabled:opacity-75 flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageBuilders;
