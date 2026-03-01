// src/components/EventParticipants.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaSearch,
  FaInfoCircle,
  FaExclamationTriangle,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const EventParticipants = () => {
  const { eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [event, setEvent] = useState({ event_name: "Loading...", start_date: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const [participantsRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/events/${eventId}/participants`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/admin/events`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setParticipants(participantsRes.data);
        const matchingEvent = eventsRes.data.find(e => e.id === parseInt(eventId));
        if (matchingEvent) setEvent(matchingEvent);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login");
        else setError("Failed to load participant data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, navigate]);

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const isAttended = p.is_attended === 1 || p.is_attended === "1" || p.is_attended === true;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));

      if (attendanceFilter === "attended") return matchesSearch && isAttended;
      if (attendanceFilter === "not-attended") return matchesSearch && !isAttended;
      return matchesSearch;
    });
  }, [participants, searchQuery, attendanceFilter]);

  const stats = useMemo(() => {
    const attended = participants.filter(p => p.is_attended === 1 || p.is_attended === "1" || p.is_attended === true).length;
    return {
      total: participants.length,
      attended,
      absent: participants.length - attended
    };
  }, [participants]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Top Header - Event Info & Back Button */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-200 text-gray-600">
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{event.event_name}</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Participant List</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="text-center px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-400 font-bold uppercase italic">Total</div>
            <div className="text-lg font-black text-gray-800">{stats.total}</div>
          </div>
          <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-100 shadow-sm">
            <div className="text-xs text-green-600 font-bold uppercase italic">Attended</div>
            <div className="text-lg font-black text-green-700">{stats.attended}</div>
          </div>
          <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-100 shadow-sm">
            <div className="text-xs text-red-500 font-bold uppercase italic">Absent</div>
            <div className="text-lg font-black text-red-600">{stats.absent}</div>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="relative flex-1 w-full md:max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="w-full md:w-48 border border-gray-300 bg-white px-4 py-2 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="attended">Attended Only</option>
            <option value="not-attended">Absent Only</option>
          </select>
          <span className="hidden md:block bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold">
            {filteredParticipants.length} Found
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            Loading List...
          </div>
        )}

        {error && (
          <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {!loading && !error && filteredParticipants.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No participants match your criteria.</p>
          </div>
        )}

        {!loading && !error && filteredParticipants.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                    <th className="w-1/3 px-6 py-4 text-left border-b border-gray-200">Participant Details</th>
                    <th className="w-1/4 px-6 py-4 text-left border-b border-gray-200">Contact Info</th>
                    <th className="px-6 py-4 text-left border-b border-gray-200">Registration</th>
                    <th className="w-32 px-6 py-4 text-center border-b border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredParticipants.map((p, index) => {
                    const isAttended = p.is_attended === 1 || p.is_attended === "1" || p.is_attended === true;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-5 border-b border-gray-100">
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            <FaUser className="text-teal-600 text-xs" /> {p.name}
                          </div>
                        </td>
                        <td className="px-6 py-5 border-b border-gray-100 text-sm">
                          <div className="flex items-center gap-2 text-gray-700 mb-1">
                            <FaPhoneAlt className="text-[10px] text-gray-400" /> {p.phone}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <FaEnvelope className="text-[10px] text-gray-400" /> {p.email || "No Email"}
                          </div>
                        </td>
                        <td className="px-6 py-5 border-b border-gray-100 text-xs text-gray-500">
                          {new Date(p.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-6 py-5 text-center border-b border-gray-100">
                          {isAttended ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <FaCheckCircle /> Attended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <FaTimesCircle /> Absent
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="xl:hidden p-4 space-y-4">
              {filteredParticipants.map((p, index) => {
                const isAttended = p.is_attended === 1 || p.is_attended === "1" || p.is_attended === true;
                return (
                  <div key={p.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-teal-100 text-teal-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <div className="font-bold text-gray-900 truncate max-w-[150px]">{p.name}</div>
                      </div>
                      <div>
                        {isAttended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-bold uppercase">
                            <FaCheckCircle /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full text-[9px] font-bold uppercase">
                            <FaTimesCircle /> No
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <FaPhoneAlt className="text-gray-400 text-[10px]" />
                        <span>{p.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <FaEnvelope className="text-gray-400 text-[10px]" />
                        <span className="truncate">{p.email || "No Email"}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 font-semibold italic">
                      <span>Registered</span>
                      <span>{new Date(p.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventParticipants;