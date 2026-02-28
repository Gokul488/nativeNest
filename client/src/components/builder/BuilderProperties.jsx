// src/components/BuilderProperties.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';
import API_BASE_URL from '../../config.js';

const BuilderProperties = () => {
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuilderProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const response = await fetch(`${API_BASE_URL}/api/builder/my-properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) navigate("/login");
          throw new Error("Failed to fetch your properties");
        }

        const data = await response.json();
        setProperties(data.properties || data || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchBuilderProperties();
  }, [navigate]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [properties, searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/builder/my-properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete property");
      setProperties(properties.filter((prop) => prop.property_id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header - ViewEvents Style */}
      <div className="p-6 border-b border-gray-200 flex flex-col xl:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">My Properties</h2>
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {properties.length} Total
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
            />
          </div>
          <Link
            to="/builder-dashboard/post-property"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95 text-sm"
          >
            <FaPlus /> Post Property
          </Link>
        </div>
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="flex flex-col items-center justify-center p-20 text-gray-500">
            <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
            <p className="font-medium">Loading your properties...</p>
          </div>
        )}
        {error && <div className="m-4 sm:m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm flex items-center gap-2"><FaInfoCircle /> {error}</div>}

        {!loading && filteredProperties.length === 0 && (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">You haven't posted any properties yet.</p>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && filteredProperties.length > 0 && (
          <>
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="w-14 px-6 py-4 text-left border-b border-gray-200">#</th>
                    <th className="w-1/2 px-6 py-4 text-left border-b border-gray-200">Property Details</th>
                    <th className="w-32 px-4 py-4 text-center border-b border-gray-200">Price</th>
                    <th className="w-32 px-4 py-4 text-center border-b border-gray-200">City</th>
                    <th className="w-36 px-6 py-4 text-right border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredProperties.map((property, index) => (
                    <tr key={property.property_id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-5 text-sm text-gray-400 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="font-bold text-gray-900 mb-1">{property.title}</div>
                        <div className="text-xs text-teal-600 font-medium">{property.property_type || 'Residential'}</div>
                      </td>
                      <td className="px-4 py-5 text-center border-b border-gray-100">
                        <span className="font-bold text-gray-800 text-sm">
                          ₹{Math.floor(property.price).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center border-b border-gray-100 text-sm text-gray-600">
                        {property.city}
                      </td>
                      <td className="px-6 py-5 text-right border-b border-gray-100">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/builder-dashboard/edit-property/${property.property_id}`)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(property.property_id)}
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

            {/* Mobile/Tablet Card View */}
            <div className="xl:hidden grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {filteredProperties.map((property, index) => (
                <div key={property.property_id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100 mr-2">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-bold text-gray-900 mt-1">{property.title}</h4>
                      <p className="text-xs text-teal-600 font-medium">{property.property_type || 'Residential'}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/builder-dashboard/edit-property/${property.property_id}`)}
                        className="p-2 text-blue-500 bg-white shadow-sm rounded-lg border border-blue-100"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(property.property_id)}
                        className="p-2 text-red-500 bg-white shadow-sm rounded-lg border border-red-100"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <div className="text-sm font-bold text-gray-800">
                      ₹{Math.floor(property.price).toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200 uppercase font-semibold">
                      {property.city}
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

export default BuilderProperties;