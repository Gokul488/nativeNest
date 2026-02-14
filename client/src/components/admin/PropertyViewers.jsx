// src/components/PropertyViewers.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUsers, FaEye, FaHome } from "react-icons/fa";
import API_BASE_URL from '../../config.js';

const PropertyViewers = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  
  const [viewers, setViewers] = useState([]);
  const [propertyTitle, setPropertyTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTitle, setLoadingTitle] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch viewers
  useEffect(() => {
    const fetchViewers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/properties/${propertyId}/viewers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch viewers");
        }

        const data = await res.json();
        setViewers(data.viewers || []);
      } catch (err) {
        setError(err.message || "Failed to load viewers");
      } finally {
        setLoading(false);
      }
    };

    fetchViewers();
  }, [propertyId, token, navigate]);

  // Fetch property title
  useEffect(() => {
    const fetchPropertyTitle = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            navigate("/login");
            return;
          }
          throw new Error("Property not found");
        }

        const data = await res.json();
        setPropertyTitle(data.property?.title || "Unknown Property");
      } catch (err) {
        setPropertyTitle("Unknown Property");
        console.error("Could not fetch property title:", err);
      } finally {
        setLoadingTitle(false);
      }
    };

    fetchPropertyTitle();
  }, [propertyId, token, navigate]);

  const isPageLoading = loading || loadingTitle;

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
                {/* Main Header Content */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                {/* Left: Title + Property Info */}
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-4">
                    <FaEye className="text-teal-600" />
                    Property Viewers
                    </h2>

                    <div className="flex items-center gap-4 bg-gray-50 px-5 py-4 rounded-lg">
                    <FaHome className="w-8 h-8 text-teal-600" />
                    <div>
                        <p className="text-xl font-semibold text-gray-900">
                        {loadingTitle ? "Loading property..." : propertyTitle || "Unknown Property"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                        Property ID: <span className="font-mono font-medium">#{propertyId}</span>
                        </p>
                    </div>
                    </div>
                </div>

                {/* Right: Total Viewers Card */}
                <div className="bg-teal-50 px-8 py-6 rounded-xl text-center shadow-sm">
                    <FaUsers className="w-10 h-10 text-teal-700 mx-auto mb-3" />
                    <div className="text-4xl font-bold text-teal-800">
                    {viewers.length}
                    </div>
                    <div className="text-sm font-medium text-teal-700 mt-1">
                    Total Viewers
                    </div>
                </div>
                </div>
            </div>
            </div>
        {/* Loading State */}
        {isPageLoading && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-lg text-gray-600">Loading property details and viewers...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isPageLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Viewers Table */}
        {!isPageLoading && !error && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {viewers.length === 0 ? (
              <div className="p-16 text-center">
                <FaEye className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  No views recorded yet
                </h3>
                <p className="text-gray-500">
                  This property hasn't been viewed by anyone so far.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Viewed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {viewers.map((viewer, index) => (
                      <tr key={viewer.id || index} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              viewer.buyer_id
                                ? "bg-teal-100 text-teal-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {viewer.buyer_id ? "Registered Buyer" : "Guest"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {viewer.buyer_name || "Guest User"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {viewer.buyer_email || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {viewer.mobile_number || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                          {viewer.ip_address}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(viewer.viewed_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyViewers;