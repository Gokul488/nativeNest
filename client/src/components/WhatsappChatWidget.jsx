// src/components/WhatsappChatWidget.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import whatsappBg from '../assets/whatsapp-doodle-bg.jpg'; // Your uploaded doodle image
import axios from 'axios'; // Add axios for API call
import API_BASE_URL from '../config'; // Assuming you have this config file

const WhatsappChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminData, setAdminData] = useState({
    name: 'Support',        // Fallback name
    mobile_number: '9442714693'  // Fallback number
  });
  const [loading, setLoading] = useState(true);

  // Fetch admin WhatsApp details on mount
  useEffect(() => {
    const fetchAdminWhatsapp = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/public/admin-whatsapp`);
        if (response.data && response.data.name && response.data.mobile_number) {
          setAdminData({
            name: response.data.name,
            mobile_number: response.data.mobile_number
          });
        }
      } catch (error) {
        console.warn('Failed to fetch admin WhatsApp details, using fallback values.');
        // Silently fall back to default values if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchAdminWhatsapp();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace('AM', 'am').replace('PM', 'pm');
  };

  const phoneNumber = adminData.mobile_number.replace(/\D/g, ''); // Remove any non-digits
  const defaultMessage = "Hi there\nI'm interested in your properties on NativeNest.in";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-2xl border border-gray-200 hover:shadow-2xl transition-all group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            "0 8px 30px rgba(37,211,102,0.25)",
            "0 12px 40px rgba(37,211,102,0.35)",
            "0 8px 30px rgba(37,211,102,0.25)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp text-3xl text-[#25D366]"></i>
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-25 animate-ping"></span>
      </motion.button>

      {/* Compact WhatsApp Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-5 z-50 w-80 max-w-[92vw] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fab fa-whatsapp text-xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    {loading ? 'Loading...' : adminData.name}
                  </h4>
                  <p className="text-xs opacity-90">Typically replies in minutes</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Compact Chat Area with Real WhatsApp Background */}
            <div
              className="h-32 relative"
              style={{
                backgroundImage: `url(${whatsappBg})`,
                backgroundColor: '#0b141a',
                backgroundSize: 'auto',
                backgroundRepeat: 'repeat',
              }}
            >
              <div className="absolute inset-0 bg-black opacity-5"></div>

              {/* Single Message Bubble - Positioned near bottom */}
              <div className="absolute bottom-3 left-4 right-4">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-md inline-block max-w-[80%]">
                  <p className="text-sm text-gray-800">Hi there</p>
                  <p className="text-sm text-gray-800">வணக்கம்</p>
                  <p className="text-xs text-gray-500 text-right mt-1">
                    {formatTime(currentTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Start Chat Button */}
            <div className="p-3 bg-white border-t border-gray-100">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#25D366] hover:bg-[#1DA851] text-white text-center py-3 rounded-full font-medium text-sm shadow-md hover:shadow-lg transition transform active:scale-98"
                onClick={() => setIsOpen(false)}
              >
                Start Chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsappChatWidget;