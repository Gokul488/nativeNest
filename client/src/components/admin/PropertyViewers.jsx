// src/components/PropertyViewers.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaEye, FaHome, FaSpinner, FaInfoCircle, FaEnvelope, FaPhoneAlt, FaGlobe } from "react-icons/fa";
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
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-gray-500">
        <FaSpinner className="animate-spin text-teal-600 text-3xl" />
        <p className="font-medium">Loading engagement data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4 md:gap-5">
            <div className="p-3 md:p-4 bg-teal-600 text-white rounded-xl md:rounded-2xl shadow-lg shadow-teal-100 shrink-0">
              <FaHome size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">{propertyTitle}</h2>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                <span className="text-[10px] md:text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase">ID: #{propertyId}</span>
                <span className="hidden md:inline text-gray-400 text-xs">•</span>
                <span className="text-gray-500 text-xs md:text-sm font-medium">Viewing Audience Analytics</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto justify-end md:justify-start">
            <div className="bg-gray-50 border border-gray-100 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-center">
              <div className="text-xl md:text-2xl font-black text-gray-800">{viewers.length}</div>
              <div className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Views</div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {viewers.length === 0 ? (
          <div className="py-24 text-center">
            <FaInfoCircle className="mx-auto text-5xl text-gray-100 mb-4" />
            <p className="text-gray-400 font-medium">No one has viewed this property yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Visitor Profile</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Contact Details</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Technical Info</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Activity Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {viewers.map((viewer, idx) => (
                    <tr key={idx} className="hover:bg-teal-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${viewer.buyer_id ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-400'}`}>
                            {viewer.buyer_id ? <FaUser /> : "?"}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors">
                              {viewer.buyer_name || "Guest Visitor"}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${viewer.buyer_id ? 'text-teal-600' : 'text-gray-400'}`}>
                              {viewer.buyer_id ? "Registered Lead" : "Public Traffic"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1">
                          {viewer.buyer_email ? (
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                              <FaEnvelope className="text-teal-500" /> {viewer.buyer_email}
                            </div>
                          ) : null}
                          {viewer.mobile_number ? (
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                              <FaPhoneAlt className="text-teal-500" /> {viewer.mobile_number}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-xs font-mono text-gray-500 border border-gray-100">
                          <FaGlobe className="text-gray-300" /> {viewer.ip_address}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="font-bold text-gray-800 text-sm">
                          {format(new Date(viewer.viewed_at), "dd MMM yyyy")}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase">
                          {format(new Date(viewer.viewed_at), "hh:mm a")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden p-4 space-y-4">
              {viewers.map((viewer, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${viewer.buyer_id ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-400'}`}>
                      {viewer.buyer_id ? <FaUser /> : "?"}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">
                        {viewer.buyer_name || "Guest Visitor"}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-tighter ${viewer.buyer_id ? 'text-teal-600' : 'text-gray-400'}`}>
                        {viewer.buyer_id ? "Registered Lead" : "Public Traffic"}
                      </span>
                    </div>
                    <div className="ml-auto text-right text-[10px] font-bold text-gray-400 uppercase">
                      {format(new Date(viewer.viewed_at), "dd MMM HH:mm")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {viewer.buyer_email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <FaEnvelope className="text-teal-500 text-[10px]" /> {viewer.buyer_email}
                      </div>
                    )}
                    {viewer.mobile_number && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <FaPhoneAlt className="text-teal-500 text-[10px]" /> {viewer.mobile_number}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                      <FaGlobe className="text-gray-400 text-[10px]" /> {viewer.ip_address}
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