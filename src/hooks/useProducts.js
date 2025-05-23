import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Use environment variable for API URL with localhost fallback
const API_URL = import.meta.env.VITE_API_BASE_URL ? 
  `${import.meta.env.VITE_API_BASE_URL}/products` : 
  'http://localhost:3001/api/products';

const useProducts = (initialPage = 1, initialLimit = 100) => {
  const { currentLanguage } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataStatus, setDataStatus] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: initialPage,
    limit: initialLimit
  });

  const fetchProducts = async (page = initialPage, limit = initialLimit) => {
    setLoading(true);
    try {
      const langParam = currentLanguage === 'pt' ? 'pt' : 'en';
      console.log(`Making request to: ${API_URL}?page=${page}&limit=${limit}&language=${langParam}`);
      const response = await fetch(`${API_URL}?page=${page}&limit=${limit}&language=${langParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`fetchProducts: Received ${data.products?.length || 0} products`);
      
      // Log the first product to debug what's coming back
      if (data.products && data.products.length > 0) {
        console.log('Sample product data:', {
          id: data.products[0].id,
          name: data.products[0].name,
          type: data.products[0].product_type
        });
      }
      
      setProducts(data.products || []);
      setPagination(data.pagination || {
        total: 0,
        totalPages: 0,
        currentPage: page,
        limit
      });
      setDataStatus(data.dataStatus);
      setError(null);
      
      // Return the data for chaining
      return data;
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      setPagination({
        total: 0,
        totalPages: 0,
        currentPage: page,
        limit
      });
      setError('AWS Database connection required. Unable to fetch products.');
      setDataStatus({
        type: 'error',
        message: 'AWS Database connection required. Unable to fetch products.',
        source: 'none'
      });
      
      // Return empty data structure for chaining
      return { products: [], pagination: { total: 0, totalPages: 0, currentPage: page, limit } };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(pagination.currentPage, pagination.limit);
  }, [pagination.currentPage, pagination.limit, currentLanguage]);

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const changeLimit = (newLimit) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      currentPage: 1 // Reset to first page when changing limit
    }));
  };

  const searchProducts = async (query) => {
    if (!query || query.trim() === '' || query === 'all') {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const langParam = currentLanguage === 'pt' ? 'pt' : 'en';
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? 
        `${import.meta.env.VITE_API_BASE_URL}` : 
        'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(query)}&language=${langParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: pagination.limit
      });
      setDataStatus(data.dataStatus);
      setError(null);
    } catch (err) {
      console.error('Error searching products:', err);
      setProducts([]);
      setPagination({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: pagination.limit
      });
      setError('AWS Database connection required. Unable to search products.');
      setDataStatus({
        type: 'error',
        message: 'AWS Database connection required. Unable to search products.',
        source: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (category) => {
    if (!category || category === 'all') {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const langParam = currentLanguage === 'pt' ? 'pt' : 'en';
      const response = await fetch(`${API_URL}?category=${encodeURIComponent(category)}&language=${langParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: pagination.limit
      });
      setDataStatus(data.dataStatus);
      setError(null);
    } catch (err) {
      console.error('Error filtering products by category:', err);
      setProducts([]);
      setPagination({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        limit: pagination.limit
      });
      setError('AWS Database connection required. Unable to filter products by category.');
      setDataStatus({
        type: 'error',
        message: 'AWS Database connection required. Unable to filter products by category.',
        source: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async (limit = 6) => {
    try {
      const response = await fetch(`${API_URL}/featured?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        products: data.products || [],
        dataStatus: data.dataStatus
      };
    } catch (err) {
      console.error('Error fetching featured products:', err);
      return { 
        products: [],
        dataStatus: {
          type: 'error',
          message: 'AWS Database connection required. Unable to fetch featured products.',
          source: 'none'
        }
      };
    }
  };

  const filterByProductType = async (type, page = 1, limit = 100) => {
    if (!type || type === 'all') {
      fetchProducts(page, limit);
      return;
    }
    
    setLoading(true);
    try {
      const langParam = currentLanguage === 'pt' ? 'pt' : 'en';
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ? 
        `${import.meta.env.VITE_API_BASE_URL}` : 
        'http://localhost:3001/api';
      const typeEndpoint = `${API_BASE_URL}/products?type=${encodeURIComponent(type)}&page=${page}&limit=${limit}&language=${langParam}`;
      console.log(`Making request to: ${typeEndpoint}`);
      const response = await fetch(typeEndpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`filterByProductType: Received ${data.products?.length || 0} products of type "${type}"`);
      
      // Log the first product to debug what's coming back
      if (data.products && data.products.length > 0) {
        console.log('Sample product data:', {
          id: data.products[0].id,
          name: data.products[0].name,
          type: data.products[0].product_type
        });
      }
      
      setProducts(data.products || []);
      setPagination(data.pagination || {
        total: 0,
        totalPages: 0,
        currentPage: page,
        limit
      });
      setDataStatus(data.dataStatus);
      setError(null);
      
      // Return the data for chaining
      return data;
    } catch (err) {
      console.error('Error filtering products by type:', err);
      setProducts([]);
      setPagination({
        total: 0,
        totalPages: 0,
        currentPage: page,
        limit
      });
      setError('AWS Database connection required. Unable to filter products by type.');
      setDataStatus({
        type: 'error',
        message: 'AWS Database connection required. Unable to filter products by type.',
        source: 'none'
      });
      
      // Return empty data structure for chaining
      return { products: [], pagination: { total: 0, totalPages: 0, currentPage: page, limit } };
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    pagination,
    dataStatus,
    fetchProducts,
    changePage,
    changeLimit,
    searchProducts,
    filterByCategory,
    fetchFeaturedProducts,
    filterByProductType
  };
};

export default useProducts;