import React, { useState, useEffect } from 'react';
import FeaturedCarousel from './FeaturedCarousel';
import QuickFilterSidebar from './QuickFilterSidebar';
import Pagination from './Pagination';
import DataStatusAlert from './DataStatusAlert';

// Import our enhanced animations and components
import { 
  ScrollReveal, 
  EnhancedProductCard, 
  SkeletonLoader,
  CardSkeleton,
  SkeletonList
} from './animations';

// This would typically be a link component from a router library
const Link = ({ to, children, className, onClick }) => <a href={to} className={className} onClick={onClick}>{children}</a>;

// Legacy ProductCard for backwards compatibility
const ProductCard = ({ product, onNavigate, featured = false }) => {
  // Redirect to EnhancedProductCard
  return (
    <EnhancedProductCard 
      product={product}
      onClick={() => {
        console.log(`Navigating to product: ${product.id}`);
        if (onNavigate && typeof onNavigate === 'function') {
          onNavigate(product.id);
        } else {
          // Use proper paths instead of hash navigation
          const targetPath = `/products/${product.id}`;
          window.location.href = targetPath;
        }
      }}
      featured={featured}
    />
  );
};

// Constants for improved UX with progressive loading
const DEFAULT_ITEMS_PER_PAGE = 10; // Default is 10 per page
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30];

// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

