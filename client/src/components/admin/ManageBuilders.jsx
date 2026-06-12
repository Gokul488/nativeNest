// src/components/ManageBuilders.jsx
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
  HardHat,
  CheckCircle,
  Clock,
  UserCheck,
  Users,
  X,
  User,
  Edit,
  Trash2
} from "lucide-react";

const ManageBuilders = () => {
  const [builders, setBuilders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [editingBuilder, setEditingBuilder] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    mobile_number: "",
    team_members: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchBuilders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      const res = await axios.get(`${API_BASE_URL}/api/admin/builders`, {
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
    let parsedMembers = [];
    try {
      parsedMembers = typeof builder.team_members === 'string'
        ? JSON.parse(builder.team_members)
        : (builder.team_members || []);
    } catch (e) {
      parsedMembers = [];
    }

    setEditingBuilder(builder);
    setEditForm({
      name: builder.name || "",
      contact_person: builder.contact_person || "",
      email: builder.email || "",
      mobile_number: builder.mobile_number || "",
      team_members: parsedMembers
    });
    setEditError("");
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditMemberChange = (index, field, value) => {
    setEditForm(prev => {
      const updatedMembers = prev.team_members.map((member, i) => {
        if (i === index) {
          return { ...member, [field]: value };
        }
        return member;
      });
      return { ...prev, team_members: updatedMembers };
    });
  };

  const addEditTeamMember = () => {
    if (editForm.team_members.length >= 10) return;
    setEditForm(prev => ({
      ...prev,
      team_members: [...prev.team_members, { name: "", role: "", mobile: "" }]
    }));
  };

  const removeEditTeamMember = (index) => {
    setEditForm(prev => ({
      ...prev,
      team_members: prev.team_members.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/builder/${editingBuilder.id}`, editForm, {
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
        {/* Left: search */}
        <div className="relative w-full lg:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search company, person, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Right: total count */}
        <div className="italic flex items-center gap-3">
          <span className="ml-1 bg-indigo-50 text-indigo-600 text-md font-bold px-3 py-1 rounded-full border border-indigo-100">
            {builders.length} Builders
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1">

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
            <span className="text-sm font-semibold">Loading builders…</span>
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
                      className="px-3 py-2.5 text-left cursor-pointer hover:text-indigo-600 transition-colors select-none"
                      onClick={() => requestSort("name")}
                    >
                      <span className="inline-flex items-center">Company {getSortIcon("name")}</span>
                    </th>
                    <th className="px-3 py-2.5 text-left">Contact Person</th>
                    <th className="px-3 py-2.5 text-left w-36">Mobile</th>
                    <th className="px-3 py-2.5 text-left">Email Address</th>
                    <th
                      className="px-3 py-2.5 text-center cursor-pointer hover:text-indigo-600 transition-colors select-none"
                      onClick={() => requestSort("total_properties")}
                    >
                      <span className="inline-flex items-center justify-center">Properties {getSortIcon("total_properties")}</span>
                    </th>
                    <th
                      className="px-3 py-2.5 text-center cursor-pointer hover:text-indigo-600 transition-colors select-none"
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

                        {/* Company */}
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() =>
                                navigate("/admin-dashboard/manage-properties", {
                                  state: { builderFilter: builder.name },
                                })
                              }
                              className="flex items-center gap-2.5 text-left group/btn w-fit"
                            >
                              <LayoutGrid className="w-4 h-4 text-indigo-400 shrink-0" />
                              <span className="font-bold text-slate-800 text-sm group-hover/btn:text-indigo-600 transition-colors">
                                {builder.name}
                              </span>
                            </button>
                            {(() => {
                              let members = [];
                              try {
                                members = typeof builder.team_members === 'string' 
                                  ? JSON.parse(builder.team_members) 
                                  : (builder.team_members || []);
                              } catch (e) {
                                members = [];
                              }
                              if (members && members.length > 0) {
                                return (
                                  <button
                                    onClick={() => setSelectedBuilder(builder)}
                                    className="w-fit inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all ml-6"
                                  >
                                    <Users className="w-2.5 h-2.5" />
                                    {members.length}
                                  </button>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>

                        {/* Contact Person */}
                        <td className="px-3 py-2.5 text-sm text-slate-800 font-bold">
                          {builder.contact_person || "—"}
                        </td>

                        {/* Mobile */}
                        <td className="px-3 py-2.5 text-sm text-slate-500 font-medium w-36">
                          <span className="inline-flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span className="truncate">{builder.mobile_number || "—"}</span>
                          </span>
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2.5 text-sm text-slate-500 font-medium max-w-[240px]">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span className="truncate">{builder.email || "—"}</span>
                          </span>
                        </td>

                        {/* Quantities */}
                        <td className="px-3 py-2.5 text-center">
                          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100">
                            <LayoutGrid className="w-3 h-3 text-indigo-400" />
                            {builder.total_properties ?? 0}
                          </span>
                        </td>

                        <td className="px-3 py-2.5 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100">
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
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Edit Builder"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(builder.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
                    className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {globalIndex}
                        </span>
                        <div>
                          <button
                            onClick={() =>
                              navigate("/admin-dashboard/manage-properties", {
                                state: { builderFilter: builder.name },
                              })
                            }
                            className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors text-left block max-w-[180px] truncate"
                          >
                            {builder.name}
                          </button>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold">
                        {new Date(builder.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        }).toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                        <User className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-bold text-slate-800">{builder.contact_person || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                        <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="font-medium text-slate-600">{builder.mobile_number || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-slate-100 overflow-hidden">
                        <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="font-medium text-slate-600 truncate">{builder.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-indigo-50 rounded-xl px-3 py-2.5 border border-indigo-100">
                        <LayoutGrid className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-bold text-indigo-700 text-sm">
                          {builder.total_properties ?? 0} Properties
                        </span>
                      </div>
                      {(() => {
                        let members = [];
                        try {
                          members = typeof builder.team_members === 'string'
                            ? JSON.parse(builder.team_members)
                            : (builder.team_members || []);
                        } catch (e) {
                          members = [];
                        }
                        if (members && members.length > 0) {
                          return (
                            <button
                              onClick={() => setSelectedBuilder(builder)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-100 text-xs font-bold transition-all mt-1"
                            >
                              <Users className="w-3.5 h-3.5 shrink-0" />
                              View Team ({members.length})
                            </button>
                          );
                        }
                        return null;
                      })()}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditClick(builder)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-100 text-xs font-bold transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit Details
                        </button>
                        <button
                          onClick={() => handleDelete(builder.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 text-xs font-bold transition-all"
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
              activeColor="indigo"
            />
          </div>
        )}
      </div>

      {/* Team Members Modal */}
      {selectedBuilder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedBuilder.name}</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Team Members</p>
              </div>
              <button 
                onClick={() => setSelectedBuilder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(() => {
                let members = [];
                try {
                  members = typeof selectedBuilder.team_members === 'string'
                    ? JSON.parse(selectedBuilder.team_members)
                    : (selectedBuilder.team_members || []);
                } catch (e) {
                  members = [];
                }
                
                if (!members || members.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No team members recorded.
                    </div>
                  );
                }
                
                return members.map((member, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-indigo-100 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-sm">
                      {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{member.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[11px] font-medium">
                        <span className="text-indigo-600 font-semibold">{member.role}</span>
                        {member.mobile && (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            {member.mobile}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Team Members List */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Members ({editForm.team_members.length}/10)</span>
                  {editForm.team_members.length < 10 && (
                    <button
                      type="button"
                      onClick={addEditTeamMember}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 text-[10px] font-bold rounded-lg transition-all"
                    >
                      + Add Member
                    </button>
                  )}
                </div>

                {editForm.team_members.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {editForm.team_members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                        <span className="text-[10px] font-bold text-slate-300 w-4">#{index+1}</span>
                        <div className="grid grid-cols-3 gap-2 flex-1">
                          <input
                            type="text"
                            required
                            placeholder="Name"
                            value={member.name || ""}
                            onChange={(e) => handleEditMemberChange(index, "name", e.target.value)}
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-all"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Role"
                            value={member.role || ""}
                            onChange={(e) => handleEditMemberChange(index, "role", e.target.value)}
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-all"
                          />
                          <input
                            type="tel"
                            required
                            placeholder="Mobile"
                            value={member.mobile || ""}
                            onChange={(e) => handleEditMemberChange(index, "mobile", e.target.value)}
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEditTeamMember(index)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-xs text-slate-400">No team members added yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingBuilder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 hover:bg-indigo-600 transition-all disabled:opacity-75 flex items-center gap-1.5"
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