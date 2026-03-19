// src/components/EventParticipants.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import {
  Search, Loader2, AlertCircle, Contact,
  CheckCircle2, XCircle, Phone, Mail,
} from "lucide-react";
import API_BASE_URL from '../../config.js';
import Pagination from "../common/Pagination.jsx";

const EventParticipants = () => {
  const { eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [event, setEvent] = useState({ event_name: "Loading...", start_date: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));
      if (attendanceFilter === "attended") return matchesSearch && isAttended;
      if (attendanceFilter === "not-attended") return matchesSearch && !isAttended;
      return matchesSearch;
    });
  }, [participants, searchQuery, attendanceFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, attendanceFilter]);

  const paginatedParticipants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredParticipants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredParticipants, currentPage]);

  const stats = useMemo(() => {
    const attended = participants.filter(p => p.is_attended === 1 || p.is_attended === "1" || p.is_attended === true).length;
    return { total: participants.length, attended, absent: participants.length - attended };
  }, [participants]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

      {/* ── Top Header: Event info + stats ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <FaArrowLeft className="text-slate-400" size={13} />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              {event.event_name}
            </h2>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">Participant List</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="text-center px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Total</div>
            <div className="text-lg font-black text-indigo-700">{stats.total}</div>
          </div>
          <div className="text-center px-4 py-2 bg-green-50 rounded-xl border border-green-100">
            <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Attended</div>
            <div className="text-lg font-black text-green-700">{stats.attended}</div>
          </div>
          <div className="text-center px-4 py-2 bg-red-50 rounded-xl border border-red-100">
            <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Absent</div>
            <div className="text-lg font-black text-red-600">{stats.absent}</div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="px-8 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3 bg-white sticky top-0 z-10">
        <div className="relative flex-1 w-full md:max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="w-full md:w-48 border border-slate-200 bg-slate-50 px-4 py-2.5 rounded-full text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
          >
            <option value="all">All Status</option>
            <option value="attended">Attended Only</option>
            <option value="not-attended">Absent Only</option>
          </select>
          <span className="hidden md:inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-bold whitespace-nowrap">
            {filteredParticipants.length} Found
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
            <span className="text-sm font-semibold">Loading participants…</span>
          </div>
        )}

        {error && (
          <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && filteredParticipants.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No participants found</p>
            <p className="text-sm text-slate-400">No participants match your criteria.</p>
          </div>
        )}

        {!loading && !error && filteredParticipants.length > 0 && (
          <div className="flex flex-col">
            {/* ── Desktop Table ── */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="w-14 px-6 py-4 text-left">#</th>
                    <th className="w-1/3 px-6 py-4 text-left">Participant</th>
                    <th className="w-1/4 px-6 py-4 text-left">Contact Info</th>
                    <th className="px-6 py-4 text-left">Registration</th>
                    <th className="w-32 px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedParticipants.map((p, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    const isAttended = p.is_attended === 1 || p.is_attended === "1" || p.is_attended === true;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                        <td className="px-6 py-2.5 text-sm font-bold text-slate-300">
                          {String(globalIndex).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-2.5">
                          <div className="flex items-center gap-2">
                            <Contact className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-2.5 text-sm">
                          <div className="flex items-center gap-2 text-slate-500 mb-0.5">
                            <Phone className="w-3 h-3 text-slate-300" /> {p.phone}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Mail className="w-3 h-3 text-slate-300" /> {p.email || "No Email"}
                          </div>
                        </td>
                        <td className="px-6 py-2.5 text-xs text-slate-400 font-medium">
                          {new Date(p.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                        <td className="px-6 py-2.5 text-center">
                          {isAttended ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Attended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 border border-slate-200 rounded-full text-[10px] font-bold">
                              <XCircle className="w-3 h-3" /> Absent
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="xl:hidden p-4 space-y-3">
              {paginatedParticipants.map((p, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                const isAttended = p.is_attended === 1 || p.is_attended === "1" || p.is_attended === true;
                return (
                  <div key={p.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {globalIndex}
                        </span>
                        <p className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{p.name}</p>
                      </div>
                      {isAttended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-[9px] font-bold">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full text-[9px] font-bold">
                          <XCircle className="w-2.5 h-2.5" /> No
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                        <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-600 font-medium">{p.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                        <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="text-xs text-slate-600 font-medium truncate">{p.email || "No Email"}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                      <span>Registered</span>
                      <span>{new Date(p.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredParticipants.length}
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

export default EventParticipants;