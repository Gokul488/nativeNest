// src/components/EventBookedBuilders.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaBuilding,
  FaUserTie,
  FaPhoneAlt,
  FaCheckCircle,
  FaSearch,
  FaInfoCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import API_BASE_URL from "../../config.js";

const EventBookedBuilders = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [builders, setBuilders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    const fetchBookedBuilders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");

        const res = await axios.get(
          `${API_BASE_URL}/api/buyer/events/${eventId}/booked-builders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBuilders(res.data.builders || []);
        setEventName(res.data.event_name || "Event");
      } catch (err) {
        setError("Could not load participating builders.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookedBuilders();
  }, [eventId]);

  const filteredBuilders = useMemo(() => {
    return builders.filter(b =>
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [builders, searchQuery]);

  const handleRegisterInterest = async (builder) => {
    if (!builder.sample_stall_type_id) {
      alert("No stall type available for this builder.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/buyer/events/stall-interest`,
        { eventId, stallTypeId: builder.sample_stall_type_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBuilders(prev =>
        prev.map(b => b.builder_id === builder.builder_id ? { ...b, interest_registered: true } : b)
      );
      alert(`Interest registered for ${builder.name}!`);
    } catch (err) {
      alert("Failed to register interest. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm"
        >
          <FaArrowLeft size={12} /> Back to My Events
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Builders at {eventName}</h2>
            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
              {builders.length} Total
            </span>
          </div>

          <div className="relative flex-1 sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by builder or contact person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-20 flex flex-col justify-center items-center gap-3 text-gray-500">
              <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full"></div>
              <p className="font-medium text-sm">Loading participating builders...</p>
            </div>
          )}

          {error && (
            <div className="m-4 sm:m-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-2 text-sm">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          {!loading && !error && filteredBuilders.length === 0 && (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-3">
              <FaInfoCircle className="text-5xl opacity-20" />
              <p className="text-lg font-medium">No builders found for this event.</p>
            </div>
          )}

          {!loading && !error && filteredBuilders.length > 0 && (
            <>
              {/* Desktop View Table */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full table-fixed border-separate border-spacing-0">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                      <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                      <th className="w-1/3 px-6 py-4 text-left border-b border-gray-200">Builder Name</th>
                      <th className="w-48 px-4 py-4 text-center border-b border-gray-200">Contact Person</th>
                      <th className="w-48 px-4 py-4 text-center border-b border-gray-200">Mobile Number</th>
                      <th className="w-48 px-6 py-4 text-center border-b border-gray-200">Interest</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredBuilders.map((b, index) => (
                      <tr key={b.builder_id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-5 border-b border-gray-100">
                          <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <FaBuilding className="text-teal-600" size={14} /> {b.name}
                          </div>
                          <div className="text-xs text-gray-400">ID: B-{b.builder_id}</div>
                        </td>
                        <td className="px-4 py-5 text-center border-b border-gray-100">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <FaUserTie className="text-gray-400" /> {b.contact_person || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center border-b border-gray-100">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 italic">
                            <FaPhoneAlt size={12} className="text-teal-500" /> {b.mobile_number || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-5 border-b border-gray-100 text-center">
                          {b.interest_registered ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                              <FaCheckCircle /> Registered
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRegisterInterest(b)}
                              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                            >
                              Register Interest
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet View Cards */}
              <div className="xl:hidden flex flex-col gap-4 p-4">
                {filteredBuilders.map((b, index) => (
                  <div key={b.builder_id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">#{String(index + 1).padStart(2, '0')}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Builder</span>
                        </div>
                        <h4 className="font-bold text-gray-900 leading-tight flex items-center gap-2">
                          <FaBuilding className="text-teal-600 shrink-0" size={14} /> {b.name}
                        </h4>
                      </div>
                      {b.interest_registered && (
                        <span className="bg-green-100 text-green-700 p-1 rounded-full"><FaCheckCircle size={14} /></span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-gray-100">
                      <div className="space-y-1">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Contact</p>
                        <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5 truncate">
                          <FaUserTie className="text-gray-400" size={10} /> {b.contact_person || "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Phone</p>
                        <p className="text-xs font-bold text-teal-600 flex items-center gap-1.5 truncate">
                          <FaPhoneAlt size={10} /> {b.mobile_number || "—"}
                        </p>
                      </div>
                    </div>

                    {!b.interest_registered ? (
                      <button
                        onClick={() => handleRegisterInterest(b)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-100 active:scale-95 transition-transform"
                      >
                        Register My Interest
                      </button>
                    ) : (
                      <div className="text-center py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100 flex items-center justify-center gap-1.5">
                        <FaCheckCircle /> Registered
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventBookedBuilders;