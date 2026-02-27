// src/components/header.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isBuyerLoggedIn = !!token && user.account_type === "buyer";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/buy", label: "Browse" },
    { to: "/blog", label: "Blog" },
    { to: "/about", label: "About" },
    { to: "/contactUs", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsDropdownOpen(false);
    navigate("/");
  };

  const goToDashboard = () => {
    setIsDropdownOpen(false);
    navigate("/buyer-dashboard");
  };

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <header
  className="fixed top-0 left-0 w-full z-50 shadow-lg h-[72px]"
>
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

        {/* Right Side: Login or User Dropdown */}
        <div className="flex items-center gap-4">
          {isBuyerLoggedIn ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="text-white p-2 hover:bg-white/20 rounded-full transition"
                aria-label="User menu"
              >
                <FaUser className="w-6 h-6" />
              </button>

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
                >
                  <div className="py-2">
                    <button
                      onClick={goToDashboard}
                      className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 transition flex items-center gap-3"
                    >
                      <FaUser className="w-4 h-4" />
                      Buyer Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-left px-4 py-3 text-red-600 hover:bg-red-50 transition"
                    >
                      <span className="material-symbols-outlined text-xl">logout</span>
                      <span>Logout</span>
                    </button>

                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:block bg-white text-[#011936] px-6 py-2.5 rounded-full font-semibold hover:bg-gray-100 transition shadow-md"
            >
              Login
            </Link>
          )}

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
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </motion.div>
          </button>
        </div>
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
                    isActive(link.to)
                      ? "text-white bg-[#2e6171] rounded-lg px-4"
                      : "hover:text-[#2e6171]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Mobile Login */}
            {!isBuyerLoggedIn && (
              <li>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 text-center bg-white text-[#011936] rounded-lg font-semibold"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </motion.div>
      )}
    </header>
  );
};

export default Header;