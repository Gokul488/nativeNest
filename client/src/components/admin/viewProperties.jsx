// src/components/ViewProperties.jsx  ← FULL REPLACEMENT
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaUserTie, FaSort, FaSortUp, FaSortDown, FaRulerCombined, FaInfoCircle, FaCubes, FaBuilding, FaHistory } from 'react-icons/fa';
import API_BASE_URL from '../../config.js';
import DeleteDialog from '../DeleteDialog';


const ViewProperties = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState(location.state?.builderFilter || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'asc' });
  const [selectedConfigs, setSelectedConfigs] = useState({}); // new: per-property selected sqft for apartments
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);


  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.builderFilter) {
      setSearchQuery(location.state.builderFilter);
    }
  }, [location.state]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

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
        setProperties(data.properties || []);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [navigate]);

  // Helper: get currently selected variant for an apartment property
  const getSelectedVariant = (prop) => {
    if (prop.property_type !== "Apartment" || !prop.variants || prop.variants.length === 0) return null;
    const selSqft = selectedConfigs[prop.id] !== undefined
      ? selectedConfigs[prop.id]
      : (prop.variants[0] ? prop.variants[0].sqft : 0);
    return prop.variants.find(v => v.sqft === selSqft) || prop.variants[0];
  };

  // Helper functions for Apartment display
  const getDisplayPrice = (prop) => {
    if (prop.property_type !== "Apartment" || !prop.variants || prop.variants.length === 0) {
      return prop.price ? parseFloat(prop.price) : 0;
    }
    const variant = getSelectedVariant(prop);
    return variant && variant.price ? variant.price : 0;
  };

  const getDisplayQuantity = (prop) => {
    if (prop.property_type !== "Apartment" || !prop.variants || prop.variants.length === 0) {
      return prop.quantity != null ? Number(prop.quantity) : 'N/A';
    }
    const variant = getSelectedVariant(prop);
    return variant && variant.quantity != null ? variant.quantity : 'N/A';
  };

  const getDisplayBlockName = (prop) => {
    if (prop.property_type !== "Apartment" || !prop.variants || prop.variants.length === 0) {
      return 'N/A';
    }
    const variant = getSelectedVariant(prop);
    return variant && variant.block_name ? variant.block_name : 'N/A';
  };

  const getDisplaySold = (prop) => {
    if (prop.property_type !== "Apartment" || !prop.variants || prop.variants.length === 0) {
      return prop.sold != null ? Number(prop.sold) : 0;
    }
    const variant = getSelectedVariant(prop);
    return variant && variant.sold != null ? variant.sold : 0;
  };

  const getSqftSelectValue = (prop) => {
    if (prop.property_type !== "Apartment" || !prop.variants || prop.variants.length === 0) return null;
    return selectedConfigs[prop.id] !== undefined
      ? selectedConfigs[prop.id]
      : (prop.variants[0] ? prop.variants[0].sqft : null);
  };

  const filteredProperties = useMemo(() => {
    const query = searchQuery.toLowerCase();
    let items = properties.filter(p =>
      (p.title || "").toLowerCase().includes(query) ||
      (p.city || "").toLowerCase().includes(query) ||
      (p.builder_name || "").toLowerCase().includes(query)
    );

    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue.toString().toLowerCase() < bValue.toString().toLowerCase()) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue.toString().toLowerCase() > bValue.toString().toLowerCase()) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  }, [properties, searchQuery, sortConfig]);

  const handleDelete = (id) => {
    setPropertyToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/viewproperties/${propertyToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete');
      setProperties(properties.filter((prop) => prop.id !== propertyToDelete));
      setShowDeleteDialog(false);
      setPropertyToDelete(null);
    } catch (err) {
      setError(err.message);
      setShowDeleteDialog(false);
    }
  };

  const handleSell = async (property) => {
    try {
      const token = localStorage.getItem('token');
      const variant = getSelectedVariant(property);
      const payload = variant ? { variant_id: variant.variant_id } : {};

      const response = await fetch(`${API_BASE_URL}/api/viewproperties/sell/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sell property');
      }

      // Update local state
      setProperties(prev => prev.map(p => {
        if (p.id === property.id) {
          if (variant) {
            return {
              ...p,
              variants: p.variants.map(v =>
                v.variant_id === variant.variant_id
                  ? { ...v, quantity: v.quantity - 1, sold: v.sold + 1 }
                  : v
              )
            };
          } else {
            return { ...p, quantity: p.quantity - 1, sold: p.sold + 1 };
          }
        }
        return p;
      }));

    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
      {/* Header (unchanged) */}
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
          <div className="flex gap-2">
            <Link
              to="/admin-dashboard/sold-properties"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95 text-sm"
            >
              <FaHistory /> Sold Properties
            </Link>
            <Link
              to="/admin-dashboard/manage-properties/add"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95 text-sm"
            >
              <FaPlus /> Add Property
            </Link>
          </div>
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
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-separate border-spacing-0">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="w-[2%] px-2 py-3 text-left border-b border-gray-200">#</th>
                    <th className="w-[24%] px-2 py-3 text-left border-b border-gray-200">Property Details</th>
                    <th className="w-[10%] px-2 py-3 text-left border-b border-gray-200 whitespace-nowrap">Builder</th>
                    <th className="w-[18%] px-2 py-3 text-center border-b border-gray-200">Sqft / Configuration</th>
                    <th className="w-[10%] px-2 py-3 text-center border-b border-gray-200">Block</th>
                    <th className="w-[5%] px-2 py-3 text-center border-b border-gray-200">Qty</th>
                    <th className="w-[5%] px-2 py-3 text-center border-b border-gray-200">Sold</th>
                    <th className="w-[11%] px-2 py-3 text-center border-b border-gray-200">Price</th>
                    <th className="w-[15%] px-2 py-3 text-center border-b border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredProperties.map((property, index) => (
                    <tr key={property.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-2 py-2 text-sm text-gray-500 font-mono border-b border-gray-100">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-2 py-2 border-b border-gray-100">
                        <div className="font-bold text-gray-900 text-sm leading-tight break-words">{property.title}</div>
                      </td>
                      <td className="px-2 py-2 text-left border-b border-gray-100">
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-bold whitespace-nowrap">
                          <FaUserTie className="text-teal-600 shrink-0" />
                          <span className="truncate max-w-[80px]">{property.builder_name || 'N/A'}</span>
                        </div>
                      </td>

                      {/* SQFT COLUMN */}
                      <td className="px-2 py-2 text-center border-b border-gray-100">
                        <div className="flex justify-center items-center">
                          {property.property_type === "Apartment" && property.variants && property.variants.length > 0 ? (
                            <div className="relative group/select inline-flex items-center w-full max-w-[140px]">
                              <select
                                value={getSqftSelectValue(property)}
                                onChange={(e) => {
                                  setSelectedConfigs(prev => ({
                                    ...prev,
                                    [property.id]: parseInt(e.target.value, 10)
                                  }));
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 text-[11px] font-bold text-slate-700 rounded-md shadow-sm hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-50 cursor-pointer appearance-none transition-all text-center pr-6"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230d9488'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 0.2rem center',
                                  backgroundSize: '0.7em',
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
                            <div className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-slate-700">
                              <span>{property.sqft ? property.sqft.toLocaleString('en-IN') : 'N/A'}</span>
                              <span className="text-[9px] text-slate-400 uppercase shrink-0">sq.ft</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* BLOCK TYPE COLUMN */}
                      <td className="px-2 py-2 text-center border-b border-gray-100">
                        <div className="inline-flex items-center gap-1 px-1.5 py-1 bg-purple-50/50 border border-purple-100 rounded text-[11px] font-bold text-purple-700">
                          <span className="truncate max-w-[60px]">{getDisplayBlockName(property)}</span>
                        </div>
                      </td>

                      {/* QUANTITY COLUMN */}
                      <td className="px-2 py-2 text-center border-b border-gray-100">
                        <div className="inline-flex items-center gap-1 px-1.5 py-1 bg-amber-50/50 border border-amber-100 rounded text-[11px] font-bold text-amber-700">
                          <span>{getDisplayQuantity(property)}</span>
                        </div>
                      </td>

                      {/* SOLD COLUMN */}
                      <td className="px-2 py-2 text-center border-b border-gray-100">
                        <div className="inline-flex items-center gap-1 px-1.5 py-1 bg-blue-50/50 border border-blue-100 rounded text-[11px] font-bold text-blue-700">
                          <span>{getDisplaySold(property)}</span>
                        </div>
                      </td>

                      {/* PRICE COLUMN */}
                      <td className="px-2 py-2 text-center border-b border-gray-100">
                        <div className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-green-50/50 border border-green-100 rounded text-[11px] font-bold text-green-700 whitespace-nowrap">
                          <span className="text-[9px] opacity-70">₹</span>
                          <span>{Math.floor(getDisplayPrice(property)).toLocaleString('en-IN')}</span>
                        </div>
                      </td>

                      <td className="px-2 py-2 text-right border-b border-gray-100">
                        <div className="flex justify-center items-center gap-1">
                          {getDisplayQuantity(property) > 0 ? (
                            <button
                              onClick={() => handleSell(property)}
                              className="px-2.5 py-1 bg-teal-600 text-white text-[10px] font-bold rounded-md hover:bg-teal-700 transition active:scale-95 shadow-sm"
                            >
                              Sold
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                              Out of Stock
                            </span>
                          )}
                          <button onClick={() => navigate(`/admin-dashboard/manage-properties/edit/${property.id}`)}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded transition" title="Edit">
                            <FaEdit size={12} />
                          </button>
                          <button onClick={() => handleDelete(property.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition" title="Delete">
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View - also updated */}
            <div className="md:hidden p-4 space-y-2">
              {filteredProperties.map((property, index) => (
                <div key={property.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm space-y-2">
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
                      <FaUserTie className="text-gray-400 text-xs" />
                      <span className="truncate">{property.builder_name || 'N/A'}</span>
                    </div>

                    {/* Sqft - dropdown for apartments */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs font-medium">Area</span>
                      {property.property_type === "Apartment" && property.variants && property.variants.length > 0 ? (
                        <div className="relative inline-flex items-center">
                          <FaRulerCombined className="absolute left-2 text-teal-400 text-[9px] pointer-events-none" />
                          <select
                            value={getSqftSelectValue(property)}
                            onChange={(e) => setSelectedConfigs(prev => ({
                              ...prev,
                              [property.id]: parseInt(e.target.value, 10)
                            }))}
                            className="pl-5 pr-6 py-1 rounded-lg text-[10px] font-bold bg-white text-slate-700 border border-slate-200 outline-none appearance-none"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230d9488'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.3rem center',
                              backgroundSize: '0.8em',
                            }}
                          >
                            {property.variants.map((v, i) => (
                              <option key={i} value={v.sqft}>{v.sqft.toLocaleString('en-IN')} ({v.apartment_type})</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700">
                          <FaRulerCombined className="text-teal-500 text-[9px]" />
                          <span>{property.sqft ? property.sqft.toLocaleString('en-IN') : 'N/A'} <span className="text-[8px] text-slate-400 uppercase">sq.ft</span></span>
                        </div>
                      )}
                    </div>

                    {/* Block Type */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs font-medium">Block Type</span>
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-50/50 text-purple-700 border border-purple-100 shadow-sm">
                        <FaBuilding className="text-purple-400 text-[9px]" />
                        {getDisplayBlockName(property)}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs font-medium">Quantity</span>
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50/50 text-amber-700 border border-amber-100 shadow-sm">
                        <FaCubes className="text-amber-400 text-[9px]" />
                        {getDisplayQuantity(property)}
                      </div>
                    </div>

                    {/* Sold Count */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs font-medium">Sold Count</span>
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50/50 text-blue-700 border border-blue-100 shadow-sm">
                        {getDisplaySold(property)}
                      </div>
                    </div>

                    {/* Price (updates when sqft dropdown changes) */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs font-medium">Price</span>
                      <div className="px-2 py-1 rounded-lg text-[11px] font-bold bg-green-50/50 text-green-700 border border-green-100 shadow-sm">
                        ₹{Math.floor(getDisplayPrice(property)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    {getDisplayQuantity(property) > 0 ? (
                      <button
                        onClick={() => handleSell(property)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition active:scale-95"
                      >
                        Sold
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">
                        Out of Stock
                      </div>
                    )}
                    <button onClick={() => navigate(`/admin-dashboard/manage-properties/edit/${property.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(property.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold">
                      <FaTrash size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
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

export default ViewProperties;