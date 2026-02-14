// src/components/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../../config.js';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load users.");
          console.error("Failed to fetch users:", error.response?.data || error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleViewParticipants = () => {
    if (!eventId.trim()) {
      alert("Please enter an Event ID");
      return;
    }
    navigate(`/admin-dashboard/events/${eventId}/participants`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Registered Users</h2>

        {/* View Event Participants Input */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            placeholder="Enter Event ID"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
          />
          <button
            onClick={handleViewParticipants}
            className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition font-medium"
          >
            View Participants
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center text-gray-500">Loading users...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          No registered users found.
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.mobile_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.email || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(user.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;