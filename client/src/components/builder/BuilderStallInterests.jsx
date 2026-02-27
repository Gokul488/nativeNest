// src/components/BuilderStallInterests.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom"; // Added for URL handling
import { 
  FaSearch, 
  FaUser, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaLayerGroup, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaTimes
} from "react-icons/fa";
import API_BASE_URL from "../../config.js";
import { format } from "date-fns";

const BuilderStallInterests = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventFilter = queryParams.get("event") || "";

  const [interests, setInterests] = useState([]);
  const [searchQuery, setSearchQuery] = useState(eventFilter); // Initialize with filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Session expired. Please log in again.");
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/builder/stall-interests`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setInterests(res.data.interests || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load buyer interests.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  const filteredInterests = useMemo(() => {
    return interests.filter(item => 
      item.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stall_type_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [interests, searchQuery]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Buyer Interests</h2>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {filteredInterests.length} {searchQuery ? 'Filtered' : 'Total'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by buyer, event, or stall type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            Loading interests...
          </div>
        )}

        {error && (
          <div className="m-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {!loading && !error && filteredInterests.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No buyer interests found {searchQuery && `for "${searchQuery}"`}.</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-teal-600 font-bold hover:underline">
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredInterests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                  <th className="w-1/4 px-6 py-4 text-left border-b border-gray-200">Buyer Information</th>
                  <th className="w-1/4 px-6 py-4 text-left border-b border-gray-200">Event & Stall</th>
                  <th className="w-48 px-4 py-4 text-center border-b border-gray-200">Contact Details</th>
                  <th className="w-40 px-6 py-4 text-center border-b border-gray-200">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredInterests.map((interest, index) => (
                  <tr key={interest.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-5 border-b border-gray-100">
                      <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <FaUser className="text-teal-600" size={14} /> 
                        {interest.buyer_name || "Anonymous Buyer"}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <FaMapMarkerAlt size={10} /> {interest.city}, {interest.state}
                      </div>
                    </td>
                    <td className="px-6 py-5 border-b border-gray-100">
                      <div className="font-semibold text-gray-800 text-sm mb-1 truncate">
                        {interest.event_name}
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-teal-50 text-teal-700 rounded text-[10px] font-bold uppercase">
                        <FaLayerGroup size={10} /> {interest.stall_type_name}
                      </div>
                    </td>
                    <td className="px-4 py-5 border-b border-gray-100">
                      <div className="flex flex-col items-center gap-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <FaPhoneAlt size={10} className="text-teal-500" /> 
                          {interest.buyer_mobile || "—"}
                        </span>
                        {interest.buyer_email && (
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <FaEnvelope size={10} /> {interest.buyer_email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 border-b border-gray-100 text-center">
                      <div className="flex flex-col items-center text-xs text-gray-500">
                        <span className="font-medium">
                          {format(new Date(interest.interest_date), "dd MMM yyyy")}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {format(new Date(interest.interest_date), "hh:mm a")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderStallInterests;