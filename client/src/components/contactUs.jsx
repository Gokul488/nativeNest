import React, { useState } from "react";
import Header from "./header";
import Footer from "./footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API_BASE_URL from '../config.js';   // ← one level up// ← Correctly imported once

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: "Message sent successfully!" });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.error || "Failed to send message" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "An error occurred. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white overflow-hidden">
      <Header />

      {/* Animated Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-tr from-[#2e6171]/70 to-[#011936]/70 rounded-full blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#011936] mb-6">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Have questions or need assistance? We’re here to help.
          </p>
        </motion.section>

        {/* Contact Info + Form */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-10 lg:gap-12"
        >
          {/* Left: Contact Info & Map */}
          <div className="space-y-8">
            {/* Info Cards */}
            <div className="space-y-6">
              {/* Address */}
              <motion.a
                href="https://maps.google.com/?q=436+Serangoon+Road,+Singapore+218132"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 4 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-12 h-12 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full flex-center shadow-md group-hover:scale-110 transition-transform">
                  <i className="fas fa-map-marker-alt text-white"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#011936]">Address</h3>
                  <p className="text-gray-600 group-hover:text-[#2e6171] transition-colors">
                    436 Serangoon Road, Singapore 218132
                  </p>
                </div>
              </motion.a>

              {/* Phone */}
              <motion.a
                href="tel:+911234567890"
                whileHover={{ x: 4 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-12 h-12 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full flex-center shadow-md group-hover:scale-110 transition-transform">
                  <i className="fas fa-phone text-white"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#011936]">Phone</h3>
                  <p className="text-gray-600 group-hover:text-[#2e6171] transition-colors">
                    +91 12345-67890
                  </p>
                </div>
              </motion.a>

              {/* Email */}
              <motion.a
                href="mailto:support@nativenest.com"
                whileHover={{ x: 4 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-12 h-12 bg-linear-to-br from-[#2e6171] to-[#011936] rounded-full flex-center shadow-md group-hover:scale-110 transition-transform">
                  <i className="fas fa-envelope text-white"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#011936]">Email</h3>
                  <p className="text-gray-600 group-hover:text-[#2e6171] transition-colors">
                    support@nativenest.com
                  </p>
                </div>
              </motion.a>
            </div>

            {/* Map */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative rounded-2xl overflow-hidden shadow-lg group"
            >
              <div className="absolute -inset-1 bg-linear-to-r from-[#2e6171] to-[#011936] rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity -z-10"></div>
              <iframe
                title="NativeNest Office"
                className="w-full h-72 rounded-2xl border-0"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.786103042933!2d103.85450097514592!3d1.3146721989416142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da174a0f7e0c7d%3A0x5f5b9e3e5a4a8c3e!2s436%20Serangoon%20Rd%2C%20Singapore%20218132!5e0!3m2!1sen!2sin!4v1700000000001"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#011936] mb-6">
              Send Us a Message
            </h2>

            {status && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg mb-6 text-sm font-medium border ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {status.message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 transition"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 transition"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Type your message..."
                rows="5"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 resize-none transition"
                value={formData.message}
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className="w-full bg-linear-to-r from-[#2e6171] to-[#011936] text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition flex-center gap-2"
              >
                Send Message
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </motion.div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-linear-to-r from-[#2e6171] to-[#011936] rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                Ready to Find Your Dream Home?
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-95">
                List your property or start browsing — NativeNest makes it simple.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-3 bg-white text-[#2e6171] px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition"
              >
                Get Started Now
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;