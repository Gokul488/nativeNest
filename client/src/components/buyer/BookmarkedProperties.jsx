import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBookmark } from 'react-icons/fa';
import API_BASE_URL from '../../config.js';

const BookmarkedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  useEffect(() => {
    const fetchBookmarked = async () => {
      if (!token) {
        setError('Please log in to view bookmarks');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/bookmarks/properties`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (!res.ok) throw new Error('Failed to fetch bookmarks');

        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarked();
  }, [token, navigate]);

  const handlePropertyClick = (id) => navigate(`/property/${id}`);

  if (loading) return <p className="text-center py-20 text-gray-600 text-lg">Loading bookmarked properties...</p>;
  if (error) return <p className="text-center text-red-600 py-20 text-lg font-medium">{error}</p>;

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto"> {/* Wider container */}
        <h2 className="text-3xl font-bold text-gray-800 mb-10 flex items-center gap-4">
          <FaBookmark className="text-red-500 text-4xl" />
          My Bookmarked Properties
        </h2>

        {properties.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow-lg border border-gray-100">
            <FaBookmark className="mx-auto text-gray-300 text-8xl mb-6" />
            <p className="text-xl text-gray-600">
              You haven't bookmarked any properties yet.
            </p>
            <p className="text-gray-500 mt-2">
              Start exploring and save your favorites!
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" // Added 5 columns on largest screens
          >
            {properties.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => handlePropertyClick(listing.id)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img 
                    src={listing.img} 
                    alt={listing.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#011936] mb-3 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-[#2e6171] font-medium mb-3 flex items-center gap-2">
                    <i className="fas fa-location-dot"></i> {listing.city}
                  </p>
                  <p className="text-2xl font-bold text-[#011936] mb-4">
                    {formatCurrency(listing.price)}
                  </p>
                  {listing.builderName && (
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <i className="fas fa-building"></i>
                      <span>{listing.builderName}</span>
                    </div>
                  )}
                </div>

                {/* Hover arrow indicator */}
                <div className="absolute bottom-6 right-6 text-[#2e6171] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <i className="fas fa-arrow-right text-2xl"></i>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookmarkedProperties;