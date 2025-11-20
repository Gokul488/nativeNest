import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/buy", label: "Buy" },
    { to: "/blog", label: "Blog" },
    { to: "/about", label: "About" },
    { to: "/contactUs", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 w-full z-50 shadow-lg">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-r from-[#2e6171] to-[#011936] opacity-90"></div>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>

      <nav className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
          >
            NativeNest
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link, i) => (
            <motion.li
              key={link.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={link.to}
                className={`px-4 py-2 text-white font-medium text-sm lg:text-base transition-all duration-300 hover:text-[#f2f2f2] hover:scale-105 ${
                  isActive(link.to) ? "bg-white/20 rounded-full" : ""
                }`}
              >
                {link.label}
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          <motion.div
            animate={{ rotate: isMenuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </motion.div>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 right-0 bg-[#011936]/95 backdrop-blur-md shadow-xl"
        >
          <ul className="py-4 px-6 space-y-3">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-white font-medium text-lg transition-colors ${
                    isActive(link.to) ? "text-white bg-[#2e6171] rounded-lg px-4" : "hover:text-[#2e6171]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </header>
  );
};

export default Header;