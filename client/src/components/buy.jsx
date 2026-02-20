import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from "./header";
import Footer from "./footer";
import OngoingEventsMarquee from "./OngoingEventsMarquee";
import { motion, AnimatePresence} from "framer-motion";
import "./buy.css"; // Reuse home styles if needed
import API_BASE_URL from '../config.js';   // ← one level up
const Buy = () => {
  const [properties, setProperties] = useState([]);
  const [propertyError, setPropertyError] = useState('');
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [maxPrice, setMaxPrice] = useState(0);
  const [selectedMinPrice, setSelectedMinPrice] = useState(0);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(0);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('All');
  const [builders, setBuilders] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState('All');

  const [toast, setToast] = useState(null);
  const HEADER_HEIGHT = 72;
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const navigate = useNavigate();
  const location = useLocation();
  const isInitialLoad = useRef(true);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!token && user.account_type === 'buyer';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseCurrency = (value) => {
    return Number(value.toString().replace(/[^0-9.-]+/g, '')) || 0;
  };

  // Toast Notification Function
  const showToast = (message, type = 'success', action = null) => {
    setToast({ message, type, action });
    setTimeout(() => setToast(null), 4000); // Auto hide after 4s
  };

  // Fetch user's bookmarks
  const fetchBookmarks = useCallback(async () => {
    if (!isLoggedIn) {
      setBookmarks(new Set());
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBookmarks(new Set(data.bookmarks.map(b => b.property_id)));
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  }, [isLoggedIn, token]);

  // Toggle bookmark
const toggleBookmark = async (e, propertyId, propertyTitle) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    const wasBookmarked = bookmarks.has(propertyId);
    const method = wasBookmarked ? 'DELETE' : 'POST';

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks/${propertyId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setBookmarks(prev => {
          const newSet = new Set(prev);
          if (wasBookmarked) newSet.delete(propertyId);
          else newSet.add(propertyId);
          return newSet;
        });

        // Show appropriate toast
        if (!wasBookmarked) {
          showToast(
            `The property has been bookmarked!`,
            'success',
            () => navigate('/buyer-dashboard/bookmarks')
          );
        } else {
          showToast(`"${propertyTitle}" removed from bookmarks.`, 'info');
        }
      } else {
        const error = await response.json();
        console.error('Bookmark error:', error);
        showToast('Failed to update bookmark. Try again.', 'error');
      }
    } catch (err) {
      console.error('Network error on bookmark:', err);
      showToast('Network error. Please check your connection.', 'error');
    }
  };

  // Memoized fetch functions
  const fetchPropertyTypes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/properties/types`);
      if (!response.ok) throw new Error(`Failed to fetch property types`);
      const data = await response.json();
      setPropertyTypes(['All', ...(data.propertyTypes || [])]);
    } catch (err) {
      console.error('Property types fetch error:', err.message);
    }
  }, []);

  const fetchBuilders = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/properties/builders`);
      if (!response.ok) throw new Error(`Failed to fetch builders`);
      const data = await response.json();
      setBuilders(['All', ...(data.builders || [])]);
    } catch (err) {
      console.error('Builders fetch error:', err.message);
    }
  }, []);

  const fetchMaxPrice = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/properties/max-price`);
      if (!response.ok) throw new Error(`Failed to fetch max price`);
      const data = await response.json();
      const fetchedMaxPrice = data.maxPrice || 0;
      setMaxPrice(fetchedMaxPrice);
      setSelectedMaxPrice(prev => (prev === 0 || prev > fetchedMaxPrice) ? fetchedMaxPrice : prev);
    } catch (err) {
      console.error('Max price fetch error:', err.message);
    }
  }, []);

  const fetchProperties = useCallback(async (filters = {}) => {
    setPropertyError('');
    try {
      const queryParams = new URLSearchParams();
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.minPrice > 0 || filters.maxPrice < maxPrice) {
        queryParams.append('priceRange', `${filters.minPrice}-${filters.maxPrice}`);
      }
      if (filters.propertyType && filters.propertyType !== 'All') queryParams.append('propertyType', filters.propertyType);
      if (filters.builder && filters.builder !== 'All') queryParams.append('builder', filters.builder);

      const url = `${API_BASE_URL}/api/properties/featured?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch properties: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error('Property fetch error:', err.message);
      setPropertyError(`Unable to load properties: ${err.message}.`);
      setProperties([]);
    }
  }, [maxPrice]);

  // Initial data fetches
  useEffect(() => {
    fetchPropertyTypes();
    fetchMaxPrice();
    fetchBuilders();
    fetchBookmarks();
  }, [fetchPropertyTypes, fetchMaxPrice, fetchBuilders, fetchBookmarks]);

  // Handle URL params and initial load
  useEffect(() => {
    if (maxPrice === 0 && isInitialLoad.current) return;

    const params = new URLSearchParams(location.search);
    const initialLocation = params.get('location') || '';
    const initialPriceRange = params.get('priceRange') || '';
    const initialPropertyType = params.get('propertyType') || 'All';
    const initialBuilder = params.get('builder') || 'All';

    setSearchLocation(initialLocation);
    setSelectedPropertyType(initialPropertyType);
    setSelectedBuilder(initialBuilder);

    let minPriceParam = 0;
    let maxPriceParam = maxPrice;

    if (initialPriceRange) {
      const [min, max] = initialPriceRange.split('-').map(Number);
      minPriceParam = min || 0;
      maxPriceParam = max || maxPrice;
    }

    setSelectedMinPrice(Math.max(0, Math.min(minPriceParam, maxPrice)));
    setSelectedMaxPrice(Math.min(maxPrice, Math.max(maxPriceParam, 0)));

    const filters = {
      location: initialLocation,
      minPrice: Math.max(0, Math.min(minPriceParam, maxPrice)),
      maxPrice: Math.min(maxPrice, Math.max(maxPriceParam, 0)),
      propertyType: initialPropertyType,
      builder: initialBuilder,
    };

    fetchProperties(filters);
    isInitialLoad.current = false;
  }, [fetchProperties, location.search, maxPrice]);

  const applyFilters = useCallback(() => {
    const filters = {
      location: searchLocation,
      minPrice: selectedMinPrice,
      maxPrice: selectedMaxPrice,
      propertyType: selectedPropertyType,
      builder: selectedBuilder,
    };
    fetchProperties(filters);

    const queryParams = new URLSearchParams();
    if (searchLocation) queryParams.append('location', searchLocation);
    if (selectedMinPrice > 0 || selectedMaxPrice < maxPrice) {
      queryParams.append('priceRange', `${selectedMinPrice}-${selectedMaxPrice}`);
    }
    if (selectedPropertyType && selectedPropertyType !== 'All') queryParams.append('propertyType', selectedPropertyType);
    if (selectedBuilder && selectedBuilder !== 'All') queryParams.append('builder', selectedBuilder);
    navigate(`/buy?${queryParams.toString()}`);

    setIsSidebarOpen(false);
  }, [searchLocation, selectedMinPrice, selectedMaxPrice, selectedPropertyType, selectedBuilder, maxPrice, fetchProperties, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  const updateFiltersAndNavigate = useCallback((newFilters) => {
    const combinedFilters = {
      location: searchLocation,
      minPrice: selectedMinPrice,
      maxPrice: selectedMaxPrice,
      propertyType: selectedPropertyType,
      builder: selectedBuilder,
      ...newFilters,
    };
    fetchProperties(combinedFilters);

    const queryParams = new URLSearchParams();
    if (combinedFilters.location) queryParams.append('location', combinedFilters.location);
    if (combinedFilters.minPrice > 0 || combinedFilters.maxPrice < maxPrice) {
      queryParams.append('priceRange', `${combinedFilters.minPrice}-${combinedFilters.maxPrice}`);
    }
    if (combinedFilters.propertyType && combinedFilters.propertyType !== 'All') queryParams.append('propertyType', combinedFilters.propertyType);
    if (combinedFilters.builder && combinedFilters.builder !== 'All') queryParams.append('builder', combinedFilters.builder);
    navigate(`/buy?${queryParams.toString()}`);
  }, [searchLocation, selectedMinPrice, selectedMaxPrice, selectedPropertyType, selectedBuilder, maxPrice, fetchProperties, navigate]);

  const clearLocation = () => {
    setSearchLocation('');
    updateFiltersAndNavigate({ location: '' });
  };

  const resetFilters = useCallback(() => {
    setSearchLocation('');
    setSelectedPropertyType('All');
    setSelectedBuilder('All');
    setSelectedMinPrice(0);
    setSelectedMaxPrice(maxPrice);

    navigate('/buy', { replace: true });
    fetchProperties({
      location: '',
      minPrice: 0,
      maxPrice,
      propertyType: 'All',
      builder: 'All',
    });
    setIsSidebarOpen(false);
  }, [maxPrice, fetchProperties, navigate]);

  // Slider handlers
  const handleMinPriceChange = (e) => {
    const newMin = Number(e.target.value);
    setSelectedMinPrice(Math.min(newMin, selectedMaxPrice));
  };

  const handleMaxPriceChange = (e) => {
    const newMax = Number(e.target.value);
    setSelectedMaxPrice(Math.max(newMax, selectedMinPrice));
  };

  const handleMinPriceInputChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = parseCurrency(rawValue);
    const clampedValue = Math.max(0, Math.min(numericValue, selectedMaxPrice, maxPrice));
    setSelectedMinPrice(clampedValue);
  };

  const handleMaxPriceInputChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = parseCurrency(rawValue);
    const clampedValue = Math.min(maxPrice, Math.max(numericValue, selectedMinPrice, 0));
    setSelectedMaxPrice(clampedValue);
  };

  const handleMinPriceBlur = () => {
    if (selectedMinPrice > selectedMaxPrice) {
      setSelectedMinPrice(selectedMaxPrice);
    }
  };

  const handleMaxPriceBlur = () => {
    if (selectedMaxPrice < selectedMinPrice) {
      setSelectedMaxPrice(selectedMinPrice);
    }
  };

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-blue-50 to-white overflow-hidden font-sans">
      <Header />
      <main style={{ paddingTop: HEADER_HEIGHT }}>
      <OngoingEventsMarquee />
      <section className="pt-8 sm:pt-10 pb-16 px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="flex items-center justify-between md:justify-center mb-10">
          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex items-center justify-center w-12 h-12 text-[#011936] text-3xl hover:bg-[#2e6171]/10 transition-colors duration-200 rounded-full"
              aria-label="Open filters"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-center text-[#011936] tracking-tight text-balance flex-1 md:flex-none">
            Find Your Dream Property
          </h1>

          <div className="md:hidden w-12"></div>
        </div>

        {/* Desktop Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-7xl mx-auto mb-12 border border-gray-100 hidden md:block"
        >
          <form onSubmit={handleSearch} className="relative">
            <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
              <div className="w-full xl:w-auto flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative w-full md:w-56">
                  <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#2e6171] focus-within:border-[#2e6171] transition-all duration-300 shadow-sm bg-gray-50/70 overflow-hidden">
                    <i className="fa-solid fa-location-dot text-[#2e6171] ml-4 text-lg"></i>
                    <input
                      id="location-search"
                      type="text"
                      placeholder="Search by city..."
                      className="h-12 grow px-3 text-base bg-transparent focus:outline-none placeholder-gray-500"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                    {searchLocation && (
                      <button
                        type="button"
                        onClick={clearLocation}
                        className="mr-3 text-gray-500 hover:text-[#011936] transition-colors"
                        aria-label="Clear location search"
                      >
                        <i className="fa-solid fa-circle-xmark text-xl"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative w-full md:w-40">
                  <select
                    className="h-12 border border-gray-300 pr-10 pl-4 rounded-xl w-full text-base focus:outline-none focus:ring-2 focus:ring-[#2e6171] focus:border-[#2e6171] transition-all duration-300 shadow-sm bg-gray-50/70 cursor-pointer appearance-none"
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    {propertyTypes.filter(type => type !== 'All').map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[#2e6171] pointer-events-none"></i>
                </div>

                <div className="relative w-full md:w-40">
                    <select
                      className="h-12 border border-gray-300 pr-10 pl-4 rounded-xl w-full text-base focus:outline-none focus:ring-2 focus:ring-[#2e6171] focus:border-[#2e6171] transition-all duration-300 shadow-sm bg-gray-50/70 cursor-pointer appearance-none"
                      value={selectedBuilder}
                      onChange={(e) => setSelectedBuilder(e.target.value)}
                    >
                      <option value="All">All Builders</option>
                      {builders.filter(b => b !== 'All').map((builder, index) => (
                        // Access builder.name instead of rendering the whole object
                        <option key={index} value={builder.name}>{builder.name}</option>
                      ))}
                    </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[#2e6171] pointer-events-none"></i>
                </div>
              </div>

              <div className="w-full xl:w-64 flex items-center gap-2">
                <div className="relative grow">
                  <div className="relative h-2 mb-4 mt-2">
                    <div className="absolute w-full h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>
                    <div
                      className="absolute h-1 bg-[#2e6171] rounded-full top-1/2 -translate-y-1/2 transition-all duration-150 ease-out"
                      style={{
                        left: `${(selectedMinPrice / maxPrice) * 100}%`,
                        width: `${((selectedMaxPrice - selectedMinPrice) / maxPrice) * 100}%`,
                      }}
                    ></div>
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      step={1000}
                      value={selectedMinPrice}
                      onChange={handleMinPriceChange}
                      className="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer price-range-slider"
                      style={{ zIndex: 3 }}
                      aria-label="Minimum price"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      step={1000}
                      value={selectedMaxPrice}
                      onChange={handleMaxPriceChange}
                      className="absolute top-0 left-0 w-full h-2 bg-transparent appearance-none cursor-pointer price-range-slider"
                      style={{ zIndex: 2 }}
                      aria-label="Maximum price"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      className="flex-1 text-center border border-gray-300 rounded-xl px-2 py-1 text-sm bg-white font-medium text-[#011936] focus:outline-none focus:ring-2 focus:ring-[#2e6171] focus:border-[#2e6171]"
                      value={formatCurrency(selectedMinPrice)}
                      onChange={handleMinPriceInputChange}
                      onBlur={handleMinPriceBlur}
                      aria-label="Minimum price input"
                    />
                    <span className="text-[#011936] text-sm font-semibold">-</span>
                    <input
                      type="text"
                      className="flex-1 text-center border border-gray-300 rounded-xl px-2 py-1 text-sm bg-white font-medium text-[#011936] focus:outline-none focus:ring-2 focus:ring-[#2e6171] focus:border-[#2e6171]"
                      value={formatCurrency(selectedMaxPrice)}
                      onChange={handleMaxPriceInputChange}
                      onBlur={handleMaxPriceBlur}
                      aria-label="Maximum price input"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-gray-100 text-[#011936] h-12 w-12 rounded-xl font-semibold hover:bg-gray-200 transition duration-300 shadow-sm flex items-center justify-center text-sm shrink-0"
                  aria-label="Reset all filters"
                >
                  <i className="fa-solid fa-rotate-right text-lg"></i>
                </button>
                <button
                  type="submit"
                  className="bg-[#2e6171] text-white h-12 px-6 rounded-xl font-bold text-base hover:bg-[#011936] transition duration-300 shadow-lg flex items-center justify-center transform hover:scale-[1.01] w-auto shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Mobile Sidebar */}
        <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleSidebar}></div>

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: isSidebarOpen ? 0 : "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold tracking-tight text-lg text-[#011936]">Filters</h2>
              <button onClick={toggleSidebar} className="text-[#011936]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-4rem)]">
              <div className="location-search-container">
                <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#2e6171]">
                  <i className="fa-solid fa-location-dot text-[#2e6171] ml-3"></i>
                  <input
                    id="mobile-location"
                    type="text"
                    placeholder="Search by city..."
                    className="h-11 grow px-3 bg-transparent focus:outline-none"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                  {searchLocation && (
                    <button type="button" onClick={clearLocation} className="mr-3 text-gray-500 hover:text-[#011936]">
                      <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <select
                  className="h-11 w-full border border-gray-300 rounded-xl pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#2e6171] appearance-none"
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  {propertyTypes.filter(t => t !== 'All').map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[#2e6171] pointer-events-none"></i>
              </div>

              <div className="relative">
                  <select
                    className="h-11 w-full border border-gray-300 rounded-xl pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#2e6171] appearance-none"
                    value={selectedBuilder}
                    onChange={(e) => setSelectedBuilder(e.target.value)}
                  >
                    <option value="All">All Builders</option>
                    {builders.filter(b => b !== 'All').map((builder, i) => (
                      <option key={i} value={builder.name}>{builder.name}</option>
                    ))}
                  </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[#2e6171] pointer-events-none"></i>
              </div>

              <div className="space-y-3">
                <div className="relative h-2">
                  <div className="absolute inset-x-0 h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>
                  <div
                    className="absolute h-1 bg-[#2e6171] rounded-full top-1/2 -translate-y-1/2 transition-all"
                    style={{
                      left: `${(selectedMinPrice / maxPrice) * 100}%`,
                      width: `${((selectedMaxPrice - selectedMinPrice) / maxPrice) * 100}%`,
                    }}
                  ></div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={1000}
                    value={selectedMinPrice}
                    onChange={handleMinPriceChange}
                    className="absolute inset-0 w-full price-range-slider"
                  />
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={1000}
                    value={selectedMaxPrice}
                    onChange={handleMaxPriceChange}
                    className="absolute inset-0 w-full price-range-slider"
                  />
                </div>

                <div className="flex gap-2 items-center text-sm">
                  <input
                    type="text"
                    className="flex-1 text-center border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#2e6171]"
                    value={formatCurrency(selectedMinPrice)}
                    onChange={handleMinPriceInputChange}
                    onBlur={handleMinPriceBlur}
                  />
                  <span className="text-[#011936]">-</span>
                  <input
                    type="text"
                    className="flex-1 text-center border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#2e6171]"
                    value={formatCurrency(selectedMaxPrice)}
                    onChange={handleMaxPriceInputChange}
                    onBlur={handleMaxPriceBlur}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 bg-gray-100 text-[#011936] h-10 rounded-lg flex items-center justify-center text-sm font-medium hover:bg-gray-200"
                >
                  <i className="fa-solid fa-rotate-right mr-1"></i> Reset
                </button>
                <button
                  type="submit"
                  onClick={handleSearch}
                  className="flex-1 bg-[#2e6171] text-white h-10 rounded-lg font-medium text-sm hover:bg-[#011936]"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error Message */}
        {propertyError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl mb-8 text-center shadow-md"
          >
            <p className="mb-3">{propertyError}</p>
            <button
              onClick={applyFilters}
              className="bg-[#2e6171] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#011936] transition duration-300 shadow-md"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Property Grid - Matches Home Page Style */}
              <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {properties.length > 0 ? (
            properties.map((listing, i) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                onClick={() => handlePropertyClick(listing.id)}
                className="group relative bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative h-56 sm:h-64 overflow-hidden">
                  <img
                    src={listing.img}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Bookmark Icon - Bottom Right of Image */}
                  <button
                    onClick={(e) => toggleBookmark(e, listing.id)}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:scale-110 transition-all z-10"
                    title={bookmarks.has(listing.id) ? "Remove from bookmarks" : "Add to bookmarks"}
                    aria-label={bookmarks.has(listing.id) ? "Remove bookmark" : "Bookmark property"}
                  >
                    {bookmarks.has(listing.id) ? (
                      <i className="fa-solid fa-bookmark text-red-500 text-xl"></i>
                    ) : (
                      <i className="fa-regular fa-bookmark text-gray-700 text-xl"></i>
                    )}
                  </button>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#011936] mb-2 tracking-tight line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-[#2e6171] font-medium mb-2 flex items-center gap-2">
                    <i className="fas fa-location-dot"></i>
                    {listing.city}
                  </p>
                  <p className="text-lg font-bold text-[#011936] mb-3">
                    {formatCurrency(listing.price)}
                  </p>

                  {listing.builderName && (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-building"></i>
                        Builder: {listing.builderName}
                      </div>
                      <div className="flex items-center text-[#2e6171] font-semibold">
                        <i className="fas fa-arrow-right text-sm transform group-hover:translate-x-2 transition-transform duration-300"></i>
                      </div>
                    </div>
                  )}
                </div>

                {/* Full card hover overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-[#2e6171]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </motion.div>
            ))
          ) : (
            !propertyError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center text-gray-500 text-lg py-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100"
              >
                No properties found matching your criteria. Try adjusting your filters.
              </motion.p>
            )
          )}
        </motion.div>
      </section>
      </main>
      <Footer />


      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm"
          >
            <div className={`p-5 rounded-xl shadow-xxl border backdrop-blur-lg text-white flex items-start gap-4 ${
              toast.type === 'success' ? 'bg-linear-to-r from-teal-600 to-emerald-600 border-teal-400' :
              toast.type === 'error' ? 'bg-linear-to-r from-red-600 to-pink-600 border-red-400' :
              'bg-linear-to-r from-blue-600 to-indigo-600 border-blue-400'
            }`}>
              <div className="text-2xl">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action();
                      setToast(null);
                    }}
                    className="mt-2 text-sm underline hover:no-underline font-medium"
                  >
                    View Bookmarked Properties →
                  </button>
                )}
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-white/70 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Custom Line Clamp Styles */}
      <style jsx>{`
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
};

export default Buy;