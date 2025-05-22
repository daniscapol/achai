import Tutorial from '../src/models/Tutorial.js';
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
    const { method, url } = req;
    const path = url.split('?')[0]; // Remove query parameters
    
    // Parse the route
    const pathParts = path.split('/').filter(Boolean); // ['api', 'v1', 'tutorials', 'id']
    const resource = pathParts[2]; // 'tutorials' or 'news'
    const id = pathParts[3]; // individual resource ID (optional)
    
    // Route to appropriate handler
    if (resource === 'tutorials') {
      return await handleTutorials(req, res, method, id);
    } else if (resource === 'news') {
      return await handleNews(req, res, method, id);
    } else {
      return res.status(404).json({
        error: 'Not found',
        message: 'Resource not found'
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function handleTutorials(req, res, method, id) {
  if (method === 'GET') {
    if (id) {
      // Get specific tutorial
      const tutorial = await Tutorial.getByIdOrSlug(id);
      if (!tutorial) {
        return res.status(404).json({
          error: 'Tutorial not found',
          message: `Tutorial with ID/slug "${id}" was not found`
        });
      }
      return res.status(200).json(tutorial);
    } else {
      // Handle different GET endpoints
      const { featured, recent, popular, categories } = req.query;
      
      if (categories !== undefined) {
        const categories = await Tutorial.getCategories();
        return res.status(200).json(categories);
      }
      
      if (featured !== undefined) {
        const limit = parseInt(req.query.limit) || 6;
        const tutorials = await Tutorial.getFeatured(limit);
        return res.status(200).json(tutorials);
      }
      
      if (recent !== undefined) {
        const limit = parseInt(req.query.limit) || 5;
        const tutorials = await Tutorial.getRecent(limit);
        return res.status(200).json(tutorials);
      }
      
      if (popular !== undefined) {
        const limit = parseInt(req.query.limit) || 5;
        const tutorials = await Tutorial.getPopular(limit);
        return res.status(200).json(tutorials);
      }
      
      // Get all tutorials with pagination and filtering
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search;
      const category = req.query.category;
      
      let result;
      if (search) {
        result = await Tutorial.search(search, page, limit);
      } else if (category) {
        result = await Tutorial.filterByCategory(category, page, limit);
      } else {
        result = await Tutorial.getAll(page, limit);
      }
      
      return res.status(200).json(result);
    }
    
  } else if (method === 'POST') {
    // Create tutorial (admin only)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to create tutorials'
      });
    }
    
    const newTutorial = await Tutorial.create(req.body);
    return res.status(201).json(newTutorial);
    
  } else if (method === 'PUT') {
    // Update tutorial (admin only)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to update tutorials'
      });
    }
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Tutorial ID is required for updates'
      });
    }
    
    const updatedTutorial = await Tutorial.update(id, req.body);
    if (!updatedTutorial) {
      return res.status(404).json({
        error: 'Tutorial not found',
        message: `Tutorial with ID "${id}" was not found`
      });
    }
    
    return res.status(200).json(updatedTutorial);
    
  } else if (method === 'DELETE') {
    // Delete tutorial (admin only)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to delete tutorials'
      });
    }
    
    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Tutorial ID is required for deletion'
      });
    }
    
    const deletedTutorial = await Tutorial.delete(id);
    if (!deletedTutorial) {
      return res.status(404).json({
        error: 'Tutorial not found',
        message: `Tutorial with ID "${id}" was not found`
      });
    }
    
    return res.status(200).json({
      message: 'Tutorial deleted successfully',
      tutorial: deletedTutorial
    });
    
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: `Method ${method} is not allowed`
    });
  }
}

async function handleNews(req, res, method, id) {
  if (method === 'GET') {
    if (id) {
      // Get specific news article
      const article = await NewsArticle.getByIdOrSlug(id);
      if (!article) {
        return res.status(404).json({
          error: 'News article not found',
          message: `News article with ID/slug "${id}" was not found`
        });
      }
      return res.status(200).json(article);
    } else {
      // Handle different GET endpoints
      const { featured, recent, popular, categories } = req.query;
      
      if (categories !== undefined) {
        const categories = await NewsArticle.getCategories();
        return res.status(200).json(categories);
      }
      
      if (featured !== undefined) {
        const limit = parseInt(req.query.limit) || 6;
        const articles = await NewsArticle.getFeatured(limit);
        return res.status(200).json(articles);
      }
      
      if (recent !== undefined) {
        const limit = parseInt(req.query.limit) || 5;
        const articles = await NewsArticle.getRecent(limit);
        return res.status(200).json(articles);
      }
      
      if (popular !== undefined) {
        const limit = parseInt(req.query.limit) || 5;
        const articles = await NewsArticle.getPopular(limit);
        return res.status(200).json(articles);
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
    }
    
  } else if (method === 'POST') {
    // Create news article (admin only)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to create news articles'
      });
    }
    
    const newArticle = await NewsArticle.create(req.body);
    return res.status(201).json(newArticle);
    
  } else if (method === 'PUT') {
    // Update news article (admin only)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to update news articles'
      });
    }
    
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
    // Delete news article (admin only)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to delete news articles'
      });
    }
    
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
}