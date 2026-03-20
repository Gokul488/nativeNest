import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaUsers, FaMapMarkerAlt, FaChartLine, FaSpinner } from "react-icons/fa";
import { Search, Loader2, AlertCircle } from "lucide-react";
import API_BASE_URL from '../../config.js';
import Pagination from "../common/Pagination.jsx";

const MostViewedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
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

  const filteredProperties = useMemo(() => {
    return properties.filter(prop =>
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prop.builderName && prop.builderName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [properties, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage]);

  const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
        <p className="font-medium text-sm">Analyzing property traffic…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col min-h-[600px]">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-6 flex flex-col lg:flex-row justify-between items-center gap-4 sticky top-0 z-10">
        {/* Left: search */}
        <div className="relative w-full lg:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search properties or builders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Right: total count */}
        <div className="italic flex items-center gap-3">
          <span className="ml-1 bg-indigo-50 text-indigo-600 text-md font-bold px-3 py-1 rounded-full border border-indigo-100">
            {properties.length} Listings
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl p-20 text-center border border-slate-200 flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No properties found</p>
            <p className="text-sm text-slate-400">
              {searchQuery ? `No results matching "${searchQuery}"` : "No property data available yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProperties.map((prop, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col border border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/60 transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      {prop.cover_image ? (
                        <img
                          src={prop.cover_image}
                          alt={prop.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-300">
                          <i className="fas fa-image text-4xl" />
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "linear-gradient(to top, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.1) 45%, transparent 100%)" }}
                      />

                      {/* Rank & Views Badge — top left */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5"
                          style={{ background: "rgba(79,70,229,0.75)", backdropFilter: "blur(8px)" }}>
                          <span className="text-indigo-200">#{globalIndex}</span>
                          <span className="w-1 h-1 bg-white/30 rounded-full" />
                          <FaEye className="text-indigo-300 text-[10px]" />
                          <span>{prop.views}</span>
                        </span>
                      </div>

                      {/* Property Type Pill — top right */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/20 uppercase tracking-wide"
                          style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}>
                          {prop.property_type}
                        </span>
                      </div>

                      {/* Sqft Badge — bottom left */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)" }}>
                        <span className="text-white font-bold text-[12px] leading-none">
                          {prop.property_type === "Apartment" && prop.variants?.length > 0
                            ? `${prop.variants[0].sqft.toLocaleString("en-IN")}–${prop.variants[prop.variants.length - 1].sqft.toLocaleString("en-IN")}`
                            : (prop.sqft ? prop.sqft.toLocaleString("en-IN") : "N/A")}
                        </span>
                        <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wide">sq.ft</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col flex-1">
                      {/* City */}
                      <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-[9px]" />
                        {prop.city}
                      </p>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-800 mb-3 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors h-[40px] flex items-start">
                        {prop.title}
                      </h3>

                      {/* Divider */}
                      <div className="h-px bg-slate-100 mb-3" />

                      {/* Price & Audience button */}
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Price</p>
                          <p className="text-base font-extrabold text-slate-900 leading-none">
                            {prop.property_type === "Apartment" && prop.variants?.length > 0
                              ? <>₹&nbsp;{Math.floor(prop.variants[0].price).toLocaleString("en-IN")} <span className="text-[11px] font-semibold text-slate-400">onwards</span></>
                              : formatPrice(prop.price)}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/admin-dashboard/property/${prop.id}/viewers`)}
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-indigo-100 bg-indigo-50 text-indigo-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                          title="View Audience"
                        >
                          <FaUsers size={14} />
                        </button>
                      </div>

                      {/* Builder name */}
                      {prop.builderName && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <i className="fas fa-building text-indigo-400 text-[10px]" />
                          <span className="font-medium">{prop.builderName}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredProperties.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              activeColor="indigo"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MostViewedProperties;