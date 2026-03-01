import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "./header";
import Footer from "./footer";
import { motion } from "framer-motion";
import API_BASE_URL from '../config.js';   // ← one level up

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
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

    const message = encodeURIComponent(`Hello, I'm interested in ${property.title} (ID: ${property.id}).`);
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
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="grow flex-center pt-24">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#2e6171] text-xl font-medium"
          >
            Fetching Property...
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="grow flex-center pt-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md w-full text-center"
          >
            <i className="fas fa-exclamation-triangle text-xl mb-2 block"></i>
            {error}
            <button
              onClick={fetchPropertyDetails}
              className="mt-4 bg-[#2e6171] text-white px-6 py-2 rounded-full font-medium hover:bg-[#011936] transition"
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
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="grow flex-center pt-24">
          <p className="text-gray-700 font-semibold text-lg">Property Not Found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <Header />

      {/* Background Orbs */}
      <div className="hidden lg:block fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-[#2e6171]/70 to-[#011936]/70 rounded-full blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl mb-16"
        >
          {property.cover_image ? (
            <div className="relative h-[350px] sm:h-[450px] md:h-[550px]">
              <img
                src={property.cover_image}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">
                  {property.title}
                </h1>
                <p className="text-xl sm:text-2xl font-bold mt-2 flex items-center drop-shadow-md">
                  <i className="fa-solid fa-indian-rupee-sign mr-2"></i>{formatPriceInINR(property.price)}
                </p>
                <p className="mt-2 text-sm sm:text-base font-light opacity-90 flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {property.address}, {property.city}, {property.state}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[350px] sm:h-[450px] md:h-[550px] bg-linear-to-br from-gray-200 to-gray-300 flex-center">
              <i className="fas fa-home text-6xl text-gray-400"></i>
            </div>
          )}
        </motion.section>

        <div className="space-y-12">

          {/* Description */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#011936] mb-6 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
              <i className="fas fa-info-circle text-[#2e6171]"></i> About This Property
            </h2>
            <DescriptionRenderer html={property.description} />
          </motion.section>

          {/* Images Gallery */}
          {(property.cover_image || (property.images && property.images.length > 0)) && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#011936] mb-6 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                <i className="fas fa-images text-[#2e6171]"></i> Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {property.cover_image && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                    onClick={() => openImageModal(property.cover_image)}
                  >
                    <img src={property.cover_image} alt="Cover" className="w-full h-40 object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow" />
                  </motion.div>
                )}
                {property.images?.map((img, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                    onClick={() => openImageModal(img)}
                  >
                    <img src={img} alt={`Image ${index + 1}`} className="w-full h-40 object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#011936] mb-6 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                <i className="fas fa-star text-[#2e6171]"></i> Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {property.amenities.map((amenity) => {
                  const iconClass = amenity.icon
                    ? (amenity.icon.startsWith('fa') ? `fas ${amenity.icon}` : amenity.icon)
                    : 'fas fa-check-circle';

                  return (
                    <motion.div
                      key={amenity.id}
                      whileHover={{ y: -6, scale: 1.05 }}
                      className="flex flex-col items-center p-5 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-[#2e6171]/40 hover:shadow-lg transition-all"
                    >
                      <i className={`${iconClass} text-3xl text-[#2e6171] mb-3`}></i>
                      <p className="text-gray-800 font-medium text-center text-sm">{amenity.name}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Location - Address + Map */}
          {fullAddress && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#011936] mb-6 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                <i className="fas fa-map-marked-alt text-[#2e6171]"></i> Location
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Address Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-[#2e6171]"></i> Property Address
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {property.address}<br />
                      {property.city}, {property.state}<br />
                      {property.pincode && `PIN: ${property.pincode}`}
                    </p>
                  </div>

                  {property.landmark && (
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-landmark text-[#2e6171]"></i> Landmark
                      </h3>
                      <p className="text-gray-700">{property.landmark}</p>
                    </div>
                  )}
                </div>

                {/* Right: Google Map Embed */}
                <div className="rounded-xl overflow-hidden shadow-inner border border-gray-200 h-[400px] md:h-auto">
                  <iframe
                    title="Property location map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              </div>
            </motion.section>
          )}

          {/* Builder Contact */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#011936] mb-6 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
              <i className="fas fa-headset text-[#2e6171]"></i> Builder Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div whileHover={{ y: -4 }} className="p-5 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-[#2e6171]/30 hover:shadow-lg transition-all">
                <div className="flex items-center text-gray-700 mb-2">
                  <i className="fas fa-user-tie mr-3 text-lg text-[#2e6171]"></i>
                  <span className="font-semibold text-base">Builder Name:</span>
                </div>
                <p className="text-gray-700 text-sm">{property.builderName || 'N/A'}</p>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="p-5 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-[#2e6171]/30 hover:shadow-lg transition-all">
                <div className="flex items-center text-gray-700 mb-2">
                  <i className="fas fa-phone-alt mr-3 text-lg text-[#2e6171]"></i>
                  <span className="font-semibold text-base">Mobile:</span>
                </div>
                <p className="text-sm">
                  {property.mobile_number ? (
                    <a href={`tel:${property.mobile_number}`} className="text-[#2e6171] hover:text-[#011936] font-medium">
                      {property.mobile_number}
                    </a>
                  ) : 'N/A'}
                </p>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="p-5 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-[#2e6171]/30 hover:shadow-lg transition-all">
                <div className="flex items-center text-gray-700 mb-2">
                  <i className="fas fa-envelope mr-3 text-lg text-[#2e6171]"></i>
                  <span className="font-semibold text-base">Email:</span>
                </div>
                <p className="text-sm">
                  {property.email ? (
                    <a href={`mailto:${property.email}`} className="text-[#2e6171] hover:text-[#011936] font-medium">
                      {property.email}
                    </a>
                  ) : 'N/A'}
                </p>
              </motion.div>
            </div>

            {/* Interested Button */}
            <div className="mt-8 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#2e6171] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                onClick={handleInterested}
              >
                <i className="fab fa-whatsapp text-xl"></i> I'm Interested
              </motion.button>
            </div>
          </motion.section>

          {/* Video Tour */}
          {property.video?.url && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#011936] mb-6 flex items-center gap-3 border-b-2 border-gray-200 pb-3">
                <i className="fas fa-video text-[#2e6171]"></i> Video Tour
              </h2>
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200 shadow-inner">
                <video controls className="w-full max-w-md rounded-lg shadow-lg" onError={handleVideoError} preload="metadata">
                  <source src={property.video.url} type={property.video.mimeType} />
                  Your browser does not support the video tag.
                </video>
                {videoError && (
                  <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-200 font-medium">
                    {videoError}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex-center p-4 md:p-8 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white/90 text-gray-700 p-2 rounded-full hover:bg-white hover:shadow-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-full h-96 md:h-[500px] bg-gray-100 flex-center overflow-hidden">
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-full object-contain" />
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {property.cover_image && (
                  <img
                    src={property.cover_image}
                    alt="Cover thumb"
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${selectedImage === property.cover_image
                      ? 'border-[#2e6171] shadow-md scale-105'
                      : 'border-transparent hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedImage(property.cover_image)}
                  />
                )}
                {property.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Thumb ${i + 1}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${selectedImage === img
                      ? 'border-[#2e6171] shadow-md scale-105'
                      : 'border-transparent hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}


      <Footer />

      {/* Custom scrollbar */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar { height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .flex-center { display: flex; align-items: center; justify-content: center; }
      `}</style>
    </div>
  );
};

export default PropertyDetails;