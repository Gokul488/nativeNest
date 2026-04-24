
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
  Lock
} from "lucide-react";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    // Basic role check: If not SuperAdmin, redirect away
    if (currentUser.admin_type !== "SuperAdmin") {
      navigate("/admin-dashboard");
      return;
    }

    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        else setError("Failed to load admins.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [navigate, currentUser.admin_type]);

  const handleDelete = async (adminId) => {
    if (adminId === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this admin?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/admin/admin/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(admins.filter(a => a.id !== adminId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete admin");
    }
  };

  const filteredAndSortedAdmins = useMemo(() => {
    let result = [...admins];
    if (searchQuery) {
      result = result.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.mobile_number.includes(searchQuery) ||
        (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
  }, [admins, searchQuery, sortConfig]);

  const paginatedAdmins = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedAdmins.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedAdmins, currentPage]);

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

  // Only render for SuperAdmins
  if (currentUser.admin_type !== "SuperAdmin") return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px] animate-in fade-in duration-500">
      
      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full lg:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
            />
          </div>
          <span className="hidden sm:inline-flex bg-sky-50 text-sky-600 text-sm font-bold px-3 py-1 rounded-full border border-sky-100 whitespace-nowrap">
            {admins.length} Admins
          </span>
        </div>

        <button
          onClick={() => navigate("/admin-dashboard/manage-admins/create")}
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500 text-white rounded-full text-sm font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:scale-105 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Admin
        </button>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin h-7 w-7 text-sky-500" />
            <span className="text-sm font-semibold text-slate-600">Loading administrators…</span>
          </div>
        )}

        {error && (
          <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && filteredAndSortedAdmins.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <Shield className="w-10 h-10 text-slate-200" />
            <p className="text-lg font-bold text-slate-800">No admins found</p>
          </div>
        )}

        {!loading && !error && filteredAndSortedAdmins.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4 text-left">Admin Details</th>
                  <th className="px-8 py-4 text-left">Contact Info</th>
                  <th 
                    className="px-8 py-4 text-center cursor-pointer hover:text-sky-600 transition-colors"
                    onClick={() => requestSort("admin_type")}
                  >
                    <span className="inline-flex items-center">Category {getSortIcon("admin_type")}</span>
                  </th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                          admin.admin_type === "SuperAdmin" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-sky-50 text-sky-600 border border-sky-100"
                        }`}>
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{admin.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> ID #{admin.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-300" />
                          <span>{admin.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-300" />
                          <span>{admin.mobile_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        admin.admin_type === "SuperAdmin" 
                        ? "bg-amber-50 text-amber-600 border-amber-100" 
                        : "bg-sky-50 text-sky-600 border-sky-100"
                      }`}>
                        <Shield className="w-3 h-3" />
                        {admin.admin_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleDelete(admin.id)}
                        disabled={admin.id === currentUser.id}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        title={admin.id === currentUser.id ? "Cannot delete yourself" : "Delete Admin"}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredAndSortedAdmins.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAndSortedAdmins.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          activeColor="sky"
        />
      )}
    </div>
  );
};

export default ManageAdmins;
