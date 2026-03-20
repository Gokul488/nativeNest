import React, { useState, useEffect, useMemo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Search, Loader2, AlertCircle, History } from 'lucide-react';
import API_BASE_URL from '../../config.js';
import { useNavigate } from 'react-router-dom';
import Pagination from '../common/Pagination.jsx';

const SoldProperties = () => {
    const [soldProperties, setSoldProperties] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSoldProperties = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const response = await fetch(`${API_BASE_URL}/api/viewproperties/sold`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    if (response.status === 401) navigate('/login');
                    throw new Error('Failed to fetch sold properties');
                }
                const data = await response.json();
                setSoldProperties(data.soldProperties || []);
            } catch (err) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchSoldProperties();
    }, [navigate]);

    const filteredSold = useMemo(() => {
        return soldProperties.filter(p =>
            (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.property_type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.apartment_type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.block_name || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [soldProperties, searchQuery]);

    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const paginatedSold = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSold.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSold, currentPage]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

            {/* ── Header ── */}
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4">
                {/* Left: search */}
                <div className="relative w-full xl:w-80 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by title, category, bhk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                    />
                </div>

                {/* Right: total count */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin-dashboard/manage-properties')}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                        title="Back to Properties"
                    >
                        <FaArrowLeft className="text-slate-400 hover:text-indigo-500 transition-colors" size={13} />
                    </button>
                    <div>
            
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Sold properties registry</p>
                    </div>
                    <span className="ml-1 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
                        {soldProperties.length} Units Sold
                    </span>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="relative flex-1">
                {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex flex-col justify-center items-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin h-7 w-7 text-indigo-500" />
                        <span className="text-sm font-semibold">Loading sales record…</span>
                    </div>
                )}

                {error && (
                    <div className="m-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="font-medium text-sm">{error}</span>
                    </div>
                )}

                {!loading && filteredSold.length === 0 && (
                    <div className="py-32 flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-1">
                            <Search className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-800">No sales records found</p>
                        <p className="text-sm text-slate-400">
                            {searchQuery ? `No results matching "${searchQuery}"` : "No properties have been sold yet."}
                        </p>
                    </div>
                )}

                {!loading && filteredSold.length > 0 && (
                    <div className="flex flex-col">
                        {/* ── Desktop Table ── */}
                        <div className="hidden xl:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-6 py-4 text-left w-16">#</th>
                                        <th className="px-6 py-4 text-left">Property Details</th>
                                        <th className="px-6 py-4 text-center">Category</th>
                                        <th className="px-6 py-4 text-center">Configuration</th>
                                        <th className="px-6 py-4 text-center">Sqft</th>
                                        <th className="px-6 py-4 text-center">Price</th>
                                        <th className="px-6 py-4 text-center">Units Sold</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedSold.map((property, index) => {
                                        const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                                        return (
                                            <tr key={`${property.id}-${index}`} className="hover:bg-slate-50/60 transition-colors duration-150 group">
                                                <td className="px-6 py-2.5 text-sm font-bold text-slate-300">
                                                    {String(globalIndex).padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-2.5">
                                                    <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                                                        {property.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2.5 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                                                        {property.property_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2.5 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold border border-purple-100 whitespace-nowrap">
                                                        {property.block_name ? `${property.block_name} - ` : ''}{property.apartment_type || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2.5 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100">
                                                        {property.sqft ? property.sqft.toLocaleString('en-IN') : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2.5 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100 whitespace-nowrap">
                                                        ₹{property.price ? Math.floor(property.price).toLocaleString('en-IN') : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2.5 text-center">
                                                    <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                                                        {property.sold}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards ── */}
                        <div className="xl:hidden p-4 space-y-3">
                            {paginatedSold.map((property, index) => {
                                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                                return (
                                    <div key={`${property.id}-${index}`} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 transition-colors group">
                                        <div className="flex justify-between items-start pb-3 border-b border-slate-100 mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                                                    {globalIndex}
                                                </span>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                                                        {property.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                        <span className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                                                            {property.property_type}
                                                        </span>
                                                        <span className="text-[9px] font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 text-purple-600">
                                                            {property.block_name ? `Block ${property.block_name} - ` : ''}{property.apartment_type}
                                                        </span>
                                                        <span className="text-[9px] font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 text-amber-600">
                                                            {property.sqft?.toLocaleString('en-IN')} sq.ft
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                <div className="text-sm font-black text-green-600">
                                                    ₹{property.price ? Math.floor(property.price).toLocaleString('en-IN') : 'N/A'}
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 bg-indigo-600 text-white rounded-full font-bold text-[10px] mt-1">
                                                    {property.sold} Sold
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredSold.length}
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

export default SoldProperties;