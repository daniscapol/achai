/**
 * API Service for interacting with the backend API
 * Handles product data fetching
 */

// API base URL - automatically detects environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api');

/**
 * Generic fetch helper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  // If no API base URL is configured, throw an error immediately
  if (!API_BASE_URL || API_BASE_URL.trim() === '') {
    throw new Error('No API server configured - using static data only');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Product API Services
 */
export const productApi = {
  // Get all products with optional filtering
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/products${queryString ? `?${queryString}` : ''}`);
  },

  // Get product by ID or slug
  async getProductByIdOrSlug(idOrSlug) {
    return fetchApi(`/products/${idOrSlug}`);
  },

  // Get featured products
  async getFeaturedProducts(limit = 6) {
    return fetchApi(`/products/featured?limit=${limit}`);
  },

  // Get product categories
  async getProductCategories() {
    return fetchApi('/products/categories');
  },

  // Get recent products
  async getRecentProducts(limit = 5) {
    return fetchApi(`/products/recent?limit=${limit}`);
  },

  // Search products
  async searchProducts(query, page = 1, limit = 20) {
    return fetchApi(`/products?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  },

  // Filter products by category
  async filterProductsByCategory(category, page = 1, limit = 20) {
    return fetchApi(`/products?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`);
  },

  // Admin methods (require authentication)
  admin: {
    // Create a new product
    async createProduct(productData, token) {
      return fetchApi('/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
    },

    // Update an existing product
    async updateProduct(idOrSlug, productData, token) {
      return fetchApi(`/products/${idOrSlug}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
    },

    // Delete a product
    async deleteProduct(idOrSlug, token) {
      return fetchApi(`/products/${idOrSlug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
};

export default {
  product: productApi,
};