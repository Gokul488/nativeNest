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
  Phone,
  Mail,
  Shield,
  Trash2,
  PlusCircle,
  Lock,
  HardHat,
  Users,
  X,
  User,
  Edit
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
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  const fetchBuilders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
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
    if (currentUser.builder_type !== "BuilderAdmin") {
      navigate("/builder-dashboard");
      return;
    }

    fetchBuilders();
  }, [navigate, currentUser.builder_type]);

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
    if (builderId === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }
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
        b.mobile_number.includes(searchQuery) ||
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
      <ChevronUp className="ml-1.5 w-3.5 h-3.5 text-sky-500" />
    ) : (
      <ChevronDown className="ml-1.5 w-3.5 h-3.5 text-sky-500" />
    );
  };

  if (currentUser.builder_type !== "BuilderAdmin") return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px] animate-in fade-in duration-500">
      
      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full lg:w-auto">
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
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500 text-white rounded-full text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:scale-105 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Builder
        </button>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin h-7 w-7 text-sky-500" />
            <span className="text-sm font-semibold text-slate-600">Loading builders…</span>
          </div>
        )}

        {error && (
          <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && filteredAndSortedBuilders.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <HardHat className="w-10 h-10 text-slate-200" />
            <p className="text-lg font-bold text-slate-800">No builders found</p>
          </div>
        )}

        {!loading && !error && filteredAndSortedBuilders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4 text-left w-16">S.No</th>
                  <th className="px-8 py-4 text-left">Builder Details</th>
                  <th className="px-8 py-4 text-left">Contact Person</th>
                  <th className="px-8 py-4 text-left">Contact Info</th>
                  <th 
                    className="px-8 py-4 text-center cursor-pointer hover:text-sky-600 transition-colors"
                    onClick={() => requestSort("builder_type")}
                  >
                    <span className="inline-flex items-center">Category {getSortIcon("builder_type")}</span>
                  </th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedBuilders.map((builder, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={builder.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                      <td className="px-8 py-5 text-sm font-bold text-slate-300">
                        {String(globalIndex).padStart(2, "0")}
                      </td>
                      <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                          builder.builder_type === "BuilderAdmin" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-sky-50 text-sky-600 border border-sky-100"
                        }`}>
                          {builder.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{builder.name}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
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
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100 hover:scale-105 active:scale-95 transition-all"
                                  >
                                    <Users className="w-2.5 h-2.5" />
                                    {members.length}
                                  </button>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-800">{builder.contact_person || "—"}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-300" />
                          <span>{builder.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-300" />
                          <span>{builder.mobile_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        builder.builder_type === "BuilderAdmin" 
                        ? "bg-amber-50 text-amber-600 border-amber-100" 
                        : "bg-sky-50 text-sky-600 border-sky-100"
                      }`}>
                        <Shield className="w-3 h-3" />
                        {builder.builder_type ? builder.builder_type.toUpperCase() : "BUILDER"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(builder)}
                          className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                          title="Edit Builder"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(builder.id)}
                          disabled={builder.id === currentUser.id}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                          title={builder.id === currentUser.id ? "Cannot delete yourself" : "Delete Builder"}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredAndSortedBuilders.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAndSortedBuilders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          activeColor="sky"
        />
      )}

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
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-sky-100 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-sm">
                      {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{member.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[11px] font-medium">
                        <span className="text-sky-600 font-semibold">{member.role}</span>
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
                  ID #{editingBuilder.id} • {editingBuilder.name}
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
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
                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 text-[10px] font-bold rounded-lg transition-all"
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
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500 transition-all"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Role"
                            value={member.role || ""}
                            onChange={(e) => handleEditMemberChange(index, "role", e.target.value)}
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500 transition-all"
                          />
                          <input
                            type="tel"
                            required
                            placeholder="Mobile"
                            value={member.mobile || ""}
                            onChange={(e) => handleEditMemberChange(index, "mobile", e.target.value)}
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500 transition-all"
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
                className="px-5 py-2 bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/10 hover:bg-sky-600 transition-all disabled:opacity-75 flex items-center gap-1.5"
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
