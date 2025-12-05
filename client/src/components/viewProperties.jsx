// Modified ViewProperties.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ViewProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/viewproperties", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProperties(response.data.properties || response.data || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch properties");
      }
    };
    fetchProperties();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/viewproperties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(properties.filter((prop) => prop.id !== id));
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete property");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-6">View Properties</h2>
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">S.No</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">City</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property, index) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700 border-b">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b">
                  <Link
                    to={`/seller-dashboard/edit-property/${property.id}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {property.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b">
                  <i className="fa-solid fa-indian-rupee-sign"></i>
                  {Math.floor(property.price).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b">{property.city}</td>
                <td className="px-4 py-3 text-sm text-gray-700 border-b">
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="px-3 py-1 rounded transition-transform duration-200 hover:scale-110"
                  >
                    <span className="material-symbols-outlined text-red-700">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {properties.length === 0 && !error && <p className="text-center text-gray-600 leading-7">No properties found</p>}
    </div>
  );
};

export default ViewProperties;