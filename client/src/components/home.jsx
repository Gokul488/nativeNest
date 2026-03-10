import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './header';
import Footer from './footer';
import OngoingEventsMarquee from "./OngoingEventsMarquee";
import API_BASE_URL from '../config.js';
const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [blogError, setBlogError] = useState('');
  const [propertyError, setPropertyError] = useState('');
  const [propertyTypes, setPropertyTypes] = useState([]);
  const HEADER_HEIGHT = 72;
  const navigate = useNavigate();

  // Format price in INR
  const formatIndianRupees = (number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(number);

  // Fetch Functions
  const fetchBlogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/featured`);
      if (!res.ok) throw new Error('Failed to load blogs');
      const data = await res.json();
      setBlogs(data.blogs || []);
      setBlogError('');
    } catch (err) {
      setBlogError('Unable to load blogs. Please try again.');
    }
  }, []);

  const fetchPropertyTypes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/types`);
      if (!res.ok) return;
      const data = await res.json();
      setPropertyTypes(['All', ...(data.propertyTypes || [])]);
    } catch (err) {
      console.error('Property types error:', err);
    }
  }, []);

  const fetchFeaturedProperties = useCallback(async () => {
    setPropertyError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/featured`);
      if (!res.ok) throw new Error('Failed to load properties');
      const data = await res.json();
      setFeaturedProperties(data.properties || []);
    } catch (err) {
      setPropertyError('Failed to load properties. Retrying...');
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchPropertyTypes();
    fetchFeaturedProperties();
  }, [fetchBlogs, fetchPropertyTypes, fetchFeaturedProperties]);

  // Navigation Handlers
  const goTo = (path) => () => navigate(path);
  const goToProperty = (id) => () => navigate(`/property/${id}`);
  const goToBlog = (id) => () => navigate(`/blog/${id}`);
  const goToCategory = (type) => () => navigate(`/buy?propertyType=${type}`);

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <Header />
      <main style={{ paddingTop: HEADER_HEIGHT }}>
        <OngoingEventsMarquee />
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-linear-to-br from-[#2e6171] to-[#011936] blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-linear-to-tr from-[#2e6171]/70 to-[#011936]/70 blur-3xl opacity-10 animate-pulse [animation-delay:2s]"></div>
        </div>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative h-[300px] sm:h-[400px] md:h-[500px] bg-cover bg-center flex items-center justify-center text-center overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80')`
          }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl px-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-4">
              Discover Your Dream Property with NativeNest
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-6 max-w-2xl mx-auto">
              Explore premium real estate opportunities tailored to your lifestyle
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goTo('/buy')}
              className="bg-[#2e6171] hover:bg-[#011936] text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
            >
              Browse Properties
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Featured Listings */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-[#011936] mb-12"
          >
            Featured Listings
          </motion.h2>

          {propertyError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl max-w-md mx-auto text-center mb-8"
            >
              <p className="font-medium">{propertyError}</p>
              <button
                onClick={fetchFeaturedProperties}
                className="mt-2 bg-[#2e6171] hover:bg-[#011936] text-white px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                Retry
              </button>
            </motion.div>
          )}

          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {featuredProperties.length > 0 ? (
              featuredProperties.slice(0, 3).map((prop, i) => (
                <PropertyCard key={prop.id} property={prop} index={i} onClick={goToProperty(prop.id)} />
              ))
            ) : !propertyError ? (
              <p className="col-span-full text-center text-gray-500">No featured properties</p>
            ) : null}
          </motion.div>

          {featuredProperties.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={goTo('/buy')}
                className="bg-[#2e6171] hover:bg-[#011936] text-white px-8 py-3 rounded-xl font-semibold transition"
              >
                View All Properties
              </button>
            </div>
          )}
        </section>

        {/* Categories */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-[#011936] mb-12"
          >
            Browse by Category
          </motion.h2>

          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {[
              { name: 'Villas', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80' },
              { name: 'Apartment', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80' },
              { name: 'Plots', img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80' },
              { name: 'Commercial', img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80' },
            ].map((cat, i) => (
              <CategoryCard key={i} category={cat} index={i} onClick={goToCategory(cat.name)} />
            ))}
          </motion.div>
        </section>

        {/* Blogs */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center text-[#011936] mb-12"
          >
            From Our Blog
          </motion.h2>

          {blogError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl max-w-md mx-auto text-center mb-8">
              <p>{blogError}</p>
            </div>
          )}

          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {blogs.length > 0 ? (
              blogs.map((blog, i) => (
                <BlogCard key={blog.id} blog={blog} index={i} onClick={goToBlog(blog.id)} />
              ))
            ) : !blogError ? (
              <p className="col-span-full text-center text-gray-500">No blogs available</p>
            ) : null}
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

// Reusable Components
const PropertyCard = ({ property, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    whileHover={{ y: -6, scale: 1.01 }}
    onClick={onClick}
    className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer"
    style={{
      boxShadow: '0 4px 24px 0 rgba(1,25,54,0.08), 0 1px 4px 0 rgba(1,25,54,0.04)',
      transition: 'box-shadow 0.4s ease, transform 0.4s ease',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 48px 0 rgba(1,25,54,0.18), 0 4px 12px 0 rgba(46,97,113,0.12)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(1,25,54,0.08), 0 1px 4px 0 rgba(1,25,54,0.04)'}
  >
    {/* Image Container */}
    <div className="relative h-52 sm:h-56 overflow-hidden">
      <img
        src={property.img}
        alt={property.title}
        className="w-full h-full object-cover"
        style={{ transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        loading="lazy"
      />

      {/* Gradient overlay at bottom */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(1,25,54,0.55) 0%, rgba(1,25,54,0.1) 45%, transparent 100%)' }} />

      {/* Property type pill — top left */}
      <div className="absolute top-3 left-3">
        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase text-white"
          style={{ background: 'rgba(46,97,113,0.85)', backdropFilter: 'blur(8px)', letterSpacing: '0.1em' }}>
          {property.property_type}
        </span>
      </div>

      {/* Sqft badge — bottom left on image */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}>
        <i className="fas fa-vector-square text-[11px]" style={{ color: 'rgba(255,255,255,0.8)' }}></i>
        <span className="text-white font-bold text-[13px] leading-none">
          {property.property_type === 'Apartment' && property.variants?.length > 0
            ? `${property.variants[0].sqft.toLocaleString('en-IN')}–${property.variants[property.variants.length - 1].sqft.toLocaleString('en-IN')}`
            : (property.sqft ? property.sqft.toLocaleString('en-IN') : 'N/A')}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.6)' }}>sq.ft</span>
      </div>
    </div>

    {/* Property Details */}
    <div className="p-5">
      {/* Location */}
      <p className="text-[11px] font-semibold text-[#2e6171] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        <i className="fas fa-location-dot text-[10px]"></i>
        {property.city}
      </p>

      {/* Title */}
      <h3 className="text-[15px] font-bold text-[#011936] mb-3 leading-snug"
        style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {property.title}
      </h3>

      {/* Divider */}
      <div className="h-px mb-3"
        style={{ background: 'linear-gradient(to right, rgba(46,97,113,0.2), rgba(46,97,113,0.1), transparent)' }} />

      {/* Price row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Price</p>
          <p className="text-[17px] font-extrabold text-[#011936] leading-none">
            {property.property_type === 'Apartment' && property.variants?.length > 0
              ? <>₹&nbsp;{Math.floor(property.variants[0].price).toLocaleString('en-IN')} <span className="text-[11px] font-semibold text-gray-400">onwards</span></>
              : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(property.price)}
          </p>
        </div>

        {/* View arrow */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 group-hover:border-[#2e6171] transition-all duration-300 group-hover:scale-110"
          style={{ background: 'transparent' }}>
          <i className="fas fa-arrow-right text-[#2e6171] text-xs group-hover:translate-x-0.5 transition-transform duration-300"></i>
        </div>
      </div>

      {/* Builder */}
      {property.builderName && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-500">
          <i className="fas fa-building text-[#2e6171] text-[10px]"></i>
          <span className="font-medium">{property.builderName}</span>
        </div>
      )}
    </div>
  </motion.div>
);

const CategoryCard = ({ category, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -8 }}
    onClick={onClick}
    className="group cursor-pointer bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100"
  >
    <div className="relative h-48 sm:h-56 overflow-hidden">
      <img
        src={category.img}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="p-6 text-center">
      <h3 className="text-xl font-bold text-[#011936]">{category.name}</h3>
    </div>
  </motion.div>
);

const BlogCard = ({ blog, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -8 }}
    onClick={onClick}
    className="group cursor-pointer bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100"
  >
    <div className="relative h-56 sm:h-64 overflow-hidden">
      <img
        src={blog.image || 'https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?w=800&q=80'}
        alt={blog.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-[#011936] line-clamp-2 mb-2">{blog.title}</h3>
      <p className="text-sm text-[#2e6171] font-medium flex items-center gap-2 mb-3">
        <i className="fas fa-calendar-alt"></i>
        {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
        {blog.excerpt || 'Click to read the full article.'}
      </p>
      <div className="flex items-center gap-2 text-[#2e6171] font-semibold hover:text-[#011936] transition">
        Read More
        <i className="fas fa-arrow-right text-sm group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </motion.div>
);

export default Home;