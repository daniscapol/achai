import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce } from '../lib/utils';

// Unified Search Component for MCP Hub
// This component provides a global search experience across all MCP content types
const UnifiedSearch = ({ 
  initialSearchTerm = '',
  allData = [], // Combined data of servers, clients, categories
  onSearchResults = () => {},
  position = 'header', // header, inline, modal
  placeholder = 'Search servers, clients, ready to use products...',
  maxResults = 8,
  showQuickFilters = true,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedType, setSelectedType] = useState('all'); // all, servers, clients, categories
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('mcp_recent_searches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (err) {
      console.error("Failed to load recent searches:", err);
    }
  }, []);

  // Save recent searches to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem('mcp_recent_searches', JSON.stringify(recentSearches));
    } catch (err) {
      console.error("Failed to save recent searches:", err);
    }
  }, [recentSearches]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    debounce((term, type) => {
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }

      const lowerTerm = term.toLowerCase();
      
      let filteredResults = allData.filter(item => {
        // Filter by type if needed
        if (type !== 'all' && item.type !== type) {
          return false;
        }

        // Check if the item matches the search term
        return (
          (item.name && item.name.toLowerCase().includes(lowerTerm)) ||
          (item.description && item.description.toLowerCase().includes(lowerTerm)) ||
          (item.category && item.category.toLowerCase().includes(lowerTerm)) ||
          (item.categories && Array.isArray(item.categories) && 
            item.categories.some(cat => cat.toLowerCase().includes(lowerTerm))) ||
          (item.tags && Array.isArray(item.tags) && 
            item.tags.some(tag => tag.toLowerCase().includes(lowerTerm))) ||
          (item.keywords && Array.isArray(item.keywords) && 
            item.keywords.some(keyword => keyword.toLowerCase().includes(lowerTerm)))
        );
      });

      // Sort results by relevance - exact name matches first, then by popularity
      filteredResults.sort((a, b) => {
        // Exact name matches come first
        const aExactMatch = a.name.toLowerCase() === lowerTerm;
        const bExactMatch = b.name.toLowerCase() === lowerTerm;
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        // Then sort by starts if available
        return (b.stars_numeric || b.stars || 0) - (a.stars_numeric || a.stars || 0);
      });

      // Limit the number of results
      setSearchResults(filteredResults.slice(0, maxResults));
      
      // Pass results to parent component
      onSearchResults(filteredResults);
    }, 300),
    [allData, maxResults, onSearchResults]
  );

  // Update search results when search term or type changes
  useEffect(() => {
    performSearch(searchTerm, selectedType);
  }, [searchTerm, selectedType, performSearch]);

  // Add search term to recent searches
  const addToRecentSearches = (term) => {
    if (!term.trim()) return;
    
    setRecentSearches(prev => {
      // Remove the term if it already exists
      const filtered = prev.filter(item => item !== term);
      // Add to the beginning and limit to 5 items
      return [term, ...filtered].slice(0, 5);
    });
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    // Add to recent searches
    addToRecentSearches(searchTerm);
    
    // Create the search URL with proper handling of type parameter
    let searchUrl = `#/search?q=${encodeURIComponent(searchTerm)}`;
    
    // Only add type if it's not 'all'
    if (selectedType !== 'all') {
      searchUrl += `&type=${selectedType}`;
    }
    
    // Log for debugging
    console.log(`Navigating to search results: ${searchUrl}`);
    
    // Close search dropdown first
    setIsSearchActive(false);
    
    // Navigate to search results page using hash navigation without reload
    window.location.hash = searchUrl;
    
    // Dispatch a custom event that can be listened for by other components if needed
    window.dispatchEvent(new CustomEvent('search_submitted', {
      detail: { searchTerm, searchUrl }
    }));
  };

  // Handle clicking on a search result
  const handleResultClick = (result) => {
    // Add to recent searches
    addToRecentSearches(searchTerm);
    
    // Log the result for debugging
    console.log("Search result clicked:", result);
    
    // Close search dropdown first to prevent state issues
    setIsSearchActive(false);
    
    let targetUrl;
    
    if (result.type === 'ready-to-use') {
      // Handle Ready to Use products - redirect to Ready to Use page
      targetUrl = '#/ready-to-use';
      console.log('Navigating to Ready to Use page');
    } else if (result.type === 'category') {
      targetUrl = `#/search?category=${result.slug}`;
    } else if (result.type === 'ai-agent') {
      // Handle AI Agent product pages specifically
      const slug = result.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      targetUrl = `#/products/${slug}`;
      console.log(`Navigating to AI agent by slug: ${slug}`);
    } else if (result.type === 'client') {
      // Special handling for clients to ensure correct prefix
      const slug = result.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      // Check if the slug already has a client- prefix to avoid duplication
      const productPath = slug.startsWith('client-') ? slug : `client-${slug}`;
      console.log(`Navigating to client: ${productPath}`);
      targetUrl = `#/products/${productPath}`;
    } else if (result.type === 'server') {
      // For servers, prefer the ID for known servers, otherwise use slug from name
      let productPath;
      
      if (result.id && !result.id.toString().match(/^\d+$/)) {
        // If the ID is not just a number (which is probably an array index), use it
        productPath = result.id;
        console.log(`Using server ID: ${productPath}`);
      } else {
        // Otherwise create a slug from the name
        productPath = result.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        console.log(`Using server name slug: ${productPath}`);
      }
      
      targetUrl = `#/products/${productPath}`;
    } else {
      console.log(`Unknown result type: ${result.type}, attempting to navigate by name slug`);
      const slug = result.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      targetUrl = `#/products/${slug}`;
    }
    
    // Navigate to the target URL without reload
    window.location.hash = targetUrl;
    
    // Dispatch a custom event that can be listened for by other components if needed
    window.dispatchEvent(new CustomEvent('result_clicked', {
      detail: { result, targetUrl }
    }));
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    setIsSearchActive(true);
    
    // If search is empty, show recent searches
    if (!searchTerm.trim() && recentSearches.length > 0) {
      performSearch('', selectedType);
    }
  };

  // Handle type filter selection
  const handleTypeSelection = (type) => {
    setSelectedType(type);
  };

  // Handle clicking a recent search
  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    performSearch(term, selectedType);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Build CSS classes based on position prop for search container
  const containerStyles = () => {
    switch (position) {
      case 'header':
        return 'relative lg:w-1/3 md:w-96';
      case 'inline':
        return 'relative w-full';
      case 'modal':
        return 'relative w-full max-w-2xl mx-auto';
      default:
        return 'relative w-full';
    }
  };

  // Render search result items
  const renderSearchResult = (result) => {
    // Helper to get the icon based on result type
    const getResultIcon = () => {
      switch (result.type) {
        case 'server':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 8h.01" />
            </svg>
          );
        case 'client':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          );
        case 'ai-agent':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          );
        case 'ready-to-use':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          );
        case 'category':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          );
        default:
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
      }
    };

    return (
      <div 
        key={`${result.type}-${result.id || result.slug}`}
        className="p-3 hover:bg-zinc-700/40 rounded-md cursor-pointer flex items-start gap-3 group transition-colors duration-200"
        onClick={() => handleResultClick(result)}
      >
        {/* Result type icon */}
        <div className={`mt-0.5 p-2 rounded-md ${
          result.type === 'server' ? 'bg-purple-600/20 text-purple-300' : 
          result.type === 'client' ? 'bg-blue-600/20 text-blue-300' : 
          result.type === 'ai-agent' ? 'bg-amber-600/20 text-amber-300' : 
          result.type === 'ready-to-use' ? 'bg-red-600/20 text-red-300' : 
          result.type === 'category' ? 'bg-green-600/20 text-green-300' :
          'bg-gray-600/20 text-gray-300'
        }`}>
          {getResultIcon()}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="text-gray-200 font-medium truncate group-hover:text-white transition-colors duration-200">
              {result.name}
            </h4>
            
            {/* Result meta data - different based on type */}
            {result.type === 'server' && result.stars && (
              <span className="text-xs text-yellow-500 flex items-center shrink-0 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-0.5" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {typeof result.stars === 'number' ? result.stars.toLocaleString() : result.stars}
              </span>
            )}
            {result.type === 'category' && result.count && (
              <span className="text-xs text-gray-400 ml-2">
                {result.count} {result.count === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          
          {/* Description or subtitle */}
          {result.description && (
            <p className="text-sm text-gray-400 line-clamp-1 group-hover:text-gray-300 transition-colors duration-200">
              {result.description}
            </p>
          )}
          
          {/* Tags/Category display */}
          {(result.category || (result.tags && result.tags.length > 0)) && (
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {result.category && (
                <span className="px-2 py-0.5 text-xs bg-zinc-700/50 text-gray-300 rounded-full">
                  {result.category}
                </span>
              )}
              {result.tags && result.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-zinc-700/50 text-gray-300 rounded-full">
                  {tag}
                </span>
              ))}
              {result.tags && result.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{result.tags.length - 2} more</span>
              )}
            </div>
          )}
        </div>
        
        {/* Arrow indicator */}
        <div className="text-gray-500 group-hover:text-purple-400 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  };

  // Additional styling based on expanded state - using a different function name to avoid duplicate declaration
  const getExpandedContainerClasses = () => {
    // This function handles the expanded state styling
    return 'relative w-full'; // Make it always full width and let the parent control sizing
  };

  return (
    <div className={position === 'header' ? getExpandedContainerClasses() : containerStyles()} ref={searchContainerRef}>
      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          className="w-full p-3.5 pl-11 pr-10 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700/70 hover:border-zinc-600 rounded-xl text-gray-200 focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500/70 transition-all duration-300 shadow-sm h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleSearchFocus}
        />
        
        {/* Clear search button */}
        {searchTerm && (
          <button 
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200 bg-zinc-700/50 rounded-full p-1 hover:bg-zinc-700"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>
      
      {/* Enhanced search dropdown results */}
      {isSearchActive && (
        <div className="absolute z-30 mt-2 w-full bg-zinc-800/90 backdrop-blur-md border border-zinc-700/70 rounded-xl shadow-lg overflow-hidden max-h-[85vh] overflow-y-auto animate-fadeIn">
          {/* Quick filter tabs */}
          {showQuickFilters && (
            <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-700/70 p-2.5 z-10">
              <div className="flex rounded-lg bg-zinc-800/80 p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => handleTypeSelection('all')}
                  className={`text-xs flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-medium ${
                    selectedType === 'all' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20' 
                      : 'text-gray-300 hover:bg-zinc-700/50 hover:text-white'
                  } transition-all duration-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeSelection('server')}
                  className={`text-xs flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-medium ${
                    selectedType === 'server' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20' 
                      : 'text-gray-300 hover:bg-zinc-700/50 hover:text-white'
                  } transition-all duration-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                  Servers
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeSelection('client')}
                  className={`text-xs flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-medium ${
                    selectedType === 'client' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20' 
                      : 'text-gray-300 hover:bg-zinc-700/50 hover:text-white'
                  } transition-all duration-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Clients
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeSelection('ai-agent')}
                  className={`text-xs flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-medium ${
                    selectedType === 'ai-agent' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-900/20' 
                      : 'text-gray-300 hover:bg-zinc-700/50 hover:text-white'
                  } transition-all duration-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Agents
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeSelection('ready-to-use')}
                  className={`text-xs flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-medium ${
                    selectedType === 'ready-to-use' 
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md shadow-red-900/20' 
                      : 'text-gray-300 hover:bg-zinc-700/50 hover:text-white'
                  } transition-all duration-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Ready to Use
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeSelection('category')}
                  className={`text-xs flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 font-medium ${
                    selectedType === 'category' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20' 
                      : 'text-gray-300 hover:bg-zinc-700/50 hover:text-white'
                  } transition-all duration-300`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Categories
                </button>
              </div>
              
              {/* Search stats - show when search is active */}
              {searchTerm.trim() && searchResults.length > 0 && (
                <div className="text-xs text-gray-400 mt-2 px-2 flex">
                  Found <span className="text-white font-medium mx-1">{searchResults.length}</span> 
                  results for "<span className="text-purple-400 font-medium">{searchTerm}</span>"
                </div>
              )}
            </div>
          )}
          
          {/* Results content */}
          <div className="p-3">
            {/* No search term - show recent searches */}
            {!searchTerm.trim() && recentSearches.length > 0 && (
              <div className="mb-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Searches
                  </h3>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-purple-400 transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleRecentSearchClick(term)}
                      className="text-left py-2 px-3 hover:bg-zinc-700/40 rounded-lg text-gray-300 text-sm flex items-center transition-colors duration-200 group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500 group-hover:text-purple-400 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="truncate">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show trending searches when no search term */}
            {!searchTerm.trim() && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Trending Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["MCP CLI", "React Client", "Python API", "SQLite", "Redis", "Browser Use", "GitHub", "Time", "Filesystem"].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleRecentSearchClick(term)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm text-gray-300 hover:text-white rounded-full border border-zinc-700 hover:border-purple-500/40 transition-all duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show search results if available */}
            {searchTerm.trim() && (
              <div>
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map(renderSearchResult)}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-400 text-base mb-2">No results found for "{searchTerm}"</p>
                    <p className="text-gray-500 text-sm mb-4">Try a different search term or browse all results</p>
                    <button
                      type="submit"
                      onClick={handleSearchSubmit}
                      className="mt-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 shadow-md shadow-purple-900/20"
                    >
                      Browse all MCP resources
                    </button>
                  </div>
                )}
                
                {/* View all results link */}
                {searchResults.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-700/60 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        // Force a direct navigation to search results
                        let searchUrl = `#/search?q=${encodeURIComponent(searchTerm)}`;
                        
                        // Only add type if it's not 'all'
                        if (selectedType !== 'all') {
                          searchUrl += `&type=${selectedType}`;
                        }
                        
                        console.log(`Force navigating to: ${searchUrl}`);
                        
                        // Close search dropdown first to prevent any state issues
                        setIsSearchActive(false);
                        
                        // Update the hash with the search URL without reload
                        window.location.hash = searchUrl;
                        
                        // Dispatch a custom event that can be listened for by other components
                        window.dispatchEvent(new CustomEvent('search_view_all', {
                          detail: { searchTerm, searchUrl }
                        }));
                      }}
                      className="w-full text-center text-sm bg-gradient-to-r from-purple-600/10 to-indigo-600/10 hover:from-purple-600/20 hover:to-indigo-600/20 text-purple-400 font-medium hover:text-purple-300 py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      View all search results
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedSearch;