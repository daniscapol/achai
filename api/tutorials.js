import Tutorial from '../src/models/Tutorial.js';

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
        // Get tutorial categories
        const categories = await Tutorial.getCategories();
        return res.status(200).json(categories);
      }
      
      if (featured !== undefined) {
        // Get featured tutorials
        const limit = parseInt(req.query.limit) || 6;
        const tutorials = await Tutorial.getFeatured(limit);
        return res.status(200).json(tutorials);
      }
      
      if (recent !== undefined) {
        // Get recent tutorials
        const limit = parseInt(req.query.limit) || 5;
        const tutorials = await Tutorial.getRecent(limit);
        return res.status(200).json(tutorials);
      }
      
      if (popular !== undefined) {
        // Get popular tutorials
        const limit = parseInt(req.query.limit) || 5;
        const tutorials = await Tutorial.getPopular(limit);
        return res.status(200).json(tutorials);
      }
      
      if (slug) {
        // Get specific tutorial by slug
        const tutorial = await Tutorial.getByIdOrSlug(slug);
        if (!tutorial) {
          return res.status(404).json({
            error: 'Tutorial not found',
            message: `Tutorial with slug "${slug}" was not found`
          });
        }
        return res.status(200).json(tutorial);
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
      
    } else if (method === 'POST') {
      // Create a new tutorial (admin only)
      if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You are not authorized to create tutorials'
        });
      }
      
      const newTutorial = await Tutorial.create(req.body);
      return res.status(201).json(newTutorial);
      
    } else if (method === 'PUT') {
      // Update an existing tutorial (admin only)
      if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You are not authorized to update tutorials'
        });
      }
      
      const { id } = req.query;
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
      // Delete a tutorial (admin only)
      if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You are not authorized to delete tutorials'
        });
      }
      
      const { id } = req.query;
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
    
  } catch (error) {
    console.error('Error in tutorials API:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Tutorial already exists',
        message: error.message
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}