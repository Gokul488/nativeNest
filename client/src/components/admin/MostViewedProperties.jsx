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
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
          <div className="p-3 md:p-4 bg-teal-50 text-teal-600 rounded-2xl text-2xl md:text-3xl">
            <FaChartLine />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight leading-tight">Property Analytics</h2>
            <p className="text-gray-500 font-medium text-sm">Tracking the most engaging listings</p>
          </div>
        </div>
        <div className="bg-teal-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-teal-200 w-full md:w-auto text-center md:text-left">
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider opacity-80">Total Tracked</span>
          <div className="text-xl md:text-2xl font-bold">{properties.length} Listings</div>
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer"
              style={{
                boxShadow: '0 4px 24px 0 rgba(1,25,54,0.08), 0 1px 4px 0 rgba(1,25,54,0.04)',
                transition: 'box-shadow 0.4s ease, transform 0.4s ease',
              }}
            >
              {/* Image Container */}
              <div className="relative h-52 sm:h-56 overflow-hidden">
                {prop.cover_image ? (
                  <img
                    src={prop.cover_image}
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)' }}
                  />
                ) : (
                  <div className="h-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <i className="fas fa-image text-4xl" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(1,25,54,0.55) 0%, rgba(1,25,54,0.1) 45%, transparent 100%)' }} />

                {/* Rank & Views Badge Top Left */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-white flex items-center gap-2"
                    style={{ background: 'rgba(46,97,113,0.85)', backdropFilter: 'blur(8px)', letterSpacing: '0.1em' }}>
                    <span className="text-teal-200">#{index + 1}</span>
                    <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                    <span className="flex items-center gap-1"><FaEye className="text-teal-300" /> {prop.views}</span>
                  </span>
                </div>

                {/* Property Type Pill Top Right */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/20"
                    style={{ background: 'rgba(1,25,54,0.4)', backdropFilter: 'blur(4px)' }}>
                    {prop.property_type}
                  </span>
                </div>

                {/* Sqft Badge Bottom Left */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <i className="fas fa-vector-square text-white/80 text-[11px]"></i>
                  <span className="text-white font-bold text-[13px] leading-none">
                    {prop.property_type === 'Apartment' && prop.variants?.length > 0
                      ? `${prop.variants[0].sqft.toLocaleString('en-IN')}–${prop.variants[prop.variants.length - 1].sqft.toLocaleString('en-IN')}`
                      : (prop.sqft ? prop.sqft.toLocaleString('en-IN') : 'N/A')}
                  </span>
                  <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wide">sq.ft</span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-5 flex flex-col flex-1">
                {/* Location */}
                <p className="text-[11px] font-semibold text-[#2e6171] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <i className="fas fa-location-dot text-[10px]"></i>
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

                  {/* View Audience button */}
                  <button
                    onClick={() => navigate(`/admin-dashboard/property/${prop.id}/viewers`)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-teal-100 bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white"
                    title="View Audience"
                  >
                    <FaUsers size={16} />
                  </button>
                </div>

                {/* Builder name at bottom */}
                {prop.builderName && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-gray-500">
                    <i className="fas fa-building text-[#2e6171] text-[10px]"></i>
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

export default MostViewedProperties;