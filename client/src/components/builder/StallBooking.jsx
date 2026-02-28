// src/components/StallBooking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaTicketAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaTag,
  FaInfoCircle,
  FaLayerGroup
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
      fetchStallTypes();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
        <p className="font-medium">Loading stall configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Navigation */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm"
        >
          <FaArrowLeft size={12} /> Back to Events
        </button>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
        <div className="bg-gray-50 p-4 sm:p-6 border-b border-gray-200 flex flex-col items-center sm:flex-row justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-3 bg-teal-600 text-white rounded-lg shadow-teal-200 shadow-lg shrink-0">
              <FaLayerGroup size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Select Stall Type</h2>
              <p className="text-gray-500 text-xs sm:text-sm truncate">Event ID: #{eventId} • Choose your desired configuration</p>
            </div>
          </div>
          <div className="bg-teal-100 text-teal-700 px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-sm font-bold flex items-center gap-2">
            <FaTicketAlt size={14} />
            {stallTypes.length} Categories Available
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 flex items-center gap-3">
              <FaExclamationCircle className="shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mb-8">
            <FaInfoCircle className="text-blue-600 mt-1 shrink-0" />
            <p className="text-sm text-blue-800 leading-relaxed">
              Note: Stall booking is subject to approval. Once you book a category, our team will contact you for precise booth placement.
            </p>
          </div>

          {/* Stall Grid */}
          {stallTypes.length === 0 ? (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
              <FaExclamationCircle className="text-4xl opacity-50" />
              <p className="text-lg">No stall configurations live for this event yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stallTypes.map((type) => (
                <div
                  key={type.stall_type_id}
                  className={`relative bg-white p-6 rounded-2xl border transition-all duration-300 flex flex-col ${type.available_count > 0
                      ? 'border-gray-200 hover:border-teal-500 hover:shadow-xl'
                      : 'opacity-70 bg-gray-50'
                    }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${type.available_count > 0 ? 'bg-teal-50 text-teal-600' : 'bg-gray-200 text-gray-500'}`}>
                      <FaTag size={16} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${type.available_count > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                      {type.available_count > 0 ? 'Available' : 'Sold Out'}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{type.stall_type_name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-teal-600">₹{Number(type.stall_price).toLocaleString('en-IN')}</span>
                      <span className="text-gray-400 text-xs font-medium">/ Stall</span>
                    </div>
                  </div>

                  {/* Inventory Info */}
                  <div className="mt-auto space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wide">
                      <span>Inventory</span>
                      <span className={type.available_count > 0 ? "text-teal-600" : "text-red-500"}>
                        {type.available_count} Left
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${type.available_count > 0 ? 'bg-teal-500' : 'bg-gray-300'}`}
                        style={{ width: `${(type.available_count / type.total_stalls) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-gray-400">Total units: {type.total_stalls}</p>
                  </div>

                  {type.available_count > 0 ? (
                    <button
                      onClick={() => handleBook(type.stall_type_id, type.stall_type_name, type.stall_price)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-teal-100 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle /> Book Now
                    </button>
                  ) : (
                    <button disabled className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl font-bold text-sm cursor-not-allowed">
                      Sold Out
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StallBooking;