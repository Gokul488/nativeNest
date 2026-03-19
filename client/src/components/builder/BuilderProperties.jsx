// src/components/builder/BuilderProperties.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Loader2, 
  AlertCircle, 
  Ruler, 
  MapPin, 
  Info,
  Pencil,
  Trash2,
  Building,
  Layers,
  ShoppingBag
} from "lucide-react";
import API_BASE_URL from "../../config.js";
import DeleteDialog from "../DeleteDialog";
import Pagination from "../common/Pagination.jsx";

const BuilderProperties = () => {
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConfigs, setSelectedConfigs] = useState({}); // per-property selected sqft for apartments
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Helper functions for Apartment display
  const getDisplayPrice = (prop) => {
    if (prop.property_type !== "Apartment" || !prop.variants || prop.variants.length === 0) {
      return prop.price ? parseFloat(prop.price) : 0;
    }
    const selSqft = selectedConfigs[prop.property_id] !== undefined
      ? selectedConfigs[prop.property_id]
      : (prop.variants[0] ? prop.variants[0].sqft : 0);
    const variant = prop.variants.find(v => v.sqft === selSqft) || prop.variants[0];
    return variant && variant.price ? variant.price : 0;
  };

  const getSqftSelectValue = (prop) => {
    if (prop.property_type !== "Apartment" || !prop.variants || prop.variants.length === 0) return null;
    return selectedConfigs[prop.property_id] !== undefined
      ? selectedConfigs[prop.property_id]
      : (prop.variants[0] ? prop.variants[0].sqft : null);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.property_type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [properties, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProperties, currentPage]);

  const handleDelete = (id) => {
    setPropertyToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/builder/my-properties/${propertyToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete property");
      setProperties(properties.filter((prop) => prop.property_id !== propertyToDelete));
      setShowDeleteDialog(false);
      setPropertyToDelete(null);
    } catch (err) {
      setError(err.message);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
      
      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Building className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              My Properties
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Manage and track your property listings
            </p>
          </div>
          <span className="ml-1 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            {properties.length} Total
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search your listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Link
            to="/builder-dashboard/post-property"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm active:scale-95 text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Post Property
          </Link>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col justify-center items-center gap-3 text-slate-400 py-24">
            <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
            <span className="text-sm font-semibold">Loading your properties…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredProperties.length === 0 && (
          <div className="flex-1 py-32 flex flex-col items-center gap-3 text-slate-400">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
              <Search className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">No properties found</p>
            <p className="text-sm text-slate-400 max-w-xs text-center">
              {searchQuery
                ? `No results matching "${searchQuery}"`
                : "You haven't posted any properties yet. Create one to get started!"}
            </p>
          </div>
        )}

        {/* Table + Cards */}
        {!loading && !error && filteredProperties.length > 0 && (
          <div className="flex flex-col h-full">
            {/* Desktop Table */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-fixed border-separate border-spacing-0">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="w-16 px-6 py-4 text-left">#</th>
                    <th className="w-1/3 px-6 py-4 text-left">Property Details</th>
                    <th className="w-1/4 px-6 py-4 text-center">Sqft / Configuration</th>
                    <th className="w-40 px-6 py-4 text-center">Price</th>
                    <th className="w-40 px-6 py-4 text-center">Location</th>
                    <th className="w-32 px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedProperties.map((property, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={property.property_id} className="transition-colors duration-150 group hover:bg-slate-50/60">
                        <td className="px-6 py-4 text-sm font-bold text-slate-300">
                          {String(globalIndex).padStart(2, "0")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                              <Building className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm leading-tight line-clamp-1" title={property.title}>
                                {property.title}
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                                {property.property_type || "Property"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SQFT COLUMN */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center">
                            {property.property_type === "Apartment" && property.variants && property.variants.length > 0 ? (
                              <div className="relative group/select inline-flex items-center w-full max-w-[160px]">
                                <select
                                  value={getSqftSelectValue(property)}
                                  onChange={(e) => {
                                    setSelectedConfigs(prev => ({
                                      ...prev,
                                      [property.property_id]: parseInt(e.target.value, 10)
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-50 cursor-pointer appearance-none transition-all text-center pr-8"
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234f46e5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.5rem center',
                                    backgroundSize: '0.8em',
                                  }}
                                >
                                  {property.variants.map((variant, vIdx) => (
                                    <option key={vIdx} value={variant.sqft}>
                                      {variant.sqft} ({variant.apartment_type})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                                <Ruler className="text-indigo-500 w-3.5 h-3.5" />
                                <span>{property.sqft ? property.sqft.toLocaleString('en-IN') : 'N/A'}</span>
                                <span className="text-[10px] text-slate-400 uppercase shrink-0">sq.ft</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* PRICE COLUMN */}
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50/50 border border-green-100 rounded-lg text-xs font-bold text-green-700">
                            <span className="text-[10px] opacity-70">₹</span>
                            <span className="tracking-tight">{Math.floor(getDisplayPrice(property)).toLocaleString('en-IN')}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600">
                            <MapPin className="text-indigo-400 w-3.5 h-3.5" />
                            {property.city || "N/A"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => navigate(`/builder-dashboard/edit-property/${property.property_id}`)}
                              className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(property.property_id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="xl:hidden p-4 space-y-3">
              {paginatedProperties.map((property, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div key={property.property_id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                          {globalIndex}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{property.title}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="text-slate-300 w-3 h-3" />
                            <span className="text-xs text-indigo-500 font-semibold">{property.city || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {/* Area Dropdown/Info */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Area</span>
                        {property.property_type === "Apartment" && property.variants && property.variants.length > 0 ? (
                          <div className="relative inline-flex items-center w-full max-w-[140px]">
                            <select
                              value={getSqftSelectValue(property)}
                              onChange={(e) => setSelectedConfigs(prev => ({
                                ...prev,
                                [property.property_id]: parseInt(e.target.value, 10)
                              }))}
                              className="w-full pl-3 pr-7 py-1.5 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200 outline-none appearance-none"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234f46e5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.4rem center',
                                backgroundSize: '0.8em',
                              }}
                            >
                              {property.variants.map((v, i) => (
                                <option key={i} value={v.sqft}>{v.sqft.toLocaleString('en-IN')} ({v.apartment_type})</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700">
                            <Ruler className="text-indigo-500 w-3 h-3" />
                            <span>{property.sqft ? property.sqft.toLocaleString('en-IN') : 'N/A'} <span className="text-[9px] text-slate-400 uppercase ml-0.5">sq.ft</span></span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Price</span>
                        <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          ₹{Math.floor(getDisplayPrice(property)).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => navigate(`/builder-dashboard/edit-property/${property.property_id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(property.property_id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
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

      <DeleteDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Delete Property?"
        message="Are you sure you want to delete this property? This action cannot be undone."
      />
    </div>
  );
};

export default BuilderProperties;