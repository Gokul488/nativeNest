import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBookmark, FaMapMarkerAlt, FaSpinner, FaBuilding, FaArrowRight, FaVectorSquare } from "react-icons/fa";
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
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl text-2xl sm:text-3xl shrink-0">
            <FaBookmark />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Saved Listings</h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">Your curated collection of properties on NativeNest</p>
          </div>
        </div>
        <div className="bg-teal-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-teal-200 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Total Saved</span>
          <div className="text-xl sm:text-2xl font-bold">{properties.length} Properties</div>
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {properties.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => navigate(`/property/${prop.id}`)}
              className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer"
              style={{
                boxShadow: '0 4px 24px 0 rgba(1,25,54,0.08), 0 1px 4px 0 rgba(1,25,54,0.04)',
                transition: 'box-shadow 0.4s ease, transform 0.4s ease',
              }}
            >
              {/* Image Container */}
              <div className="relative h-60 sm:h-64 overflow-hidden">
                {prop.img ? (
                  <img
                    src={prop.img}
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)' }}
                  />
                ) : (
                  <div className="h-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <FaBookmark size={40} />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(1,25,54,0.55) 0%, rgba(1,25,54,0.1) 45%, transparent 100%)' }} />

                {/* Top Badges Container - Prevents Overlap */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                  {/* Save Badge */}
                  <span className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-teal-600 flex items-center gap-1.5 shadow-sm shrink-0"
                    style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}>
                    <FaBookmark className="text-[10px]" /> SAVED
                  </span>

                  {/* Property Type Pill */}
                  <span className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white border border-white/20 sm:block hidden truncate"
                    style={{ background: 'rgba(1,25,54,0.4)', backdropFilter: 'blur(4px)' }}>
                    {prop.property_type || 'Property'}
                  </span>
                  {/* Smaller type pill for mobile to ensure no overlap */}
                  <span className="px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white border border-white/20 block sm:hidden truncate max-w-[80px]"
                    style={{ background: 'rgba(1,25,54,0.4)', backdropFilter: 'blur(4px)' }}>
                    {prop.property_type || 'Prop'}
                  </span>
                </div>

                {/* Sqft Badge Bottom Left */}
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <FaVectorSquare className="text-white/80 text-[11px]" />
                  <span className="text-white font-bold text-[13px] leading-none">
                    {prop.property_type === 'Apartment' && prop.variants?.length > 0
                      ? `${prop.variants[0].sqft.toLocaleString('en-IN')}–${prop.variants[prop.variants.length - 1].sqft.toLocaleString('en-IN')}`
                      : (prop.sqft ? prop.sqft.toLocaleString('en-IN') : 'N/A')}
                  </span>
                  <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wide">sq.ft</span>
                </div>
              </div>

              {/* Info Content */}
              <div className="p-5 flex-1 flex flex-col">
                {/* Location */}
                <p className="text-[11px] font-semibold text-[#2e6171] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-[10px]" />
                  {prop.city}
                </p>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-[#011936] mb-3 line-clamp-2 leading-snug group-hover:text-teal-600 transition-colors h-[42px] flex items-start">
                  {prop.title}
                </h3>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-[#2e6171]/20 via-[#2e6171]/10 to-transparent mb-3" />

                {/* Price & Actions Row */}
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Price</p>
                    <p className="text-[17px] font-extrabold text-[#011936] leading-none">
                      {prop.property_type === 'Apartment' && prop.variants?.length > 0
                        ? <>₹&nbsp;{Math.floor(prop.variants[0].price).toLocaleString('en-IN')} <span className="text-[11px] font-semibold text-gray-400">onwards</span></>
                        : formatPrice(prop.price)}
                    </p>
                  </div>

                  <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                    <FaArrowRight size={18} />
                  </div>
                </div>

                {/* Builder name at bottom */}
                {prop.builderName && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-gray-500">
                    <FaBuilding className="text-[#2e6171] text-[10px]" />
                    <span className="font-medium">{prop.builderName}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkedProperties;