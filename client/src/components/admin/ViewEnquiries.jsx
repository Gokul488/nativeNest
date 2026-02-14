// src/components/ViewEnquiries.jsx
import React, { useEffect, useState } from "react";
import axios from "axios"; // ← added for delete (you can also use fetch)
import API_BASE_URL from '../../config.js';

const ITEMS_PER_PAGE = 10;

const ViewEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all enquiries
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact`);
        if (!response.ok) throw new Error("Failed to fetch enquiries");
        const data = await response.json();
        const messages = data.messages || data || [];
        setEnquiries(messages);
        setFilteredEnquiries(messages);
      } catch (err) {
        console.error("Error fetching enquiries:", err);
        setError("Failed to load contact enquiries.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  // Search/filter logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEnquiries(enquiries);
      setCurrentPage(1);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = enquiries.filter(
      (enq) =>
        enq.name?.toLowerCase().includes(term) ||
        enq.email?.toLowerCase().includes(term)
    );

    setFilteredEnquiries(filtered);
    setCurrentPage(1);
  }, [searchTerm, enquiries]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEnquiries = filteredEnquiries.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;

    setDeletingId(id);
    try {
      // Assuming you add DELETE /api/contact/:id endpoint on backend
      const token = localStorage.getItem("token"); // if admin protected
      const response = await axios.delete(`${API_BASE_URL}/api/contact/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 200 || response.status === 204) {
        const updated = enquiries.filter((enq) => enq.id !== id);
        setEnquiries(updated);
        setFilteredEnquiries((prev) => prev.filter((enq) => enq.id !== id));
        alert("Enquiry deleted successfully");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete enquiry. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header + Search */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Contact Enquiries</h2>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-8 text-center text-gray-500">Loading enquiries...</div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {filteredEnquiries.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {searchTerm
                ? "No matching enquiries found."
                : "No contact enquiries found."}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received On
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedEnquiries.map((enquiry, idx) => (
                      <tr key={enquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {startIndex + idx + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {enquiry.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {enquiry.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xl">
                          <div className="line-clamp-3">{enquiry.message}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {new Date(enquiry.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                        <button
                            onClick={() => handleDelete(enquiry.id)}
                            disabled={deletingId === enquiry.id}
                            className={`p-2 rounded-lg transition-all ${
                            deletingId === enquiry.id
                                ? "opacity-50 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100"
                            }`}
                            title="Delete enquiry"
                        >
                            <span className="material-symbols-outlined text-2xl">
                            {deletingId === enquiry.id ? "hourglass_empty" : "delete"}
                            </span>
                        </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredEnquiries.length)} of{" "}
                    {filteredEnquiries.length}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ViewEnquiries;