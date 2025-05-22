import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ChevronRight, ChevronLeft, Star, Search, X } from 'lucide-react';

const NetflixStyleProductsPage = () => {
  const navigate = useNavigate();
  
  // Parse URL query parameters to initialize state
  const parseUrlParams = () => {
    // Get query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    
    // Parse from URL query parameters if available
    const query = params.get('q') || '';
    const category = params.get('category') || 'all';
    const sort = params.get('sort') || 'featured';
    const view = params.get('view') || 'categorized';
    
    // Parse filters from URL
    const types = params.get('types') ? params.get('types').split(',') : [];
    const categories = params.get('categories') ? params.get('categories').split(',') : [];
    const ratings = params.get('ratings') ? params.get('ratings').split(',').map(Number) : [];
    const priceMin = params.get('priceMin') ? Number(params.get('priceMin')) : 0;
    const priceMax = params.get('priceMax') ? Number(params.get('priceMax')) : 1000;
    
    return {
      searchQuery: query,
      activeCategory: category,
      sortOption: sort,
      viewMode: view,
      selectedFilters: {
        types,
        categories,
        ratings,
        priceRange: { min: priceMin, max: priceMax }
      }
    };
  };
  
  // Get initial state from URL
  const initialState = parseUrlParams();
  
  // Initialize state with URL values if available
  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [allCategories, setAllCategories] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [combinedProducts, setCombinedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialState.activeCategory);
  const [sortOption, setSortOption] = useState(initialState.sortOption);
  const [viewMode, setViewMode] = useState(initialState.viewMode);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(initialState.selectedFilters);
  
  // Update URL with current filters and state
  const updateUrl = () => {
    const params = new URLSearchParams();
    
    // Only add parameters that are different from defaults
    if (searchQuery) params.set('q', searchQuery);
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (sortOption !== 'featured') params.set('sort', sortOption);
    if (viewMode !== 'categorized') params.set('view', viewMode);
    
    // Only add filter parameters if they have values
    if (selectedFilters.types.length > 0) params.set('types', selectedFilters.types.join(','));
    if (selectedFilters.categories.length > 0) params.set('categories', selectedFilters.categories.join(','));
    if (selectedFilters.ratings.length > 0) params.set('ratings', selectedFilters.ratings.join(','));
    if (selectedFilters.priceRange.min > 0) params.set('priceMin', selectedFilters.priceRange.min.toString());
    if (selectedFilters.priceRange.max < 1000) params.set('priceMax', selectedFilters.priceRange.max.toString());
    
    // Determine if we should use direct path or hash-based URL
    const isDirectPath = window.location.pathname.includes('/products');
    const searchParamsString = params.toString();
    
    if (isDirectPath) {
      // Update URL with React Router (doesn't reload the page)
      navigate({
        pathname: '/products',
        search: searchParamsString ? `?${searchParamsString}` : ''
      }, { replace: true });
    } else {
      // For hash-based URLs, update the hash
      window.location.hash = `#/products${searchParamsString ? `?${searchParamsString}` : ''}`;
    }
  };
  
  // Get products from API
  const {
    products: dbProducts,
    loading: dbLoading,
    error: dbError,
    fetchProducts,
    searchProducts: searchDbProducts
  } = useProducts(1, 50);

  // Function to fetch MCP unified data for integration
  const fetchMcpData = async () => {
    try {
      if (window.mcpServersDirectData && Array.isArray(window.mcpServersDirectData)) {
        return window.mcpServersDirectData;
      }
      
      if (window.unifiedSearchData && Array.isArray(window.unifiedSearchData)) {
        return window.unifiedSearchData;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching MCP data:", error);
      return [];
    }
  };

  // Function to combine product data
  const combineProductData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch MCP data with timeout
      const mcpData = await fetchMcpData();
      
      let formattedDbProducts = [];
      
      if (!dbLoading && dbProducts && dbProducts.length > 0) {
        formattedDbProducts = dbProducts.map(product => ({
          ...product,
          id: String(product.id),
          type: 'custom-product',
          stars: product.stars_numeric || 0,
          shortDescription: product.description 
            ? product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '') 
            : 'No description available.',
          longDescription: product.description || 'No detailed description available.',
          categories: product.category ? [product.category] : ['Products'],
          name: product.name || 'Unnamed Product',
          image_url: product.image_url || '/assets/news-images/fallback.jpg',
          local_image_path: product.image_url || '/assets/news-images/fallback.jpg',
          price: product.price || 0,
          keyFeatures: [],
          useCases: []
        }));
      }
      
      // Combine all data sources
      const allProducts = [...formattedDbProducts, ...mcpData];
      
      // Extract all categories
      const categorySet = new Set();
      allProducts.forEach(product => {
        if (product.category) {
          categorySet.add(product.category);
        }
        if (product.categories && Array.isArray(product.categories)) {
          product.categories.forEach(cat => categorySet.add(cat));
        }
      });
      
      setAllCategories(Array.from(categorySet).sort());
      setCombinedProducts(allProducts);
    } catch (error) {
      console.error("Error combining product data:", error);
      setCombinedProducts([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Apply filters to products
  const applyFilters = (products) => {
    return products.filter(product => {
      // Filter by type
      if (selectedFilters.types.length > 0 && 
          !selectedFilters.types.includes(product.type)) {
        return false;
      }
      
      // Filter by categories
      if (selectedFilters.categories.length > 0) {
        const productCategories = [];
        if (product.category) productCategories.push(product.category);
        if (product.categories && Array.isArray(product.categories)) {
          productCategories.push(...product.categories);
        }
        
        if (!productCategories.some(cat => selectedFilters.categories.includes(cat))) {
          return false;
        }
      }
      
      // Filter by rating
      if (selectedFilters.ratings.length > 0) {
        const productRating = Math.floor(product.stars || product.stars_numeric || 0);
        if (!selectedFilters.ratings.includes(productRating)) {
          return false;
        }
      }
      
      // Filter by price range
      if (product.price) {
        const price = Number(product.price);
        if (price < selectedFilters.priceRange.min || price > selectedFilters.priceRange.max) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Sort products
  const sortProducts = (products) => {
    const productsToSort = [...products];
    
    switch (sortOption) {
      case 'featured':
        return productsToSort.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      case 'name_asc':
        return productsToSort.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name_desc':
        return productsToSort.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'rating_desc':
        return productsToSort.sort((a, b) => (b.stars || b.stars_numeric || 0) - (a.stars || a.stars_numeric || 0));
      case 'price_asc':
        return productsToSort.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return productsToSort.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'newest':
        // Using id as a proxy for "newest" since we don't have date fields
        return productsToSort.sort((a, b) => String(b.id).localeCompare(String(a.id)));
      default:
        return productsToSort;
    }
  };

  // Group products by category
  const getProductsByCategory = () => {
    // Create an object to hold all categories including product types
    const categories = {
      featured: [],
      servers: [],
      clients: [],
      aiAgents: [],
      trending: [], // Added trending category
      popular: [], // Added popular category
      recent: [], // Added recent additions
    };
    
    // Add all user categories from products
    allCategories.forEach(category => {
      categories[category] = [];
    });
    
    // Handle searching - return a single row with search results
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      let searchResults = combinedProducts.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(query)) ||
        (p.longDescription && p.longDescription.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
      
      // Apply filtering and sorting to search results
      searchResults = applyFilters(searchResults);
      searchResults = sortProducts(searchResults);
      
      return { searchResults };
    }
    
    // If in view all mode, return everything in a flat structure
    if (viewMode === 'viewAll') {
      let allProducts = [...combinedProducts];
      
      // Apply filters and sort
      allProducts = applyFilters(allProducts);
      allProducts = sortProducts(allProducts);
      
      return { viewAll: allProducts };
    }
    
    // Apply filters to our products first
    const filteredProducts = applyFilters(combinedProducts);
    
    // Fill categories
    filteredProducts.forEach(product => {
      // Add to trending (based on stars if available)
      if ((product.stars || product.stars_numeric || 0) > 4) {
        categories.trending.push(product);
      }
      
      // Add to featured if applicable
      if (product.is_featured) {
        categories.featured.push(product);
      }
      
      // Add 20% of products to "popular" randomly but deterministically based on id
      const productIdNum = parseInt(String(product.id).replace(/\D/g, '') || '0', 10);
      if (productIdNum % 5 === 0) {
        categories.popular.push(product);
      }
      
      // Add newer products (by ID) to "recent"
      const productId = String(product.id);
      if (!isNaN(parseInt(productId)) && parseInt(productId) > combinedProducts.length * 0.7) {
        categories.recent.push(product);
      }
      
      // Add to product type categories
      if (product.type === 'server') {
        categories.servers.push(product);
      } else if (product.type === 'client') {
        categories.clients.push(product);
      } else if (product.type === 'ai-agent') {
        categories.aiAgents.push(product);
      }
      
      // Add to specific categories
      if (product.category) {
        if (!categories[product.category]) {
          categories[product.category] = [];
        }
        categories[product.category].push(product);
      }
      
      // Add to all array categories
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(cat => {
          if (!categories[cat]) {
            categories[cat] = [];
          }
          categories[cat].push(product);
        });
      }
    });
    
    // Sort each category based on the current sort option
    Object.keys(categories).forEach(key => {
      categories[key] = sortProducts(categories[key]);
    });
    
    // Only return categories that have products
    const filteredCategories = {};
    Object.keys(categories).forEach(key => {
      if (categories[key].length > 0) {
        filteredCategories[key] = categories[key];
      }
    });
    
    return filteredCategories;
  };

  // Load products when component mounts or DB products change
  useEffect(() => {
    combineProductData();
  }, [dbProducts]);
  
  // Update URL when state changes
  useEffect(() => {
    // Skip the initial render
    if (!isLoading && combinedProducts.length > 0) {
      updateUrl();
    }
  }, [activeCategory, sortOption, viewMode, searchQuery]);
  
  // Listen for URL changes (e.g., browser back/forward buttons)
  useEffect(() => {
    const handleUrlChange = () => {
      const newState = parseUrlParams();
      
      // Only update state if it's different from current state
      if (newState.searchQuery !== searchQuery) {
        setSearchQuery(newState.searchQuery);
      }
      
      if (newState.activeCategory !== activeCategory) {
        setActiveCategory(newState.activeCategory);
      }
      
      if (newState.sortOption !== sortOption) {
        setSortOption(newState.sortOption);
      }
      
      if (newState.viewMode !== viewMode) {
        setViewMode(newState.viewMode);
      }
      
      // Update filters if they've changed
      const currentFiltersJson = JSON.stringify(selectedFilters);
      const newFiltersJson = JSON.stringify(newState.selectedFilters);
      
      if (currentFiltersJson !== newFiltersJson) {
        setSelectedFilters(newState.selectedFilters);
      }
    };
    
    // Add event listeners for both hash changes and popstate (browser navigation)
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [searchQuery, activeCategory, sortOption, viewMode, selectedFilters]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    searchDbProducts(searchQuery);
    // Update URL with new search query
    updateUrl();
  };
  
  // Handle sort change
  const handleSortChange = (option) => {
    setSortOption(option);
    // Update URL when sort option changes
    setTimeout(() => updateUrl(), 0);
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Update URL when view mode changes
    setTimeout(() => updateUrl(), 0);
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Update URL when category changes
    setTimeout(() => updateUrl(), 0);
  };
  
  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'types' || filterType === 'categories' || filterType === 'ratings') {
        // Toggle the value in the array
        if (newFilters[filterType].includes(value)) {
          newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        } else {
          newFilters[filterType] = [...newFilters[filterType], value];
        }
      } else if (filterType === 'priceRange') {
        newFilters.priceRange = value;
      }
      
      return newFilters;
    });
    
    // Update URL when filters change (with a slight delay to ensure state is updated)
    setTimeout(() => updateUrl(), 0);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      types: [],
      categories: [],
      ratings: [],
      priceRange: { min: 0, max: 1000 }
    });
    setViewMode('categorized');
    setSortOption('featured');
    setActiveCategory('all');
    
    // Update URL when filters are cleared
    setTimeout(() => updateUrl(), 0);
  };
  
  // Handle search query change
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      // If search is cleared, update URL immediately
      setTimeout(() => updateUrl(), 0);
    }
  };

  // Handle product click
  const handleProductClick = (product) => {
    try {
      // Cache product data for faster loading
      if (product.type === 'custom-product') {
        const existingCache = sessionStorage.getItem('cached_custom_products');
        if (existingCache) {
          const parsedCache = JSON.parse(existingCache);
          const existingIndex = parsedCache.findIndex(p => String(p.id) === String(product.id));
          
          if (existingIndex >= 0) {
            parsedCache[existingIndex] = {...product};
          } else {
            parsedCache.push({...product});
          }
          
          sessionStorage.setItem('cached_custom_products', JSON.stringify(parsedCache));
        } else {
          sessionStorage.setItem('cached_custom_products', JSON.stringify([{...product}]));
        }
      } else {
        sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
      }
    } catch (err) {
      console.warn("Could not cache product data:", err);
    }
    
    // Determine if we're on direct URL or hash-based URL
    const isDirectUrlPath = window.location.pathname.includes('/netflix-products');
    
    // Navigate based on product type and current URL state
    if (isDirectUrlPath) {
      // We're on a direct URL path, need to use full URLs
      if (product.type === 'custom-product') {
        window.location.href = `${window.location.origin}/products/${product.id}`;
      } else if (product.type === 'client') {
        window.location.href = `${window.location.origin}/#/products/client-${product.id}`;
      } else {
        window.location.href = `${window.location.origin}/#/products/${product.id}`;
      }
    } else {
      // We're already on a hash-based URL, just change the hash
      if (product.type === 'custom-product') {
        navigate(`/products/${product.id}`);
      } else if (product.type === 'client') {
        window.location.hash = `#/products/client-${product.id}`;
      } else {
        window.location.hash = `#/products/${product.id}`;
      }
    }
  };

  // Get products organized by category
  const categorizedProducts = getProductsByCategory();

  // Component for a scrollable row
  const ProductRow = ({ title, products, isLarge = false, onViewAll = null, hideViewAll = false }) => {
    const rowRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    
    const checkScrollButtons = () => {
      if (rowRef.current) {
        // Check if we can scroll left
        setCanScrollLeft(rowRef.current.scrollLeft > 10);
        
        // Check if we can scroll right
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
        const maxScrollLeft = scrollWidth - clientWidth - 10;
        setCanScrollRight(scrollLeft < maxScrollLeft);
      }
    };
    
    useEffect(() => {
      // Check on mount
      checkScrollButtons();
      
      // Add event listener with debounce
      const rowElement = rowRef.current;
      if (rowElement) {
        // Create debounced scroll handler to prevent excessive updates
        let scrollTimeout;
        const handleScroll = () => {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            checkScrollButtons();
          }, 100);
        };
        
        rowElement.addEventListener('scroll', handleScroll);
        
        // Also recheck when window resizes - with debounce
        let resizeTimeout;
        const handleResize = () => {
          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            checkScrollButtons();
          }, 100);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
          rowElement.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleResize);
          if (scrollTimeout) clearTimeout(scrollTimeout);
          if (resizeTimeout) clearTimeout(resizeTimeout);
        };
      }
    }, [products]);
    
    const scroll = (direction) => {
      if (rowRef.current) {
        const { scrollLeft, clientWidth } = rowRef.current;
        const scrollTo = direction === 'left' 
          ? scrollLeft - clientWidth * 0.75 
          : scrollLeft + clientWidth * 0.75;
          
        rowRef.current.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      }
    };
    
    return (
      <div className={`mb-12 ${isLarge ? 'mt-8' : ''}`}>
        <div className="flex justify-between items-center mb-4 pl-2 pr-4">
          <h2 className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300`}>
            {title}
          </h2>
          
          {!hideViewAll && onViewAll && (
            <button
              onClick={onViewAll}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center group transition-colors duration-300"
            >
              <span>Explore All</span>
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          )}
        </div>
        
        <div className="relative group">
          {/* Left scroll button */}
          <button 
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-zinc-900/80 text-white rounded-full p-2 
              ${canScrollLeft 
                ? 'opacity-0 group-hover:opacity-100 hover:bg-purple-600' 
                : 'opacity-0 cursor-default'} 
              transition-all shadow-md -ml-4`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft className={`h-6 w-6 ${!canScrollLeft ? 'text-gray-600' : ''}`} />
          </button>
          
          <div 
            ref={rowRef}
            className="flex overflow-x-auto py-4 px-2 no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            {products.map((product, index) => (
              <div 
                key={`${product.type || 'unknown'}-${product.id || ''}-${index}-${Math.random().toString(36).substr(2, 9)}`}
                className={`flex-shrink-0 mr-4 rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer relative group/item ${isLarge ? 'w-[340px]' : 'w-[240px]'}`}
                onClick={() => handleProductClick(product)}
              >
                {/* Shadow glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg pointer-events-none transition-opacity duration-300 z-0"></div>
                
                <div className={`bg-zinc-900/90 border border-zinc-800/70 group-hover/item:border-purple-500/40 transition-all duration-300 shadow-xl rounded-lg overflow-hidden flex flex-col h-full`}>
                  {/* Image section */}
                  <div className={`relative ${isLarge ? 'h-44' : 'h-32'} bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden`}>
                    {product.image_url || product.local_image_path ? (
                      <img
                        src={product.local_image_path || product.image_url || '/assets/news-images/fallback.jpg'}
                        alt={product.name}
                        className="max-w-[85%] max-h-[85%] object-contain transition-transform duration-700 group-hover/item:scale-110"
                        onError={(e) => {
                          // Only attempt to set fallback once to prevent loops
                          if (e.target.src !== '/assets/news-images/fallback.jpg') {
                            e.target.src = '/assets/news-images/fallback.jpg';
                          }
                          e.target.onerror = null;
                        }}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="text-gray-400">No image</div>
                    )}
                    
                    {/* Product type badge */}
                    {product.type && (
                      <Badge 
                        className={`absolute top-2 right-2 shadow-md ${
                          product.type === 'server' ? 'bg-indigo-600/90' : 
                          product.type === 'client' ? 'bg-blue-600/90' : 
                          product.type === 'ai-agent' ? 'bg-rose-600/90' : 
                          'bg-purple-600/90'
                        }`}
                      >
                        {product.type === 'custom-product' ? 'Product' : product.type}
                      </Badge>
                    )}
                    
                    {/* Featured badge */}
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-amber-500/90 shadow-md">
                        Featured
                      </Badge>
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                    
                    {/* Product name on gradient */}
                    <div className="absolute bottom-0 left-0 w-full p-3">
                      <h3 className="text-white font-bold text-lg line-clamp-1 drop-shadow-md">
                        {product.name}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Content section */}
                  <div className="p-3 flex-grow flex flex-col">
                    {/* Category */}
                    {product.category && (
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-gray-400 bg-zinc-800/90 px-2 py-1 rounded-full inline-flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full mr-1 bg-purple-400"></span>
                          {product.category}
                        </span>
                      </div>
                    )}
                    
                    {/* Price if available */}
                    {product.price > 0 && (
                      <p className="text-lg font-bold text-white mb-1">${Number(product.price).toFixed(2)}</p>
                    )}
                    
                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2 group-hover/item:text-gray-300 transition-colors duration-300">
                      {product.shortDescription || product.description || 'No description available'}
                    </p>
                    
                    {/* Rating if available */}
                    {(product.stars || product.stars_numeric) && (
                      <div className="flex items-center mt-auto">
                        <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                        <span className="text-sm text-gray-300 font-medium">
                          {typeof product.stars_numeric === 'number' 
                            ? product.stars_numeric.toFixed(1) 
                            : product.stars}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover overlay with view button - appears on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-zinc-900/60 backdrop-blur-sm">
                    <Button variant="secondary" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right scroll button */}
          <button 
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-zinc-900/80 text-white rounded-full p-2 
              ${canScrollRight 
                ? 'opacity-0 group-hover:opacity-100 hover:bg-purple-600' 
                : 'opacity-0 cursor-default'} 
              transition-all shadow-md -mr-4`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight className={`h-6 w-6 ${!canScrollRight ? 'text-gray-600' : ''}`} />
          </button>
        </div>
      </div>
    );
  };
  
  // Component for grid layout when viewing all products
  const ProductGrid = ({ products, title }) => {
    return (
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300 mb-6 pl-2">
          {title}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <div 
              key={`${product.type || 'unknown'}-${product.id || ''}-${index}-${Math.random().toString(36).substr(2, 9)}`}
              className="rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer relative group/item"
              onClick={() => handleProductClick(product)}
            >
              {/* Shadow glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg pointer-events-none transition-opacity duration-300 z-0"></div>
              
              <div className="bg-zinc-900/90 border border-zinc-800/70 group-hover/item:border-purple-500/40 transition-all duration-300 shadow-xl rounded-lg overflow-hidden flex flex-col h-full">
                {/* Image section */}
                <div className="relative h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden">
                  {product.image_url || product.local_image_path ? (
                    <img
                      src={product.local_image_path || product.image_url || '/assets/news-images/fallback.jpg'}
                      alt={product.name}
                      className="max-w-[85%] max-h-[85%] object-contain transition-transform duration-700 group-hover/item:scale-110"
                      onError={(e) => {
                        // Only attempt to set fallback once to prevent loops
                        if (e.target.src !== '/assets/news-images/fallback.jpg') {
                          e.target.src = '/assets/news-images/fallback.jpg';
                        }
                        e.target.onerror = null;
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                  
                  {/* Product type badge */}
                  {product.type && (
                    <Badge 
                      className={`absolute top-2 right-2 shadow-md ${
                        product.type === 'server' ? 'bg-indigo-600/90' : 
                        product.type === 'client' ? 'bg-blue-600/90' : 
                        product.type === 'ai-agent' ? 'bg-rose-600/90' : 
                        'bg-purple-600/90'
                      }`}
                    >
                      {product.type === 'custom-product' ? 'Product' : product.type}
                    </Badge>
                  )}
                  
                  {/* Featured badge */}
                  {product.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-amber-500/90 shadow-md">
                      Featured
                    </Badge>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                  
                  {/* Product name on gradient */}
                  <div className="absolute bottom-0 left-0 w-full p-3">
                    <h3 className="text-white font-bold text-lg line-clamp-1 drop-shadow-md">
                      {product.name}
                    </h3>
                  </div>
                </div>
                
                {/* Content section */}
                <div className="p-3 flex-grow flex flex-col">
                  {/* Category */}
                  {product.category && (
                    <div className="flex items-center mb-2">
                      <span className="text-xs text-gray-400 bg-zinc-800/90 px-2 py-1 rounded-full inline-flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full mr-1 bg-purple-400"></span>
                        {product.category}
                      </span>
                    </div>
                  )}
                  
                  {/* Price if available */}
                  {product.price > 0 && (
                    <p className="text-lg font-bold text-white mb-1">${Number(product.price).toFixed(2)}</p>
                  )}
                  
                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2 group-hover/item:text-gray-300 transition-colors duration-300">
                    {product.shortDescription || product.description || 'No description available'}
                  </p>
                  
                  {/* Rating if available */}
                  {(product.stars || product.stars_numeric) && (
                    <div className="flex items-center mt-auto">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                      <span className="text-sm text-gray-300 font-medium">
                        {typeof product.stars_numeric === 'number' 
                          ? product.stars_numeric.toFixed(1) 
                          : product.stars}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get all unique types and categories from products for filters
  const getFilterOptions = () => {
    const types = new Set();
    const categories = new Set();
    const maxPrice = Math.max(...combinedProducts.map(p => Number(p.price) || 0), 1000);
    
    combinedProducts.forEach(product => {
      if (product.type) types.add(product.type);
      
      if (product.category) categories.add(product.category);
      
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(cat => categories.add(cat));
      }
    });
    
    return {
      types: Array.from(types),
      categories: Array.from(categories),
      maxPrice
    };
  };
  
  const filterOptions = getFilterOptions();
  
  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4 md:px-8">
      {/* Hero search section */}
      <div className="relative w-full mb-8 md:mb-12">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-zinc-900/20 to-indigo-900/20 rounded-xl overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-xl"></div>
        </div>
        
        <div className="relative z-10 py-8 md:py-12 px-4 md:px-12 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-200">
            Discover Amazing Products
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2 relative">
            <Input
              type="text"
              placeholder="Search for products, servers, clients..."
              value={searchQuery}
              onChange={handleSearchQueryChange}
              className="flex-1 py-6 px-5 bg-zinc-900/80 border-zinc-700 text-white placeholder-gray-400 rounded-full shadow-xl focus:ring-2 focus:ring-purple-500/70 transition-all duration-300"
            />
            
            {searchQuery && (
              <button 
                type="button" 
                className="absolute right-[4.5rem] top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => {
                  setSearchQuery('');
                  setTimeout(() => updateUrl(), 0);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            <Button 
              type="submit" 
              disabled={isSearching} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 px-6 rounded-full shadow-xl transition-all duration-300"
            >
              {isSearching ? 'Searching...' : <Search className="h-5 w-5" />}
            </Button>
          </form>
          
          {/* Controls and filters bar */}
          <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-6xl mx-auto bg-zinc-900/70 backdrop-blur-sm rounded-xl p-4 border border-zinc-800/70">
            {/* Left side - View modes */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-zinc-800 rounded-lg p-1 shadow-inner">
                <button
                  onClick={() => handleViewModeChange('categorized')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    viewMode === 'categorized' 
                      ? 'bg-purple-600 text-white font-medium shadow-md' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => handleViewModeChange('viewAll')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    viewMode === 'viewAll' 
                      ? 'bg-purple-600 text-white font-medium shadow-md' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  View All
                </button>
              </div>
              
              {/* Quick filters */}
              <div className="hidden md:flex items-center flex-wrap gap-2">
                {activeCategory !== 'all' && (
                  <Badge className="bg-purple-600/70 hover:bg-purple-600 cursor-pointer flex items-center gap-1 pl-2 pr-1 py-1.5">
                    <span>Category: {activeCategory}</span>
                    <button 
                      onClick={() => handleCategoryChange('all')}
                      className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-purple-700/50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedFilters.types.length > 0 && (
                  <Badge className="bg-indigo-600/70 hover:bg-indigo-600 cursor-pointer flex items-center gap-1 pl-2 pr-1 py-1.5">
                    <span>Types: {selectedFilters.types.length}</span>
                    <button 
                      onClick={() => setSelectedFilters(prev => ({...prev, types: []}))}
                      className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-indigo-700/50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {selectedFilters.categories.length > 0 && (
                  <Badge className="bg-blue-600/70 hover:bg-blue-600 cursor-pointer flex items-center gap-1 pl-2 pr-1 py-1.5">
                    <span>Categories: {selectedFilters.categories.length}</span>
                    <button 
                      onClick={() => setSelectedFilters(prev => ({...prev, categories: []}))}
                      className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-blue-700/50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                
                {(selectedFilters.types.length > 0 || 
                  selectedFilters.categories.length > 0 || 
                  selectedFilters.ratings.length > 0 || 
                  activeCategory !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-purple-400 hover:text-purple-300 ml-2"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            {/* Right side - Sort and filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Sort dropdown */}
              <div className="relative flex-grow md:flex-grow-0">
                <select
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-lg p-2 pr-8 text-sm w-full appearance-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="name_asc">Sort: A-Z</option>
                  <option value="name_desc">Sort: Z-A</option>
                  <option value="rating_desc">Sort: Highest Rated</option>
                  <option value="price_asc">Sort: Price (Low-High)</option>
                  <option value="price_desc">Sort: Price (High-Low)</option>
                  <option value="newest">Sort: Newest</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Filter button */}
              <Button
                onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  showFiltersDrawer ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="hidden sm:inline">Filters</span>
                  {(selectedFilters.types.length > 0 || selectedFilters.categories.length > 0 || selectedFilters.ratings.length > 0) && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-purple-500 text-white">
                      {selectedFilters.types.length + selectedFilters.categories.length + selectedFilters.ratings.length}
                    </span>
                  )}
                </div>
              </Button>
            </div>
          </div>
          
          {/* Filter drawer - shown when showFiltersDrawer is true */}
          {showFiltersDrawer && (
            <div className="mt-4 p-4 bg-zinc-900/90 backdrop-blur-md rounded-xl border border-zinc-800/70 shadow-lg transition-all duration-300 animate-fadeIn max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Clear all filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product types filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Product Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.types.map(type => (
                      <Badge
                        key={type}
                        className={`py-1.5 px-3 cursor-pointer transition-all duration-300 ${
                          selectedFilters.types.includes(type)
                            ? type === 'server' ? 'bg-indigo-600' : 
                              type === 'client' ? 'bg-blue-600' : 
                              type === 'ai-agent' ? 'bg-rose-600' : 
                              'bg-purple-600'
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                        onClick={() => handleFilterChange('types', type)}
                      >
                        {type === 'custom-product' ? 'Product' : type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Categories filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 no-scrollbar">
                    {filterOptions.categories.slice(0, 20).map(category => (
                      <Badge
                        key={category}
                        className={`py-1.5 px-3 cursor-pointer transition-all duration-300 ${
                          selectedFilters.categories.includes(category)
                            ? 'bg-purple-600'
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                        onClick={() => handleFilterChange('categories', category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Ratings filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Ratings</h4>
                  <div className="flex flex-wrap gap-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <Badge
                        key={rating}
                        className={`py-1.5 px-3 cursor-pointer transition-all duration-300 ${
                          selectedFilters.ratings.includes(rating)
                            ? 'bg-amber-600'
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                        onClick={() => handleFilterChange('ratings', rating)}
                      >
                        <div className="flex items-center">
                          <span className="mr-1">{rating}+</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        </div>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Category selector pills - only show for categorized view */}
          {viewMode === 'categorized' && allCategories.length > 0 && !showFiltersDrawer && (
            <div className="mt-6 flex items-center justify-center flex-wrap gap-2 max-w-4xl mx-auto overflow-x-auto pb-2">
              <Badge
                onClick={() => handleCategoryChange('all')}
                className={`py-1.5 px-4 cursor-pointer transition-all duration-300 ${
                  activeCategory === 'all' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                All
              </Badge>
              
              {['featured', 'trending', 'popular', 'recent', 'servers', 'clients', 'aiAgents'].map(category => 
                categorizedProducts[category] && categorizedProducts[category].length > 0 ? (
                  <Badge
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`py-1.5 px-4 cursor-pointer transition-all duration-300 ${
                      activeCategory === category 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  >
                    {category === 'featured' ? 'Featured' : 
                     category === 'trending' ? 'Trending' :
                     category === 'popular' ? 'Popular' :
                     category === 'recent' ? 'New Additions' :
                     category === 'servers' ? 'Servers' : 
                     category === 'clients' ? 'Clients' : 
                     category === 'aiAgents' ? 'AI Agents' : category}
                  </Badge>
                ) : null
              )}
              
              {allCategories.slice(0, 8).map(category => 
                // Only show categories not already covered in the special ones above
                !['featured', 'trending', 'popular', 'recent', 'servers', 'clients', 'aiAgents'].includes(category) && 
                categorizedProducts[category] && 
                categorizedProducts[category].length > 0 ? (
                  <Badge
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`py-1.5 px-4 cursor-pointer transition-all duration-300 ${
                      activeCategory === category 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  >
                    {category}
                  </Badge>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Search results */}
          {searchQuery && categorizedProducts.searchResults && (
            <ProductRow 
              title={`Search Results for "${searchQuery}"`} 
              products={categorizedProducts.searchResults}
              isLarge={true}
              hideViewAll={true}
            />
          )}
          
          {/* View All grid layout */}
          {!searchQuery && viewMode === 'viewAll' && categorizedProducts.viewAll && (
            <ProductGrid 
              title={activeCategory === 'all' ? 'All Products' : `All ${activeCategory} Products`}
              products={categorizedProducts.viewAll}
            />
          )}
          
          {/* Category-based rows layout */}
          {!searchQuery && viewMode === 'categorized' ? (
            <>
              {/* Display based on active category */}
              {activeCategory === 'all' ? (
                <>
                  {/* Featured products first */}
                  {categorizedProducts.featured && categorizedProducts.featured.length > 0 && (
                    <ProductRow 
                      title="Featured" 
                      products={categorizedProducts.featured.slice(0, 10)} 
                      isLarge={true}
                      onViewAll={() => {
                        handleCategoryChange('featured');
                        handleViewModeChange('viewAll');
                      }}
                    />
                  )}
                  
                  {/* Trending products */}
                  {categorizedProducts.trending && categorizedProducts.trending.length > 0 && (
                    <ProductRow 
                      title="Trending Now" 
                      products={categorizedProducts.trending.slice(0, 10)} 
                      onViewAll={() => {
                        handleCategoryChange('trending');
                        handleViewModeChange('viewAll');
                      }}
                    />
                  )}
                  
                  {/* Popular products */}
                  {categorizedProducts.popular && categorizedProducts.popular.length > 0 && (
                    <ProductRow 
                      title="Popular with Users" 
                      products={categorizedProducts.popular.slice(0, 10)} 
                      onViewAll={() => {
                        handleCategoryChange('popular');
                        handleViewModeChange('viewAll');
                      }}
                    />
                  )}
                  
                  {/* Recent additions */}
                  {categorizedProducts.recent && categorizedProducts.recent.length > 0 && (
                    <ProductRow 
                      title="New Additions" 
                      products={categorizedProducts.recent.slice(0, 10)} 
                      onViewAll={() => {
                        handleCategoryChange('recent');
                        handleViewModeChange('viewAll');
                      }}
                    />
                  )}
                  
                  {/* Then product type categories */}
                  {categorizedProducts.servers && categorizedProducts.servers.length > 0 && (
                    <ProductRow 
                      title="MCP Servers" 
                      products={categorizedProducts.servers.slice(0, 10)} 
                      onViewAll={() => {
                        handleCategoryChange('servers');
                        handleViewModeChange('viewAll');
                      }}
                    />
                  )}
                  
                  {categorizedProducts.clients && categorizedProducts.clients.length > 0 && (
                    <ProductRow 
                      title="MCP Clients" 
                      products={categorizedProducts.clients.slice(0, 10)} 
                      onViewAll={() => {
                        handleCategoryChange('clients');
                        handleViewModeChange('viewAll');
                      }}
                    />
                  )}
                  
                  {categorizedProducts.aiAgents && categorizedProducts.aiAgents.length > 0 && (
                    <ProductRow 
                      title="AI Agents" 
                      products={categorizedProducts.aiAgents.slice(0, 10)} 
                      onViewAll={() => {
                        handleCategoryChange('aiAgents');
                        handleViewModeChange('viewAll');
                      }}
                    />
                  )}
                  
                  {/* Then display other categories */}
                  {Object.keys(categorizedProducts).map(category => {
                    if (['featured', 'trending', 'popular', 'recent', 'servers', 'clients', 'aiAgents', 'searchResults', 'viewAll'].includes(category)) {
                      return null; // Skip already displayed categories
                    }
                    
                    return (
                      <ProductRow 
                        key={category}
                        title={category}
                        products={categorizedProducts[category].slice(0, 10)}
                        onViewAll={() => {
                          handleCategoryChange(category);
                          handleViewModeChange('viewAll');
                        }}
                      />
                    );
                  })}
                </>
              ) : (
                // Display only the active category
                categorizedProducts[activeCategory] && (
                  <ProductRow 
                    title={
                      activeCategory === 'featured' ? 'Featured Products' : 
                      activeCategory === 'trending' ? 'Trending Products' :
                      activeCategory === 'popular' ? 'Popular Products' :
                      activeCategory === 'recent' ? 'New Additions' :
                      activeCategory === 'servers' ? 'MCP Servers' : 
                      activeCategory === 'clients' ? 'MCP Clients' : 
                      activeCategory === 'aiAgents' ? 'AI Agents' : 
                      activeCategory
                    }
                    products={categorizedProducts[activeCategory]}
                    isLarge={true}
                    onViewAll={() => handleViewModeChange('viewAll')}
                  />
                )
              )}
            </>
          ) : null}
          
          {/* No results message */}
          {!isLoading && (
            (searchQuery && (!categorizedProducts.searchResults || categorizedProducts.searchResults.length === 0)) ||
            (!searchQuery && viewMode === 'viewAll' && (!categorizedProducts.viewAll || categorizedProducts.viewAll.length === 0)) ||
            (!searchQuery && viewMode === 'categorized' && activeCategory !== 'all' && (!categorizedProducts[activeCategory] || categorizedProducts[activeCategory].length === 0)) ||
            (!searchQuery && viewMode === 'categorized' && activeCategory === 'all' && Object.keys(categorizedProducts).length === 0)
          ) && (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-zinc-900/40 rounded-xl border border-zinc-800/60 shadow-lg max-w-2xl mx-auto">
              <div className="text-gray-400 w-16 h-16 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-gray-400 text-center mb-6">
                {searchQuery 
                  ? `We couldn't find any products matching "${searchQuery}"` 
                  : 'Try changing your filters or categories'}
              </p>
              <Button 
                onClick={clearFilters}
                variant="secondary"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Clear all filters
              </Button>
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

export default NetflixStyleProductsPage;