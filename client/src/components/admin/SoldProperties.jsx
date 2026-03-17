import React, { useState, useEffect } from 'react';
import { FaSearch, FaInfoCircle, FaHome, FaHistory, FaHashtag, FaLayerGroup, FaTags, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import API_BASE_URL from '../../config.js';
import { useNavigate } from 'react-router-dom';

const SoldProperties = () => {
    const [soldProperties, setSoldProperties] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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

    const filteredSold = soldProperties.filter(p =>
        (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.property_type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.apartment_type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.block_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200 flex flex-col xl:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2 sm:gap-4 w-full xl:w-auto">
                    <button
                        onClick={() => navigate('/admin-dashboard/manage-properties')}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors group shrink-0"
                        title="Back to Properties"
                    >
                        <FaArrowLeft className="text-gray-500 group-hover:text-teal-600" />
                    </button>
                    <div className="bg-teal-50 p-2 sm:p-2.5 rounded-xl border border-teal-100 shrink-0">
                        <FaHistory className="text-teal-600 text-lg sm:text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 tracking-tight whitespace-nowrap">Sales History</h2>
                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap">Sold Properties Registry</p>
                    </div>
                    <span className="bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap shrink-0">
                        {soldProperties.length} Units Sold
                    </span>
                </div>

                <div className="relative w-full xl:w-80">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title, category, bhk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="relative flex-1 bg-gray-50/30">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 z-20 flex justify-center items-center gap-3 text-gray-500">
                        <div className="animate-spin h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                        Loading sales record...
                    </div>
                )}

                {error && <div className="m-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm font-medium">{error}</div>}

                {!loading && filteredSold.length === 0 && (
                    <div className="py-24 text-center text-gray-400 flex flex-col items-center gap-4">
                        <div className="bg-gray-50 p-6 rounded-full">
                            <FaInfoCircle className="text-5xl opacity-20" />
                        </div>
                        <p className="text-lg font-medium">No sales records found matching your search.</p>
                    </div>
                )}

                {!loading && filteredSold.length > 0 && (
                    <>
                        {/* Desktop View - Shows from 1280px (xl) up */}
                        <div className="hidden xl:block overflow-x-auto bg-white">
                            <table className="w-full border-separate border-spacing-0">
                                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4 text-left border-b border-gray-200 w-16">#</th>
                                        <th className="px-6 py-4 text-left border-b border-gray-200 min-w-[200px]">Property Details</th>
                                        <th className="px-6 py-4 text-center border-b border-gray-200 whitespace-nowrap">Category</th>
                                        <th className="px-6 py-4 text-center border-b border-gray-200 whitespace-nowrap">Configuration</th>
                                        <th className="px-6 py-4 text-center border-b border-gray-200">Sqft</th>
                                        <th className="px-6 py-4 text-center border-b border-gray-200">Price</th>
                                        <th className="px-6 py-4 text-center border-b border-gray-200 whitespace-nowrap">Units Sold</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {filteredSold.map((property, index) => (
                                        <tr key={`${property.id}-${index}`} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-400 border-b border-gray-100">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-100">
                                                <div className="font-bold text-gray-800 text-sm group-hover:text-teal-700 transition-colors">
                                                    {property.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center border-b border-gray-100">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-tight">
                                                    {property.property_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center border-b border-gray-100">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 rounded text-[10px] font-bold uppercase tracking-tight border border-purple-100/50 whitespace-nowrap">
                                                    {property.block_name ? `${property.block_name} - ` : ''}{property.apartment_type || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center border-b border-gray-100">
                                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">
                                                    <span>{property.sqft ? property.sqft.toLocaleString('en-IN') : 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right border-b border-gray-100">
                                                <div className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-green-50 text-green-700 rounded text-[12px] font-bold whitespace-nowrap border border-green-100">
                                                    <span className="text-[10px] opacity-70">₹</span>
                                                    <span>{property.price ? Math.floor(property.price).toLocaleString('en-IN') : 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center border-b border-gray-100">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 rounded-full font-bold text-sm">
                                                    {property.sold}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/Tablet View - Compact Card Layout (Below 1280px) */}
                        <div className="xl:hidden p-4 space-y-4">
                            {filteredSold.map((property, index) => (
                                <div key={`${property.id}-${index}`} className="bg-white rounded-2xl p-4 border border-teal-100/50 shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="bg-teal-50 text-teal-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-teal-50/30">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-2 group-hover:text-teal-600 transition-colors uppercase tracking-tight">
                                                    {property.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span className="text-[9px] font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-gray-500 uppercase">
                                                        {property.property_type}
                                                    </span>
                                                    <span className="text-[9px] font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100 text-purple-600 uppercase">
                                                        {property.block_name ? `Block ${property.block_name} - ` : ''}{property.apartment_type}
                                                    </span>
                                                    <span className="text-[9px] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-amber-600 uppercase">
                                                        {property.sqft?.toLocaleString('en-IN')} sq.ft
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center justify-end gap-1 mb-2">
                                                <span className="text-xs text-green-600 font-bold">₹</span>
                                                <span className="text-xl font-black text-green-600 tracking-tight">
                                                    {property.price ? Math.floor(property.price).toLocaleString('en-IN') : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-600 text-white rounded-md font-bold text-[10px] shadow-sm uppercase">
                                                {property.sold} SOLD
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Footer shadow/overlay to indicate more content */}
            <div className="h-4 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none sticky bottom-0"></div>
        </div>
    );
};

export default SoldProperties;