// src/components/builder/StallBooking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Ticket,
  CheckCircle2,
  AlertCircle,
  Tag,
  Info,
  Store,
  Loader2,
  PackageX,
} from 'lucide-react';
import API_BASE_URL from '../../config.js';

const StallBooking = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [stallTypes, setStallTypes] = useState([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStallTypes();
  }, [eventId]);

  const fetchStallTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/stalls/event/${eventId}/types-availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load stall types');
      }

      const { eventName, stallTypes } = await res.json();
      setEventName(eventName);
      setStallTypes(stallTypes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (stallTypeId, typeName, price) => {
    if (!window.confirm(`Book a ${typeName} stall for ₹${price.toLocaleString('en-IN')}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/stalls/book-by-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stallTypeId, eventId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      alert('Stall booked successfully!');
      fetchStallTypes();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500 mb-4" />
        <p className="text-sm font-semibold">Loading stall configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Top Nav */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-semibold text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>
        <button
          onClick={() => navigate(`/builder-dashboard/event-bookings/${eventId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-bold text-sm shadow-sm"
        >
          <Store className="w-4 h-4" /> My Bookings
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{eventName || 'Stall Booking'}</h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Select a stall category to book your spot</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold border border-indigo-100">
            <Ticket className="w-4 h-4" />
            {stallTypes.length} {stallTypes.length === 1 ? 'Category' : 'Categories'} Available
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Info Alert */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-sm text-indigo-800 leading-relaxed font-medium">
              Stall booking is subject to approval. Once you book a category, our team will contact you for precise booth placement.
            </p>
          </div>

          {/* Empty State */}
          {stallTypes.length === 0 ? (
            <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1 border border-slate-100">
                <PackageX className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-800">No stall categories yet</p>
              <p className="text-sm text-slate-400 max-w-xs text-center">
                No stall configurations are live for this event yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stallTypes.map((type) => {
                const isAvailable = type.available_count > 0;
                const fillPercent = Math.round((type.available_count / type.total_stalls) * 100);

                return (
                  <div
                    key={type.stall_type_id}
                    className={`relative bg-white rounded-2xl border transition-all duration-300 flex flex-col p-6 ${
                      isAvailable
                        ? 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                        : 'border-slate-100 bg-slate-50 opacity-70'
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex justify-between items-start mb-5">
                      <div className={`p-2.5 rounded-xl ${isAvailable ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400'}`}>
                        <Tag className="w-4 h-4" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isAvailable ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'
                      }`}>
                        {isAvailable ? 'Available' : 'Sold Out'}
                      </span>
                    </div>

                    {/* Name & Price */}
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{type.stall_type_name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${isAvailable ? 'text-indigo-600' : 'text-slate-400'}`}>
                          ₹{Number(type.stall_price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-400 text-xs font-semibold">/ stall</span>
                      </div>
                    </div>

                    {/* Inventory Bar */}
                    <div className="mt-auto space-y-2 mb-5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Inventory</span>
                        <span className={isAvailable ? 'text-indigo-500' : 'text-red-400'}>
                          {type.available_count} left
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isAvailable ? 'bg-indigo-500' : 'bg-slate-300'}`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Total units: {type.total_stalls}</p>
                    </div>

                    {/* CTA */}
                    {isAvailable ? (
                      <button
                        onClick={() => handleBook(type.stall_type_id, type.stall_type_name, type.stall_price)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-indigo-100"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Book
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StallBooking;