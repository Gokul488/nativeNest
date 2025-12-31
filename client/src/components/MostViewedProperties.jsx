import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaUsers } from "react-icons/fa";
import API_BASE_URL from "../config.js";

const MostViewedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          `${API_BASE_URL}/api/properties/most-viewed`,
          { headers }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to fetch");
        }

        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("Unauthorized")) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString("en-IN")}`;

  const openProperty = (id) => {
    window.open(`/property/${id}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading most viewed properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-screen-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 flex items-center gap-4">
          <FaEye className="text-teal-600 text-4xl" />
          Most Viewed Properties
        </h2>

        {properties.length === 0 ? (
          <p className="text-center text-gray-600">
            No property views recorded yet.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {properties.map((prop, index) => (
              <motion.div
                key={prop.id}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => openProperty(prop.id)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition cursor-pointer relative"
              >
                {/* Image */}
                <div className="h-60 bg-gray-100 overflow-hidden rounded-t-2xl">
                  {prop.cover_image ? (
                    <img
                      src={prop.cover_image}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Views Badge */}
                  <div className="absolute top-4 left-4 bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    #{index + 1} • {prop.views} views
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">
                    {prop.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    {prop.city}
                  </p>

                  <p className="text-xl font-bold mb-4">
                    {formatPrice(prop.price)}
                  </p>

                  {/* VIEW BUYERS BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ⛔ prevent card click
                      navigate(`/admin-dashboard/property/${prop.id}/viewers`);
                    }}
                    className="flex items-center gap-2 text-sm text-teal-700 font-medium hover:underline"
                  >
                    <FaUsers />
                    View Buyers
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MostViewedProperties;
