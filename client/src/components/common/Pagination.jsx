import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  showTotal = true,
  activeColor = "sky" // Default theme color
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

  const getActiveStyles = () => {
    switch(activeColor) {
      case 'indigo': return 'bg-indigo-600 shadow-indigo-100 text-white';
      case 'teal': return 'bg-teal-600 shadow-teal-100 text-white';
      case 'purple': return 'bg-purple-600 shadow-purple-100 text-white';
      case 'amber': return 'bg-amber-600 shadow-amber-100 text-white';
      default: return 'bg-sky-500 shadow-sky-100 text-white';
    }
  };

  const getHoverTextStyles = () => {
    switch(activeColor) {
      case 'indigo': return 'hover:text-indigo-600 hover:border-indigo-200';
      case 'teal': return 'hover:text-teal-600 hover:border-teal-200';
      default: return 'hover:text-sky-600 hover:border-sky-200';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 bg-slate-50/50 border-t border-slate-100">
      {showTotal && (
        <div className="text-sm text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
          <span className="text-slate-900 font-bold">{Math.min(totalItems, currentPage * itemsPerPage)}</span> of{" "}
          <span className="text-slate-900 font-bold">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2.5 rounded-xl border border-slate-200 transition-all duration-200 ${
            currentPage === 1
              ? "text-slate-300 cursor-not-allowed bg-slate-50 border-slate-100"
              : `text-slate-600 hover:bg-white ${getHoverTextStyles()} shadow-sm active:scale-95`
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {getPageNumbers().map((no) => (
            <button
              key={no}
              onClick={() => onPageChange(no)}
              className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
                currentPage === no
                  ? `${getActiveStyles()} scale-105`
                  : `text-slate-600 bg-white hover:bg-slate-50 ${getHoverTextStyles()} border border-transparent hover:border-slate-200`
              }`}
            >
              {no}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2.5 rounded-xl border border-slate-200 transition-all duration-200 ${
            currentPage === totalPages
              ? "text-slate-300 cursor-not-allowed bg-slate-50 border-slate-100"
              : `text-slate-600 hover:bg-white ${getHoverTextStyles()} shadow-sm active:scale-95`
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
