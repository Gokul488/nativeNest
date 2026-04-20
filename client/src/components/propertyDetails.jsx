import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "./header";
import Footer from "./footer";
import { motion } from "framer-motion";
import API_BASE_URL from '../config.js';   // ← one level up

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [heroBlockOpen, setHeroBlockOpen] = useState(false);
  const [heroTypeOpen, setHeroTypeOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [videoError, setVideoError] = useState('');
  const navigate = useNavigate();

  // Click-outside handler to close all dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setHeroBlockOpen(false);
        setHeroTypeOpen(false);
        setBlockDropdownOpen(false);
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGuestId = () => {
    let guestId = localStorage.getItem("guest_id");
    if (!guestId) {
      guestId = "guest_" + crypto.randomUUID();
      localStorage.setItem("guest_id", guestId);
    }
    return guestId;
  };

  // Format price in Indian Rupees
  const formatPriceInINR = (price) => {
    if (!price) return 'N/A';
    const num = Number(price);
    return isNaN(num) ? price : num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // Calculate and format rate per sq. ft.
  const getRatePerSqFt = () => {
    let p = property?.price;
    let s = property?.sqft;

    if ((property?.property_type === 'Apartment' || property?.property_type === 'Villas') && selectedVariant) {
      p = selectedVariant.price;
      s = selectedVariant.sqft;
    }

    if (!s || !p || s <= 0) {
      return 'N/A';
    }
    const rate = p / s;
    return formatPriceInINR(Math.round(rate));
  };

  // Apartment block/type helpers
  const allBlocks = property?.property_type === 'Apartment'
    ? [...new Set((property.variants || []).map(v => v.block_name || 'General'))]
    : [];

  const typesForBlock = (blockName) =>
    (property?.variants || []).filter(v => (v.block_name || 'General') === blockName);

  const handleBlockChange = (blockName) => {
    setSelectedBlock(blockName);
    const types = typesForBlock(blockName);
    setSelectedVariant(types[0] || null);
  };

  const handleFacingChange = (facing) => {
    setSelectedBlock(facing);
    const variant = (property?.variants || []).find(v => v.facing === facing);
    setSelectedVariant(variant || null);
  };

  const handleTypeChange = (apartmentType) => {
    const match = typesForBlock(selectedBlock).find(v => v.apartment_type === apartmentType);
    if (match) setSelectedVariant(match);
  };

  const fetchPropertyDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const guestId = getGuestId();

      const headers = {
        "Content-Type": "application/json"
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/properties/${id}?guestId=${guestId}`,
        { headers }
      );

      if (!response.ok) throw new Error("Failed to fetch property");

      const data = await response.json();
      setProperty(data.property);
      if ((data.property.property_type === 'Apartment' || data.property.property_type === 'Villas') && data.property.variants?.length > 0) {
        const firstVariant = data.property.variants[0];
        if (data.property.property_type === 'Apartment') {
          const firstBlock = firstVariant.block_name || 'General';
          setSelectedBlock(firstBlock);
        } else {
          // For Villas, we use facing as the primary selector if no blocks
          setSelectedBlock(firstVariant.facing || 'Default');
        }
        setSelectedVariant(firstVariant);
      } else {
        setSelectedBlock(null);
        setSelectedVariant(null);
      }
    } catch (err) {
      setError("Unable to load property details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  // Lightbox
  const openImageModal = (image) => {
    const images = [];
    if (property.cover_image) images.push(property.cover_image);
    if (property.images) images.push(...property.images);
    setAllImages(images);
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setAllImages([]);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const handleVideoError = () => {
    setVideoError('Unable to play video. The file may be corrupted or unsupported.');
  };

  // Rich Text Renderer using blog-content styles
  const DescriptionRenderer = ({ html }) => {
    if (!html || html === '<p><br></p>') {
      return <p className="text-gray-500 italic">No description provided.</p>;
    }
    return <div className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // Handle Interested Button Click
  const handleInterested = () => {
    if (!property.mobile_number) {
      alert("No contact number available for this property.");
      return;
    }

    const message = encodeURIComponent(`Hello, I'm interested in ${property.title}.`);
    window.open(`https://wa.me/+91${property.mobile_number}?text=${message}`, '_blank');
  };

  // Build full address string safely
  const fullAddress = property
    ? [
      property.address,
      property.city,
      property.state,
      property.pincode || '', // if pincode exists in your data
    ]
      .filter(Boolean)
      .join(', ')
    : '';

  // Encode address for Google Maps iframe
  const encodedAddress = encodeURIComponent(fullAddress);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#f8f6f1' }}>
        <Header />
        <div className="grow flex items-center justify-center pt-24">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full border-2 border-[#2e6171]/30 border-t-[#2e6171]"
              style={{ animation: 'spin 1s linear infinite' }} />
            <p className="text-xl font-medium text-[#2e6171]">
              Loading property…
            </p>
          </motion.div>
        </div>
        <Footer />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#f8f6f1' }}>
        <Header />
        <div className="grow flex items-center justify-center pt-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-red-100 text-red-600 px-8 py-6 rounded-2xl max-w-md w-full text-center shadow-lg"
          >
            <i className="fas fa-exclamation-triangle text-2xl mb-3 block"></i>
            <p className="text-lg">{error}</p>
            <button
              onClick={fetchPropertyDetails}
              className="mt-5 bg-[#2e6171] text-white px-8 py-2.5 rounded-full font-medium hover:bg-[#011936] transition-colors text-sm tracking-wider"
            >
              Retry
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#f8f6f1' }}>
        <Header />
        <div className="grow flex items-center justify-center pt-24">
          <p className="text-xl text-gray-500">Property Not Found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: '#f5f3ee' }}>
      <Header />

      <main style={{ paddingTop: '72px' }}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full"
          style={{ height: 'clamp(420px, 60vh, 680px)' }}
        >
          {/* Image wrapper with clipping */}
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
            {property.cover_image ? (
              <img
                src={property.cover_image}
                alt={property.title}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.78)' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a2e3a' }}>
                <i className="fas fa-home text-7xl" style={{ color: 'rgba(255,255,255,0.2)' }}></i>
              </div>
            )}

            {/* Rich dark gradient */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(1,25,54,0.92) 0%, rgba(1,25,54,0.45) 50%, transparent 100%)' }} />
          </div>

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium tracking-wide"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '100px' }}
          >
            <i className="fas fa-arrow-left text-xs"></i> Back
          </motion.button>

          {/* Property type badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute top-6 right-6"
          >
            <span className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full text-white" style={{ background: 'rgba(46,97,113,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}>
              {property.property_type}
            </span>
          </motion.div>

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 lg:px-16 pb-10" style={{ overflow: 'visible', zIndex: 10 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <p className="text-white/100 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-[#ffffff]"></i>
                {property.city}{property.state ? `, ${property.state}` : ''}
              </p>
              <h1 className="text-white mb-6 font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', lineHeight: 1.15, letterSpacing: '-0.01em', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                {property.title}
              </h1>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex flex-col" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', padding: '12px 20px', minWidth: '130px' }}>
                  <span className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Total Price</span>
                  <span className="text-white font-bold" style={{ fontSize: '1.15rem' }}>
                    ₹ { (property.property_type === 'Apartment' || property.property_type === 'Villas') && selectedVariant
                      ? formatPriceInINR(selectedVariant.price)
                      : formatPriceInINR(property.price)}
                  </span>
                </div>

                <div className="flex flex-col" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', padding: '12px 20px', minWidth: '130px' }}>
                  <span className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Area</span>
                  <span className="text-white font-bold" style={{ fontSize: '1.15rem' }}>
                    {(property.property_type === 'Apartment' || property.property_type === 'Villas') && selectedVariant
                      ? selectedVariant.sqft.toLocaleString('en-IN')
                      : (property.sqft ? property.sqft.toLocaleString('en-IN') : 'N/A')}
                    <span className="text-white/50 text-xs font-normal ml-1">sq.ft</span>
                  </span>
                </div>

                {getRatePerSqFt() !== 'N/A' && (
                  <div className="flex flex-col" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', padding: '12px 20px', minWidth: '130px' }}>
                    <span className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Rate / sq.ft</span>
                    <span className="text-white font-bold" style={{ fontSize: '1.15rem' }}>
                      ₹ {getRatePerSqFt()}
                    </span>
                  </div>
                )}

                {/* Units available — non-apartment/non-villa only */}
                {property.property_type !== 'Apartment' && property.property_type !== 'Villas' && property.quantity != null && (
                  <div className="flex flex-col" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', padding: '12px 20px', minWidth: '130px' }}>
                    <span className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Units Left</span>
                    <span className="text-white font-bold" style={{ fontSize: '1.15rem' }}>
                      {property.quantity.toLocaleString('en-IN')}
                      <span className="text-white/50 text-xs font-normal ml-1">units</span>
                    </span>
                  </div>
                )}

                {/* Selected variant quantity — Apartment or Villa */}
                {(property.property_type === 'Apartment' || property.property_type === 'Villas') && selectedVariant?.quantity != null && (
                  <div className="flex flex-col" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', padding: '12px 20px', minWidth: '130px' }}>
                    <span className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Units Left</span>
                    <span className="text-white font-bold" style={{ fontSize: '1.15rem' }}>
                      {selectedVariant.quantity.toLocaleString('en-IN')}
                      <span className="text-white/50 text-xs font-normal ml-1">units</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Variant selector — Apartment */}
              {property.property_type === 'Apartment' && property.variants?.length > 0 && (
                <div className="flex flex-wrap items-end gap-3">

                  {/* Block custom dropdown */}
                  <div className="flex flex-col gap-1.5 relative" style={{ zIndex: heroBlockOpen ? 50 : 1 }} data-dropdown>
                    <label className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">Block</label>
                    <button
                      onClick={() => { setHeroBlockOpen(o => !o); setHeroTypeOpen(false); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', minWidth: '150px' }}
                    >
                      <i className="fas fa-building text-[10px]" style={{ color: '#7eb8c4' }}></i>
                      <span className="flex-1 text-left">{selectedBlock || '—'}</span>
                      <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${heroBlockOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.5)' }}></i>
                    </button>
                    {heroBlockOpen && (
                      <div className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden"
                        style={{ minWidth: '170px', background: 'white', boxShadow: '0 16px 48px rgba(1,25,54,0.22)', border: '1px solid #dde8ec', zIndex: 50 }}>
                        {allBlocks.map((b, i) => (
                          <button key={b} onClick={() => { handleBlockChange(b); setHeroBlockOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{ background: selectedBlock === b ? 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' : 'white', borderTop: i > 0 ? '1px solid #f0f4f6' : 'none' }}>
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: selectedBlock === b ? 'linear-gradient(135deg, #2e6171, #011936)' : '#f4f9fb' }}>
                              <i className="fas fa-building" style={{ fontSize: '9px', color: selectedBlock === b ? 'white' : '#2e6171' }}></i>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: '#011936' }}>{b}</span>
                            {selectedBlock === b && <i className="fas fa-check ml-auto text-xs" style={{ color: '#2e6171' }}></i>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Unit Type custom dropdown */}
                  <div className="flex flex-col gap-1.5 relative" style={{ zIndex: heroTypeOpen ? 50 : 1 }} data-dropdown>
                    <label className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">Unit Type</label>
                    <button
                      onClick={() => { setHeroTypeOpen(o => !o); setHeroBlockOpen(false); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', minWidth: '190px' }}
                    >
                      <i className="fas fa-door-open text-[10px]" style={{ color: '#7eb8c4' }}></i>
                      <span className="flex-1 text-left">
                        {selectedVariant ? selectedVariant.apartment_type : '—'}
                      </span>
                      <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${heroTypeOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.5)' }}></i>
                    </button>
                    {heroTypeOpen && (
                      <div className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden"
                        style={{ minWidth: '220px', background: 'white', boxShadow: '0 16px 48px rgba(1,25,54,0.22)', border: '1px solid #dde8ec', zIndex: 50 }}>
                        {typesForBlock(selectedBlock).map((v, i) => (
                          <button key={v.apartment_type} onClick={() => { handleTypeChange(v.apartment_type); setHeroTypeOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{ background: selectedVariant?.apartment_type === v.apartment_type ? 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' : 'white', borderTop: i > 0 ? '1px solid #f0f4f6' : 'none' }}>
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: selectedVariant?.apartment_type === v.apartment_type ? 'linear-gradient(135deg, #2e6171, #011936)' : '#f4f9fb' }}>
                              <i className="fas fa-home" style={{ fontSize: '9px', color: selectedVariant?.apartment_type === v.apartment_type ? 'white' : '#2e6171' }}></i>
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: '#011936' }}>{v.apartment_type}</p>
                              <p className="text-[11px]" style={{ color: '#6b7280' }}>{v.sqft?.toLocaleString('en-IN')} sq.ft</p>
                            </div>
                            {selectedVariant?.apartment_type === v.apartment_type && <i className="fas fa-check ml-auto text-xs" style={{ color: '#2e6171' }}></i>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Variant selector — Villas */}
              {property.property_type === 'Villas' && property.variants?.length > 0 && (
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1.5 relative" style={{ zIndex: heroBlockOpen ? 50 : 1 }} data-dropdown>
                    <label className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">Facing</label>
                    <button
                      onClick={() => { setHeroBlockOpen(o => !o); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', minWidth: '150px' }}
                    >
                      <i className="fas fa-compass text-[10px]" style={{ color: '#7eb8c4' }}></i>
                      <span className="flex-1 text-left">{selectedVariant?.facing || '—'}</span>
                      <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${heroBlockOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.5)' }}></i>
                    </button>
                    {heroBlockOpen && (
                      <div className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden"
                        style={{ minWidth: '170px', background: 'white', boxShadow: '0 16px 48px rgba(1,25,54,0.22)', border: '1px solid #dde8ec', zIndex: 50 }}>
                        {property.variants.map((v, i) => (
                          <button key={i} onClick={() => { handleFacingChange(v.facing); setHeroBlockOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{ background: selectedVariant?.facing === v.facing ? 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' : 'white', borderTop: i > 0 ? '1px solid #f0f4f6' : 'none' }}>
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: selectedVariant?.facing === v.facing ? 'linear-gradient(135deg, #2e6171, #011936)' : '#f4f9fb' }}>
                              <i className="fas fa-compass" style={{ fontSize: '9px', color: selectedVariant?.facing === v.facing ? 'white' : '#2e6171' }}></i>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: '#011936' }}>{v.facing}</span>
                            {selectedVariant?.facing === v.facing && <i className="fas fa-check ml-auto text-xs" style={{ color: '#2e6171' }}></i>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* ── CONTENT AREA ─────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">

          {/* ── ABOUT ── */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: '0 2px 24px rgba(1,25,54,0.07)' }}
          >
            <div className="px-8 pt-8 pb-2 flex items-center gap-3">
              <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#011936' }}>
                About This Property
              </h2>
            </div>
            <div className="px-8 py-6">
              <DescriptionRenderer html={property.description} />
            </div>
          </motion.section>

          {/* ── BLOCK & UNIT TYPES (Apartment) ── */}
          {property.property_type === 'Apartment' && property.variants?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl"
              style={{ boxShadow: '0 2px 24px rgba(1,25,54,0.07)', overflow: 'visible' }}
            >
              <div className="px-8 pt-8 pb-6 flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#011936' }}>Block & Unit Types</h2>
              </div>

              <div className="px-8 pb-8">
                {/* ── Single unified row ── */}
                <div
                  className="flex items-stretch rounded-2xl"
                  style={{ border: '1.5px solid #dde8ec', background: 'linear-gradient(to right, #f4f9fb, #eef5f8)', overflow: 'visible', position: 'relative' }}
                >

                  {/* ── Block custom dropdown ── */}
                  <div className="relative border-r flex-shrink-0" style={{ borderColor: '#dde8ec', zIndex: blockDropdownOpen ? 50 : 1 }}
                    data-dropdown>
                    <button
                      onClick={() => { setBlockDropdownOpen(o => !o); setTypeDropdownOpen(false); }}
                      className="flex items-center gap-3 px-5 py-4 h-full w-full text-left transition-colors hover:bg-white/60"
                      style={{ minWidth: '160px' }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2e6171, #011936)' }}>
                        <i className="fas fa-building text-xs text-white"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#2e6171' }}>Block</p>
                        <p className="text-sm font-bold truncate" style={{ color: '#011936' }}>{selectedBlock || '—'}</p>
                      </div>
                      <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ml-1 flex-shrink-0 ${blockDropdownOpen ? 'rotate-180' : ''}`}
                        style={{ color: '#2e6171' }}></i>
                    </button>
                    {/* Block dropdown panel */}
                    {blockDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden"
                        style={{ minWidth: '180px', background: 'white', boxShadow: '0 12px 40px rgba(1,25,54,0.15)', border: '1px solid #dde8ec', zIndex: 50 }}>
                        {allBlocks.map((b, i) => (
                          <button
                            key={b}
                            onClick={() => { handleBlockChange(b); setBlockDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{
                              background: selectedBlock === b ? 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' : 'white',
                              borderTop: i > 0 ? '1px solid #f0f4f6' : 'none'
                            }}
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: selectedBlock === b ? 'linear-gradient(135deg, #2e6171, #011936)' : '#f4f9fb' }}>
                              <i className="fas fa-building" style={{ fontSize: '10px', color: selectedBlock === b ? 'white' : '#2e6171' }}></i>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: selectedBlock === b ? '#011936' : '#374151' }}>{b}</span>
                            {selectedBlock === b && (
                              <i className="fas fa-check ml-auto text-xs" style={{ color: '#2e6171' }}></i>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Unit Type custom dropdown ── */}
                  <div className="relative border-r flex-shrink-0" style={{ borderColor: '#dde8ec', zIndex: typeDropdownOpen ? 50 : 1 }}
                    data-dropdown>
                    <button
                      onClick={() => { setTypeDropdownOpen(o => !o); setBlockDropdownOpen(false); }}
                      className="flex items-center gap-3 px-5 py-4 h-full w-full text-left transition-colors hover:bg-white/60"
                      style={{ minWidth: '200px' }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2e6171, #011936)' }}>
                        <i className="fas fa-door-open text-xs text-white"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#2e6171' }}>Unit Type</p>
                        <p className="text-sm font-bold truncate" style={{ color: '#011936' }}>
                          {selectedVariant ? `${selectedVariant.apartment_type}` : '—'}
                        </p>
                      </div>
                      <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ml-1 flex-shrink-0 ${typeDropdownOpen ? 'rotate-180' : ''}`}
                        style={{ color: '#2e6171' }}></i>
                    </button>
                    {/* Type dropdown panel */}
                    {typeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden"
                        style={{ minWidth: '230px', background: 'white', boxShadow: '0 12px 40px rgba(1,25,54,0.15)', border: '1px solid #dde8ec', zIndex: 50 }}>
                        {typesForBlock(selectedBlock).map((v, i) => (
                          <button
                            key={v.apartment_type}
                            onClick={() => { handleTypeChange(v.apartment_type); setTypeDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{
                              background: selectedVariant?.apartment_type === v.apartment_type ? 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' : 'white',
                              borderTop: i > 0 ? '1px solid #f0f4f6' : 'none'
                            }}
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: selectedVariant?.apartment_type === v.apartment_type ? 'linear-gradient(135deg, #2e6171, #011936)' : '#f4f9fb' }}>
                              <i className="fas fa-home" style={{ fontSize: '10px', color: selectedVariant?.apartment_type === v.apartment_type ? 'white' : '#2e6171' }}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold" style={{ color: '#011936' }}>{v.apartment_type}</p>
                              <p className="text-[11px]" style={{ color: '#6b7280' }}>{v.sqft?.toLocaleString('en-IN')} sq.ft</p>
                            </div>
                            {selectedVariant?.apartment_type === v.apartment_type && (
                              <i className="fas fa-check ml-auto text-xs flex-shrink-0" style={{ color: '#2e6171' }}></i>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Area ── */}
                  <div className="flex items-center gap-3 px-5 py-4 border-r" style={{ borderColor: '#dde8ec', flex: '1 1 0', minWidth: '0' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'white', border: '1px solid #d0e9ef' }}>
                      <i className="fas fa-ruler-combined text-xs" style={{ color: '#2e6171' }}></i>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#6b7280' }}>Area</p>
                      <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#011936' }}>
                        {selectedVariant?.sqft ? selectedVariant.sqft.toLocaleString('en-IN') : '—'}
                        <span className="text-xs font-normal ml-1" style={{ color: '#9ca3af' }}>sq.ft</span>
                      </p>
                    </div>
                  </div>

                  {/* ── Price ── */}
                  <div className="flex items-center gap-3 px-5 py-4 border-r" style={{ borderColor: '#dde8ec', flex: '1 1 0', minWidth: '0' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'white', border: '1px solid #d0e9ef' }}>
                      <i className="fas fa-indian-rupee-sign text-xs" style={{ color: '#2e6171' }}></i>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#6b7280' }}>Price</p>
                      <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#011936' }}>
                        ₹ {selectedVariant?.price ? formatPriceInINR(selectedVariant.price) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* ── Units Available ── */}
                  <div className="flex items-center gap-3 px-5 py-4 border-r" style={{ borderColor: '#dde8ec', flex: '1 1 0', minWidth: '0' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: selectedVariant?.quantity > 0 ? '#dcfce7' : '#fee2e2' }}>
                      <i className={`fas ${selectedVariant?.quantity > 0 ? 'fa-check-circle' : 'fa-times-circle'} text-xs`}
                        style={{ color: selectedVariant?.quantity > 0 ? '#15803d' : '#dc2626' }}></i>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#6b7280' }}>Units Left</p>
                      <p className="text-sm font-bold whitespace-nowrap"
                        style={{ color: selectedVariant?.quantity > 0 ? '#15803d' : '#dc2626' }}>
                        {selectedVariant?.quantity != null ? selectedVariant.quantity.toLocaleString('en-IN') : '—'}
                      </p>
                    </div>
                  </div>

                  {/* ── WhatsApp CTA ── */}
                  <div className="flex items-center px-4 py-3 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: '0 10px 28px rgba(37,211,102,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleInterested}
                      className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-white text-sm whitespace-nowrap"
                      style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}
                    >
                      <i className="fab fa-whatsapp text-lg"></i>
                      I'm Interested
                    </motion.button>
                  </div>

                </div>
              </div>
            </motion.section>
          )}

          {/* ── VILLA CONFIGURATIONS (Villas) ── */}
          {property.property_type === 'Villas' && property.variants?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl"
              style={{ boxShadow: '0 2px 24px rgba(1,25,54,0.07)', overflow: 'visible' }}
            >
              <div className="px-8 pt-8 pb-6 flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#011936' }}>Villa Configurations</h2>
              </div>

              <div className="px-8 pb-8">
                <div
                  className="flex items-stretch rounded-2xl"
                  style={{ border: '1.5px solid #dde8ec', background: 'linear-gradient(to right, #f4f9fb, #eef5f8)', overflow: 'visible', position: 'relative' }}
                >
                  {/* ── Facing custom dropdown ── */}
                  <div className="relative border-r flex-shrink-0" style={{ borderColor: '#dde8ec', zIndex: blockDropdownOpen ? 50 : 1 }}
                    data-dropdown>
                    <button
                      onClick={() => { setBlockDropdownOpen(o => !o); }}
                      className="flex items-center gap-3 px-5 py-4 h-full w-full text-left transition-colors hover:bg-white/60"
                      style={{ minWidth: '160px' }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2e6171, #011936)' }}>
                        <i className="fas fa-compass text-xs text-white"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#2e6171' }}>Facing</p>
                        <p className="text-sm font-bold truncate" style={{ color: '#011936' }}>{selectedVariant?.facing || '—'}</p>
                      </div>
                      <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ml-1 flex-shrink-0 ${blockDropdownOpen ? 'rotate-180' : ''}`}
                        style={{ color: '#2e6171' }}></i>
                    </button>
                    {/* Facing dropdown panel */}
                    {blockDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden"
                        style={{ minWidth: '180px', background: 'white', boxShadow: '0 12px 40px rgba(1,25,54,0.15)', border: '1px solid #dde8ec', zIndex: 50 }}>
                        {property.variants.map((v, i) => (
                          <button
                            key={v.facing}
                            onClick={() => { handleFacingChange(v.facing); setBlockDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                            style={{
                              background: selectedVariant?.facing === v.facing ? 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' : 'white',
                              borderTop: i > 0 ? '1px solid #f0f4f6' : 'none'
                            }}
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: selectedVariant?.facing === v.facing ? 'linear-gradient(135deg, #2e6171, #011936)' : '#f4f9fb' }}>
                              <i className="fas fa-compass" style={{ fontSize: '10px', color: selectedVariant?.facing === v.facing ? 'white' : '#2e6171' }}></i>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: selectedVariant?.facing === v.facing ? '#011936' : '#374151' }}>{v.facing}</span>
                            {selectedVariant?.facing === v.facing && (
                              <i className="fas fa-check ml-auto text-xs" style={{ color: '#2e6171' }}></i>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Area ── */}
                  <div className="flex items-center gap-3 px-5 py-4 border-r" style={{ borderColor: '#dde8ec', flex: '1 1 0', minWidth: '0' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'white', border: '1px solid #d0e9ef' }}>
                      <i className="fas fa-ruler-combined text-xs" style={{ color: '#2e6171' }}></i>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#6b7280' }}>Area</p>
                      <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#011936' }}>
                        {selectedVariant?.sqft ? selectedVariant.sqft.toLocaleString('en-IN') : '—'}
                        <span className="text-xs font-normal ml-1" style={{ color: '#9ca3af' }}>sq.ft</span>
                      </p>
                    </div>
                  </div>

                  {/* ── Price ── */}
                  <div className="flex items-center gap-3 px-5 py-4 border-r" style={{ borderColor: '#dde8ec', flex: '1 1 0', minWidth: '0' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'white', border: '1px solid #d0e9ef' }}>
                      <i className="fas fa-indian-rupee-sign text-xs" style={{ color: '#2e6171' }}></i>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#6b7280' }}>Price</p>
                      <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#011936' }}>
                        ₹ {selectedVariant?.price ? formatPriceInINR(selectedVariant.price) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* ── Units Available ── */}
                  <div className="flex items-center gap-3 px-5 py-4 border-r" style={{ borderColor: '#dde8ec', flex: '1 1 0', minWidth: '0' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: selectedVariant?.quantity > 0 ? '#dcfce7' : '#fee2e2' }}>
                      <i className={`fas ${selectedVariant?.quantity > 0 ? 'fa-check-circle' : 'fa-times-circle'} text-xs`}
                        style={{ color: selectedVariant?.quantity > 0 ? '#15803d' : '#dc2626' }}></i>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: '#6b7280' }}>Units Left</p>
                      <p className="text-sm font-bold whitespace-nowrap"
                        style={{ color: selectedVariant?.quantity > 0 ? '#15803d' : '#dc2626' }}>
                        {selectedVariant?.quantity != null ? selectedVariant.quantity.toLocaleString('en-IN') : '—'}
                      </p>
                    </div>
                  </div>

                  {/* ── WhatsApp CTA ── */}
                  <div className="flex items-center px-4 py-3 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: '0 10px 28px rgba(37,211,102,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleInterested}
                      className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-white text-sm whitespace-nowrap"
                      style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}
                    >
                      <i className="fab fa-whatsapp text-lg"></i>
                      I'm Interested
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── UNITS AVAILABLE (Plots/Commercial/Others) ── */}
          {property.property_type !== 'Apartment' && property.property_type !== 'Villas' && property.quantity != null && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 2px 24px rgba(1,25,54,0.07)' }}
            >
              <div className="px-8 pt-8 pb-6 flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#011936' }}>Availability</h2>
              </div>
              <div className="px-8 pb-8">
                <div className="flex items-center gap-5 p-5 rounded-2xl" style={{ background: '#f8f6f1', border: '1px solid #e8e4da', maxWidth: '320px' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' }}>
                    <i className="fas fa-home text-2xl" style={{ color: '#2e6171' }}></i>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: '#2e6171' }}>Units Left</p>
                    <p className="text-3xl font-bold" style={{ color: '#011936' }}>{property.quantity.toLocaleString('en-IN')}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{property.property_type} · {property.city}</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── GALLERY ── */}
          {(property.cover_image || property.images?.length > 0) && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 2px 24px rgba(1,25,54,0.07)' }}
            >
              <div className="px-8 pt-8 pb-6 flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#011936' }}>
                  Gallery
                </h2>
              </div>
              <div className="px-8 pb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {property.cover_image && (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    className="cursor-pointer rounded-2xl overflow-hidden relative group"
                    style={{ height: '160px' }}
                    onClick={() => openImageModal(property.cover_image)}
                  >
                    <img src={property.cover_image} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <i className="fas fa-expand text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg"></i>
                    </div>
                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-full" style={{ background: 'rgba(46,97,113,0.85)' }}>Cover</span>
                  </motion.div>
                )}
                {property.images?.map((img, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    className="cursor-pointer rounded-2xl overflow-hidden relative group"
                    style={{ height: '160px' }}
                    onClick={() => openImageModal(img)}
                  >
                    <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <i className="fas fa-expand text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg"></i>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ── AMENITIES ── */}
          {property.amenities?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 2px 24px rgba(1,25,54,0.07)' }}
            >
              <div className="px-8 pt-8 pb-6 flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#011936' }}>
                  Amenities
                </h2>
              </div>
              <div className="px-8 pb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {property.amenities.map((amenity) => {
                  const iconClass = amenity.icon
                    ? (amenity.icon.startsWith('fa') ? `fas ${amenity.icon}` : amenity.icon)
                    : 'fas fa-check-circle';
                  return (
                    <motion.div
                      key={amenity.id}
                      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(46,97,113,0.14)' }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center text-center p-4 rounded-2xl cursor-default"
                      style={{ background: '#f8f6f1', border: '1px solid #e8e4da' }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' }}>
                        <i className={`${iconClass} text-xl`} style={{ color: '#2e6171' }}></i>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: '#011936' }}>{amenity.name}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* ── LOCATION ── */}
          {fullAddress && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 2px 24px rgba(1,25,54,0.07)' }}
            >
              {/* Section header */}
              <div className="px-8 pt-8 pb-5 flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#011936' }}>Location</h2>
              </div>

              {/* Full-width map */}
              <div className="mx-8 rounded-2xl overflow-hidden" style={{ height: '340px', border: '1px solid #e8e4da' }}>
                <iframe
                  title="Property location map"
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>

              {/* Address strip below map */}
              <div className="mx-8 mt-4 mb-8 flex flex-wrap gap-4">
                {/* Address block */}
                <div className="flex items-start gap-3 flex-1 min-w-[200px] rounded-2xl px-5 py-4" style={{ background: '#f8f6f1', border: '1px solid #e8e4da' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' }}>
                    <i className="fas fa-map-marker-alt text-sm" style={{ color: '#2e6171' }}></i>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: '#2e6171' }}>Address</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                      {property.address}, {property.city}, {property.state}
                      {property.pincode && <span style={{ color: '#9ca3af' }}> – {property.pincode}</span>}
                    </p>
                  </div>
                </div>

                {/* Landmark block — only if exists */}
                {property.landmark && (
                  <div className="flex items-start gap-3 flex-1 min-w-[200px] rounded-2xl px-5 py-4" style={{ background: '#f8f6f1', border: '1px solid #e8e4da' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #eaf4f7, #d0e9ef)' }}>
                      <i className="fas fa-landmark text-sm" style={{ color: '#2e6171' }}></i>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: '#2e6171' }}>Landmark</p>
                      <p className="text-sm" style={{ color: '#374151' }}>{property.landmark}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* ── BUILDER CONTACT ── */}
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #011936 0%, #0d3347 50%, #2e6171 100%)', boxShadow: '0 8px 40px rgba(1,25,54,0.25)' }}
          >
            <div className="px-8 pt-8 pb-6 flex items-center gap-3">
              <div className="w-1 h-7 rounded-full bg-white/40" />
              <h2 className="text-2xl font-bold text-white">
                Builder Contact
              </h2>
            </div>
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: 'fa-user-tie', label: 'Builder', value: property.builderName || 'N/A', href: null },
                  { icon: 'fa-phone-alt', label: 'Mobile', value: property.mobile_number || 'N/A', href: property.mobile_number ? `tel:${property.mobile_number}` : null },
                  { icon: 'fa-envelope', label: 'Email', value: property.email || 'N/A', href: property.email ? `mailto:${property.email}` : null },
                ].map(({ icon, label, value, href }) => (
                  <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <i className={`fas ${icon} text-sm`} style={{ color: '#7eb8c4' }}></i>
                      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                    </div>
                    {href ? (
                      <a href={href} className="text-sm font-semibold hover:underline" style={{ color: '#b3dce6' }}>{value}</a>
                    ) : (
                      <p className="text-sm font-semibold text-white">{value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(37,211,102,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleInterested}
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', fontSize: '1rem', letterSpacing: '0.04em', boxShadow: '0 6px 20px rgba(37,211,102,0.25)' }}
                >
                  <i className="fab fa-whatsapp text-xl"></i>
                  I'm Interested
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* ── VIDEO TOUR ── */}
          {property.video?.url && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 2px 24px rgba(1,25,54,0.07)' }}
            >
              <div className="px-8 pt-8 pb-6 flex items-center gap-3">
                <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom, #2e6171, #011936)' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#011936' }}>
                  Video Tour
                </h2>
              </div>
              <div className="px-8 pb-8">
                <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0a0a', maxWidth: '560px' }}>
                  <video controls className="w-full rounded-2xl" onError={handleVideoError} preload="metadata">
                    <source src={property.video.url} type={property.video.mimeType} />
                    Your browser does not support the video tag.
                  </video>
                </div>
                {videoError && (
                  <p className="mt-4 text-sm text-red-500 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i> {videoError}
                  </p>
                )}
              </div>
            </motion.section>
          )}

        </div>
      </main>

      {/* ── LIGHTBOX MODAL ── */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(1,10,20,0.92)', backdropFilter: 'blur(12px)' }}
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.93, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full"
            style={{ maxWidth: '900px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(1,25,54,0.08)', border: '1px solid rgba(1,25,54,0.12)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#011936" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Main image */}
            <div className="relative flex items-center justify-center" style={{ height: 'clamp(280px, 55vh, 520px)', background: '#f0ede6' }}>
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-full object-contain" />
            </div>

            {/* Thumbnails */}
            <div className="p-4 flex gap-2.5 overflow-x-auto" style={{ background: '#faf9f6', borderTop: '1px solid #ece9e0' }}>
              {property.cover_image && (
                <img
                  src={property.cover_image}
                  alt="Cover"
                  onClick={() => setSelectedImage(property.cover_image)}
                  className="cursor-pointer object-cover flex-shrink-0 transition-all duration-200"
                  style={{ width: '72px', height: '72px', borderRadius: '12px', border: selectedImage === property.cover_image ? '2px solid #2e6171' : '2px solid transparent', opacity: selectedImage === property.cover_image ? 1 : 0.65 }}
                />
              )}
              {property.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Thumb ${i + 1}`}
                  onClick={() => setSelectedImage(img)}
                  className="cursor-pointer object-cover flex-shrink-0 transition-all duration-200"
                  style={{ width: '72px', height: '72px', borderRadius: '12px', border: selectedImage === img ? '2px solid #2e6171' : '2px solid transparent', opacity: selectedImage === img ? 1 : 0.65 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />

      <style>{`
        
        .scrollbar-thin::-webkit-scrollbar { height: 5px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #c9c3b5; border-radius: 3px; }
        .blog-content { color: #374151; line-height: 1.8; font-size: 0.95rem; }
        .blog-content p { margin-bottom: 1rem; }
        .blog-content h2, .blog-content h3 { color: #011936; margin: 1.5rem 0 0.5rem; font-weight: 700; }
        .blog-content ul, .blog-content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        .blog-content li { margin-bottom: 0.4rem; }
        .flex-center { display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
};

export default PropertyDetails;