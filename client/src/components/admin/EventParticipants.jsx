// src/components/EventParticipants.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from '../../config.js';
import { FaArrowLeft, FaSearch, FaInfoCircle, FaSpinner, FaExclamationTriangle } from "react-icons/fa";

const EventParticipants = () => {
  const { eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]); // For search
  const [event, setEvent] = useState({ event_name: "Unknown Event", start_date: null }); // Fetch event details
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch participants
        const participantsRes = await axios.get(
          `${API_BASE_URL}/api/admin/events/${eventId}/participants`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setParticipants(participantsRes.data);
        setFilteredParticipants(participantsRes.data);

        // Fetch all events and find the matching one
        const eventsRes = await axios.get(
          `${API_BASE_URL}/api/admin/events`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const matchingEvent = eventsRes.data.find(e => e.id === parseInt(eventId));
        if (matchingEvent) {
          setEvent(matchingEvent);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load data.");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, navigate]);

  // Handle search
  useEffect(() => {
    const filtered = participants.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredParticipants(filtered);
  }, [searchQuery, participants]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-teal-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-teal-800">
            Event Participants for {event.event_name} (ID: {eventId})
          </h2>
          {event.start_date && (
            <p className="text-sm text-gray-600 mt-1">
              Starting on: {new Date(event.start_date).toLocaleDateString("en-IN")}
            </p>
          )}
          <p className="text-sm text-gray-600">
            Total Participants: {participants.length}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin-dashboard/manage-users")}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          <FaArrowLeft />
          <span>Back to Users</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-200">
        <FaSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2">
          <FaSpinner className="animate-spin" />
          Loading participants...
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
      {!loading && !error && filteredParticipants.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500 flex flex-col items-center gap-2">
          <FaInfoCircle className="text-3xl" />
          No participants registered for this event yet. Consider promoting it!
        </div>
      )}

      {/* Participants Table */}
      {!loading && !error && filteredParticipants.length > 0 && (
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
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">
                  Registered On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((p, index) => (
                <tr key={p.id} className="hover:bg-teal-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.email || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(p.created_at).toLocaleString("en-IN")}
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

export default EventParticipants;