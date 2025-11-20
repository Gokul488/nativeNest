import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";

// Import background images
import bg1 from "../assets/loginBG1.jpg";
import bg2 from "../assets/loginBG2.jpg";
import bg3 from "../assets/loginBG3.jpg";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5000';

  // Random background image on each load
  const backgroundImage = useMemo(() => {
    const images = [bg1, bg2, bg3];
    return images[Math.floor(Math.random() * images.length)];
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const identifier = formData.get('identifier');
    const password = formData.get('password');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.account_type === "seller") navigate('/seller-dashboard');
      else if (data.user.account_type === "buyer") navigate('/buyer-dashboard');
      else if (data.user.account_type === "agent") navigate('/agent-dashboard');
      else navigate('/');
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
        <div className="absolute inset-0 bg-black/30" /> {/* Dark overlay for readability */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#011936]">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Log in to your NativeNest account</p>
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiUser className="text-[#2e6171]" />
                Mobile / Email <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="identifier"
                placeholder="Enter mobile or email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 transition"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#011936] mb-2">
                <FiLock className="text-[#2e6171]" />
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2e6171] text-gray-700 placeholder-gray-400 pr-12 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-[#2e6171]"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#2e6171] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#2e6171] to-[#011936] text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <i className="fas fa-sign-in-alt"></i>}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="font-bold text-[#2e6171] hover:underline">
              Register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;