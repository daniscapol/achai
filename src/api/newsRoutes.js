import express from 'express';
import NewsArticle from '../models/NewsArticle.js';

const router = express.Router();

// Get all news articles (with pagination)
router.get('/news', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const category = req.query.category;
    
    let result;
    
    if (search) {
      // If search parameter is provided, search news articles
      result = await NewsArticle.search(search, page, limit);
    } else if (category) {
      // If category parameter is provided, filter by category
      result = await NewsArticle.filterByCategory(category, page, limit);
    } else {
      // Otherwise, get all news articles
      result = await NewsArticle.getAll(page, limit);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in GET /api/news:', error);
    res.status(500).json({
      error: 'Failed to fetch news articles',
      message: error.message
    });
  }
});

// Get featured news articles
router.get('/news/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const articles = await NewsArticle.getFeatured(limit);
    res.json(articles);
  } catch (error) {
    console.error('Error in GET /api/news/featured:', error);
    res.status(500).json({
      error: 'Failed to fetch featured news articles',
      message: error.message
    });
  }
});

// Get news categories
router.get('/news/categories', async (req, res) => {
  try {
    const categories = await NewsArticle.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error in GET /api/news/categories:', error);
    res.status(500).json({
      error: 'Failed to fetch news categories',
      message: error.message
    });
  }
});

// Get recent news articles
router.get('/news/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const articles = await NewsArticle.getRecent(limit);
    res.json(articles);
  } catch (error) {
    console.error('Error in GET /api/news/recent:', error);
    res.status(500).json({
      error: 'Failed to fetch recent news articles',
      message: error.message
    });
  }
});

// Get popular news articles
router.get('/news/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const articles = await NewsArticle.getPopular(limit);
    res.json(articles);
  } catch (error) {
    console.error('Error in GET /api/news/popular:', error);
    res.status(500).json({
      error: 'Failed to fetch popular news articles',
      message: error.message
    });
  }
});

// Get a specific news article by ID or slug
router.get('/news/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const article = await NewsArticle.getByIdOrSlug(idOrSlug);
    
    if (!article) {
      return res.status(404).json({
        error: 'News article not found',
        message: `News article with ID/slug "${idOrSlug}" was not found`
      });
    }
    
    res.json(article);
  } catch (error) {
    console.error(`Error in GET /api/news/${req.params.idOrSlug}:`, error);
    res.status(500).json({
      error: 'Failed to fetch news article',
      message: error.message
    });
  }
});

// Create a new news article (admin only)
router.post('/news', async (req, res) => {
  try {
    // Basic authentication check (this should be replaced with proper authentication)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to create news articles'
      });
    }
    
    const newArticle = await NewsArticle.create(req.body);
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error in POST /api/news:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'News article already exists',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to create news article',
      message: error.message
    });
  }
});

// Update an existing news article (admin only)
router.put('/news/:idOrSlug', async (req, res) => {
  try {
    // Basic authentication check (this should be replaced with proper authentication)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to update news articles'
      });
    }
    
    const { idOrSlug } = req.params;
    const updatedArticle = await NewsArticle.update(idOrSlug, req.body);
    
    if (!updatedArticle) {
      return res.status(404).json({
        error: 'News article not found',
        message: `News article with ID/slug "${idOrSlug}" was not found`
      });
    }
    
    res.json(updatedArticle);
  } catch (error) {
    console.error(`Error in PUT /api/news/${req.params.idOrSlug}:`, error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'News article with this slug already exists',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to update news article',
      message: error.message
    });
  }
});

// Delete a news article (admin only)
router.delete('/news/:idOrSlug', async (req, res) => {
  try {
    // Basic authentication check (this should be replaced with proper authentication)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to delete news articles'
      });
    }
    
    const { idOrSlug } = req.params;
    const deletedArticle = await NewsArticle.delete(idOrSlug);
    
    if (!deletedArticle) {
      return res.status(404).json({
        error: 'News article not found',
        message: `News article with ID/slug "${idOrSlug}" was not found`
      });
    }
    
    res.json({
      message: 'News article deleted successfully',
      article: deletedArticle
    });
  } catch (error) {
    console.error(`Error in DELETE /api/news/${req.params.idOrSlug}:`, error);
    res.status(500).json({
      error: 'Failed to delete news article',
      message: error.message
    });
  }
});

export default router;