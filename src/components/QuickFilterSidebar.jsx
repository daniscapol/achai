import React from 'react';
import { Link } from 'react-router-dom';

// A simpler sidebar component specifically for quick access to categories and filters
const QuickFilterSidebar = ({ 
  isOpen, 
  onClose, 
  categories = [], 
  currentFilters = {},
  onFilterChange,
  recentSearches = []
}) => {
  // Most used categories for quick access
  const topCategories = [...categories]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  
  // Handle filter toggles
  const toggleFilter = (filterType, value) => {
    if (onFilterChange) {
      onFilterChange(filterType, value);
    }
  };

  return (
    <>
      {/* Overlay to capture clicks outside sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 
          flex flex-col overflow-hidden z-40 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header with title and close button (mobile only) */}
        <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-medium text-gray-200">Quick Filters</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-zinc-800"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Sidebar content */}
        <div className="flex-grow overflow-y-auto py-4 px-3">
          {/* Status filters section */}
          <div className="mb-6">
            <h3 className="text-xs uppercase font-semibold text-gray-400 mb-2 px-2">Status</h3>
            <div className="space-y-1">
              <button 
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                  currentFilters.officialOnly 
                    ? 'text-white bg-green-600' 
                    : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                }`}
                onClick={() => toggleFilter('officialOnly', !currentFilters.officialOnly)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
                </svg>
                <span className="flex-grow text-left">Official MCPs</span>
              </button>
              
              <button 
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                  currentFilters.hasGithub 
                    ? 'text-white bg-purple-600' 
                    : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                }`}
                onClick={() => toggleFilter('hasGithub', !currentFilters.hasGithub)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="flex-grow text-left">Has GitHub</span>
              </button>

              <button 
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                  currentFilters.hasNpm 
                    ? 'text-white bg-orange-600' 
                    : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                }`}
                onClick={() => toggleFilter('hasNpm', !currentFilters.hasNpm)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="flex-grow text-left">Has NPM Package</span>
              </button>
            </div>
          </div>
          
          {/* Popularity filters section */}
          <div className="mb-6">
            <h3 className="text-xs uppercase font-semibold text-gray-400 mb-2 px-2">Popularity</h3>
            <div className="space-y-1">
              {[0, 100, 1000, 5000, 10000].map(stars => (
                <button 
                  key={stars}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    currentFilters.minStars === stars 
                      ? 'text-white bg-yellow-600' 
                      : 'text-gray-300 hover:text-white hover:bg-zinc-800'
                  }`}
                  onClick={() => toggleFilter('minStars', stars)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="flex-grow text-left">{stars === 0 ? 'Any stars' : `${stars.toLocaleString()}+ stars`}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Top categories section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-xs uppercase font-semibold text-gray-400">Popular Categories</h3>
              <a href="#/browse-categories" className="text-xs text-purple-400 hover:text-purple-300">
                View all
              </a>
            </div>
            <div className="space-y-1">
              {topCategories.map(category => (
                <a
                  key={category.slug}
                  href={`#/search?category=${category.slug}`}
                  className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors duration-200"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                  <span className="flex-grow truncate">{category.name}</span>
                  <span className="text-xs text-gray-500">{category.count}</span>
                </a>
              ))}
            </div>
          </div>
          
          {/* Recent searches section */}
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase font-semibold text-gray-400 mb-2 px-2">Recent Searches</h3>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <a
                    key={index}
                    href={`#/search?q=${encodeURIComponent(search)}`}
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-grow truncate">{search}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <a 
            href="#/submit-server"
            className="flex items-center justify-center w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Submit Your MCP Server
          </a>
        </div>
      </aside>
    </>
  );
};

export default QuickFilterSidebar;