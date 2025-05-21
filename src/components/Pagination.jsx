import React, { useEffect, useState, useCallback } from 'react';

/**
 * Improved simple pagination component with state management
 * @param {Object} props Component props
 * @param {number} props.currentPage Current page number (1-based)
 * @param {number} props.totalPages Total number of pages
 * @param {Function} props.onPageChange Function called when page changes, receives page number
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Local state to track current page to avoid race conditions
  const [internalPage, setInternalPage] = useState(currentPage);
  
  // Update internal state when prop changes
  useEffect(() => {
    setInternalPage(currentPage);
  }, [currentPage]);
  
  // Debug: Log when component renders with current props
  useEffect(() => {
    console.log(`Debug - Pagination rendered with currentPage: ${currentPage}, internalPage: ${internalPage}, totalPages: ${totalPages}, rendering: ${totalPages > 1}`);
  }, [currentPage, internalPage, totalPages]);
  
  // If there's only one page or less, don't render pagination
  if (totalPages <= 1) return null;
  
  // Generate array of page numbers: [1, 2, 3, ...]
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  // Memoize handlers to prevent unnecessary re-renders
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log(`Pagination: handlePageChange from ${internalPage} to ${newPage}`);
      
      // Even if it's the same page, explicitly call onPageChange to ensure click is registered
      setInternalPage(newPage);
      onPageChange(newPage);
    }
  }, [internalPage, totalPages, onPageChange]);
  
  // Simple handlers for previous and next
  const handlePrevious = useCallback(() => {
    if (internalPage > 1) {
      console.log(`Pagination: Moving from page ${internalPage} to ${internalPage - 1}`);
      handlePageChange(internalPage - 1);
    }
  }, [internalPage, handlePageChange]);
  
  const handleNext = useCallback(() => {
    if (internalPage < totalPages) {
      console.log(`Pagination: Moving from page ${internalPage} to ${internalPage + 1}`);
      handlePageChange(internalPage + 1);
    }
  }, [internalPage, totalPages, handlePageChange]);

  // Generate a more limited set of page numbers for display
  const getPageRange = () => {
    const range = [];
    const maxVisiblePages = 5; // Show max of 5 page numbers
    
    if (totalPages <= maxVisiblePages) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      // Otherwise, show a limited range
      if (internalPage <= 3) {
        // Near the start: show 1, 2, 3, 4, ... totalPages
        for (let i = 1; i <= 4; i++) {
          range.push(i);
        }
        range.push('...');
        range.push(totalPages);
      } else if (internalPage >= totalPages - 2) {
        // Near the end: show 1, ... totalPages-3, totalPages-2, totalPages-1, totalPages
        range.push(1);
        range.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        // Somewhere in the middle: show 1, ... currentPage-1, currentPage, currentPage+1, ... totalPages
        range.push(1);
        range.push('...');
        for (let i = internalPage - 1; i <= internalPage + 1; i++) {
          range.push(i);
        }
        range.push('...');
        range.push(totalPages);
      }
    }
    
    return range;
  };
  
  // Get our limited range of page numbers
  const displayedPageNumbers = getPageRange();

  return (
    <div className="flex flex-col items-center mt-8 space-y-6">
      {/* Netflix-inspired premium pagination */}
      <div className="flex items-center justify-center space-x-2">
        {/* First Page Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (internalPage !== 1) {
              handlePageChange(1);
            }
          }}
          disabled={internalPage === 1}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 hover:bg-purple-700 text-gray-300 hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:hover:bg-zinc-800 disabled:hover:text-gray-300"
          aria-label="First page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Previous Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handlePrevious();
          }}
          disabled={internalPage === 1}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 hover:bg-purple-700 text-gray-300 hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:hover:bg-zinc-800 disabled:hover:text-gray-300"
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {displayedPageNumbers.map((item, index) => (
            item === '...' ? (
              <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={`page-${item}`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(item);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  internalPage === item
                    ? 'bg-purple-600 text-white font-medium shadow-lg shadow-purple-700/30 scale-110'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'
                }`}
                aria-label={`Page ${item}`}
                aria-current={internalPage === item ? 'page' : undefined}
              >
                {item}
              </button>
            )
          ))}
        </div>
        
        {/* Next Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleNext();
          }}
          disabled={internalPage === totalPages}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 hover:bg-purple-700 text-gray-300 hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:hover:bg-zinc-800 disabled:hover:text-gray-300"
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Last Page Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (internalPage !== totalPages) {
              handlePageChange(totalPages);
            }
          }}
          disabled={internalPage === totalPages}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 hover:bg-purple-700 text-gray-300 hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:hover:bg-zinc-800 disabled:hover:text-gray-300"
          aria-label="Last page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Page indicator */}
      <div className="text-sm text-gray-400">
        Showing page {internalPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;