import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  showTotal = true 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
      {showTotal && (
        <div className="text-sm text-gray-500 font-medium">
          Showing <span className="text-gray-900 font-bold">{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
          <span className="text-gray-900 font-bold">{Math.min(totalItems, currentPage * itemsPerPage)}</span> of{" "}
          <span className="text-gray-900 font-bold">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg border border-gray-200 transition-all ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed bg-gray-50"
              : "text-gray-600 hover:bg-white hover:text-teal-600 hover:border-teal-200 shadow-sm"
          }`}
        >
          <FaChevronLeft size={14} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((no) => (
            <button
              key={no}
              onClick={() => onPageChange(no)}
              className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                currentPage === no
                  ? "bg-teal-600 text-white shadow-md shadow-teal-100 scale-105"
                  : "text-gray-600 hover:bg-white hover:text-teal-600 hover:border-gray-300 border border-transparent shadow-sm"
              }`}
            >
              {no}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg border border-gray-200 transition-all ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed bg-gray-50"
              : "text-gray-600 hover:bg-white hover:text-teal-600 hover:border-teal-200 shadow-sm"
          }`}
        >
          <FaChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
