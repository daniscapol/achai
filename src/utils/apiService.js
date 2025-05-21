/**
 * API Service for interacting with the backend API
 * Handles tutorials and news article data fetching
 */

// API base URL - defaults to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Generic fetch helper with error handling
 */
async function fetchApi(endpoint, options = {}) {
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
 * Tutorial API Services
 */
export const tutorialApi = {
  // Get all tutorials with optional filtering
  async getTutorials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/tutorials${queryString ? `?${queryString}` : ''}`);
  },

  // Get tutorial by ID or slug
  async getTutorialByIdOrSlug(idOrSlug) {
    return fetchApi(`/tutorials/${idOrSlug}`);
  },

  // Get featured tutorials
  async getFeaturedTutorials(limit = 6) {
    return fetchApi(`/tutorials/featured?limit=${limit}`);
  },

  // Get tutorial categories
  async getTutorialCategories() {
    return fetchApi('/tutorials/categories');
  },

  // Get recent tutorials
  async getRecentTutorials(limit = 5) {
    return fetchApi(`/tutorials/recent?limit=${limit}`);
  },

  // Get popular tutorials
  async getPopularTutorials(limit = 5) {
    return fetchApi(`/tutorials/popular?limit=${limit}`);
  },

  // Search tutorials
  async searchTutorials(query, page = 1, limit = 20) {
    return fetchApi(`/tutorials?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  },

  // Filter tutorials by category
  async filterTutorialsByCategory(category, page = 1, limit = 20) {
    return fetchApi(`/tutorials?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`);
  },

  // Admin methods (require authentication)
  admin: {
    // Create a new tutorial
    async createTutorial(tutorialData, token) {
      return fetchApi('/tutorials', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tutorialData),
      });
    },

    // Update an existing tutorial
    async updateTutorial(idOrSlug, tutorialData, token) {
      return fetchApi(`/tutorials/${idOrSlug}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tutorialData),
      });
    },

    // Delete a tutorial
    async deleteTutorial(idOrSlug, token) {
      return fetchApi(`/tutorials/${idOrSlug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
};

/**
 * News API Services
 */
export const newsApi = {
  // Get all news articles with optional filtering
  async getNewsArticles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return fetchApi(`/news${queryString ? `?${queryString}` : ''}`);
  },

  // Get news article by ID or slug
  async getNewsArticleByIdOrSlug(idOrSlug) {
    return fetchApi(`/news/${idOrSlug}`);
  },

  // Get featured news articles
  async getFeaturedNews(limit = 6) {
    return fetchApi(`/news/featured?limit=${limit}`);
  },

  // Get news categories
  async getNewsCategories() {
    return fetchApi('/news/categories');
  },

  // Get recent news
  async getRecentNews(limit = 5) {
    return fetchApi(`/news/recent?limit=${limit}`);
  },

  // Get popular news
  async getPopularNews(limit = 5) {
    return fetchApi(`/news/popular?limit=${limit}`);
  },

  // Search news articles
  async searchNews(query, page = 1, limit = 20) {
    return fetchApi(`/news?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  },

  // Filter news by category
  async filterNewsByCategory(category, page = 1, limit = 20) {
    return fetchApi(`/news?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`);
  },

  // Admin methods (require authentication)
  admin: {
    // Create a new news article
    async createNewsArticle(articleData, token) {
      return fetchApi('/news', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(articleData),
      });
    },

    // Update an existing news article
    async updateNewsArticle(idOrSlug, articleData, token) {
      return fetchApi(`/news/${idOrSlug}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(articleData),
      });
    },

    // Delete a news article
    async deleteNewsArticle(idOrSlug, token) {
      return fetchApi(`/news/${idOrSlug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
};

export default {
  tutorial: tutorialApi,
  news: newsApi,
};