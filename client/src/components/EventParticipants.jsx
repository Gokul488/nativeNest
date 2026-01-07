// src/components/EventParticipants.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";

const EventParticipants = () => {
  const { eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/admin/events/${eventId}/participants`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setParticipants(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load participants.");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId, navigate]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Event Participants (Event ID: {eventId})
        </h2>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center text-gray-500">Loading participants...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && participants.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          No participants registered for this event yet.
        </div>
      )}

      {/* Participants Table */}
      {!loading && !error && participants.length > 0 && (
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
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map((p, index) => (
                <tr key={p.id} className="hover:bg-gray-50">
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