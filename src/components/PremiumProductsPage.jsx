import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import DataStatusAlert from './DataStatusAlert';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash.debounce';

// Icon components for better visual representation
const ServerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
);

const ClientIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AgentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const ReadyToUseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// Product Card Component with animation
const ProductCard = ({ product, onClick }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Function to determine the color based on product type
  const getTypeColor = (type) => {
    const typeMapping = {
      server: 'from-indigo-500 to-blue-600',
      client: 'from-blue-500 to-cyan-600',
      'ai-agent': 'from-rose-500 to-pink-600',
      'ready-to-use': 'from-amber-500 to-orange-600',
      // Database mappings
      'mcp_server': 'from-indigo-500 to-blue-600',
      'mcp_client': 'from-blue-500 to-cyan-600',
      'ai_agent': 'from-rose-500 to-pink-600',
      'ready_to_use': 'from-amber-500 to-orange-600'
    };
    
    // Normalize the type from database values to UI values
    const dbToUiType = {
      'mcp_server': 'server',
      'mcp_client': 'client',
      'ai_agent': 'ai-agent',
      'ready_to_use': 'ready-to-use' 
    };
    
    // Get normalized type for display
    const normalizedType = dbToUiType[product.product_type] || type || product.product_type;
    return typeMapping[normalizedType] || 'from-purple-500 to-violet-600';
  };

  // Function to get the icon based on product type
  const getTypeIcon = (type) => {
    // Normalize the type from database values to UI values
    const dbToUiType = {
      'mcp_server': 'server',
      'mcp_client': 'client',
      'ai_agent': 'ai-agent',
      'ready_to_use': 'ready-to-use' 
    };
    
    // Get normalized display type
    const normalizedType = dbToUiType[product.product_type] || type || product.product_type;
    
    switch (normalizedType) {
      case 'server':
      case 'mcp_server':
        return <ServerIcon />;
      case 'client':
      case 'mcp_client':
        return <ClientIcon />;
      case 'ai-agent':
      case 'ai_agent':
        return <AgentIcon />;
      case 'ready-to-use':
      case 'ready_to_use':
        return <ReadyToUseIcon />;
      default:
        return <ServerIcon />;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden h-full flex flex-col relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(product)}
    >
      <div className="bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 shadow-lg rounded-xl overflow-hidden flex flex-col h-full relative group">
        {/* Animated gradient border on hover */}
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${getTypeColor(product.type)} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
        
        {/* Image section */}
        <div className="relative h-44 bg-gradient-to-br from-zinc-800/70 to-zinc-900/70 flex items-center justify-center overflow-hidden">
          <img
            src={product.image_url || '/assets/news-images/fallback.jpg'}
            alt={product.name}
            className="max-w-[80%] max-h-[80%] object-contain transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              if (e.target.src !== '/assets/news-images/fallback.jpg') {
                e.target.src = '/assets/news-images/fallback.jpg';
              }
              e.target.onerror = null;
            }}
            loading="lazy"
            decoding="async"
          />
          
          {/* Product type badge */}
          <div 
            className={`absolute top-3 right-3 bg-gradient-to-r ${getTypeColor(product.type)} shadow-md text-xs px-2 py-1 rounded-full text-white flex items-center space-x-1 z-10`}
          >
            {getTypeIcon(product.type)}
            <span>
              {/* Show friendly UI name for product type */}
              {(() => {
                // Mapping from database types to display names
                if (product.product_type === 'mcp_server') return 'server';
                if (product.product_type === 'mcp_client') return 'client';
                if (product.product_type === 'ai_agent') return 'ai-agent';
                if (product.product_type === 'ready_to_use') return 'ready-to-use';
                return product.type || product.product_type || 'server';
              })()}
            </span>
          </div>
          
          {/* Featured badge if applicable */}
          {product.is_featured && (
            <div className="absolute top-3 left-3 bg-amber-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>Featured</span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
          
          {/* Product name on gradient */}
          <div className="absolute bottom-0 left-0 w-full p-4">
            <h3 className="text-white font-bold text-lg line-clamp-1 drop-shadow-md">
              {product.name}
            </h3>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Categories */}
          <div className="flex flex-wrap gap-1 mb-2">
            {Array.isArray(product.categories) && product.categories.length > 0 ? (
              product.categories.slice(0, 2).map((cat, idx) => (
                <span key={idx} className="text-xs bg-zinc-800 text-gray-300 px-2 py-0.5 rounded-full">
                  {cat}
                </span>
              ))
            ) : product.category ? (
              <span className="text-xs bg-zinc-800 text-gray-300 px-2 py-0.5 rounded-full">
                {product.category}
              </span>
            ) : null}
            
            {/* Show count of additional categories */}
            {Array.isArray(product.categories) && product.categories.length > 2 && (
              <span className="text-xs bg-zinc-800 text-gray-300 px-2 py-0.5 rounded-full">
                +{product.categories.length - 2} more
              </span>
            )}
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-400 line-clamp-3 flex-grow mb-3 group-hover:text-gray-300 transition-colors duration-300">
            {product.description || 'No description available'}
          </p>
          
          {/* Stats row */}
          <div className="flex justify-between items-center mt-auto">
            {/* Stars */}
            <div className="flex items-center">
              {product.stars_numeric > 0 ? (
                <>
                  <div className="flex text-yellow-500">
                    {[...Array(Math.min(5, Math.ceil(product.stars_numeric / 2000)))].map((_, i) => (
                      <StarIcon key={i} />
                    ))}
                    {[...Array(5 - Math.min(5, Math.ceil(product.stars_numeric / 2000)))].map((_, i) => (
                      <StarIcon key={i + 5} className="text-zinc-700" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    {product.stars_numeric.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-500">No ratings</span>
              )}
            </div>
            
            {/* Official badge if applicable */}
            {product.official && (
              <span className="text-xs bg-green-800/30 text-green-400 px-2 py-0.5 rounded-full">
                Official
              </span>
            )}
          </div>

          {/* View details button - appears on hover */}
          <div className={`transition-all duration-300 ease-in-out mt-3 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-colors duration-200 flex justify-center items-center">
              <span>View Details</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main ProductsPage Component
const PremiumProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // State management for filters and UI
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [sortOption, setSortOption] = useState('popularity');
  const [minStars, setMinStars] = useState(0);
  const [officialOnly, setOfficialOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Get products using our hook
  const {
    products,
    loading,
    error,
    dataStatus,
    fetchProducts,
    filterByProductType,
    searchProducts
  } = useProducts(1, 100); // Load up to 100 products initially
  
  // No fallback - rely exclusively on AWS database

  // Extract all unique categories from products
  const [allCategories, setAllCategories] = useState([]);
  useEffect(() => {
    if (products && products.length > 0) {
      const categories = new Set();
      products.forEach(product => {
        if (Array.isArray(product.categories)) {
          product.categories.forEach(cat => categories.add(cat));
        } else if (product.category) {
          categories.add(product.category);
        }
      });
      setAllCategories(Array.from(categories).sort());
    }
  }, [products]);

  // Function to extract filter options from URL on mount
  useEffect(() => {
    // The loading state is handled by the useProducts hook
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const categories = searchParams.get('categories');
    const stars = searchParams.get('stars');
    const official = searchParams.get('official');
    
    // Set initial state based on URL params, but only if they're valid and not null
    const isValidType = type && type !== 'null' && type !== 'undefined';
    
    if (isValidType) {
      setActiveTab(type);
    }
    if (search) setSearchTerm(search);
    if (sort) setSortOption(sort);
    if (categories) setSelectedCategories(categories.split(','));
    if (stars) setMinStars(parseInt(stars));
    if (official === 'true') setOfficialOnly(true);
    
    // Only apply filters from URL if they're present and valid
    if (isValidType || search || categories) {
      if (isValidType) {
        // Map the UI tab value to database product_type if needed
        const productType = mapTabToProductType(type);
        loadFilteredProducts(productType, search, categories ? categories.split(',') : [], false);
      } else {
        loadFilteredProducts('all', search, categories ? categories.split(',') : [], false);
      }
    } else {
      // Just load all products without updating URL for initial page load
      fetchProducts();
    }
  }, []);

  // Main function to load products with all current filters applied
  const loadFilteredProducts = async (type = activeTab, search = searchTerm, categories = selectedCategories, updateUrl = true) => {
    // Loading state is handled by the useProducts hook's internal implementation
    
    // Normalize the type parameter to handle edge cases
    const normalizedType = type === null || type === undefined || type === 'null' || type === 'undefined' ? 'all' : type;
    
    console.log(`Loading filtered products: type=${normalizedType}, search=${search}, categories=${categories.join(',') || 'none'}`);
    
    try {
      // First fetch products based on type
      if (normalizedType !== 'all') {
        console.log(`Filtering by product type: ${normalizedType}`);
        const result = await filterByProductType(normalizedType);
        console.log(`Filtered by type - received ${result?.products?.length || 0} products`);
      } else {
        console.log('Loading all products');
        const result = await fetchProducts();
        console.log(`Fetched all products - received ${result?.products?.length || 0} products`);
      }
      
      // Then apply search filter if provided
      if (search && search.trim() !== '') {
        console.log(`Searching for: ${search}`);
        const result = await searchProducts(search);
        console.log(`Search results - received ${result?.products?.length || 0} products`);
      }
      
      // Debug overall state
      console.log(`Current products state has ${products?.length || 0} items`);
      
      // Only update URL if updateUrl flag is true
      if (updateUrl) {
        // Update URL params to reflect current filters
        const params = new URLSearchParams();
        
        // Only add type parameter if it's valid and not 'all'
        if (normalizedType !== 'all' && normalizedType !== null && normalizedType !== undefined) {
          params.set('type', normalizedType);
        }
        
        // Add other filters
        if (search && search.trim() !== '') params.set('search', search);
        if (sortOption !== 'popularity') params.set('sort', sortOption);
        if (categories.length > 0) params.set('categories', categories.join(','));
        if (minStars > 0) params.set('stars', minStars.toString());
        if (officialOnly) params.set('official', 'true');
        
        // Update URL without full page reload
        navigate({ search: params.toString() }, { replace: true });
      }
    } catch (err) {
      console.error('Error loading filtered products:', err);
      // We cannot use setError directly as it's part of the useProducts hook
      // The error will be handled in the useProducts hook
    }
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((term) => {
      loadFilteredProducts(activeTab, term, selectedCategories, true);
    }, 500),
    [activeTab, selectedCategories]
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Function to map UI tab names to database product types
  const mapTabToProductType = (tab) => {
    if (tab === 'server') return 'mcp_server';
    if (tab === 'client') return 'mcp_client';
    if (tab === 'ai-agent') return 'ai_agent';
    if (tab === 'ready-to-use') return 'ready_to_use';
    return tab; // Return as-is for 'all' or if already DB format
  };

  // Handle product type tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Map UI tabs to database product_type values
    const productType = mapTabToProductType(tab);
    
    console.log(`Tab changed to: ${tab}, querying database for product_type: ${productType}`);
    
    // Clear any existing filters when changing tabs
    setSelectedCategories([]);
    setMinStars(0);
    setOfficialOnly(false);
    
    // Loading state is handled automatically by the useProducts hook
    
    // Load products with the selected type, but don't update URL with filter parameters
    if (tab === 'all') {
      // For "All Products" tab, just fetch all products
      fetchProducts().finally(() => {
        // Update URL to clear any filter parameters
        navigate('', { replace: true });
      });
    } else {
      // For other tabs, filter by product type
      loadFilteredProducts(productType, '', [], false);
    }
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newSelectedCategories);
    loadFilteredProducts(activeTab, searchTerm, newSelectedCategories, true);
  };

  // Handle sort option changes
  const handleSortChange = (option) => {
    setSortOption(option);
    
    // Apply sorting to the URL
    const params = new URLSearchParams(location.search);
    params.set('sort', option);
    navigate({ search: params.toString() }, { replace: true });
  };

  // Apply all current filters
  const applyFilters = () => {
    loadFilteredProducts(activeTab, searchTerm, selectedCategories, true);
    setFilterDrawerOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    // Loading state is handled by useProducts hook
    
    // Reset all state
    setSearchTerm('');
    setActiveTab('all');
    setSortOption('popularity');
    setMinStars(0);
    setOfficialOnly(false);
    setSelectedCategories([]);
    
    // Clear URL parameters
    navigate('', { replace: true });
    
    // Reload all products
    fetchProducts();
    
    // Close filters drawer if open
    setFilterDrawerOpen(false);
  };

  // Handle individual product click
  const handleProductClick = (product) => {
    try {
      // Cache product data for faster loading
      sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    } catch (err) {
      console.warn("Could not cache product data:", err);
    }
    
    // Navigate based on product type
    if (product.type === 'client' || product.product_type === 'client') {
      navigate(`/products/client-${product.id}`);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  // Apply current client-side filters to products
  const filteredProducts = React.useMemo(() => {
    if (!products || products.length === 0) {
      console.log('No products to filter - API returned no data');
      return [];
    }
    
    console.log(`Filtering ${products.length} products with client-side filters`);
    
    let result = [...products];
    
    // No need to map types here - we'll handle display in the product card component
    
    // Apply stars filter
    if (minStars > 0) {
      const before = result.length;
      result = result.filter(p => (p.stars_numeric || 0) >= minStars);
      console.log(`Stars filter (>=${minStars}): ${before} → ${result.length} products`);
    }
    
    // Apply official filter
    if (officialOnly) {
      const before = result.length;
      result = result.filter(p => p.official === true);
      console.log(`Official filter: ${before} → ${result.length} products`);
    }
    
    // Apply selected categories filter
    if (selectedCategories.length > 0) {
      const before = result.length;
      result = result.filter(p => {
        if (Array.isArray(p.categories) && p.categories.length > 0) {
          return p.categories.some(cat => selectedCategories.includes(cat));
        } else if (p.category) {
          return selectedCategories.includes(p.category);
        }
        return false;
      });
      console.log(`Categories filter (${selectedCategories.join(', ')}): ${before} → ${result.length} products`);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'popularity':
        result.sort((a, b) => (b.stars_numeric || 0) - (a.stars_numeric || 0));
        break;
      case 'newest':
        result.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        break;
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
    }
    
    console.log(`Final filtered products: ${result.length} items`);
    return result;
  }, [products, minStars, officialOnly, selectedCategories, sortOption]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 py-8 px-4 md:px-6">
      {/* Show data status alert if there's an error */}
      {dataStatus && dataStatus.type === 'error' && (
        <div className="mb-6">
          <DataStatusAlert />
        </div>
      )}
      
      {/* Page header with gradient text */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-indigo-300 to-purple-300">
          Explore AI Solutions
        </h1>
        <p className="text-center text-gray-400 max-w-3xl mx-auto">
          Discover powerful MCP servers, clients, AI agents, and ready-to-use solutions to enhance your AI capabilities
        </p>
      </div>
      
      {/* Main search bar with filter button */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="relative flex items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search for products, categories, or keywords..."
              className="w-full py-3 pl-12 pr-4 bg-zinc-800/70 border border-zinc-700/80 hover:border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-gray-200 rounded-xl shadow-lg"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            
            {/* Clear search button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  loadFilteredProducts(activeTab, '', selectedCategories, true);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Advanced filter button */}
          <button 
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`ml-2 p-3 rounded-xl border ${filterDrawerOpen ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:border-purple-500/50'} transition-colors duration-300 flex items-center`}
            aria-label="Toggle filters"
          >
            <FilterIcon />
            <span className="ml-2 hidden md:inline">Filters</span>
            
            {/* Filter count badge */}
            {(minStars > 0 || officialOnly || selectedCategories.length > 0) && (
              <span className="ml-2 bg-purple-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {(minStars > 0 ? 1 : 0) + (officialOnly ? 1 : 0) + selectedCategories.length}
              </span>
            )}
          </button>
          
          {/* View mode toggles */}
          <div className="ml-2 p-1 bg-zinc-800 border border-zinc-700 rounded-lg hidden md:flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-gray-400 hover:text-white'}`}
              aria-label="Grid view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-gray-400 hover:text-white'}`}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Advanced filter drawer */}
        <AnimatePresence>
          {filterDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 rounded-xl p-5 overflow-hidden shadow-xl"
            >
              <div className="flex flex-col md:flex-row md:flex-wrap gap-6">
                {/* Categories section */}
                <div className="md:w-1/3">
                  <h3 className="font-medium text-gray-200 mb-3">Categories</h3>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {allCategories.map(category => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
                        />
                        <label htmlFor={`category-${category}`} className="text-gray-300 text-sm ml-2 cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                    {allCategories.length === 0 && (
                      <p className="text-sm text-gray-500">No categories available</p>
                    )}
                  </div>
                </div>
                
                {/* Popularity filter */}
                <div className="md:w-1/3">
                  <h3 className="font-medium text-gray-200 mb-3">Popularity</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Minimum stars</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="500"
                          value={minStars}
                          onChange={(e) => setMinStars(parseInt(e.target.value))}
                          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="w-16 text-center text-sm bg-zinc-700 rounded-md py-1 px-2 text-gray-200">
                          {minStars > 0 ? minStars.toLocaleString() : 'Any'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Quick preset buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setMinStars(0)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${minStars === 0 ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'}`}
                      >
                        Any
                      </button>
                      <button
                        onClick={() => setMinStars(1000)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${minStars === 1000 ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'}`}
                      >
                        1,000+
                      </button>
                      <button
                        onClick={() => setMinStars(5000)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${minStars === 5000 ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'}`}
                      >
                        5,000+
                      </button>
                      <button
                        onClick={() => setMinStars(10000)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${minStars === 10000 ? 'bg-purple-600 text-white' : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'}`}
                      >
                        10,000+
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Other filters */}
                <div className="md:w-1/3">
                  <h3 className="font-medium text-gray-200 mb-3">Other filters</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="official-only"
                        checked={officialOnly}
                        onChange={() => setOfficialOnly(!officialOnly)}
                        className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
                      />
                      <label htmlFor="official-only" className="text-gray-300 text-sm ml-2 cursor-pointer">
                        Show official products only
                      </label>
                    </div>
                    
                    {/* Sort options */}
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Sort by</label>
                      <select
                        value={sortOption}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg py-2 px-3 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="popularity">Popularity</option>
                        <option value="newest">Newest</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Filter actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-zinc-600 hover:border-zinc-500 text-gray-300 rounded-lg transition-colors duration-200"
                >
                  Reset filters
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                >
                  Apply filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Product type tabs */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-5 py-2.5 rounded-full transition-all ${activeTab === 'all' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            All Products
          </button>
          <button
            onClick={() => handleTabChange('server')}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center ${activeTab === 'server' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            <ServerIcon />
            <span className="ml-1.5">MCP Servers</span>
          </button>
          <button
            onClick={() => handleTabChange('client')}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center ${activeTab === 'client' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            <ClientIcon />
            <span className="ml-1.5">MCP Clients</span>
          </button>
          <button
            onClick={() => handleTabChange('ai-agent')}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center ${activeTab === 'ai-agent' ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            <AgentIcon />
            <span className="ml-1.5">AI Agents</span>
          </button>
          <button
            onClick={() => handleTabChange('ready-to-use')}
            className={`px-5 py-2.5 rounded-full transition-all flex items-center ${activeTab === 'ready-to-use' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            <ReadyToUseIcon />
            <span className="ml-1.5">Ready to Use</span>
          </button>
        </div>
      </div>
      
      {/* Applied filters badges (visible when filters are applied) */}
      {(selectedCategories.length > 0 || minStars > 0 || officialOnly) && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            
            {/* Category badges */}
            {selectedCategories.map(category => (
              <span 
                key={category} 
                className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/20"
              >
                {category}
                <button
                  onClick={() => handleCategoryChange(category)}
                  className="ml-1.5 text-purple-400 hover:text-white"
                  aria-label={`Remove ${category} filter`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            
            {/* Stars badge */}
            {minStars > 0 && (
              <span className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-yellow-600/20 text-yellow-400 border border-yellow-500/20">
                {minStars.toLocaleString()}+ Stars
                <button
                  onClick={() => setMinStars(0)}
                  className="ml-1.5 text-yellow-400 hover:text-white"
                  aria-label="Remove stars filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            
            {/* Official badge */}
            {officialOnly && (
              <span className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-green-600/20 text-green-400 border border-green-500/20">
                Official only
                <button
                  onClick={() => setOfficialOnly(false)}
                  className="ml-1.5 text-green-400 hover:text-white"
                  aria-label="Remove official filter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            
            {/* Clear all button */}
            <button
              onClick={resetFilters}
              className="text-xs text-gray-400 hover:text-white underline ml-2"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
      
      {/* Results count and sorting info */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Showing <span className="text-white font-medium">{filteredProducts.length}</span> products
          {searchTerm && (
            <span> for "<span className="text-purple-400">{searchTerm}</span>"</span>
          )}
        </div>
        
        {/* Sort by (mobile) */}
        <div className="md:hidden">
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-sm bg-gray-800 border border-gray-700 text-gray-200 rounded-lg py-1.5 px-2"
          >
            <option value="popularity">Sort: Popularity</option>
            <option value="newest">Sort: Newest</option>
            <option value="name-asc">Sort: A-Z</option>
            <option value="name-desc">Sort: Z-A</option>
          </select>
        </div>
      </div>
      
      {/* Loading state with proper spinner and skeleton cards */}
      {loading ? (
        <div className="max-w-7xl mx-auto">
          {/* Loading spinner overlay */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-full">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading products...</span>
            </div>
          </div>
          
          {/* Skeleton cards */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl overflow-hidden h-80 relative">
                {/* Image skeleton */}
                <div className="h-44 bg-gray-700/50 animate-pulse"></div>
                
                {/* Content skeleton */}
                <div className="p-4 space-y-3">
                  {/* Title skeleton */}
                  <div className="h-6 bg-gray-700/50 rounded animate-pulse w-3/4"></div>
                  
                  {/* Category skeleton */}
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-700/50 rounded-full animate-pulse w-16"></div>
                    <div className="h-5 bg-gray-700/50 rounded-full animate-pulse w-16"></div>
                  </div>
                  
                  {/* Description skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-4/6"></div>
                  </div>
                  
                  {/* Stats skeleton */}
                  <div className="flex justify-between mt-2">
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-20"></div>
                    <div className="h-4 bg-gray-700/50 rounded animate-pulse w-16"></div>
                  </div>
                </div>
                
                {/* Shine effect for better loading UX */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Error message if database connection failed */}
          {error && (
            <div className="bg-red-600/20 border border-red-700/30 text-red-100 p-6 rounded-lg mb-8">
              <h3 className="font-bold text-xl mb-2">Database Connection Error</h3>
              <p>{error}</p>
            </div>
          )}
          
          {/* No results message */}
          {!error && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-gray-900/40 rounded-xl border border-gray-800/60 shadow-lg max-w-2xl mx-auto">
              <div className="text-gray-400 w-16 h-16 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-gray-400 text-center mb-6">
                No products match your current search and filter criteria.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors duration-300"
              >
                Reset all filters
              </button>
            </div>
          )}
          
          {/* Products grid/list */}
          {!error && filteredProducts.length > 0 && (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              <AnimatePresence>
                {filteredProducts.map((product) => {
                  // Ensure a key is always available by using fallbacks
                  const uniqueKey = product.id || product.name || Math.random().toString(36).substring(7);
                  
                  return (
                    <ProductCard 
                      key={uniqueKey} 
                      product={product} 
                      onClick={handleProductClick} 
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
      
      {/* Back to Top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:transform hover:scale-110 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default PremiumProductsPage;