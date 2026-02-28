import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBookmark, FaMapMarkerAlt, FaSpinner, FaBuilding, FaArrowRight } from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const BookmarkedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookmarked = async () => {
      if (!token) {
        setError("Please log in to view bookmarks");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/bookmarks/properties`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch bookmarks");

        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarked();
  }, [token, navigate]);

  const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-gray-500">
        <FaSpinner className="animate-spin text-teal-600 text-4xl" />
        <p className="font-medium">Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-4 sm:p-8">
      {/* HEADER SECTION - Styled like MostViewedProperties */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl text-3xl">
            <FaBookmark />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Saved Listings</h2>
            <p className="text-gray-500 font-medium">Your curated collection of properties on NativeNest</p>
          </div>
        </div>
        <div className="bg-teal-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-teal-200">
          <span className="text-sm font-bold uppercase tracking-wider opacity-80">Total Saved</span>
          <div className="text-2xl font-bold">{properties.length} Properties</div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
          <FaBookmark className="opacity-50" /> {error}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-100">
          <FaBookmark className="mx-auto text-6xl text-gray-200 mb-4" />
          <p className="text-gray-500 text-lg">You haven't bookmarked any properties yet.</p>
          <button 
            onClick={() => navigate('/properties')}
            className="mt-4 text-teal-600 font-bold hover:underline"
          >
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/property/${prop.id}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden">
                {prop.img ? (
                  <img
                    src={prop.img}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <FaBookmark size={40} />
                  </div>
                )}
                {/* Save Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm text-teal-600 px-3 py-1.5 rounded-lg shadow-sm font-bold text-xs">
                  <FaBookmark /> SAVED
                </div>
              </div>

              {/* Info Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-teal-600 transition-colors">
                  {prop.title}
                </h3>
                
                <div className="flex flex-col gap-1 mb-4">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-teal-500 text-xs" /> {prop.city}
                  </p>
                  {prop.builderName && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FaBuilding className="text-gray-300" /> {prop.builderName}
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xl font-black text-gray-900">{formatPrice(prop.price)}</span>
                  <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                    <FaArrowRight size={18} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkedProperties;