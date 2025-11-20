import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiLock, FiType, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";

// Import background images
import bg1 from "../assets/loginBG1.jpg";
import bg2 from "../assets/loginBG2.jpg";
import bg3 from "../assets/loginBG3.jpg";

const Register = () => {
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountTypes, setAccountTypes] = useState([]);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000';

  // Random background image on each load
  const backgroundImage = useMemo(() => {
    const images = [bg1, bg2, bg3];
    return images[Math.floor(Math.random() * images.length)];
  }, []);

  useEffect(() => {
    const fetchAccountTypes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/account-types`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch account types');
        setAccountTypes(data.accountTypes);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAccountTypes();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      mobile_number: formData.get('mobile_number'),
      password: formData.get('password'),
      confirm_password: formData.get('confirm_password'),
      account_type: formData.get('account_type')
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/post-property');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Full-screen Random Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={backgroundImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#011936]">Create Account</h1>
            <p className="text-gray-600 mt-2">Join NativeNest today</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg mb-6 text-sm font-medium bg-red-50 text-red-700 border border-red-200"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiType className="text-[#2e6171]" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 transition"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiMail className="text-[#2e6171]" />
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiPhone className="text-[#2e6171]" />
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile_number"
                placeholder="Enter 10-digit mobile"
                maxLength="10"
                pattern="\d{10}"
                title="Please enter a 10-digit mobile number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 transition"
                required
                onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiLock className="text-[#2e6171]" />
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 pr-12 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-[#2e6171]"
                >
                  {showRegPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiLock className="text-[#2e6171]" />
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 pr-12 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-[#2e6171]"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiUser className="text-[#2e6171]" />
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                name="account_type"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 transition"
                required
                defaultValue=""
              >
                <option value="" disabled>Select account type</option>
                {accountTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" required className="mt-1" />
              <span>
                I accept the{" "}
                <Link to="/terms-and-conditions" className="text-[#2e6171] font-medium hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-[#2e6171] font-medium hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#2e6171] to-[#011936] text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Register"}
              {!loading && <i className="fas fa-user-plus"></i>}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#2e6171] hover:underline">
              Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;