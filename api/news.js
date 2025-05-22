import NewsArticle from '../src/models/NewsArticle.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;
    
    if (method === 'GET') {
      // Handle different GET endpoints
      const { slug, featured, recent, popular, categories } = req.query;
      
      if (categories !== undefined) {
        // Get news categories
        const categories = await NewsArticle.getCategories();
        return res.status(200).json(categories);
      }
      
      if (featured !== undefined) {
        // Get featured news articles
        const limit = parseInt(req.query.limit) || 6;
        const articles = await NewsArticle.getFeatured(limit);
        return res.status(200).json(articles);
      }
      
      if (recent !== undefined) {
        // Get recent news articles
        const limit = parseInt(req.query.limit) || 5;
        const articles = await NewsArticle.getRecent(limit);
        return res.status(200).json(articles);
      }
      
      if (popular !== undefined) {
        // Get popular news articles
        const limit = parseInt(req.query.limit) || 5;
        const articles = await NewsArticle.getPopular(limit);
        return res.status(200).json(articles);
      }
      
      if (slug) {
        // Get specific news article by slug
        const article = await NewsArticle.getByIdOrSlug(slug);
        if (!article) {
          return res.status(404).json({
            error: 'News article not found',
            message: `News article with slug "${slug}" was not found`
          });
        }
        return res.status(200).json(article);
      }
      
      // Get all news articles with pagination and filtering
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search;
      const category = req.query.category;
      
      let result;
      
      if (search) {
        result = await NewsArticle.search(search, page, limit);
      } else if (category) {
        result = await NewsArticle.filterByCategory(category, page, limit);
      } else {
        result = await NewsArticle.getAll(page, limit);
      }
      
      return res.status(200).json(result);
      
    } else if (method === 'POST') {
      // Create a new news article (admin only)
      if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You are not authorized to create news articles'
        });
      }
      
      const newArticle = await NewsArticle.create(req.body);
      return res.status(201).json(newArticle);
      
    } else if (method === 'PUT') {
      // Update an existing news article (admin only)
      if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You are not authorized to update news articles'
        });
      }
      
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Article ID is required for updates'
        });
      }
      
      const updatedArticle = await NewsArticle.update(id, req.body);
      if (!updatedArticle) {
        return res.status(404).json({
          error: 'News article not found',
          message: `News article with ID "${id}" was not found`
        });
      }
      
      return res.status(200).json(updatedArticle);
      
    } else if (method === 'DELETE') {
      // Delete a news article (admin only)
      if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You are not authorized to delete news articles'
        });
      }
      
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Article ID is required for deletion'
        });
      }
      
      const deletedArticle = await NewsArticle.delete(id);
      if (!deletedArticle) {
        return res.status(404).json({
          error: 'News article not found',
          message: `News article with ID "${id}" was not found`
        });
      }
      
      return res.status(200).json({
        message: 'News article deleted successfully',
        article: deletedArticle
      });
      
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({
        error: 'Method not allowed',
        message: `Method ${method} is not allowed`
      });
    }
    
  } catch (error) {
    console.error('Error in news API:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'News article already exists',
        message: error.message
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}