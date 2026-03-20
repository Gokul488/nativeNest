// src/components/PropertyViewers.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhoneAlt, FaGlobe } from "react-icons/fa";
import { Home, Loader2, Users, Mail, Phone, Globe } from "lucide-react";
import API_BASE_URL from '../../config.js';
import { format } from "date-fns";

const PropertyViewers = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [viewers, setViewers] = useState([]);
  const [propertyTitle, setPropertyTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTitle, setLoadingTitle] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchViewers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/viewers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch viewers");
        const data = await res.json();
        setViewers(data.viewers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchViewers();
  }, [propertyId, token]);

  useEffect(() => {
    const fetchPropertyTitle = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPropertyTitle(data.property?.title || "Unknown Property");
      } catch (err) {
        setPropertyTitle("Unknown Property");
      } finally {
        setLoadingTitle(false);
      }
    };
    fetchPropertyTitle();
  }, [propertyId, token]);

  if (loading || loadingTitle) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
        <p className="text-sm font-semibold">Loading engagement data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Header Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          {/* Left: icon + title */}
          <div className="flex items-center gap-3">

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                {propertyTitle}
              </h2>

            </div>
          </div>

          {/* Right: total views badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-black text-slate-800">{viewers.length}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Views</span>
          </div>
        </div>
      </div>

      {/* ── Table Section ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {error ? (
          <div className="py-24 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">{error}</p>
          </div>
        ) : viewers.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No viewers yet</p>
            <p className="text-sm text-slate-400">No one has viewed this property yet.</p>
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Visitor Profile</th>
                    <th className="px-6 py-4 text-center">Contact Details</th>
                    <th className="px-6 py-4 text-center">Technical Info</th>
                    <th className="px-6 py-4 text-right">Activity Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {viewers.map((viewer, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors duration-150 group">

                      {/* Visitor Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                            viewer.buyer_id
                              ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}>
                            {viewer.buyer_id ? <FaUser size={13} /> : "?"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                              {viewer.buyer_name || "Guest Visitor"}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${
                              viewer.buyer_id ? "text-indigo-500" : "text-slate-400"
                            }`}>
                              {viewer.buyer_id ? "Registered Lead" : "Public Traffic"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1.5">
                          {viewer.buyer_email ? (
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              <Mail className="w-3 h-3 text-indigo-400" />
                              {viewer.buyer_email}
                            </div>
                          ) : null}
                          {viewer.mobile_number ? (
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                              <Phone className="w-3 h-3 text-indigo-400" />
                              {viewer.mobile_number}
                            </div>
                          ) : (
                            !viewer.buyer_email && <span className="text-slate-300 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Technical Info */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-mono text-slate-500">
                          <Globe className="w-3 h-3 text-slate-300" />
                          {viewer.ip_address}
                        </div>
                      </td>

                      {/* Activity Date */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                          <span className="font-bold text-indigo-700 text-xs">
                            {format(new Date(viewer.viewed_at), "dd MMM yyyy")}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                          {format(new Date(viewer.viewed_at), "hh:mm a")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden p-4 space-y-3">
              {viewers.map((viewer, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 hover:border-indigo-200 transition-colors">

                  {/* Card Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border ${
                      viewer.buyer_id
                        ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}>
                      {viewer.buyer_id ? <FaUser size={13} /> : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {viewer.buyer_name || "Guest Visitor"}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${
                        viewer.buyer_id ? "text-indigo-500" : "text-slate-400"
                      }`}>
                        {viewer.buyer_id ? "Registered Lead" : "Public Traffic"}
                      </span>
                    </div>
                    <div className="shrink-0">
                      <span className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-600">
                        {format(new Date(viewer.viewed_at), "dd MMM")}
                      </span>
                    </div>
                  </div>

                  {/* Contact + IP */}
                  <div className="space-y-2">
                    {viewer.buyer_email && (
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                        <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-xs text-slate-600 font-medium truncate">{viewer.buyer_email}</span>
                      </div>
                    )}
                    {viewer.mobile_number && (
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                        <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-xs text-slate-600 font-medium">{viewer.mobile_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                      <Globe className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span className="text-xs text-slate-500 font-mono">{viewer.ip_address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyViewers;