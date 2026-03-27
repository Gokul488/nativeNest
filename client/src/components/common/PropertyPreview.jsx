import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Ruler, 
  IndianRupee, 
  Building2, 
  CheckCircle2, 
  XCircle,
  Home,
  DoorOpen,
  Info,
  Calendar,
  Layers,
  Phone,
  LayoutDashboard,
  Expand,
  ChevronDown
} from "lucide-react";
import API_BASE_URL from '../../config.js';

const PropertyPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json"
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, { headers });
        if (!response.ok) throw new Error("Failed to fetch property details");

        const data = await response.json();
        setProperty(data.property);

        if (data.property.property_type === 'Apartment' && data.property.variants?.length > 0) {
          const firstVariant = data.property.variants[0];
          setSelectedBlock(firstVariant.block_name || 'General');
          setSelectedVariant(firstVariant);
        }
      } catch (err) {
        setError(err.message || "Unable to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return Number(price).toLocaleString('en-IN');
  };

  const DescriptionRenderer = ({ html }) => {
    if (!html || html === '<p><br></p>') {
      return <p className="text-slate-500 italic">No description provided.</p>;
    }
    return (
      <div 
        className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    );
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-500 font-medium animate-pulse">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error || "Property Not Found"}</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-slate-900 text-white px-6 py-2 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const allBlocks = property.property_type === 'Apartment'
    ? [...new Set((property.variants || []).map(v => v.block_name || 'General'))]
    : [];

  const typesForBlock = (blockName) =>
    (property.variants || []).filter(v => (v.block_name || 'General') === blockName);

  const images = [];
  if (property.cover_image) images.push(property.cover_image);
  if (property.images) images.push(...property.images);

  const fullAddress = [
    property.address,
    property.city,
    property.state,
    property.pincode
  ].filter(Boolean).join(', ');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors group mb-2"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Properties
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider border border-indigo-200">
                {property.property_type}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {property.city}, {property.state}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {property.title}
            </h1>
          </div>

          <div className="flex flex-col items-end gap-2 bg-slate-50/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/60 min-w-[200px]">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Price</p>
            <div className="flex items-center gap-1.5 text-indigo-600 font-black text-3xl tracking-tight">
              <span className="text-xl">₹</span>
              <span>
                {property.property_type === 'Apartment' && selectedVariant
                  ? formatPrice(selectedVariant.price)
                  : formatPrice(property.price)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mt-1">
              <Ruler className="w-3.5 h-3.5" />
              <span>
                {property.property_type === 'Apartment' && selectedVariant
                  ? selectedVariant.sqft.toLocaleString('en-IN')
                  : (property.sqft ? property.sqft.toLocaleString('en-IN') : 'N/A')}
                <span className="ml-1 opacity-60">sq.ft</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gallery Preview */}
          {images.length > 0 && (
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100">
              <div className="relative aspect-video group cursor-zoom-in" onClick={() => setSelectedImage(images[0])}>
                <img 
                  src={images[0]} 
                  alt="Primary" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Expand className="text-white w-10 h-10" />
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {images.slice(1).map((img, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all shadow-sm"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About & Features */}
          <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Info className="w-6 h-6 text-indigo-500" />
              Property Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-10 pb-10 border-b border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Builder</p>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <p className="font-bold text-slate-800">{property.builder_name || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability</p>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <p className="font-bold text-slate-800">
                    {property.property_type === 'Apartment' && selectedVariant?.quantity != null
                      ? `${selectedVariant.quantity} Units`
                      : (property.quantity != null ? `${property.quantity} Units` : 'N/A')}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-amber-400" />
                  <p className="font-bold text-slate-800">{property.property_type}</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Description</h3>
            <DescriptionRenderer html={property.description} />
          </div>

          {/* Amenities if any */}
          {property.amenities?.length > 0 && (
            <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-8">Premium Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => (
                  <div 
                    key={amenity.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                      {amenity.icon ? <i className={amenity.icon.startsWith('fa') ? `fas ${amenity.icon}` : `fas fa-star`}></i> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Controls & Location */}
        <div className="space-y-8">
          
          {/* Apartment Variant Selector */}
          {property.property_type === 'Apartment' && property.variants?.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[32px] p-8 shadow-xl text-white">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Select Unit Configuration
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Block Name</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allBlocks.map(block => (
                      <button
                        key={block}
                        onClick={() => {
                          setSelectedBlock(block);
                          setSelectedVariant(typesForBlock(block)[0]);
                        }}
                        className={`py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                          selectedBlock === block 
                            ? 'bg-white text-indigo-600 shadow-lg' 
                            : 'bg-indigo-500/30 text-white hover:bg-indigo-500/50'
                        }`}
                      >
                        {block}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Unit Type</label>
                  <div className="space-y-2">
                    {typesForBlock(selectedBlock).map(variant => (
                      <button
                        key={variant.apartment_type}
                        onClick={() => setSelectedVariant(variant)}
                        className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-left transition-all ${
                          selectedVariant?.apartment_type === variant.apartment_type
                            ? 'bg-white text-indigo-900 shadow-xl scale-[1.02]'
                            : 'bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/40 border border-indigo-400/20'
                        }`}
                      >
                        <div>
                          <p className="font-black text-sm">{variant.apartment_type}</p>
                          <p className={`text-[10px] font-bold ${selectedVariant?.apartment_type === variant.apartment_type ? 'text-indigo-500' : 'text-indigo-300'}`}>
                            {variant.sqft} SQ.FT
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm whitespace-nowrap">₹ {formatPrice(variant.price)}</p>
                          <p className={`text-[10px] font-bold ${variant.quantity > 0 ? 'text-emerald-400' : 'text-red-300'}`}>
                            {variant.quantity > 0 ? `${variant.quantity} Left` : 'Sold Out'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Card */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-500" />
              Quick Specs
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Address', val: property.address, icon: <MapPin className="text-sky-500" /> },
                { label: 'City', val: property.city, icon: <Building2 className="text-indigo-500" /> },
                { label: 'State', val: property.state, icon: <Layers className="text-teal-500" /> },
                { label: 'Pincode', val: property.pincode, icon: <Info className="text-amber-500" /> },
                { label: 'Contact', val: property.mobile_number, icon: <Phone className="text-emerald-500" /> },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-50 flex items-center justify-center shrink-0">
                    {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="font-bold text-slate-700 text-sm truncate">{item.val || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map Preview */}
          <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 overflow-hidden">
            <div className="aspect-square rounded-[26px] overflow-hidden grayscale-[0.5] hover:grayscale-0 transition-all duration-500 border border-slate-100">
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
            <div className="p-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Location</p>
               <p className="text-xs font-bold text-slate-600 leading-relaxed">{fullAddress || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full aspect-video rounded-2xl overflow-hidden shadow-2xl"
            >
              <img src={selectedImage} alt="Large view" className="w-full h-full object-contain bg-black" />
              <button 
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                onClick={() => setSelectedImage(null)}
              >
                <XCircle className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyPreview;
