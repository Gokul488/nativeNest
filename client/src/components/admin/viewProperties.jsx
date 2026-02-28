// src/components/ViewProperties.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCity, FaRupeeSign, FaInfoCircle, FaMapMarkerAlt, FaUserTie } from 'react-icons/fa';
import API_BASE_URL from '../../config.js';

const ViewProperties = () => {
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const response = await fetch(`${API_BASE_URL}/api/viewproperties`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) navigate('/login');
          throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        setProperties(data.properties || data || []);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [navigate]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.builder_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [properties, searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/viewproperties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete');
      setProperties(properties.filter((prop) => prop.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Manage Properties</h2>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {properties.length} Total
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties or builders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
          </div>
          <Link
            to="/admin-dashboard/manage-properties/add"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95 text-sm"
          >
            <FaPlus /> Add Property
          </Link>
        </div>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
            Loading properties...
          </div>
        )}

        {error && <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">{error}</div>}

        {!loading && filteredProperties.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No properties found.</p>
          </div>
        )}

        {!loading && filteredProperties.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                    <th className="w-1/3 px-6 py-4 text-left border-b border-gray-200">Property Details</th>
                    <th className="w-40 px-4 py-4 text-center border-b border-gray-200">Builder</th>
                    <th className="w-32 px-4 py-4 text-center border-b border-gray-200">Price</th>
                    <th className="w-36 px-6 py-4 text-center border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredProperties.map((property, index) => (
                    <tr key={property.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="font-bold text-gray-900 mb-1">{property.title}</div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-teal-600 font-medium whitespace-nowrap">
                            <FaMapMarkerAlt /> {property.city}
                          </span>
                          <span className="text-gray-400 truncate max-w-[150px]">
                            {property.address || 'No address'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center border-b border-gray-100">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-bold">
                          <FaUserTie className="text-teal-600 shrink-0" /> <span className="truncate max-w-[100px]">{property.builder_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center border-b border-gray-100">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ₹{Math.floor(property.price).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right border-b border-gray-100">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin-dashboard/manage-properties/edit/${property.id}`)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
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

            {/* Mobile Card View */}
            <div className="md:hidden p-4 space-y-4">
              {filteredProperties.map((property, index) => (
                <div key={property.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-teal-100 text-teal-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="font-bold text-gray-900 truncate max-w-[180px]">{property.title}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400 text-xs" />
                      <span className="text-gray-700 font-medium">{property.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUserTie className="text-gray-400 text-xs" />
                      <span className="truncate">{property.builder_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-bold">₹{Math.floor(property.price).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/admin-dashboard/manage-properties/edit/${property.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold"
                    >
                      <FaTrash size={14} /> Delete
                    </button>
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

export default ViewProperties;