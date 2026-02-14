import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaTicketAlt, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaTag, 
  FaInfoCircle 
} from 'react-icons/fa';
import API_BASE_URL from '../../config.js';

const StallBooking = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [stallTypes, setStallTypes] = useState([]);
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

      const { stallTypes } = await res.json();
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
        body: JSON.stringify({ stallTypeId, eventId: eventId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Booking failed');

      alert('Stall booked successfully!');
      fetchStallTypes(); // refresh
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading available categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Select Stall Type</h2>
          <p className="text-slate-500 font-medium mt-1">
            Exhibition ID: <span className="text-slate-900 font-bold">#{eventId}</span> • Choose your space configuration.
          </p>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-4 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FaTicketAlt />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Available Options</p>
            <p className="text-xl font-black text-slate-900 leading-tight">{stallTypes.length} Tiers</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* --- INFO ALERT --- */}
      <div className="bg-teal-50/50 border border-teal-100 p-5 rounded-3xl flex items-start gap-4">
        <FaInfoCircle className="text-teal-600 mt-1" />
        <p className="text-sm text-teal-800 font-medium">
          Note: Stall booking is subject to approval. Once you book a category, our team will contact you for precise booth placement within the exhibition floor plan.
        </p>
      </div>

      {/* --- STALL CATEGORIES GRID --- */}
      {stallTypes.length === 0 ? (
        <div className="bg-white rounded-4xl p-16 text-center border border-slate-200 border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="text-slate-300 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No stalls configured</h3>
          <p className="text-slate-500 mt-2">Stall configurations for this event are not yet live. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stallTypes.map((type) => (
            <div
              key={type.stall_type_id}
              className={`group relative bg-white p-8 rounded-4xl border transition-all duration-500 flex flex-col ${
                type.available_count > 0
                  ? 'border-slate-200 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-900/5'
                  : 'opacity-75 bg-slate-50 border-slate-200'
              }`}
            >
              {/* Type Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${type.available_count > 0 ? 'bg-teal-50 text-teal-600' : 'bg-slate-200 text-slate-500'}`}>
                  <FaTag size={20} />
                </div>
                {type.available_count > 0 ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Available
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Title & Price */}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 group-hover:text-teal-600 transition-colors">
                  {type.stall_type_name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{Number(type.stall_price).toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">/ Stall</span>
                </div>
              </div>

              {/* Availability Progress */}
              <div className="mt-auto space-y-3 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 uppercase tracking-tighter">Inventory</span>
                  <span className={type.available_count > 0 ? "text-teal-600" : "text-red-500"}>
                    {type.available_count} Left
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${type.available_count > 0 ? 'bg-teal-500' : 'bg-slate-300'}`}
                    style={{ width: `${(type.available_count / type.total_stalls) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {type.total_stalls} total units allocated for this event.
                </p>
              </div>

              {/* Action Button */}
              {type.available_count > 0 ? (
                <button
                  onClick={() => handleBook(type.stall_type_id, type.stall_type_name, type.stall_price)}
                  className="flex items-center justify-center w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all hover:bg-teal-600 hover:shadow-xl hover:shadow-teal-600/20 active:scale-95"
                >
                  Book Category <FaCheckCircle className="ml-3" />
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-5 bg-slate-200 text-slate-400 rounded-2xl font-black text-sm tracking-widest uppercase cursor-not-allowed"
                >
                  Registration Closed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StallBooking;