const ProductListPage = ({ allProductsData, onNavigateToDetail, currentCategoryFilter }) => {
  // State to track products from API
  const [apiProductsData, setApiProductsData] = useState([]);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [useApi, setUseApi] = useState(false);
  
  // Fetch products from API on component mount
  useEffect(() => {
    const fetchProductsFromApi = async () => {
      setIsApiLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products?limit=100`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Loaded ${data.products.length} products from API`);
        setApiProductsData(data.products);
        setUseApi(true);
      } catch (error) {
        console.error('Error fetching products from AWS database:', error);
        setApiError(error.message);
        // Always use API, but indicate there's an error
        setUseApi(true); 
        setApiProductsData([]);
      } finally {
        setIsApiLoading(false);
      }
    };
    
    fetchProductsFromApi();
  }, []);
  
  // Use API data if available, otherwise fall back to preloaded data
  const allProductsArray = useApi && apiProductsData.length > 0
    ? apiProductsData
    : Array.isArray(allProductsData) 
      ? allProductsData 
      : Object.values(allProductsData);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(allProductsArray);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [sortOption, setSortOption] = useState('popularity'); // Default sort by popularity (stars)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE); // Control how many items are visible per page - always 10 by default
  const [currentPage, setCurrentPage] = useState(1); // Current active page
  const [sidebarOpen, setSidebarOpen] = useState(false); // Controls the quick filter sidebar on mobile
  const [recentSearches, setRecentSearches] = useState([]); // Track recent searches
  const [productType, setProductType] = useState('All'); // Product type filter
  
  // Filter state
  const [filters, setFilters] = useState({
    officialOnly: false,
    hasGithub: false,
    hasNpm: false,
    minStars: 0,
    tags: []
  });
  
  // Count active filters for badge
  const activeFilterCount = (
    (filters.officialOnly ? 1 : 0) +
    (filters.hasGithub ? 1 : 0) +
    (filters.hasNpm ? 1 : 0) +
    (filters.minStars > 0 ? 1 : 0) +
    filters.tags.length
  );
  
  // Handle filter changes from the sidebar
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Add search term to recent searches when search is performed
  useEffect(() => {
    if (searchTerm.trim() && !recentSearches.includes(searchTerm.trim())) {
      setRecentSearches(prev => {
        const newSearches = [searchTerm.trim(), ...prev.slice(0, 4)];
        return newSearches;
      });
    }
  }, [searchTerm]);
  
  // Generate categories data for sidebar
  const categoriesWithCounts = React.useMemo(() => {
    const categoryMap = new Map();
    
    // Count how many servers are in each category
    allProductsArray.forEach(server => {
      const category = server.category || 'Uncategorized';
      
      // Create slug from category name
      const slug = category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      
      // Add or increment count in the map
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
          href: `#/search?category=${slug}`
        });
      }
    });
    
    // Convert map to array and sort by count (descending)
    return Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count);
  }, [allProductsArray]);

  // Determine active category based on currentCategoryFilter prop and log for debugging
  const activeCategory = currentCategoryFilter || 'All';
  console.log(`ProductListPage: Active category is "${activeCategory}", filtering ${allProductsArray.length} products`);

  // Get total product count for display
  const totalProducts = filteredProducts.length;
  
  // Calculate total pages based on items per page
  const totalPages = Math.ceil(totalProducts / itemsPerPage);  
  
  // Debug: Log totalProducts and totalPages
  console.log(`Debug - ProductListPage: Total products: ${totalProducts}, Items per page: ${itemsPerPage}, Total pages: ${totalPages}`);
  
  // Reset to first page if current page is out of bounds when filtered products change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      console.log(`ProductListPage: Current page (${currentPage}) exceeds total pages (${totalPages}), resetting to page 1`);
      setCurrentPage(1);
    }
  }, [filteredProducts, itemsPerPage, currentPage, totalPages]);
  
  // Get current products for the selected page
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Filter and sort products based on category, search term, filters, and sort option
  useEffect(() => {
    console.log(`ProductListPage: Starting filtering with ${allProductsArray.length} products`);
    let products = [...allProductsArray];
    
    // First filter by category if active category is set and not 'All'
    if (activeCategory && activeCategory !== 'All') {
      // Special handling for "official" category
      if (activeCategory === 'official') {
        products = products.filter(product => product.official === true);
        console.log(`ProductListPage: Filtered to ${products.length} official products`);
      } else {
        // Filter by category, handling potential slug format differences
        products = products.filter(product => 
          (product.category && product.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === activeCategory) ||
          (product.categories && Array.isArray(product.categories) && 
           product.categories.some(cat => cat.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === activeCategory))
        );
        console.log(`ProductListPage: Filtered to ${products.length} products in category "${activeCategory}"`);
      }
    }
    
    // Apply product type filtering - use proper product_type values from the API
    if (productType && productType !== 'All') {
      const prevCount = products.length;
      
      // Define a consistent mapping between display names and stored values
      const typeMapping = {
        'MCP Servers': 'mcp_server',
        'MCP Clients': 'mcp_client',
        'AI Agents': 'ai_agent',
        'Ready to Use': 'ready_to_use'
      };
      
      const typeFilter = typeMapping[productType];
      
      if (typeFilter) {
        products = products.filter(product => product.product_type === typeFilter);
        console.log(`ProductListPage: Applied product type filter "${productType}" (type: ${typeFilter}) (${prevCount} -> ${products.length} products)`);
      }
    }

    // Apply additional filters from the filters state
    if (filters.officialOnly) {
      const prevCount = products.length;
      products = products.filter(product => product.official === true);
      console.log(`ProductListPage: Applied officialOnly filter (${prevCount} -> ${products.length} products)`);
    }
    
    if (filters.hasGithub) {
      const prevCount = products.length;
      products = products.filter(product => 
        product.githubUrl || product.github_url || 
        (product.links && product.links.some(link => 
          link.url && link.url.includes('github.com')
        ))
      );
      console.log(`ProductListPage: Applied hasGithub filter (${prevCount} -> ${products.length} products)`);
    }
    
    if (filters.hasNpm) {
      const prevCount = products.length;
      products = products.filter(product => 
        product.npmUrl || product.npm_url || 
        (product.links && product.links.some(link => 
          link.url && link.url.includes('npmjs.com')
        ))
      );
      console.log(`ProductListPage: Applied hasNpm filter (${prevCount} -> ${products.length} products)`);
    }
    
    if (filters.minStars > 0) {
      const prevCount = products.length;
      products = products.filter(product => 
        (product.stars_numeric || product.stars || 0) >= filters.minStars
      );
      console.log(`ProductListPage: Applied minStars filter (${prevCount} -> ${products.length} products)`);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      const prevCount = products.length;
      products = products.filter(product =>
        product.tags && Array.isArray(product.tags) &&
        filters.tags.some(tag => product.tags.includes(tag))
      );
      console.log(`ProductListPage: Applied tags filter (${prevCount} -> ${products.length} products)`);
    }

    // Then filter by search term if provided
    if (searchTerm.trim() !== '') {
      const prevCount = products.length;
      const lowerSearchTerm = searchTerm.toLowerCase();
      products = products.filter(product => 
        (product.name && product.name.toLowerCase().includes(lowerSearchTerm)) || 
        (product.description && product.description.toLowerCase().includes(lowerSearchTerm)) ||
        (product.keywords && Array.isArray(product.keywords) && 
         product.keywords.join(' ').toLowerCase().includes(lowerSearchTerm)) ||
        (product.category && product.category.toLowerCase().includes(lowerSearchTerm)) ||
        (product.tags && Array.isArray(product.tags) && 
         product.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
      );
      console.log(`ProductListPage: Applied search filter "${searchTerm}" (${prevCount} -> ${products.length} products)`);
    }
    
    // Finally sort the filtered products based on the selected sort option
    switch (sortOption) {
      case 'popularity':
        products = products.sort((a, b) => (b.stars_numeric || b.stars || 0) - (a.stars_numeric || a.stars || 0));
        console.log('ProductListPage: Sorted by popularity');
        break;
      case 'name':
        products = products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        console.log('ProductListPage: Sorted by name');
        break;
      case 'newest':
        // This would require a 'createdAt' or 'addedAt' field, falling back to sorting by name for now
        products = products.sort((a, b) => (b.createdAt || b.addedAt || 0) - (a.createdAt || a.addedAt || 0));
        console.log('ProductListPage: Sorted by newest');
        break;
      default:
        products = products.sort((a, b) => (b.stars_numeric || b.stars || 0) - (a.stars_numeric || a.stars || 0));
    }
    
    console.log(`ProductListPage: Final filtered product count: ${products.length}`);
    setFilteredProducts(products);
    
    // Reset to first page when filters change to avoid empty results
    if (totalProducts !== products.length) {
      console.log('ProductListPage: Product count changed, resetting to first page');
      setCurrentPage(1);
    }
    console.log('ProductListPage: Filter/sort/search changed, products updated');
  }, [searchTerm, activeCategory, allProductsArray, sortOption, filters]);

  // Handle intersection observation for lazy loading
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    console.log(`ProductListPage: Changing page to ${pageNumber}`);
    setCurrentPage(pageNumber);
    // Scroll to top of product list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    console.log(`ProductListPage: Changing items per page to ${newItemsPerPage}`);
    setItemsPerPage(newItemsPerPage);
    // Reset to first page when changing items per page
    setCurrentPage(1);
  };

  // Handle product type filter change - using consistent mapping
  const handleProductTypeChange = (newProductType) => {
    console.log(`ProductListPage: Changing product type filter to ${newProductType}`);
    setProductType(newProductType);
    // Reset to first page when changing product type
    setCurrentPage(1);
    
    // Properly map display values to stored values
    const typeMapping = {
      'MCP Servers': 'mcp_server',
      'MCP Clients': 'mcp_client',
      'AI Agents': 'ai_agent',
      'Ready to Use': 'ready_to_use'
    };
    
    const typeFilter = newProductType === 'All' ? null : typeMapping[newProductType];
    console.log(`ProductListPage: Setting product type filter to: ${typeFilter}`);
  };

  // Debug logging
  useEffect(() => {
    console.log(`ProductListPage: Showing page ${currentPage} with ${itemsPerPage} items per page`);
    console.log(`ProductListPage: Displaying ${currentProducts.length} of ${filteredProducts.length} total products`);
  }, [currentPage, itemsPerPage, currentProducts.length, filteredProducts.length]);
  
  // Add a separate effect to debug when itemsPerPage changes
  useEffect(() => {
    console.log(`DEBUG: itemsPerPage changed to ${itemsPerPage}`);
    // Force reset itemsPerPage to 10 if it's not one of our expected values
    if (!ITEMS_PER_PAGE_OPTIONS.includes(itemsPerPage)) {
      console.log(`DEBUG: Resetting itemsPerPage from ${itemsPerPage} to ${DEFAULT_ITEMS_PER_PAGE}`);
      setItemsPerPage(DEFAULT_ITEMS_PER_PAGE);
    }
  }, [itemsPerPage]);
  
  // Format the page title based on active category
  const pageTitle = activeCategory && activeCategory !== 'All' 
    ? `MCP Servers in ${activeCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` 
    : 'Browse All MCP Servers';

  // Generate feature carousel data
  // Top trending products (sorted by stars)
  const trendingProducts = [...allProductsArray]
    .sort((a, b) => (b.stars_numeric || b.stars || 0) - (a.stars_numeric || a.stars || 0))
    .slice(0, 8);
    
  // Official products
  const officialProducts = allProductsArray
    .filter(product => product.official === true)
    .slice(0, 8);
  
  // Get recently added products (if they have createdAt/addedAt fields, otherwise alphabetical)
  const recentProducts = [...allProductsArray]
    .sort((a, b) => (b.createdAt || b.addedAt || 0) - (a.createdAt || a.addedAt || 0))
    .slice(0, 8);

  // Clear search handler
  const handleClearSearch = () => {
    if (searchTerm) {
      setSearchTerm('');
    }
  };

  return (
    <div className="flex">
      {/* Quick filter sidebar */}
      <QuickFilterSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        categories={categoriesWithCounts}
        currentFilters={filters}
        onFilterChange={handleFilterChange}
        recentSearches={recentSearches}
      />
      
      {/* Main content */}
      <div className="container mx-auto p-4 min-h-screen">
      {/* Data source status alert - prominently displayed at the top */}
      <div className="my-4">
        <DataStatusAlert />
      </div>
      
      {/* Hero section and welcome banner - only on All category */}
      {activeCategory === 'All' && (
        <>
          {/* Hero Banner - Enhanced with better visuals */}
          <div className="relative overflow-hidden rounded-xl mb-12 bg-gradient-to-r from-purple-900/70 via-indigo-900/60 to-indigo-900/70 border border-purple-500/30 shadow-lg">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYyem0wLTEydi0yaC0ydjRoNHYtMmgtMnptMCAxOGgtMnY0aDJ2LTR6bTItMTh2LTRoNHYyaC0ydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat"></div>
            </div>
            <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                  <span className="text-purple-300">MCP</span> Marketplace
                </h2>
                <p className="text-xl text-gray-200 mb-6">Discover powerful MCP servers to enhance your AI capabilities and connect to valuable data sources.</p>
                <div className="flex flex-wrap gap-4">
                  <a href="#/what-is-an-mcp-server" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 duration-300 shadow-lg flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Learn About MCP
                  </a>
                  <a href="#/categories" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 duration-300 shadow-lg border border-purple-500/30 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Browse Categories
                  </a>
                </div>
                
                {/* Quick-start guide section */}
                <div className="mt-8 bg-black/20 p-4 rounded-lg border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Start with Claude Code
                  </h3>
                  <div className="bg-black/30 rounded p-3 font-mono text-sm text-gray-300 mb-2">
                    claude mcp add my-server /path/to/server
                  </div>
                  <a href="#/connect-to-claude" className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center">
                    View setup guide
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="w-64 h-64 bg-purple-800/30 rounded-full flex items-center justify-center p-8 backdrop-blur-sm border border-purple-500/30 shadow-xl relative overflow-hidden group">
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/30 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"></div>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48 text-purple-300 opacity-90 group-hover:text-purple-200 transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xl">
                      MCP
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Popular Categories Section - Quick access */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Popular Categories</h2>
              <a href="#/categories" className="text-purple-400 hover:text-purple-300 text-sm flex items-center">
                View all categories
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Top categories from actual data */}
              {categoriesWithCounts.slice(0, 6).map((category, idx) => {
                // Define a much more diverse set of icons for different categories
                const iconPaths = {
                  // AI, Machine Learning, LLM related
                  "ai": "M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707m-12.728 12l-.707-.707m12.728 0l-.707.707",
                  "ml": "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  "llm": "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                  
                  // Data Storage
                  "database": "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7",
                  "vector": "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
                  "storage": "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
                  
                  // Web & API
                  "web": "M3 12h18M3 6h18M3 18h18",
                  "api": "M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01M5 5h14c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2z",
                  "http": "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
                  
                  // Documents & Files
                  "document": "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
                  "pdf": "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                  "text": "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                  
                  // Development Tools
                  "developer": "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
                  "tools": "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
                  "code": "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                  
                  // Automation & Workflow
                  "workflow": "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                  "automation": "M14.7519 4.25732C15.8024 5.30784 16.25 6.64745 16.25 8.04999C16.25 9.4525 15.8024 10.7921 14.7519 11.8427L8.5 18.0946L2.24806 11.8427C1.19755 10.7921 0.75 9.4525 0.75 8.04999C0.75 6.64745 1.19755 5.30784 2.24806 4.25732C3.29858 3.20681 4.63818 2.75926 6.04074 2.75926C7.44329 2.75926 8.7829 3.20681 9.83341 4.25732L12.0858 6.50973L14.3382 4.25732C13.2877 3.20681 14.6273 2.75926 16.0299 2.75926C14.6273 2.75926 13.2877 3.20681 12.2372 4.25732L9.98479 6.50973L7.73238 4.25732C6.68187 3.20681 5.34226 2.75926 3.93971 2.75926C2.53716 2.75926 1.19755 3.20681 0.147036 4.25732C-0.90348 5.30784 -1.35103 6.64745 -1.35103 8.04999C-1.35103 9.4525 -0.90348 10.7921 0.147036 11.8427L6.39897 18.0946L14.7519 11.8427C15.8024 10.7921 16.25 9.4525 16.25 8.04999C16.25 6.64745 15.8024 5.30784 14.7519 4.25732Z",
                  "bot": "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84",
                  
                  // Research & Knowledge
                  "research": "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
                  "knowledge": "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                  
                  // Analytics & Monitoring
                  "analytics": "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                  "chart": "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
                  "monitoring": "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                  
                  // DevOps & Cloud
                  "cloud": "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
                  "devops": "M8 9l4-4 4 4m0 6l-4 4-4-4",
                  "deployment": "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                };
                
                // Choose an icon based on the category name or assign based on fixed rotation
                const iconKeys = Object.keys(iconPaths);
                let iconPath;
                
                // First try to match by category name
                const lowerCat = category.name.toLowerCase();
                let matched = false;
                
                // Try to find the best match from our icon set
                for (const [key, path] of Object.entries(iconPaths)) {
                  if (lowerCat.includes(key)) {
                    iconPath = path;
                    matched = true;
                    break;
                  }
                }
                
                // If no match found, use index-based assignment for variety
                if (!matched) {
                  // Use modulo to cycle through the available icons
                  const iconIndex = idx % iconKeys.length;
                  iconPath = iconPaths[iconKeys[iconIndex]];
                }
                
                return (
                  <a key={category.slug} href={`#/search?category=${category.slug}`} className="bg-zinc-800/70 hover:bg-zinc-700/80 border border-zinc-700 hover:border-purple-500/30 p-4 rounded-lg text-center transition-all duration-300 group">
                    <div className="text-purple-400 mb-2 mx-auto h-8 w-8 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 group-hover:text-purple-300 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm font-medium capitalize group-hover:text-white transition-colors duration-300">{category.name}</span>
                    <span className="mt-1 text-xs text-gray-500 block">({category.count})</span>
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Enhanced Trending Carousel */}
          <div className="mb-12 bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trending MCP Servers
            </h2>
            {trendingProducts.length > 0 && (
              <FeaturedCarousel 
                title="" 
                items={trendingProducts} 
                onItemClick={onNavigateToDetail} 
              />
            )}
            
          </div>
          
          {/* Enhanced Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/70 rounded-lg p-6 border border-zinc-700 hover:border-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
              <div className="text-purple-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-100">Secure & Open</h3>
              <p className="text-gray-300">MCP servers provide secure connections between AI models and your data, all through open protocols.</p>
              <a href="#/what-is-an-mcp-server" className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/70 rounded-lg p-6 border border-zinc-700 hover:border-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
              <div className="text-purple-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-100">Easily Integrated</h3>
              <p className="text-gray-300">Connect your AI models to databases, APIs, and tools using standardized protocols that just work.</p>
              <a href="#/connect-to-claude" className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium">
                Connection guide
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/70 rounded-lg p-6 border border-zinc-700 hover:border-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
              <div className="text-purple-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-100">Powerful Capabilities</h3>
              <p className="text-gray-300">Enhance your AI with real-time data access, web automation, API connections, and much more.</p>
              <a href="#/submit-server" className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium">
                Submit your server
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-center my-6">
        <div className="flex items-center">
          {/* Toggle sidebar button for mobile */}
          <button
            className="mr-3 p-2 bg-zinc-800 border border-zinc-700 rounded-md md:hidden flex items-center justify-center"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Toggle filters sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-200">{pageTitle}</h1>
        </div>
        
        {/* Compare Servers Button */}
        <a
          href="#/compare"
          className="mt-3 md:mt-0 bg-zinc-800 hover:bg-zinc-700 text-gray-200 border border-zinc-700 py-2 px-4 rounded-md flex items-center space-x-2 transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <span>Compare Servers</span>
        </a>
      </div>
      
      {/* Enhanced Search and filter section */}
      <div className="mb-8">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by name, description, or category..." 
            className="w-full p-4 pl-12 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Enhanced Search icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Clear search button (only visible when there's a search term) */}
          {searchTerm && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-300 transition-colors duration-200"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Quick-filters bar - always visible for faster filtering */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-400 mr-1">Quick filters:</span>
          <button
            onClick={() => setFilters({...filters, officialOnly: !filters.officialOnly})}
            className={`text-xs px-3 py-1.5 rounded-full flex items-center transition-all duration-200 ${
              filters.officialOnly
                ? 'bg-green-600 text-white'
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
            </svg>
            Official
          </button>
          <button
            onClick={() => setFilters({...filters, hasGithub: !filters.hasGithub})}
            className={`text-xs px-3 py-1.5 rounded-full flex items-center transition-all duration-200 ${
              filters.hasGithub
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            GitHub Repo
          </button>
          <button
            onClick={() => setFilters({...filters, minStars: filters.minStars > 0 ? 0 : 1000})}
            className={`text-xs px-3 py-1.5 rounded-full flex items-center transition-all duration-200 ${
              filters.minStars > 0
                ? 'bg-yellow-600 text-white'
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {filters.minStars > 0 ? `${filters.minStars.toLocaleString()}+ Stars` : 'Popular'}
          </button>
          
          {/* Category filters - Top 3 categories */}
          {['databases', 'web', 'api'].map(category => (
            <button
              key={category}
              onClick={() => {
                // Navigate to category page
                window.location.hash = `#/search?category=${category}`;
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700 flex items-center transition-all duration-200"
            >
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-1.5"></span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
          
          {/* More filters button */}
          <button 
            className={`relative flex items-center bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1.5 text-gray-300 hover:bg-zinc-700 transition-all duration-200 text-xs ml-auto ${showFilterOptions ? 'bg-purple-900/30 border-purple-500/50' : ''}`}
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            aria-label={showFilterOptions ? "Hide advanced filters" : "Show advanced filters"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {showFilterOptions ? 'Hide Advanced Filters' : 'Advanced Filters'}
            
            {/* Active filter count badge */}
            {activeFilterCount > 0 && (
              <span className="ml-1.5 bg-purple-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {/* Sort options */}
          <div className="ml-2 flex items-center bg-zinc-800 border border-zinc-700 rounded-full pr-2">
            <span className="text-xs text-gray-400 ml-3 mr-1 hidden sm:inline-block">Sort:</span>
            <select 
              className="bg-transparent border-none text-gray-200 text-xs py-1.5 pl-2 pr-4 focus:ring-0 focus:outline-none appearance-none cursor-pointer"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                backgroundPosition: 'right 0.2rem center',
                backgroundSize: '1.2em 1.2em',
              }}
            >
              <option value="popularity">Popularity</option>
              <option value="name">Name (A-Z)</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        
        {/* Results count - Enhanced with more details */}
        <div className="mt-3 text-sm text-gray-400">
          Showing {totalProducts} {totalProducts === 1 ? 'result' : 'results'}
          {allProductsArray.length !== totalProducts && (
            <span> out of {allProductsArray.length} total products</span>
          )}
          {searchTerm && <span> for "<span className="text-purple-400">{searchTerm}</span>"</span>}
          {filters.officialOnly && <span> · Official only</span>}
          {filters.minStars > 0 && <span> · {filters.minStars.toLocaleString()}+ stars</span>}
          {productType !== 'All' && <span> · Type: <span className="text-purple-400">{productType}</span></span>}
        </div>
        
        {/* Advanced filter options (shown/hidden based on state) with smooth animation */}
        <div className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${showFilterOptions ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg shadow-lg">
            <h3 className="text-gray-200 font-semibold mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Advanced Filters
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Repository filters group */}
              <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Repository</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="official-only" 
                      className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500 bg-zinc-700 border-zinc-600" 
                      checked={filters.officialOnly}
                      onChange={(e) => setFilters({...filters, officialOnly: e.target.checked})}
                    />
                    <label htmlFor="official-only" className="text-gray-300 text-sm ml-2">Official MCP Servers Only</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="has-github" 
                      className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500 bg-zinc-700 border-zinc-600" 
                      checked={filters.hasGithub}
                      onChange={(e) => setFilters({...filters, hasGithub: e.target.checked})}
                    />
                    <label htmlFor="has-github" className="text-gray-300 text-sm ml-2">Has GitHub Repository</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="has-npm" 
                      className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500 bg-zinc-700 border-zinc-600" 
                      checked={filters.hasNpm}
                      onChange={(e) => setFilters({...filters, hasNpm: e.target.checked})}
                    />
                    <label htmlFor="has-npm" className="text-gray-300 text-sm ml-2">Has NPM Package</label>
                  </div>
                </div>
              </div>
              
              {/* Popularity filter group */}
              <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Popularity</h4>
                <div className="space-y-4">
                  {/* Preset star filters for quicker selection */}
                  <div className="flex flex-wrap gap-2">
                    {[0, 100, 1000, 5000, 10000].map(stars => (
                      <button
                        key={stars}
                        onClick={() => setFilters({...filters, minStars: stars})}
                        className={`text-xs px-2 py-1 rounded ${
                          filters.minStars === stars
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                        }`}
                      >
                        {stars === 0 ? 'Any' : `${stars.toLocaleString()}+`}
                      </button>
                    ))}
                  </div>
                  
                  {/* Star rating slider */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>0</span>
                      <span>50K+</span>
                    </div>
                    <input 
                      type="range" 
                      id="min-stars" 
                      min="0" 
                      max="50000" 
                      step="500"
                      value={filters.minStars}
                      onChange={(e) => setFilters({...filters, minStars: parseInt(e.target.value)})}
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center mt-2">
                      <span className="text-sm text-purple-400 font-medium">
                        {filters.minStars > 0 ? `${filters.minStars.toLocaleString()}+ stars` : 'Any number of stars'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tags filter group */}
              <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {['open-source', 'web', 'ai', 'automation', 'data', 'tools', 'database', 'api', 'cloud'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const updatedTags = filters.tags.includes(tag)
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag];
                        setFilters({...filters, tags: updatedTags});
                      }}
                      className={`text-xs px-2 py-1.5 rounded-full flex items-center ${
                        filters.tags.includes(tag)
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                      }`}
                    >
                      {filters.tags.includes(tag) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Filter actions */}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowFilterOptions(false)}
                className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
              
              {(filters.officialOnly || filters.hasGithub || filters.hasNpm || filters.minStars > 0 || filters.tags.length > 0) && (
                <button
                  onClick={() => setFilters({
                    officialOnly: false,
                    hasGithub: false,
                    hasNpm: false,
                    minStars: 0,
                    tags: []
                  })}
                  className="text-sm text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Display active filters */}
      {activeFilterCount > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            
            {filters.officialOnly && (
              <span className="inline-flex items-center bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                Official Only
                <button 
                  onClick={() => setFilters({...filters, officialOnly: false})}
                  className="ml-1 text-purple-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            
            {filters.hasGithub && (
              <span className="inline-flex items-center bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                Has GitHub
                <button 
                  onClick={() => setFilters({...filters, hasGithub: false})}
                  className="ml-1 text-purple-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            
            {filters.hasNpm && (
              <span className="inline-flex items-center bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                Has NPM
                <button 
                  onClick={() => setFilters({...filters, hasNpm: false})}
                  className="ml-1 text-purple-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            
            {filters.minStars > 0 && (
              <span className="inline-flex items-center bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                {filters.minStars.toLocaleString()}+ Stars
                <button 
                  onClick={() => setFilters({...filters, minStars: 0})}
                  className="ml-1 text-purple-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            
            {filters.tags.map(tag => (
              <span key={tag} className="inline-flex items-center bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                #{tag}
                <button 
                  onClick={() => setFilters({...filters, tags: filters.tags.filter(t => t !== tag)})}
                  className="ml-1 text-purple-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
            
            <button
              onClick={() => setFilters({
                officialOnly: false,
                hasGithub: false,
                hasNpm: false,
                minStars: 0,
                tags: []
              })}
              className="text-xs text-purple-400 hover:text-purple-300 underline ml-2"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Display view options - sorting controls */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-end mb-4">
          <div className="bg-zinc-800 rounded-md p-1 inline-flex">
            <button 
              className={`p-2 rounded ${sortOption === 'popularity' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setSortOption('popularity')}
              title="Sort by popularity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button 
              className={`p-2 rounded ${sortOption === 'name' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setSortOption('name')}
              title="Sort alphabetically"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
            <button 
              className={`p-2 rounded ${sortOption === 'newest' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setSortOption('newest')}
              title="Sort by newest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Items per page and product type selector */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        {/* Product type filter */}
        <div className="mb-4 sm:mb-0 w-full sm:w-auto">
          <div className="bg-zinc-800 rounded-lg p-1 inline-flex space-x-1">
            {['All', 'MCP Servers', 'MCP Clients', 'AI Agents', 'Ready to Use'].map((type) => (
              <button
                key={type}
                onClick={() => handleProductTypeChange(type)}
                className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${productType === type ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-zinc-700'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        {/* Items per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Items per page:</span>
          <div className="bg-zinc-800 rounded-lg p-1 inline-flex space-x-1">
            {/* Use hardcoded options to ensure consistency */}
            <button
              onClick={() => handleItemsPerPageChange(10)}
              className={`px-2 py-1 text-sm rounded-md transition-colors duration-200 ${itemsPerPage === 10 ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-zinc-700'}`}
            >
              10
            </button>
            <button
              onClick={() => handleItemsPerPageChange(20)}
              className={`px-2 py-1 text-sm rounded-md transition-colors duration-200 ${itemsPerPage === 20 ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-zinc-700'}`}
            >
              20
            </button>
            <button
              onClick={() => handleItemsPerPageChange(30)}
              className={`px-2 py-1 text-sm rounded-md transition-colors duration-200 ${itemsPerPage === 30 ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-zinc-700'}`}
            >
              30
            </button>
          </div>
        </div>
      </div>
      
      {/* Netflix-style Product grid - showing products with pagination */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-6">
            {currentProducts.map((product, index) => (
              <div 
                key={product.id || product.name}
                className="animate-fadeIn product-item" 
                style={{ 
                  animationDelay: `${Math.min(index * 30, 1000)}ms`,
                }}
              >
                <ProductCard 
                  product={product} 
                  onNavigate={onNavigateToDetail}
                  featured={index === 0 && activeCategory === 'All' && currentPage === 1} // Mark first product as featured only on first page
                />
              </div>
            ))}
          </div>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
          
          {/* Results summary - with clear display of current page items */}
          <div className="mt-4 text-sm text-gray-400 text-center">
            Showing items {totalProducts > 0 ? indexOfFirstProduct + 1 : 0}-{Math.min(indexOfLastProduct, totalProducts)} of {totalProducts} products
            {currentPage > 1 && <span> (page {currentPage} of {totalPages})</span>}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-zinc-800/30 rounded-lg border border-zinc-700 mb-12">
          {apiError ? (
            <>
              <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400 text-xl mb-2">AWS Database Connection Error</p>
              <p className="text-gray-400 text-lg mb-4">Unable to connect to the AWS database. All data must come from AWS.</p>
              <p className="text-gray-500 text-sm mb-4">Details: {apiError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
              >
                Retry Connection
              </button>
            </>
          ) : (
            <>
              <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-xl mb-4">No MCP servers found matching your criteria.</p>
              {searchTerm && (
                <button 
                  onClick={handleClearSearch}
                  className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
                >
                  Clear search and try again
                </button>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Recommendation section after products - show only on All category */}
      {activeCategory === 'All' && filteredProducts.length > 0 && (
        <div className="mb-16">
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-lg p-8 border border-purple-500/20">
            <div className="flex items-start">
              <div className="bg-purple-600 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Did You Know?</h3>
                <p className="text-gray-300">
                  MCP servers can be combined to create powerful AI workflows. Try connecting multiple servers to build sophisticated AI applications with data from various sources.
                </p>
                <div className="mt-4">
                  <a 
                    href="#/what-is-an-mcp-server" 
                    className="text-purple-400 hover:text-purple-300 underline font-medium"
                  >
                    Learn more about MCP servers
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Back to top button */}
      {filteredProducts.length > 0 && (
        <div className="mt-8 mb-20 flex justify-center">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Back to top
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProductListPage;