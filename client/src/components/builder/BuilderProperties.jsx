import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaTrash, FaEdit, FaMapMarkerAlt, FaTag, FaHome, FaSearch } from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const BuilderProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuilderProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/builder/my-properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) navigate("/login");
          throw new Error("Failed to fetch your properties");
        }

        const data = await response.json();
        setProperties(data.properties || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBuilderProperties();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/builder/my-properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) navigate("/login");
        throw new Error("Failed to delete property");
      }

      setProperties(properties.filter((prop) => prop.property_id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete property");
    }
  };

  const filteredProperties = properties.filter(prop => 
    prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading your listings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">My Properties</h2>
          <p className="text-slate-500 font-medium mt-1">Manage and monitor your active real estate listings.</p>
        </div>
        <Link
          to="/builder-dashboard/post-property"
          className="inline-flex items-center justify-center gap-3 bg-teal-600 text-white px-8 py-4 rounded-2xl hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/20 transition-all duration-300 font-bold active:scale-95"
        >
          <FaPlus /> Post New Property
        </Link>
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="relative group max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Search by title or city..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
          {error}
        </div>
      )}

      {/* --- PROPERTY LIST --- */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-4xl p-16 text-center border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHome className="text-slate-300 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No properties found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or add a new listing to get started.</p>
          </div>
        ) : (
          filteredProperties.map((property, index) => (
            <div 
              key={property.property_id} 
              className="group bg-white p-5 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 flex flex-col md:flex-row items-center gap-6"
            >
              {/* Index & Icon */}
              <div className="hidden md:flex w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center text-slate-400 font-black group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <Link
                  to={`/builder-dashboard/edit-property/${property.property_id}`}
                  className="text-xl font-black text-slate-800 hover:text-teal-600 transition-colors block truncate"
                >
                  {property.title}
                </Link>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <FaMapMarkerAlt className="text-teal-500" /> {property.city}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <FaTag className="text-indigo-500" /> {property.property_type}
                  </span>
                </div>
              </div>

              {/* Price Tag */}
              <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listing Price</span>
                <span className="text-lg font-black text-slate-900">
                  ₹{Math.floor(property.price).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/builder-dashboard/edit-property/${property.property_id}`}
                  className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-teal-600 hover:text-white transition-all duration-300"
                  title="Edit Property"
                >
                  <FaEdit />
                </Link>
                <button
                  onClick={() => handleDelete(property.property_id)}
                  className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300"
                  title="Delete Property"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuilderProperties;