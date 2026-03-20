// src/components/ManageUsers.jsx
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
  Contact,
  Users,
} from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }
        const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        else setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];
    if (searchQuery) {
      result = result.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mobile_number.includes(searchQuery) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
  }, [users, searchQuery, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedUsers, currentPage]);

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
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Right: total count */}
        <div className=" italic flex items-center gap-3">
          <span className="ml-1 bg-indigo-50 text-indigo-600 text-md font-bold px-3 py-1 rounded-full border border-indigo-100">
            {users.length} Users
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1">

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
            <span className="text-sm font-semibold">Loading users…</span>
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
        {!loading && !error && filteredAndSortedUsers.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No users found</p>
            <p className="text-sm text-slate-400 max-w-xs text-center">
              No results matching "{searchQuery}"
            </p>
          </div>
        )}

        {/* Table + cards */}
        {!loading && !error && filteredAndSortedUsers.length > 0 && (
          <div className="flex flex-col">

            {/* ── Desktop Table ── */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-2.5 text-left w-16">#</th>
                    <th
                      className="px-6 py-2.5 text-left cursor-pointer hover:text-indigo-600 transition-colors select-none"
                      onClick={() => requestSort("name")}
                    >
                      <span className="inline-flex items-center">Full Name {getSortIcon("name")}</span>
                    </th>
                    <th className="px-6 py-2.5 text-left">Mobile</th>
                    <th className="px-6 py-2.5 text-left">Email Address</th>
                    <th
                      className="px-6 py-2.5 text-center cursor-pointer hover:text-indigo-600 transition-colors select-none"
                      onClick={() => requestSort("created_at")}
                    >
                      <span className="inline-flex items-center justify-center">Registration {getSortIcon("created_at")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedUsers.map((user, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr
                        key={user.id || index}
                        className="hover:bg-slate-50/60 transition-colors duration-150 group"
                      >
                        {/* # */}
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-300">
                          {String(globalIndex).padStart(2, "0")}
                        </td>

                        {/* Full Name */}
                        <td className="px-6 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Contact className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="font-bold text-slate-800 text-sm">{user.name}</span>
                          </div>
                        </td>

                        {/* Mobile */}
                        <td className="px-6 py-2.5 text-sm text-slate-500 font-medium">
                          <span className="inline-flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-300" />
                            {user.mobile_number}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-2.5 text-sm text-slate-500 font-medium max-w-[240px]">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span className="truncate">{user.email || "—"}</span>
                          </span>
                        </td>

                        {/* Registration */}
                        <td className="px-6 py-2.5 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100">
                            {new Date(user.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="xl:hidden p-4 space-y-3">
              {paginatedUsers.map((user, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div
                    key={user.id || index}
                    className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {globalIndex}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            ID #{user.id ? String(user.id).slice(-4) : "N/A"}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold">
                        {new Date(user.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        }).toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                        <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="font-medium text-slate-600">{user.mobile_number}</span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-slate-100 overflow-hidden">
                        <Mail className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="font-medium text-slate-600 truncate">{user.email || "—"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredAndSortedUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              activeColor="indigo"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;