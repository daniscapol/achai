import React, { useState, useEffect } from 'react';
import AdvancedSearchModal from './AdvancedSearchModal';

const SearchResultsLayout = ({ children }) => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  // Update active filters whenever search params change
  useEffect(() => {
    const updateActiveFilters = () => {
      const hash = window.location.hash;
      if (!hash.includes('?')) {
        setActiveFilters([]);
        return;
      }
      
      const searchParamsString = hash.split('?')[1];
      const searchParams = new URLSearchParams(searchParamsString);
      const filters = [];
      
      // Add query filter if present
      const query = searchParams.get('q');
      if (query) {
        filters.push({
          type: 'query',
          label: query,
          param: 'q',
          value: query
        });
      }
      
      // Add category filter if present
      const category = searchParams.get('category');
      if (category) {
        filters.push({
          type: 'category',
          label: category.replace(/-/g, ' '),
          param: 'category',
          value: category
        });
      }
      
      // Add type filter if present
      const type = searchParams.get('type');
      if (type && type !== 'all') {
        filters.push({
          type: 'type',
          label: type === 'server' ? 'Servers Only' : 
                type === 'client' ? 'Clients Only' : 
                type === 'category' ? 'Categories Only' : type,
          param: 'type',
          value: type
        });
      }
      
      // Add categories filter if present (comma-separated)
      const categories = searchParams.get('categories');
      if (categories) {
        const categoryList = categories.split(',');
        categoryList.forEach(cat => {
          filters.push({
            type: 'category',
            label: cat.replace(/-/g, ' '),
            param: 'categories',
            value: categories,
            removeValue: cat
          });
        });
      }
      
      // Add minimum rating filter if present
      const minRating = searchParams.get('minRating');
      if (minRating) {
        filters.push({
          type: 'rating',
          label: `${minRating}+ stars`,
          param: 'minRating',
          value: minRating
        });
      }
      
      // Add official only filter if present
      const official = searchParams.get('official');
      if (official === 'true') {
        filters.push({
          type: 'official',
          label: 'Official Only',
          param: 'official',
          value: 'true'
        });
      }
      
      setActiveFilters(filters);
    };
    
    // Listen for hash changes
    window.addEventListener('hashchange', updateActiveFilters);
    
    // Initial update
    updateActiveFilters();
    
    return () => {
      window.removeEventListener('hashchange', updateActiveFilters);
    };
  }, []);

  // Remove a filter
  const removeFilter = (filter) => {
    const hash = window.location.hash;
    if (!hash.includes('?')) return;
    
    const [baseUrl, paramsString] = hash.split('?');
    const searchParams = new URLSearchParams(paramsString);
    
    // Special handling for filters that have multiple values (like categories)
    if (filter.removeValue && filter.param === 'categories') {
      const values = filter.value.split(',');
      const newValues = values.filter(v => v !== filter.removeValue);
      
      if (newValues.length > 0) {
        searchParams.set(filter.param, newValues.join(','));
      } else {
        searchParams.delete(filter.param);
      }
    } else {
      searchParams.delete(filter.param);
    }
    
    // Navigate to the new URL
    const newParamsString = searchParams.toString();
    const newUrl = newParamsString ? `${baseUrl}?${newParamsString}` : baseUrl;
    
    // First update the hash
    window.location.hash = newUrl;
    
    // Then force a page reload to ensure filters are applied
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const hash = window.location.hash;
    if (!hash.includes('?')) return;
    
    const baseUrl = hash.split('?')[0];
    
    // First update the hash
    window.location.hash = baseUrl;
    
    // Then force a page reload to ensure filters are applied
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  // Toggle advanced search modal
  const toggleAdvancedSearch = () => {
    setIsAdvancedSearchOpen(!isAdvancedSearchOpen);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Advanced search toggle button - moved to top area */}
      <div className="container mx-auto px-4 pt-4 flex justify-end">
        <button
          onClick={toggleAdvancedSearch}
          className="px-3 py-1.5 flex items-center gap-2 text-sm text-gray-300 hover:text-white hover:bg-purple-600/20 rounded transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Advanced Filters
        </button>
      </div>
      
      {/* Main Content with active filters */}
      <main className="flex-grow">
        {/* Active Filters Bar - moved here to be more visible and closer to results */}
        {activeFilters.length > 0 && (
          <div className="bg-gradient-to-r from-purple-900/30 to-zinc-900/30 py-3 mb-4 mt-4 mx-4 rounded-xl border border-purple-500/20">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-white text-base mr-2">Active filters:</span>
                
                {activeFilters.map((filter, index) => (
                  <button
                    key={`${filter.type}-${filter.value}-${index}`}
                    onClick={() => removeFilter(filter)}
                    className="inline-flex items-center bg-purple-600/30 hover:bg-purple-600/50 text-white text-sm px-3 py-1.5 rounded-lg shadow-sm transition-all duration-200"
                  >
                    <span className="mr-1 font-medium">
                      {filter.type === 'query' && 'Search: '}
                      {filter.type === 'category' && 'Category: '}
                      {filter.type === 'type' && 'Type: '}
                      {filter.type === 'rating' && 'Rating: '}
                      {filter.type === 'official' && ''}
                    </span>
                    <span>{filter.label}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ))}
                
                <button
                  onClick={clearAllFilters}
                  className="text-sm bg-purple-600/10 hover:bg-purple-600/30 text-purple-300 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 ml-auto flex items-center"
                >
                  <span>Clear all</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {children}
      </main>
      
      {/* Advanced Search Modal */}
      <AdvancedSearchModal 
        isOpen={isAdvancedSearchOpen} 
        onClose={() => setIsAdvancedSearchOpen(false)} 
      />
    </div>
  );
};

export default SearchResultsLayout;