import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaCubes, FaUserTie, FaBuilding, FaRulerCombined,
  FaSearch, FaHistory, FaCheckCircle, FaUserPlus, FaUser
} from 'react-icons/fa';
import { BadgeCheck, Loader2, ChevronRight, Building2, Layers, LayoutGrid, X } from 'lucide-react';
import API_BASE_URL from '../../config.js';

const PropertyUnits = () => {
  const { propertyId, sqft } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [buyerType, setBuyerType] = useState('registered');
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [newBuyer, setNewBuyer] = useState({ name: '', mobile: '', email: '' });
  const [selling, setSelling] = useState(false);

  const [viewingBlock, setViewingBlock] = useState(null);
  const [viewingFloor, setViewingFloor] = useState(null);
  const [viewingVariant, setViewingVariant] = useState(null);

  useEffect(() => {
    fetchPropertyDetails();
    fetchBuyers();
  }, [propertyId, sqft]);

  const fetchPropertyDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/viewproperties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch property details');
      const data = await response.json();
      setProperty(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch buyers');
      const data = await response.json();
      setBuyers(data);
    } catch (err) {
      console.error('Error fetching buyers:', err);
    }
  };

  const handleSellClick = (idx) => {
    setSelectedUnitIdx(idx);
    setShowSoldModal(true);
  };

  const handleSoldConfirm = async () => {
    if (buyerType === 'registered' && !selectedBuyerId) {
      alert('Please select a buyer');
      return;
    }
    if (buyerType === 'new' && (!newBuyer.name || !newBuyer.mobile)) {
      alert('Please enter buyer name and mobile number');
      return;
    }

    setSelling(true);
    try {
      const token = localStorage.getItem('token');
      const targetVariant = viewingVariant || (sqft ? property.variants?.find(v => v.sqft === parseInt(sqft)) : null);

      const payload = {
        variant_id: targetVariant?.variant_id,
        buyer_id: buyerType === 'registered' ? selectedBuyerId : null,
        buyer_name: buyerType === 'new' ? newBuyer.name : null,
        buyer_mobile: buyerType === 'new' ? newBuyer.mobile : null,
        buyer_email: buyerType === 'new' ? newBuyer.email : null,
      };

      const response = await fetch(`${API_BASE_URL}/api/viewproperties/sell/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sell property');
      }

      alert('Property sold successfully!');
      setShowSoldModal(false);
      fetchPropertyDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setSelling(false);
    }
  };

  const handleBack = () => {
    if (viewingVariant) setViewingVariant(null);
    else if (viewingFloor) setViewingFloor(null);
    else if (viewingBlock) setViewingBlock(null);
    else navigate(-1);
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 bg-slate-50">
        <div className="bg-white rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-slate-200 px-12 py-10 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-sky-500 w-9 h-9" />
          <p className="text-slate-500 font-semibold text-sm tracking-wide">Loading units…</p>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error || !property) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-white rounded-[20px] border border-slate-200 shadow-[0_4px_12px_rgba(15,23,42,0.06)] p-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-sm font-semibold">
            {error || 'Property not found'}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
          >
            <FaArrowLeft size={12} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ─── Data ─── */
  const variants = property.variants || [];
  const hasVariants = variants.length > 0;
  const uniqueBlocks = [...new Set(variants.map(v => v.block_name))].filter(Boolean).sort();
  const floorsInBlock = viewingBlock
    ? [...new Set(variants.filter(v => v.block_name === viewingBlock).map(v => v.floor))].filter(Boolean).sort((a, b) => a - b)
    : [];
  const variantsInFloor = viewingBlock && viewingFloor
    ? variants.filter(v => v.block_name === viewingBlock && v.floor === viewingFloor)
    : [];
  const currentVariant = viewingVariant || (sqft ? variants.find(v => v.sqft === parseInt(sqft)) : null);
  const availableCount = viewingVariant ? (viewingVariant.quantity || 0) : (currentVariant ? (currentVariant.quantity || 0) : (property.quantity || 0));
  const soldCount = viewingVariant ? (viewingVariant.sold || 0) : (currentVariant ? (currentVariant.sold || 0) : (property.sold || 0));
  const totalUnitsInView = availableCount + soldCount;
  const unitDetails = viewingVariant || currentVariant || property;

  /* ─── Breadcrumb label for header subtitle ─── */
  const subtitleLabel = viewingVariant
    ? `${viewingVariant.block_name} · Floor ${viewingVariant.floor} · ${viewingVariant.apartment_type}`
    : viewingFloor
      ? `${viewingBlock} · Floor ${viewingFloor}`
      : viewingBlock
        ? `Block ${viewingBlock} — Select Floor`
        : currentVariant
          ? `${currentVariant.block_name} · Floor ${currentVariant.floor}`
          : property.city;

  const totalUnitsAvailable = hasVariants
    ? variants.reduce((s, v) => s + (v.quantity || 0), 0)
    : (property.quantity || 0);

  const counterLabel = viewingVariant
    ? `${availableCount} Available Units`
    : viewingFloor
      ? `${variantsInFloor.reduce((s, v) => s + (v.quantity || 0), 0)} Available on Floor`
      : `${totalUnitsAvailable} Units Available`;

  return (
    <>
      <div className="bg-white rounded-[20px] shadow-[0_4px_12px_rgba(15,23,42,0.06)] border border-slate-200 overflow-hidden flex flex-col min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 transition-all duration-200 shadow-sm"
            >
              <FaArrowLeft size={13} />
            </button>
            <div>
              <h1 className="text-[18px] font-bold text-slate-900 leading-snug">{property.title}</h1>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                {property.property_type} &nbsp;·&nbsp; {subtitleLabel}
              </p>
            </div>
          </div>

          {/* Units Badge */}
          <div className="inline-flex items-center gap-2.5 bg-sky-50 border border-sky-100 px-4 py-2 rounded-[12px]">
            <FaCubes className="text-sky-500 shrink-0" size={14} />
            <span className="text-sky-700 font-bold text-sm">{counterLabel}</span>
          </div>
        </div>

        {/* ── Breadcrumbs ── */}
        {hasVariants && (
          <div className="px-6 pt-5 pb-1 flex items-center gap-1.5 flex-wrap text-[13px]">
            <button
              onClick={() => { setViewingBlock(null); setViewingFloor(null); setViewingVariant(null); }}
              className={`flex items-center gap-1 font-semibold transition-colors ${!viewingBlock ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <LayoutGrid size={13} /> Blocks
            </button>
            {viewingBlock && (
              <>
                <ChevronRight size={13} className="text-slate-300" />
                <button
                  onClick={() => { setViewingFloor(null); setViewingVariant(null); }}
                  className={`flex items-center gap-1 font-semibold transition-colors ${viewingBlock && !viewingFloor ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  <Building2 size={13} /> {viewingBlock}
                </button>
              </>
            )}
            {viewingFloor && (
              <>
                <ChevronRight size={13} className="text-slate-300" />
                <button
                  onClick={() => setViewingVariant(null)}
                  className={`flex items-center gap-1 font-semibold transition-colors ${viewingFloor && !viewingVariant ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  <Layers size={13} /> Floor {viewingFloor}
                </button>
              </>
            )}
            {viewingVariant && (
              <>
                <ChevronRight size={13} className="text-slate-300" />
                <span className="font-semibold text-sky-600">{viewingVariant.apartment_type}</span>
              </>
            )}
          </div>
        )}

        {/* ── Content ── */}
        <div className="p-6 flex-1">

          {/* === UNIT GRID (no variants, or deepest level) === */}
          {(!hasVariants || viewingVariant || (!viewingBlock && !uniqueBlocks.length)) && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1.5 w-7 bg-sky-500 rounded-full" />
                <h3 className="font-bold text-slate-800 text-[15px]">Individual Units Availability</h3>
              </div>

              {totalUnitsInView > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-[18px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unit #</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Apartment Detail</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Block / Floor</th>
                        <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.from({ length: totalUnitsInView }).map((_, idx) => {
                        const isSold = idx >= availableCount;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-400 group-hover:text-sky-500 transition-colors">
                                #{idx + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSold ? "bg-slate-100 text-slate-400" : "bg-sky-50 text-sky-500"}`}>
                                  <FaBuilding size={14} />
                                </div>
                                <span className="font-bold text-slate-900 text-sm">
                                  {unitDetails.apartment_type ? `${unitDetails.apartment_type} Apartment` : property.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-slate-500 font-medium">
                                Block {unitDetails.block_name || 'N/A'} · Floor {unitDetails.floor || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isSold ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold">
                                  <FaCheckCircle size={10} /> SOLD
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[10px] font-bold">
                                  AVAILABLE
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {!isSold ? (
                                <button
                                  onClick={() => handleSellClick(idx)}
                                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-sm"
                                >
                                  <BadgeCheck size={14} /> Mark as Sold
                                </button>
                              ) : (
                                <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1.5 mr-2">
                                  <FaHistory size={11} /> Sale Recorded
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Sold Out Empty State (Should rarely be hit now as we show Sold units) */
                <div className="py-20 text-center bg-slate-50 rounded-[20px] border border-dashed border-slate-200">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaHistory className="text-slate-300 text-2xl" />
                  </div>
                  <p className="text-slate-700 font-bold text-base">No units found</p>
                  <p className="text-slate-400 text-sm mt-1 font-medium">Check other variants or add more quantity.</p>
                  <Link
                    to="/admin-dashboard/manage-properties"
                    className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-sky-500 text-white rounded-full font-bold text-sm hover:bg-sky-600 shadow-[0_4px_12px_rgba(14,165,233,0.3)] transition-all"
                  >
                    Go to All Properties
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* === BLOCK SELECTION === */}
          {hasVariants && !viewingBlock && uniqueBlocks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1.5 w-7 bg-sky-500 rounded-full" />
                <h3 className="font-bold text-slate-800 text-[15px]">Select a Block</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uniqueBlocks.map(block => {
                  const blockUnits = variants.filter(v => v.block_name === block).reduce((s, v) => s + v.quantity, 0);
                  return (
                    <button
                      key={block}
                      onClick={() => setViewingBlock(block)}
                      className="group bg-white border border-slate-200 rounded-[18px] p-6 hover:border-sky-300 hover:shadow-[0_8px_24px_rgba(14,165,233,0.10)] transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="w-14 h-14 bg-slate-50 rounded-[14px] flex items-center justify-center mb-4 text-slate-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 group-hover:rotate-3">
                        <Building2 size={24} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition-colors">{block}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-widest">Property Block</p>
                      <div className="mt-3 px-3 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[10px] font-bold">
                        {blockUnits} available
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* === FLOOR SELECTION === */}
          {hasVariants && viewingBlock && !viewingFloor && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1.5 w-7 bg-sky-500 rounded-full" />
                <h3 className="font-bold text-slate-800 text-[15px]">Select Floor — <span className="text-sky-600">{viewingBlock}</span></h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {floorsInBlock.map(floor => {
                  const floorUnits = variants
                    .filter(v => v.block_name === viewingBlock && v.floor === floor)
                    .reduce((s, v) => s + v.quantity, 0);
                  return (
                    <button
                      key={floor}
                      onClick={() => setViewingFloor(floor)}
                      className="group bg-white border border-slate-200 rounded-[18px] p-6 hover:border-sky-300 hover:shadow-[0_8px_24px_rgba(14,165,233,0.10)] transition-all duration-300 flex flex-col items-center text-center"
                    >
                      <div className="w-14 h-14 bg-slate-50 rounded-[14px] flex items-center justify-center mb-4 text-slate-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 group-hover:rotate-3">
                        <Layers size={24} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition-colors">{floor}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-widest">Floor</p>
                      <div className="mt-3 px-3 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[10px] font-bold">
                        {floorUnits} available
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* === APARTMENT TYPE SELECTION === */}
          {hasVariants && viewingBlock && viewingFloor && !viewingVariant && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-1.5 w-7 bg-sky-500 rounded-full" />
                <h3 className="font-bold text-slate-800 text-[15px]">
                  Apartment Types — <span className="text-sky-600">Floor {viewingFloor}</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {variantsInFloor.map((v, i) => (
                  <div
                    key={i}
                    className="group bg-white border border-slate-200 rounded-[20px] p-6 hover:border-sky-300 hover:shadow-[0_12px_32px_rgba(14,165,233,0.10)] transition-all duration-400 relative overflow-hidden"
                  >
                    {/* decorative circle */}
                    <div className="absolute -top-5 -right-5 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-sky-50/60 transition-colors pointer-events-none" />

                    <div className="relative z-10">
                      {/* Top row */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="bg-sky-50 border border-sky-100 p-3 rounded-[14px] text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                          <FaBuilding size={18} />
                        </div>
                      </div>

                      {/* Apartment type name */}
                      <h4 className="text-lg font-black text-slate-900 mb-4 group-hover:text-sky-600 transition-colors uppercase tracking-tight">
                        {v.apartment_type}
                      </h4>

                      {/* Details */}
                      <div className="space-y-2.5 mb-5">
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                            <FaRulerCombined className="text-slate-300" size={11} /> Built-up Area
                          </span>
                          <span className="text-xs font-black text-slate-900">{v.sqft.toLocaleString('en-IN')} SQ.FT</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                            <span className="text-slate-300 font-bold">₹</span> Price per Unit
                          </span>
                          <span className="text-xs font-black text-indigo-600">₹{Math.floor(v.price).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                            <FaCubes className="text-slate-300" size={11} /> Available Units
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black ${v.quantity > 0
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-red-50 text-red-500 border border-red-100'
                            }`}>
                            {v.quantity} UNITS
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setViewingVariant(v)}
                        disabled={v.quantity === 0}
                        className="w-full py-3 bg-slate-900 text-white rounded-[14px] text-sm font-bold hover:bg-sky-600 hover:shadow-[0_6px_16px_rgba(14,165,233,0.25)] disabled:opacity-40 disabled:bg-slate-100 disabled:text-slate-400 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        {v.quantity > 0 ? 'View & Manage Units' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SELL MODAL
      ═══════════════════════════════════════════════ */}
      {showSoldModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowSoldModal(false)}
          />

          {/* Modal Card */}
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-[0_24px_64px_rgba(15,23,42,0.18)] relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[92vh]">

            {/* Modal Header */}
            <div className="px-7 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/60">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Finalize Sale</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Buyer information for Unit #{(selectedUnitIdx ?? 0) + 1}
                </p>
              </div>
              <button
                onClick={() => setShowSoldModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-7 overflow-y-auto flex-1">

              {/* Buyer Type Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-[14px] gap-1 mb-7">
                <button
                  onClick={() => setBuyerType('registered')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-sm font-bold transition-all ${buyerType === 'registered'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <FaUser size={12} /> Registered Buyer
                </button>
                <button
                  onClick={() => setBuyerType('new')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-sm font-bold transition-all ${buyerType === 'new'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <FaUserPlus size={12} /> New / Guest
                </button>
              </div>

              {/* Registered Buyer */}
              {buyerType === 'registered' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">
                      Select Registered Agent / Buyer
                    </label>
                    <div className="relative">
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                      <select
                        value={selectedBuyerId}
                        onChange={e => setSelectedBuyerId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230ea5e9'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          backgroundSize: '1em',
                        }}
                      >
                        <option value="">Choose from list…</option>
                        {buyers.map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({b.mobile_number})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-[14px] p-4 flex items-start gap-3">
                    <FaCheckCircle className="text-indigo-400 mt-0.5 shrink-0" size={14} />
                    <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                      Selecting a registered buyer automatically links this sale to their profile.
                    </p>
                  </div>
                </div>
              ) : (
                /* New / Guest Buyer */
                <div className="space-y-4">
                  {[
                    { label: 'Buyer Full Name', key: 'name', type: 'text', placeholder: 'John Doe', required: true },
                    { label: 'Mobile Number', key: 'mobile', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: true },
                    { label: 'Email Address (Optional)', key: 'email', type: 'email', placeholder: 'john@example.com', required: false },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-0.5">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={newBuyer[field.key]}
                        onChange={e => setNewBuyer({ ...newBuyer, [field.key]: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[14px] text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-7 pb-7 mt-auto">
              <button
                onClick={handleSoldConfirm}
                disabled={selling}
                className="w-full py-3.5 bg-slate-900 text-white rounded-[14px] text-sm font-bold hover:bg-sky-600 hover:shadow-[0_8px_20px_rgba(14,165,233,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(15,23,42,0.12)]"
              >
                {selling ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Processing Sale…
                  </>
                ) : (
                  <>
                    <BadgeCheck size={16} />
                    Complete Property Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyUnits;