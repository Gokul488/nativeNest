import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "./header";
import Footer from "./footer";
import { motion } from "framer-motion";
import API_BASE_URL from '../config.js';   // ← one level up

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [videoError, setVideoError] = useState('');
  const navigate = useNavigate();

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
    if (!property?.sqft || !property?.price || property.sqft <= 0) {
      return 'N/A';
    }
    const rate = property.price / property.sqft;
    return formatPriceInINR(Math.round(rate));
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
      if (data.property.property_type === 'Apartment' && data.property.variants?.length > 0) {
        setSelectedVariant(data.property.variants[0]);
      } else {
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
          className="relative w-full overflow-hidden"
          style={{ height: 'clamp(420px, 60vh, 680px)' }}
        >
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
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 lg:px-16 pb-10">
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
                    ₹ {property.property_type === 'Apartment' && selectedVariant
                      ? formatPriceInINR(selectedVariant.price)
                      : formatPriceInINR(property.price)}
                  </span>
                </div>

                <div className="flex flex-col" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', padding: '12px 20px', minWidth: '130px' }}>
                  <span className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Area</span>
                  <span className="text-white font-bold" style={{ fontSize: '1.15rem' }}>
                    {property.property_type === 'Apartment' && selectedVariant
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
              </div>

              {/* Variant selector */}
              {property.property_type === 'Apartment' && property.variants?.length > 0 && (
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest mb-2">Select Configuration</p>
                  <div className="flex flex-wrap gap-2">
                    {property.variants.map((variant, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariant(variant)}
                        className="text-xs font-semibold transition-all duration-300"
                        style={{
                          padding: '7px 16px',
                          borderRadius: '100px',
                          border: selectedVariant?.apartment_type === variant.apartment_type && selectedVariant?.sqft === variant.sqft
                            ? '1px solid #7eb8c4'
                            : '1px solid rgba(255,255,255,0.25)',
                          background: selectedVariant?.apartment_type === variant.apartment_type && selectedVariant?.sqft === variant.sqft
                            ? 'rgba(46,97,113,0.9)'
                            : 'rgba(255,255,255,0.08)',
                          color: 'white',
                          backdropFilter: 'blur(8px)',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {variant.apartment_type} · {variant.sqft.toLocaleString('en-IN')} sq.ft
                      </button>
                    ))}
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