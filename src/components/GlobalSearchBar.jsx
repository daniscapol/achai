import React, { useState, useEffect, useRef } from 'react';
import UnifiedSearch from './UnifiedSearch';
import { loadUnifiedData } from '../utils/searchUtils';

// This component is designed to be included in the header/navbar
// It provides an enhanced search bar with interactive elements and animations
const GlobalSearchBar = () => {
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef(null);

  // Load all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Try to get data from localStorage first
        const localData = localStorage.getItem('mcp_unified_data');
        if (localData) {
          setAllData(JSON.parse(localData));
          setIsLoading(false);
          return;
        }
        
        // Load the data using our utility function
        const data = await loadUnifiedData();
        setAllData(data);
      } catch (err) {
        console.error("Error loading search data:", err);
        // Fallback to an empty array
        setAllData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle search results
  const handleSearchResults = (results) => {
    // This function can be used for analytics or other side effects
    console.log(`Found ${results.length} results`);
  };

  // Handle outside clicks to collapse expanded search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle search focus when Command+K or Ctrl+K is pressed
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsExpanded(true);
        setIsFocused(true);
        
        // Focus the search input if there's a child input element
        const input = searchRef.current?.querySelector('input');
        if (input) {
          input.focus();
        }
      }
      
      // Close search on Escape
      if (e.key === 'Escape' && (isExpanded || isFocused)) {
        setIsExpanded(false);
        setIsFocused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, isFocused]);

  // Handle search focus
  const handleFocus = () => {
    setIsFocused(true);
    setIsExpanded(true);
  };

  return (
    <div 
      className={`relative transition-all duration-300 ${
        isExpanded ? 'lg:w-96 md:w-full' : 'lg:w-80 md:w-96'
      }`}
      ref={searchRef}
    >
      {isLoading ? (
        // Show skeleton loader while data is loading
        <div className={`h-12 bg-zinc-800 rounded-lg animate-pulse border-2 border-transparent ${
          isExpanded ? 'lg:w-96 md:w-full' : 'lg:w-80 md:w-96'
        }`}></div>
      ) : (
        <div 
          className={`group transition-all duration-300 ${
            isFocused ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
          }`}
          onMouseEnter={() => setIsExpanded(true)}
          onFocus={handleFocus}
        >
          <UnifiedSearch
            allData={allData}
            onSearchResults={handleSearchResults}
            position="header"
            placeholder="Search servers, clients, ready to use products..."
            maxResults={6}
            showQuickFilters={true}
            isExpanded={isExpanded}
            isFocused={isFocused}
          />
          
          {/* Animated search icon with pulse effect */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-400 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={isFocused ? 2.5 : 2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                className={isFocused ? "animate-pulse" : ""}
              />
            </svg>
          </div>
        </div>
      )}
      
      {/* Enhanced keyboard shortcut indicator with animated hint */}
      <div 
        className={`hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1.5 transition-opacity duration-300 ${
          isFocused ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <kbd className="px-1.5 py-0.5 text-xs bg-zinc-700/70 text-gray-300 rounded border border-zinc-600/70 shadow-sm">
          ⌘
        </kbd>
        <kbd className="px-1.5 py-0.5 text-xs bg-zinc-700/70 text-gray-300 rounded border border-zinc-600/70 shadow-sm">
          K
        </kbd>
        
        {/* Pulsing hint animation on hover */}
        <span className="absolute inset-0 bg-purple-500/10 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></span>
      </div>
    </div>
  );
};

export default GlobalSearchBar;