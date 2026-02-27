// src/components/ManageStallTypes.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaInfoCircle, 
  FaCalendarAlt, FaLayerGroup, FaRupeeSign, FaListUl 
} from 'react-icons/fa';
import API_BASE_URL from '../../config.js';

const ManageStallTypes = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [stallTypes, setStallTypes] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventTotal, setEventTotal] = useState(0);
  const [usedStalls, setUsedStalls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      const stallRes = await axios.get(
        `${API_BASE_URL}/api/stalls/types/event/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const eventRes = await axios.get(
        `${API_BASE_URL}/api/admin/events`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const currentEvent = eventRes.data.find(e => e.id === Number(eventId));
      if (currentEvent) {
        setEventName(currentEvent.event_name);
      }

      const types = stallRes.data.stallTypes || [];
      setStallTypes(types);
      setEventTotal(stallRes.data.eventTotalStalls || 0);
      setUsedStalls(types.reduce((sum, t) => sum + Number(t.no_of_stalls), 0));

    } catch (err) {
      console.error("Fetch failed", err);
      setError("Failed to load stall types.");
    } finally {
      setLoading(false);
    }
  }, [eventId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStallTypes = useMemo(() => {
    return stallTypes.filter(t => 
      t.stall_type_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stallTypes, searchQuery]);

  const handleDelete = async (stallTypeId) => {
    if (!window.confirm("Are you sure? This will delete the stall type and all associated unbooked stalls.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/api/stalls/types/${stallTypeId}/event/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      setError("Failed to delete stall type.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Stall Types</h2>
            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
              {stallTypes.length} Types
            </span>
          </div>
          <p className="text-teal-600 font-medium flex items-center gap-2 text-sm">
            <FaCalendarAlt size={14} />
            {eventName || "Loading Event..."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search stall types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
          </div>
          <Link
            to={`/admin-dashboard/manage-stall-types/${eventId}/add`}
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95 text-sm"
          >
            <FaPlus /> Add Stall Type
          </Link>
        </div>
      </div>

      {/* Action Bar (Replaced Configured Stalls with Booked Stall List Button) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-200">
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <FaLayerGroup size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Event Capacity</p>
            <p className="text-xl font-bold text-gray-800">{eventTotal} Stalls</p>
          </div>
        </div>

        {/* Updated: Booked Stall List Button */}
        <Link 
          to={`/admin-dashboard/event-bookings/${eventId}`}
          className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-teal-500 hover:bg-teal-50/30 transition-all group"
        >
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
            <FaListUl size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Stall Management</p>
            <p className="text-lg font-extrabold text-teal-700 flex items-center gap-2">
              Booked Stall List
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </p>
          </div>
        </Link>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            Loading configuration...
          </div>
        )}

        {error && <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">{error}</div>}

        {!loading && filteredStallTypes.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No stall types found for this event.</p>
          </div>
        )}

        {!loading && filteredStallTypes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="w-16 px-6 py-4 text-left border-b border-gray-200">#</th>
                  <th className="w-1/2 px-6 py-4 text-left border-b border-gray-200">Stall Configuration</th>
                  <th className="w-32 px-4 py-4 text-center border-b border-gray-200">Quantity</th>
                  <th className="w-40 px-4 py-4 text-center border-b border-gray-200">Price</th>
                  <th className="w-36 px-6 py-4 text-center border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredStallTypes.map((type, index) => (
                  <tr key={type.stall_type_id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-5 border-b border-gray-100">
                      <div className="font-bold text-gray-900 mb-1">{type.stall_type_name}</div>
                    </td>
                    <td className="px-4 py-5 text-center border-b border-gray-100">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700">
                        {type.no_of_stalls} Units
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center border-b border-gray-100">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaRupeeSign className="mr-1" size={10} />
                        {Number(type.stall_price).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right border-b border-gray-100">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`/admin-dashboard/manage-stall-types/${eventId}/edit/${type.stall_type_id}`}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FaEdit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(type.stall_type_id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
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

export default ManageStallTypes;