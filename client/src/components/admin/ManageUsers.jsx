// src/components/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config.js";
import { FaSearch, FaDownload, FaSpinner, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // For search
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch all registered users (buyers)
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
        setFilteredUsers(res.data);
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

  // Fetch all property events for the dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/api/admin/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvents(res.data);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = users.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.mobile_number.includes(searchQuery) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleViewParticipants = () => {
    if (!selectedEventId) {
      alert("Please select an event");
      return;
    }
    navigate(`/admin-dashboard/events/${selectedEventId}/participants`);
  };

  // Placeholder for export (you can implement CSV export logic here)
  const handleExport = () => {
    alert("Exporting users as CSV... (Implement logic here)");
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-teal-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-teal-800">Registered Users</h2>
          <p className="text-sm text-gray-600">Total Users: {users.length}</p>
        </div>

        {/* Event Dropdown + Button */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Select Event to View Participants</label>
          {eventsLoading ? (
            <div className="text-gray-500 flex items-center gap-2">
              <FaSpinner className="animate-spin" />
              Loading events...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="border border-teal-300 bg-white px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-w-[280px] text-gray-800 hover:bg-teal-50 transition"
              >
                <option value="" disabled className="text-gray-400">Select Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.event_name} ({event.event_type}) – {event.city}
                  </option>
                ))}
              </select>

              <button
                onClick={handleViewParticipants}
                disabled={!selectedEventId}
                className={`px-5 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  selectedEventId
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                View Participants
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2">
          <FaSpinner className="animate-spin" />
          Loading users...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500 flex flex-col items-center gap-2">
          <FaInfoCircle className="text-3xl" />
          No registered users found.
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                  Joined On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-teal-50 transition">
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