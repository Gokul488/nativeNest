// src/components/BuilderStallInterests.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom"; 
import { 
  FaSearch, FaUser, FaPhoneAlt, FaEnvelope, FaLayerGroup, 
  FaInfoCircle, FaExclamationTriangle, FaMapMarkerAlt,
  FaTimes, FaArrowLeft, FaCheckCircle, FaTimesCircle 
} from "react-icons/fa";
import API_BASE_URL from "../../config.js";
import { format } from "date-fns";

const BuilderStallInterests = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get("eventId"); 
  const eventNameHint = queryParams.get("event") || "";

  const [interests, setInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [attendanceFilter, setAttendanceFilter] = useState("all"); // New State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        let url = `${API_BASE_URL}/api/builder/stall-interests${eventId ? `?eventId=${eventId}` : ''}`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setInterests(res.data.interests || []);
      } catch (err) {
        setError("Failed to load buyer interests.");
      } finally {
        setLoading(false);
      }
    };
    fetchInterests();
  }, [eventId]);

  // Combined Filtering Logic (Search + Attendance)
  const filteredInterests = useMemo(() => {
    return interests.filter(item => {
      const isAttended = item.is_attended === 1 || item.is_attended === true;
      const matchesSearch = 
        item.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.stall_type_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (attendanceFilter === "attended") return matchesSearch && isAttended;
      if (attendanceFilter === "not-attended") return matchesSearch && !isAttended;
      return matchesSearch;
    });
  }, [interests, searchQuery, attendanceFilter]);

  // Stats Calculation
  const stats = useMemo(() => {
    const attended = interests.filter(i => i.is_attended === 1 || i.is_attended === true).length;
    return { total: interests.length, attended, absent: interests.length - attended };
  }, [interests]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Top Header - Stats Section (Matching EventParticipants design) */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/builder-dashboard/events" className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-200 text-gray-600">
            <FaArrowLeft />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              {eventNameHint ? `${eventNameHint} Leads` : "Buyer Interests"}
            </h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">Stall Visit Management</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="text-center px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-400 font-bold uppercase italic">Total Leads</div>
            <div className="text-lg font-black text-gray-800">{stats.total}</div>
          </div>
          <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-100 shadow-sm">
            <div className="text-xs text-green-600 font-bold uppercase italic">Visited</div>
            <div className="text-lg font-black text-green-700">{stats.attended}</div>
          </div>
          <div className="text-center px-4 py-2 bg-red-50 rounded-lg border border-red-100 shadow-sm">
            <div className="text-xs text-red-500 font-bold uppercase italic">Absent</div>
            <div className="text-lg font-black text-red-600">{stats.absent}</div>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="relative flex-1 w-full lg:max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or stall type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="w-full lg:w-48 border border-gray-300 bg-white px-4 py-2 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="attended">Visited Stall</option>
            <option value="not-attended">Not Visited</option>
          </select>
          <span className="hidden lg:block bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold">
            {filteredInterests.length} Leads Found
          </span>
        </div>
      </div>

      {/* Table Area */}
      <div className="relative flex-1">
        {loading ? (
          <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            Loading Leads...
          </div>
        ) : filteredInterests.length === 0 ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No leads match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                  <th className="w-1/3 px-6 py-4 text-left border-b border-gray-200">Buyer Details</th>
                  <th className="w-1/4 px-6 py-4 text-left border-b border-gray-200">Event & Stall</th>
                  <th className="px-6 py-4 text-center border-b border-gray-200">Contact</th>
                  <th className="w-32 px-6 py-4 text-center border-b border-gray-200">Visit Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredInterests.map((item, index) => {
                  const isAttended = item.is_attended === 1 || item.is_attended === true;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <FaUser className="text-teal-600" size={14} /> {item.buyer_name}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <FaMapMarkerAlt size={10} /> {item.city}, {item.state}
                        </div>
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="font-semibold text-gray-800 text-sm truncate">{item.event_name}</div>
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] font-bold uppercase">
                          <FaLayerGroup size={10} /> {item.stall_type_name}
                        </div>
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100 text-center">
                        <div className="flex flex-col items-center gap-1 text-xs">
                          <span className="font-medium text-gray-700"><FaPhoneAlt size={10} className="inline mr-1 text-teal-500"/>{item.buyer_mobile}</span>
                          {item.buyer_email && <span className="text-gray-400"><FaEnvelope size={10} className="inline mr-1"/>{item.buyer_email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center border-b border-gray-100">
                        {isAttended ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <FaCheckCircle /> Visited
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
        )}
      </div>
    </div>
  );
};

export default BuilderStallInterests;