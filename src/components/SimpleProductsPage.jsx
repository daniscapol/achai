import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import DataStatusAlert from './DataStatusAlert';

const SimpleProductsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [filterCounts, setFilterCounts] = useState({
    all: 0,
    server: 0,
    client: 0,
    'ai-agent': 0,
    'ready-to-use': 0
  });
  
  // Get products from AWS database with our hook
  const {
    products,
    loading,
    error,
    dataStatus,
    filterByProductType,
    fetchProducts
  } = useProducts(1, 100); // Load up to 100 products initially
  
  // Filtered products state
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Update filtered products when active filter changes or products update
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredProducts(products);
    } else {
      const newFilteredProducts = products.filter(product => product.type === activeFilter || product.product_type === activeFilter);
      setFilteredProducts(newFilteredProducts);
    }
  }, [activeFilter, products]);
  
  // Calculate filter counts whenever products change
  useEffect(() => {
    if (products && products.length > 0) {
      const counts = {
        all: products.length,
        server: products.filter(p => p.type === 'server' || p.product_type === 'server').length,
        client: products.filter(p => p.type === 'client' || p.product_type === 'client').length,
        'ai-agent': products.filter(p => p.type === 'ai-agent' || p.product_type === 'ai-agent').length,
        'ready-to-use': products.filter(p => p.type === 'ready-to-use' || p.product_type === 'ready-to-use').length
      };
      
      setFilterCounts(counts);
    }
  }, [products]);
  
  // Handle filter change
  const handleFilterChange = async (filterType) => {
    setActiveFilter(filterType);
    
    // If we're switching to 'all', fetch all products
    if (filterType === 'all') {
      await fetchProducts(1, 100);
    }
    // Otherwise, fetch the specific type
    else {
      await filterByProductType(filterType, 1, 100);
    }
  };

  // Handle product click
  const handleProductClick = (product) => {
    try {
      // Cache product data for faster loading
      sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    } catch (err) {
      console.warn("Could not cache product data:", err);
    }
    
    // Navigate based on product type - always use proper path-based navigation
    if (product.type === 'client' || product.product_type === 'client') {
      navigate(`/products/client-${product.id}`);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4 md:px-8">
      {/* Show data status alert if there's an error */}
      {dataStatus && dataStatus.type === 'error' && (
        <div className="mb-6">
          <DataStatusAlert />
        </div>
      )}
      
      <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-200">
        All Products
      </h1>
      
      {/* Simple Filter Buttons */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-5 py-2 rounded-full transition-all ${
            activeFilter === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          }`}
        >
          All Products ({filterCounts.all})
        </button>
        <button
          onClick={() => handleFilterChange('server')}
          className={`px-5 py-2 rounded-full transition-all ${
            activeFilter === 'server' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          } ${filterCounts.server === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={filterCounts.server === 0}
        >
          MCP Servers ({filterCounts.server})
        </button>
        <button
          onClick={() => handleFilterChange('client')}
          className={`px-5 py-2 rounded-full transition-all ${
            activeFilter === 'client' 
              ? 'bg-blue-600 text-white' 
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          } ${filterCounts.client === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={filterCounts.client === 0}
        >
          MCP Clients ({filterCounts.client})
        </button>
        <button
          onClick={() => handleFilterChange('ai-agent')}
          className={`px-5 py-2 rounded-full transition-all ${
            activeFilter === 'ai-agent' 
              ? 'bg-rose-600 text-white' 
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          } ${filterCounts['ai-agent'] === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={filterCounts['ai-agent'] === 0}
        >
          AI Agents ({filterCounts['ai-agent']})
        </button>
        <button
          onClick={() => handleFilterChange('ready-to-use')}
          className={`px-5 py-2 rounded-full transition-all ${
            activeFilter === 'ready-to-use' 
              ? 'bg-amber-600 text-white' 
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          } ${filterCounts['ready-to-use'] === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={filterCounts['ready-to-use'] === 0}
        >
          Ready to Use ({filterCounts['ready-to-use']})
        </button>
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
          
          {/* Simple grid layout of filtered products */}
          {!error && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredProducts.map((product, index) => (
                <div 
                  key={`product-${product.id}-${index}`}
                  className="rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer relative group/item"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="bg-zinc-900/90 border border-zinc-800/70 group-hover/item:border-purple-500/40 transition-all duration-300 shadow-xl rounded-lg overflow-hidden flex flex-col h-full">
                    {/* Image section */}
                    <div className="relative h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image_url || '/assets/news-images/fallback.jpg'}
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
                      
                      {/* Product type badge */}
                      {(product.type || product.product_type) && (
                        <div 
                          className={`absolute top-2 right-2 shadow-md text-xs px-2 py-1 rounded-full text-white ${
                            (product.type === 'server' || product.product_type === 'server') ? 'bg-indigo-600/90' : 
                            (product.type === 'client' || product.product_type === 'client') ? 'bg-blue-600/90' : 
                            (product.type === 'ai-agent' || product.product_type === 'ai-agent') ? 'bg-rose-600/90' : 
                            'bg-purple-600/90'
                          }`}
                        >
                          {product.type || product.product_type}
                        </div>
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
                      
                      {/* Description */}
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2 group-hover/item:text-gray-300 transition-colors duration-300">
                        {product.description || 'No description available'}
                      </p>
                      
                      {/* Rating if available */}
                      {(product.stars || product.stars_numeric) && (
                        <div className="flex items-center mt-auto">
                          <svg className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
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
          )}
          
          {/* No products message */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-zinc-900/40 rounded-xl border border-zinc-800/60 shadow-lg max-w-2xl mx-auto">
              <div className="text-gray-400 w-16 h-16 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-gray-400 text-center mb-6">
                {activeFilter === 'all' 
                  ? 'There are no products available in the AWS database at this time.' 
                  : `No ${activeFilter === 'server' ? 'MCP Server' : 
                      activeFilter === 'client' ? 'MCP Client' : 
                      activeFilter === 'ai-agent' ? 'AI Agent' : 
                      'Ready to Use'} products found in the AWS database.`
                }
              </p>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => handleFilterChange('all')}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors duration-300"
                >
                  Show All Products
                </button>
              )}
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

export default SimpleProductsPage;