// src/components/ManageUsers.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config.js";
import {
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaIdBadge
} from "react-icons/fa";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
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

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ml-2 opacity-20" />;
    return sortConfig.direction === "asc" ? <FaSortUp className="ml-2 text-teal-600" /> : <FaSortDown className="ml-2 text-teal-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Users</h2>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {users.length} Total
          </span>
        </div>

        <div className="relative w-full lg:w-80">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            Loading users...
          </div>
        )}

        {error && (
          <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {!loading && !error && filteredAndSortedUsers.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No users found matching your search.</p>
          </div>
        )}

        {!loading && !error && filteredAndSortedUsers.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="w-14 px-4 py-4 text-left border-b border-gray-200">#</th>
                    <th onClick={() => requestSort("name")} className="w-1/4 px-4 py-4 text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">Full Name {getSortIcon("name")}</div>
                    </th>
                    <th className="w-1/4 px-4 py-4 text-left border-b border-gray-200">Mobile</th>
                    <th className="w-1/4 px-4 py-4 text-left border-b border-gray-200">Email Address</th>
                    <th onClick={() => requestSort("created_at")} className="w-32 px-4 py-4 text-center border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-center">Joined Date {getSortIcon("created_at")}</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredAndSortedUsers.map((user, index) => (
                    <tr key={user.id || index} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-4 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-5 border-b border-gray-100">
                        <div className="font-bold text-gray-900 flex items-center gap-2 truncate">
                          <FaIdBadge className="text-teal-600 text-xs shrink-0" /> <span className="truncate">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 border-b border-gray-100 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <FaPhoneAlt className="text-[10px] text-gray-400 shrink-0" /> {user.mobile_number}
                        </div>
                      </td>
                      <td className="px-4 py-5 border-b border-gray-100 text-sm text-gray-500">
                        <div className="flex items-center gap-2 truncate">
                          <FaEnvelope className="text-[10px] text-gray-400 shrink-0" /> <span className="truncate">{user.email || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center border-b border-gray-100">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <FaCalendarAlt className="text-[10px]" />
                          {new Date(user.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="xl:hidden p-4 space-y-4">
              {filteredAndSortedUsers.map((user, index) => (
                <div key={user.id || index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-teal-100 text-teal-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="font-bold text-gray-900">{user.name}</div>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                      {new Date(user.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaPhoneAlt className="text-gray-400 text-xs" />
                      <span>{user.mobile_number}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <FaEnvelope className="text-gray-400 text-xs" />
                      <span className="truncate">{user.email || "—"}</span>
                    </div>
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

export default ManageUsers;