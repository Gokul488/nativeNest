// src/components/EventBookedBuilders.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBuilding,
  FaUserTie,
  FaPhoneAlt,
  FaCheckCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  Search,
  Loader2,
  AlertCircle,
  ArrowLeft,
  X,
  Building2,
} from "lucide-react";
import API_BASE_URL from "../../config.js";

const EventBookedBuilders = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [builders, setBuilders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventName, setEventName] = useState("");
  const [confirmBuilder, setConfirmBuilder] = useState(null);

  useEffect(() => {
    const fetchBookedBuilders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please login again.");
          setLoading(false);
          return;
        }
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
    const query = searchQuery.toLowerCase();
    return builders.filter((b) => {
      const name = b.name ? b.name.toLowerCase() : "";
      const person = b.contact_person ? b.contact_person.toLowerCase() : "";
      const stall = b.stall_numbers ? b.stall_numbers.toString() : "";
      return (
        name.includes(query) ||
        person.includes(query) ||
        stall.includes(searchQuery)
      );
    });
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
      setBuilders((prev) =>
        prev.map((b) =>
          b.builder_id === builder.builder_id
            ? { ...b, interest_registered: true }
            : b
        )
      );
      setConfirmBuilder(null);
      alert(`Interest registered for ${builder.name}!`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register interest.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Back navigation ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-semibold text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Events
      </button>

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">

        {/* ── Header ── */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
          {/* Left: search */}
          <div className="relative flex-1 sm:w-72 lg:flex-none group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search builder, contact, or stall..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              disabled={loading}
            />
          </div>

          {/* Right: info + count */}
          <div className="flex items-center gap-3">
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100 italic">
              {loading ? "…" : builders.length} Builders Total
            </span>
            <span className="text-sm font-bold text-slate-400">— {eventName}</span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex flex-col">

          {/* Loading */}
          {loading && (
            <div className="flex-1 flex flex-col justify-center items-center gap-3 text-slate-400 py-24">
              <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
              <span className="text-sm font-semibold">Loading builders…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm">{error}</span>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredBuilders.length === 0 && (
            <div className="flex-1 py-32 flex flex-col items-center gap-3 text-slate-400">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
                <Search className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-800">No builders found</p>
              <p className="text-sm text-slate-400 max-w-xs text-center">
                {searchQuery
                  ? `No builders matching "${searchQuery}"`
                  : "No builders have booked stalls for this event yet."}
              </p>
            </div>
          )}

          {/* Table + Cards */}
          {!loading && !error && filteredBuilders.length > 0 && (
            <div className="flex flex-col">

              {/* ── Desktop Table ── */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="w-28 px-6 py-4 text-left">Stall No.</th>
                      <th className="w-1/3 px-6 py-4 text-left">Builder Name</th>
                      <th className="w-44 px-6 py-4 text-center">Contact Person</th>
                      <th className="w-44 px-6 py-4 text-center">Mobile Number</th>
                      <th className="w-44 px-6 py-4 text-center">Interest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuilders.map((b, index) => (
                      <tr
                        key={b.builder_id}
                        className="transition-colors duration-150 group hover:bg-slate-50/60"
                      >
                        {/* Stall No. */}
                        <td className="px-6 py-3 border-b border-slate-100">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600">
                            <FaMapMarkerAlt className="text-indigo-400 text-[10px]" />
                            {b.stall_numbers || "—"}
                          </div>
                        </td>

                        {/* Builder Name */}
                        <td className="px-6 py-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <FaBuilding className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="font-bold text-slate-800 text-sm">
                              {b.name}
                            </span>
                          </div>
                        </td>

                        {/* Contact Person */}
                        <td className="px-6 py-3 text-center border-b border-slate-100">
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <FaUserTie className="text-slate-300 text-[10px]" />
                            {b.contact_person || "—"}
                          </div>
                        </td>

                        {/* Mobile Number */}
                        <td className="px-6 py-3 text-center border-b border-slate-100">
                          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <FaPhoneAlt className="text-indigo-400 text-[10px]" />
                            {b.mobile_number || "—"}
                          </div>
                        </td>

                        {/* Interest */}
                        <td className="px-6 py-3 text-center border-b border-slate-100">
                          {b.interest_registered ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                              <FaCheckCircle className="text-[10px]" /> Registered
                            </span>
                          ) : (
                            <button
                              onClick={() => setConfirmBuilder(b)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
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

              {/* ── Mobile Cards ── */}
              <div className="xl:hidden p-4 space-y-3">
                {filteredBuilders.map((b, index) => (
                  <div
                    key={b.builder_id}
                    className="rounded-2xl p-5 border space-y-4 bg-white hover:border-indigo-200 transition-colors border-slate-100"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border bg-indigo-50 text-indigo-600 border-indigo-100">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                            <FaBuilding className="text-indigo-400 text-[11px]" />
                            {b.name}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <FaMapMarkerAlt className="text-slate-300 text-[9px]" />
                            <span className="text-xs text-indigo-500 font-semibold">
                              Stall {b.stall_numbers || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {b.interest_registered && (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">
                          Registered
                        </span>
                      )}
                    </div>

                    {/* Contact info row */}
                    <div className="grid grid-cols-2 gap-3 px-3 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 truncate">
                        <FaUserTie className="text-indigo-400 shrink-0 text-[10px]" />
                        <span className="truncate">{b.contact_person || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 truncate">
                        <FaPhoneAlt className="text-indigo-400 shrink-0 text-[10px]" />
                        <span className="truncate">{b.mobile_number || "—"}</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex gap-2 pt-1">
                      {b.interest_registered ? (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-bold">
                          <FaCheckCircle size={12} /> Interest Registered
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmBuilder(b)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                        >
                          <FaBuilding size={12} /> Register Interest
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── Confirm Interest Modal ── */}
      {confirmBuilder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl">
            <button
              onClick={() => setConfirmBuilder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={22} />
            </button>
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                Register Interest
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Register your interest for{" "}
                <span className="font-bold text-slate-800">
                  {confirmBuilder.name}
                </span>
                ?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmBuilder(null)}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRegisterInterest(confirmBuilder)}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm active:scale-95 text-sm"
              >
                Yes, Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventBookedBuilders;