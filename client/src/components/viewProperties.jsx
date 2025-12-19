// src/components/ViewProperties.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config.js';

const ViewProperties = () => {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/viewproperties`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) navigate('/login');
          throw new Error('Failed to fetch properties');
        }

        const data = await response.json();
        setProperties(data.properties || data || []);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      }
    };

    fetchProperties();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/viewproperties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) navigate('/login');
        throw new Error('Failed to delete property');
      }

      setProperties(properties.filter((prop) => prop.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete property');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Manage Properties</h2>
        <Link
          to="/admin-dashboard/manage-properties/add"
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-medium"
        >
          + Add New Property
        </Link>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.length === 0 && !error ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No properties found. Create your first property!
                </td>
              </tr>
            ) : (
              properties.map((property, index) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/admin-dashboard/manage-properties/edit/${property.id}`}
                      className="text-teal-600 hover:text-teal-800 hover:underline font-medium"
                    >
                      {property.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    ₹{Math.floor(property.price).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{property.city}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600 hover:text-red-800 transition" 
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewProperties;