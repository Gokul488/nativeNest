// src/components/ViewProperties.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaPlus, FaMapMarkerAlt, FaUserTie, FaSort, FaSortUp, FaSortDown, FaRulerCombined, FaInfoCircle, FaCubes, FaBuilding, FaHistory, FaChevronDown, FaTimes } from 'react-icons/fa';
import { Pencil, Trash2, BadgeCheck } from 'lucide-react';
import API_BASE_URL from '../../config.js';
import DeleteDialog from '../DeleteDialog';
import Pagination from '../common/Pagination.jsx';

const ViewProperties = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [builderFilter, setBuilderFilter] = useState(location.state?.builderFilter || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'city', direction: 'asc' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // Sync builderFilter from navigation state (e.g. clicking a builder from admin dashboard)
  useEffect(() => {
    if (location.state?.builderFilter) {
      setBuilderFilter(location.state.builderFilter);
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

  // Derive unique builder names for the dropdown
  const builderOptions = useMemo(() => {
    const names = properties
      .map(p => p.builder_name)
      .filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const getDisplayQuantity = (prop) => {
    if ((prop.property_type === "Apartment" || prop.property_type === "Villas") && prop.variants && prop.variants.length > 0) {
      return prop.variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0);
    }
    return prop.quantity != null ? Number(prop.quantity) : 0;
  };

  const getDisplaySold = (prop) => {
    if ((prop.property_type === "Apartment" || prop.property_type === "Villas") && prop.variants && prop.variants.length > 0) {
      return prop.variants.reduce((sum, v) => sum + (Number(v.sold) || 0), 0);
    }
    return prop.sold != null ? Number(prop.sold) : 0;
  };

  const filteredProperties = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const builderQuery = builderFilter.toLowerCase();

    let items = properties.filter(p => {
      // Text search: title or city
      const matchesSearch = !query ||
        (p.title || "").toLowerCase().includes(query) ||
        (p.city || "").toLowerCase().includes(query);

      // Builder filter: exact match from dropdown (or partial if typed manually)
      const matchesBuilder = !builderQuery ||
        (p.builder_name || "").toLowerCase().includes(builderQuery);

      return matchesSearch && matchesBuilder;
    });

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
  }, [properties, searchQuery, builderFilter, sortConfig]);

  // Reset page when search, builder filter, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, builderFilter, sortConfig]);

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
      const payload = {};

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

      setProperties(prev => prev.map(p => {
        if (p.id === property.id) {
          return {
            ...p,
            quantity: p.quantity - 1,
            sold: p.sold + 1,
            variants: p.variants.map(v =>
              v.variant_id === property.variants[0].variant_id // This logic might need refinement if selling from total count
                ? { ...v, quantity: v.quantity - 1, sold: v.sold + 1 }
                : v
            )
          };
        }
        return p;
      }));

    } catch (err) {
      setError(err.message);
    }
  };

  const clearBuilderFilter = () => setBuilderFilter('');
  const clearAllFilters = () => {
    setSearchQuery('');
    setBuilderFilter('');
  };

  const hasActiveFilters = searchQuery || builderFilter;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col gap-2 bg-white sticky top-0 z-10">
        {/* Single row: Search + Builder Filter + Actions + Count */}
        <div className="flex items-center gap-2 w-full flex-wrap">
          {/* Text Search (title / city) */}
          <div className="relative group flex-1 min-w-[160px] max-w-xs">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors text-sm" />
            <input
              type="text"
              placeholder="Search by title or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Builder Name Filter Dropdown */}
          <div className="relative group w-44 shrink-0">
            <FaUserTie className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors text-sm pointer-events-none z-10" />
            <select
              value={builderFilter}
              onChange={(e) => setBuilderFilter(e.target.value)}
              className={`w-full pl-10 pr-8 py-2.5 rounded-full bg-slate-50 border text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer
                ${builderFilter
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-500'
                }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '0.8em',
              }}
            >
              <option value="">All Builders</option>
              {builderOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {builderFilter && (
              <button
                onClick={clearBuilderFilter}
                title="Clear builder filter"
                className="absolute right-7 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition z-10"
              >
                <FaTimes size={10} />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <Link
            to="/admin-dashboard/sold-properties"
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-full font-semibold transition-all shadow-sm active:scale-95 text-sm shrink-0"
          >
            <FaHistory /> Sold Properties
          </Link>
          <Link
            to="/admin-dashboard/manage-properties/add"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full font-semibold transition-all shadow-sm active:scale-95 text-sm shrink-0"
          >
            <FaPlus /> Add Property
          </Link>

          {/* Property count — same line, pushed to the right */}
          <span className="ml-auto italic bg-indigo-50 text-indigo-600 text-sm font-bold px-3 py-1.5 rounded-full border border-indigo-100 shrink-0 whitespace-nowrap">
            {filteredProperties.length}
            {filteredProperties.length !== properties.length && (
              <span className="font-normal text-indigo-400"> / {properties.length}</span>
            )}{' '}
            Properties
          </span>
        </div>

        {/* Active filter tags — only rendered when a filter is active */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {builderFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200">
                <FaUserTie size={9} />
                {builderFilter}
                <button onClick={clearBuilderFilter} className="ml-0.5 hover:text-indigo-900 transition">
                  <FaTimes size={9} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                <FaSearch size={9} />
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-0.5 hover:text-slate-900 transition">
                  <FaTimes size={9} />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-400 hover:text-red-500 underline underline-offset-2 transition"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
            <div className="animate-spin h-7 w-7 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <span className="text-sm font-semibold">Loading properties…</span>
          </div>
        )}

        {error && <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">{error}</div>}

        {!loading && filteredProperties.length === 0 && (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
            <FaInfoCircle className="text-4xl opacity-50" />
            <p className="text-lg">No properties found.</p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-indigo-500 hover:text-indigo-700 underline underline-offset-2 transition"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && filteredProperties.length > 0 && (
          <div className="flex flex-col h-full">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto flex-1">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="w-[5%] px-4 py-5 text-left text-xs">#</th>
                    <th className="w-[35%] px-4 py-5 text-left text-xs">Property Details</th>
                    <th className="w-[25%] px-4 py-5 text-left text-xs whitespace-nowrap">Builder</th>
                    <th className="w-[10%] px-4 py-5 text-center text-xs">Qty</th>
                    <th className="w-[10%] px-4 py-5 text-center text-xs">Sold</th>
                    <th className="w-[15%] px-4 py-5 text-center text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedProperties.map((property, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={property.id} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                        <td className="px-4 py-2.5 text-sm text-slate-400 font-bold">
                          {String(globalIndex).padStart(2, '0')}
                        </td>
                        <td className="px-4 py-2.5">
                          <Link
                            to={`/admin-dashboard/property-preview/${property.id}`}
                            className="font-bold text-slate-900 text-sm leading-tight hover:text-indigo-600 transition-colors"
                          >
                            {property.title}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-left">
                          {/* Clicking builder name sets the builder filter */}
                          <button
                            onClick={() => setBuilderFilter(property.builder_name || '')}
                            title={`Filter by ${property.builder_name}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-pointer"
                          >
                            <FaUserTie className="text-indigo-500 shrink-0" />
                            <span>{property.builder_name || 'N/A'}</span>
                          </button>
                        </td>

                        {/* QUANTITY COLUMN */}
                        <td className="px-4 py-2.5 text-center">
                          <Link
                            to={`/admin-dashboard/manage-properties/units/${property.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50/50 border border-amber-100 rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="View Units"
                          >
                            <span>{getDisplayQuantity(property)}</span>
                          </Link>
                        </td>

                        {/* SOLD COLUMN */}
                        <td className="px-4 py-2.5 text-center">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50/50 border border-blue-100 rounded-lg text-xs font-bold text-blue-700">
                            <span>{getDisplaySold(property)}</span>
                          </div>
                        </td>

                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-center items-center gap-1.5">
                            <button onClick={() => navigate(`/admin-dashboard/manage-properties/edit/${property.id}`)}
                              className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(property.id)}
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Delete">
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

            {/* Mobile Card View */}
            <div className="md:hidden p-4 space-y-2 flex-1">
              {paginatedProperties.map((property, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <div key={property.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-sm space-y-2">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-50 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                          {globalIndex}
                        </div>
                        <Link
                          to={`/admin-dashboard/property-preview/${property.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-[13px]"
                        >
                          {property.title}
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <FaUserTie className="text-slate-400 text-xs" />
                        {/* Tapping builder name on mobile sets the filter */}
                        <button
                          onClick={() => setBuilderFilter(property.builder_name || '')}
                          className="text-indigo-600 font-bold hover:underline transition text-xs"
                        >
                          {property.builder_name || 'N/A'}
                        </button>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-medium">Quantity</span>
                        <Link
                          to={`/admin-dashboard/manage-properties/units/${property.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50/50 text-amber-700 border border-amber-100 shadow-sm hover:bg-amber-100 transition-all active:scale-95"
                        >
                          <FaCubes className="text-amber-400 text-[9px]" />
                          {getDisplayQuantity(property)}
                        </Link>
                      </div>

                      {/* Sold Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-medium">Sold Count</span>
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50/50 text-blue-700 border border-blue-100 shadow-sm">
                          {getDisplaySold(property)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                      <button onClick={() => navigate(`/admin-dashboard/manage-properties/edit/${property.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-100 transition">
                        <Pencil size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(property.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition">
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

export default ViewProperties;