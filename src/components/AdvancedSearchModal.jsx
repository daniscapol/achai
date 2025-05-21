import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AdvancedSearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['server']);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [officialOnly, setOfficialOnly] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // Load categories from data
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Try to get data from localStorage first
        const localData = localStorage.getItem('mcp_unified_data');
        if (localData) {
          const parsedData = JSON.parse(localData);
          const categories = parsedData
            .filter(item => item.type === 'category')
            .sort((a, b) => b.count - a.count);
          setAvailableCategories(categories);
          return;
        }
        
        // Load server data to extract categories
        const serverModule = await import('../mcp_servers_data.json');
        const servers = serverModule.default;
        
        // Generate categories from server data
        const categoryMap = new Map();
        servers.forEach(server => {
          const category = server.category || 'Uncategorized';
          const slug = category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
          
          if (categoryMap.has(slug)) {
            categoryMap.set(slug, {
              ...categoryMap.get(slug),
              count: categoryMap.get(slug).count + 1
            });
          } else {
            categoryMap.set(slug, {
              name: category,
              slug: slug,
              count: 1,
              type: 'category'
            });
          }
        });

        // Convert categories to array and sort by count
        const categoriesArray = Array.from(categoryMap.values())
          .sort((a, b) => b.count - a.count);
        
        setAvailableCategories(categoriesArray);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      const searchInput = document.getElementById('advanced-search-input');
      if (searchInput) {
        setTimeout(() => {
          searchInput.focus();
        }, 100);
      }
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build the search URL with query parameters
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.append('q', searchTerm.trim());
    }
    
    if (selectedTypes.length > 0 && selectedTypes.length < 3) {
      params.append('type', selectedTypes.join(','));
    }
    
    if (selectedCategories.length > 0) {
      params.append('categories', selectedCategories.join(','));
    }
    
    if (minRating > 0) {
      params.append('minRating', minRating.toString());
    }
    
    if (officialOnly) {
      params.append('official', 'true');
    }
    
    // Navigate to search results page
    navigate(`/search?${params.toString()}`);
    
    // Close the modal
    onClose();
  };

  // Handle type selection toggle
  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Handle category selection toggle
  const handleCategoryToggle = (slug) => {
    setSelectedCategories((prev) => {
      if (prev.includes(slug)) {
        return prev.filter(c => c !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  // Handle category selection clear
  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  // Handle reset all filters
  const handleResetAll = () => {
    setSearchTerm('');
    setSelectedTypes(['server']);
    setSelectedCategories([]);
    setMinRating(0);
    setOfficialOnly(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center border-b border-zinc-800 p-4">
          <h2 className="text-xl font-bold text-white">Advanced Search</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-full transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="p-6">
            {/* Search input */}
            <div className="mb-6">
              <label htmlFor="advanced-search-input" className="block text-gray-300 font-medium mb-2">
                Search Term
              </label>
              <div className="relative">
                <input
                  id="advanced-search-input"
                  type="text"
                  placeholder="Search MCP servers, clients, and categories..."
                  className="w-full p-3 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Search by name, description, tags, or keywords
              </p>
            </div>
            
            {/* Type selection */}
            <div className="mb-6">
              <h3 className="text-gray-300 font-medium mb-2">
                Resource Types
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeToggle('server')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                    selectedTypes.includes('server')
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 8h.01" />
                  </svg>
                  MCP Servers
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeToggle('client')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                    selectedTypes.includes('client')
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  MCP Clients
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeToggle('category')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                    selectedTypes.includes('category')
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Categories
                </button>
              </div>
              {selectedTypes.length === 0 && (
                <p className="mt-1 text-sm text-red-400">
                  Please select at least one resource type
                </p>
              )}
            </div>
            
            {/* Categories */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-300 font-medium">Categories</h3>
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCategories}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(category => (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => handleCategoryToggle(category.slug)}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors duration-200 ${
                        selectedCategories.includes(category.slug)
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                      }`}
                    >
                      {selectedCategories.includes(category.slug) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {category.name}
                      <span className="text-xs opacity-70">({category.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Additional filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Minimum rating */}
              <div>
                <h3 className="text-gray-300 font-medium mb-2">
                  Minimum Star Rating
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={minRating}
                    onChange={(e) => setMinRating(parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="w-20 text-center">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-purple-400 font-medium">
                      {minRating > 0 ? `${minRating}+` : 'Any'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Official only toggle */}
              <div>
                <h3 className="text-gray-300 font-medium mb-2">
                  Resource Status
                </h3>
                <button
                  type="button"
                  onClick={() => setOfficialOnly(!officialOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    officialOnly
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
                  </svg>
                  Official Resources Only
                </button>
              </div>
            </div>
            
            {/* Search tips */}
            <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700">
              <h3 className="text-purple-400 text-sm font-medium mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Search Tips
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400">•</span>
                  Use specific terms for more accurate results
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400">•</span>
                  Combine resource types to search across different content
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400">•</span>
                  Select multiple categories to broaden your search
                </li>
              </ul>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="border-t border-zinc-800 p-4 bg-zinc-900/80 sticky bottom-0 flex justify-between">
            <button 
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              Reset All
            </button>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-zinc-800 text-gray-200 rounded-lg hover:bg-zinc-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={selectedTypes.length === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedTypes.length === 0
                    ? 'bg-purple-600/50 text-white/70 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;