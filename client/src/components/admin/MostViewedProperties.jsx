import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaUsers, FaMapMarkerAlt, FaChartLine, FaSpinner } from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const MostViewedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/api/properties/most-viewed`, { headers });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to fetch");
        }

        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("Unauthorized")) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, navigate]);

  const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-gray-500">
        <FaSpinner className="animate-spin text-teal-600 text-4xl" />
        <p className="font-medium">Analyzing property traffic...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl text-3xl">
            <FaChartLine />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Property Analytics</h2>
            <p className="text-gray-500 font-medium">Tracking the most engaging listings across NativeNest</p>
          </div>
        </div>
        <div className="bg-teal-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-teal-200">
          <span className="text-sm font-bold uppercase tracking-wider opacity-80">Total Tracked</span>
          <div className="text-2xl font-bold">{properties.length} Listings</div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
          <FaEye className="opacity-50" /> {error}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-100">
          <FaEye className="mx-auto text-6xl text-gray-200 mb-4" />
          <p className="text-gray-500 text-lg">No property views recorded yet.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                {prop.cover_image ? (
                  <img
                    src={prop.cover_image}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <FaEye size={40} />
                  </div>
                )}
                {/* Views Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-lg shadow-sm font-bold text-xs uppercase tracking-wider">
                  <span className="text-teal-600">#{index + 1}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center gap-1"><FaEye className="text-teal-500" /> {prop.views}</span>
                </div>
              </div>

              {/* Info Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-teal-600 transition-colors">
                  {prop.title}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                  <FaMapMarkerAlt className="text-teal-500 text-xs" /> {prop.city}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xl font-black text-gray-900">{formatPrice(prop.price)}</span>
                  <button
                    onClick={() => navigate(`/admin-dashboard/property/${prop.id}/viewers`)}
                    className="p-3 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                    title="View Audience"
                  >
                    <FaUsers size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MostViewedProperties;