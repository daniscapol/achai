import express from 'express';
import { News } from '../utils/News.js';

const router = express.Router();

// GET /api/news - Get all articles with pagination, search, filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, popular, slug } = req.query;
    
    // Get single article by slug
    if (slug) {
      const article = await News.getBySlug(slug);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      return res.status(200).json({ article });
    }
    
    // Get popular articles
    if (popular) {
      const articles = await News.getPopular(parseInt(limit));
      return res.status(200).json({ articles });
    }
    
    // Search articles
    if (search) {
      const result = await News.search(search, parseInt(page), parseInt(limit));
      return res.status(200).json({
        success: true,
        data: result.articles,
        pagination: result.pagination
      });
    }
    
    // Get articles by category
    if (category) {
      const result = await News.getByCategory(category, parseInt(page), parseInt(limit));
      return res.status(200).json({
        success: true,
        data: result.articles,
        pagination: result.pagination
      });
    }
    
    // Get all articles
    const result = await News.getAll(parseInt(page), parseInt(limit));
    return res.status(200).json({
      success: true,
      data: result.articles,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// POST /api/news - Create new article (admin only)
router.post('/', async (req, res) => {
  try {
    const articleData = req.body;
    
    // Basic validation
    if (!articleData.title || !articleData.content || !articleData.author) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: title, content, author' 
      });
    }
    
    const newArticle = await News.create(articleData);
    return res.status(201).json({ 
      success: true,
      data: newArticle 
    });

  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// PUT /api/news/:id - Update article (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedArticle = await News.update(parseInt(id), updateData);
    
    if (!updatedArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    return res.status(200).json({ article: updatedArticle });

  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// DELETE /api/news/:id - Delete article (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedArticle = await News.delete(parseInt(id));
    
    if (!deletedArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    return res.status(200).json({ 
      message: 'Article archived successfully',
      id: deletedArticle.id 
    });

  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/news/categories - Get all categories (must be before /:id route)
router.get('/categories', async (req, res) => {
  try {
    const categories = await News.getCategories();
    return res.status(200).json({ 
      success: true,
      data: categories 
    });
  } catch (error) {
    console.error('News Categories API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/news/:id - Get single article by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get by ID first (if it's a number)
    let article;
    if (!isNaN(id)) {
      article = await News.getById(parseInt(id));
    }
    
    // If not found by ID or ID is not a number, try by slug
    if (!article) {
      article = await News.getBySlug(id);
    }
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    return res.status(200).json({ 
      success: true,
      data: article 
    });
  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;