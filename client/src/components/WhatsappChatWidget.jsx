// src/components/WhatsappChatWidget.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WhatsappChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  // State to hold current time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute (60000 ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Updates every minute

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, []);

  // Format time like WhatsApp: 15:05 or 3:05 PM
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace('AM', 'am').replace('PM', 'pm');
  };

  const phoneNumber = "9442714693";
  const defaultMessage = "Hi there\nI'm interested in your properties on NativeNest.com";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <>
      {/* Floating WhatsApp Icon */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1DA851] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp text-3xl"></i>
      </motion.button>

      {/* Chat Bubble */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-[#075E54] text-white p-4 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition"
                aria-label="Close chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fab fa-whatsapp text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold">Gokul</h4>
                  <p className="text-xs opacity-90">Typically replies in minutes</p>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-5 bg-linear-to-b from-gray-50 to-white">
              <div className="space-y-3">
                <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm inline-block max-w-[85%]">
                  <p className="text-gray-800 text-sm">Hi there</p>
                  <p className="text-gray-800 text-sm mt-1">வணக்கம்</p>
                  {/* Dynamic Time */}
                <p className="text-xs text-gray-500 text-right mt-2">
  Today, {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace('AM', 'am').replace('PM', 'pm')}
</p>
                </div>
              </div>
            </div>

            {/* Start Chat Button */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-medium text-center py-3.5 rounded-full transition shadow-md hover:shadow-lg"
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