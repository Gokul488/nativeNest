// src/components/ManageStallTypes.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaRupeeSign, FaCalendarAlt } from 'react-icons/fa';
import {
  Search, Loader2, AlertCircle, Plus,
  Layers, ListOrdered, Pencil, Trash2,
} from 'lucide-react';
import API_BASE_URL from '../../config.js';
import DeleteDialog from '../DeleteDialog';

const ManageStallTypes = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [stallTypes, setStallTypes] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventTotal, setEventTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stallTypeToDelete, setStallTypeToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate('/login'); return; }
      const [stallRes, eventRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/stalls/types/event/${eventId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/admin/events`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const currentEvent = eventRes.data.find(e => e.id === Number(eventId));
      if (currentEvent) setEventName(currentEvent.event_name);
      const types = stallRes.data.stallTypes || [];
      setStallTypes(types);
      setEventTotal(stallRes.data.eventTotalStalls || 0);
    } catch (err) {
      setError("Failed to load stall types.");
    } finally {
      setLoading(false);
    }
  }, [eventId, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredStallTypes = useMemo(() => {
    return stallTypes.filter(t =>
      t.stall_type_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stallTypes, searchQuery]);

  const handleDelete = (id) => { setStallTypeToDelete(id); setShowDeleteDialog(true); };

  const confirmDelete = async () => {
    if (!stallTypeToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/stalls/types/${stallTypeToDelete}/event/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      setShowDeleteDialog(false);
      setStallTypeToDelete(null);
    } catch (err) {
      setError("Failed to delete stall type.");
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left: search + add */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search stall types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Link
            to={`/admin-dashboard/manage-stall-types/${eventId}/add`}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm active:scale-95 text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Stall Type
          </Link>
        </div>

        {/* Right: total count */}
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-indigo-500 font-semibold mt-0.5 flex items-center gap-1">
              <FaCalendarAlt size={10} /> {eventName || "Loading Event…"}
            </p>
          </div>
          <span className="italic ml-1 bg-indigo-50 text-indigo-600 text-md font-bold px-3 py-1 rounded-full border border-indigo-100">
            {stallTypes.length} Types
          </span>
        </div>
      </div>

      {/* ── Info Bar ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8 py-4 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Event Capacity</p>
            <p className="text-lg font-extrabold text-slate-800">{eventTotal} Stalls</p>
          </div>
        </div>
        <Link
          to={`/admin-dashboard/event-bookings/${eventId}`}
          className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
        >
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
            <ListOrdered className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Stall Management</p>
            <p className="text-sm font-extrabold text-indigo-600">Booked Stall List →</p>
          </div>
        </Link>
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
            <span className="text-sm font-semibold">Loading configuration…</span>
          </div>
        )}

        {error && (
          <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {!loading && filteredStallTypes.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No stall types found</p>
            <p className="text-sm text-slate-400">No stall types configured for this event.</p>
          </div>
        )}

        {!loading && filteredStallTypes.length > 0 && (
          <div className="flex flex-col">
            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="w-16 px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Stall Configuration</th>
                    <th className="w-32 px-6 py-4 text-center">Quantity</th>
                    <th className="w-40 px-6 py-4 text-center">Price</th>
                    <th className="w-32 px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStallTypes.map((type, index) => (
                    <tr key={type.stall_type_id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                      <td className="px-6 py-2.5 text-sm font-bold text-slate-300">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="font-bold text-slate-800 text-sm">{type.stall_type_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {type.no_of_stalls} Units
                        </span>
                      </td>
                      <td className="px-6 py-2.5 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          <FaRupeeSign className="mr-0.5 opacity-70" size={9} />
                          {Number(type.stall_price).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-2.5 text-center">
                        <div className="flex justify-center gap-2">
                          <Link
                            to={`/admin-dashboard/manage-stall-types/${eventId}/edit/${type.stall_type_id}`}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(type.stall_type_id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden p-4 space-y-3">
              {filteredStallTypes.map((type, index) => (
                <div key={type.stall_type_id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {index + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-sm truncate max-w-[180px]">{type.stall_type_name}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Quantity</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                        {type.no_of_stalls} Units
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Price</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 border border-green-100 text-green-700">
                        ₹{Number(type.stall_price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <Link
                      to={`/admin-dashboard/manage-stall-types/${eventId}/edit/${type.stall_type_id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-100 transition"
                    >
                      <Pencil size={13} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(type.stall_type_id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Delete Stall Type?"
        message="Are you sure you want to delete this stall type? This will also remove all associated unbooked stalls. This action cannot be undone."
      />
    </div>
  );
};

export default ManageStallTypes;