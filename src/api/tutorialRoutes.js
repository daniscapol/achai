import express from 'express';
import Tutorial from '../models/Tutorial.js';

const router = express.Router();

// Get all tutorials (with pagination)
router.get('/tutorials', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const category = req.query.category;
    
    let result;
    
    if (search) {
      // If search parameter is provided, search tutorials
      result = await Tutorial.search(search, page, limit);
    } else if (category) {
      // If category parameter is provided, filter by category
      result = await Tutorial.filterByCategory(category, page, limit);
    } else {
      // Otherwise, get all tutorials
      result = await Tutorial.getAll(page, limit);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in GET /api/tutorials:', error);
    res.status(500).json({
      error: 'Failed to fetch tutorials',
      message: error.message
    });
  }
});

// Get featured tutorials
router.get('/tutorials/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const tutorials = await Tutorial.getFeatured(limit);
    res.json(tutorials);
  } catch (error) {
    console.error('Error in GET /api/tutorials/featured:', error);
    res.status(500).json({
      error: 'Failed to fetch featured tutorials',
      message: error.message
    });
  }
});

// Get tutorial categories
router.get('/tutorials/categories', async (req, res) => {
  try {
    const categories = await Tutorial.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error in GET /api/tutorials/categories:', error);
    res.status(500).json({
      error: 'Failed to fetch tutorial categories',
      message: error.message
    });
  }
});

// Get recent tutorials
router.get('/tutorials/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const tutorials = await Tutorial.getRecent(limit);
    res.json(tutorials);
  } catch (error) {
    console.error('Error in GET /api/tutorials/recent:', error);
    res.status(500).json({
      error: 'Failed to fetch recent tutorials',
      message: error.message
    });
  }
});

// Get popular tutorials
router.get('/tutorials/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const tutorials = await Tutorial.getPopular(limit);
    res.json(tutorials);
  } catch (error) {
    console.error('Error in GET /api/tutorials/popular:', error);
    res.status(500).json({
      error: 'Failed to fetch popular tutorials',
      message: error.message
    });
  }
});

// Get a specific tutorial by ID or slug
router.get('/tutorials/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const tutorial = await Tutorial.getByIdOrSlug(idOrSlug);
    
    if (!tutorial) {
      return res.status(404).json({
        error: 'Tutorial not found',
        message: `Tutorial with ID/slug "${idOrSlug}" was not found`
      });
    }
    
    res.json(tutorial);
  } catch (error) {
    console.error(`Error in GET /api/tutorials/${req.params.idOrSlug}:`, error);
    res.status(500).json({
      error: 'Failed to fetch tutorial',
      message: error.message
    });
  }
});

// Create a new tutorial (admin only)
router.post('/tutorials', async (req, res) => {
  try {
    // Basic authentication check (this should be replaced with proper authentication)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to create tutorials'
      });
    }
    
    const newTutorial = await Tutorial.create(req.body);
    res.status(201).json(newTutorial);
  } catch (error) {
    console.error('Error in POST /api/tutorials:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Tutorial already exists',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to create tutorial',
      message: error.message
    });
  }
});

// Update an existing tutorial (admin only)
router.put('/tutorials/:idOrSlug', async (req, res) => {
  try {
    // Basic authentication check (this should be replaced with proper authentication)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to update tutorials'
      });
    }
    
    const { idOrSlug } = req.params;
    const updatedTutorial = await Tutorial.update(idOrSlug, req.body);
    
    if (!updatedTutorial) {
      return res.status(404).json({
        error: 'Tutorial not found',
        message: `Tutorial with ID/slug "${idOrSlug}" was not found`
      });
    }
    
    res.json(updatedTutorial);
  } catch (error) {
    console.error(`Error in PUT /api/tutorials/${req.params.idOrSlug}:`, error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Tutorial with this slug already exists',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to update tutorial',
      message: error.message
    });
  }
});

// Delete a tutorial (admin only)
router.delete('/tutorials/:idOrSlug', async (req, res) => {
  try {
    // Basic authentication check (this should be replaced with proper authentication)
    if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'You are not authorized to delete tutorials'
      });
    }
    
    const { idOrSlug } = req.params;
    const deletedTutorial = await Tutorial.delete(idOrSlug);
    
    if (!deletedTutorial) {
      return res.status(404).json({
        error: 'Tutorial not found',
        message: `Tutorial with ID/slug "${idOrSlug}" was not found`
      });
    }
    
    res.json({
      message: 'Tutorial deleted successfully',
      tutorial: deletedTutorial
    });
  } catch (error) {
    console.error(`Error in DELETE /api/tutorials/${req.params.idOrSlug}:`, error);
    res.status(500).json({
      error: 'Failed to delete tutorial',
      message: error.message
    });
  }
});

// Rate a tutorial
router.post('/tutorials/:idOrSlug/rate', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { rating } = req.body;
    
    // Validate rating
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be a number between 1 and 5'
      });
    }
    
    // Optional: You can associate ratings with users if you have authentication
    // const userId = req.user?.id || 'anonymous'; 
    
    const result = await Tutorial.addRating(idOrSlug, rating);
    
    if (!result) {
      return res.status(404).json({
        error: 'Tutorial not found',
        message: `Tutorial with ID/slug "${idOrSlug}" was not found`
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error in POST /api/tutorials/${req.params.idOrSlug}/rate:`, error);
    res.status(500).json({
      error: 'Failed to add rating',
      message: error.message
    });
  }
});

// Submit feedback for a tutorial
router.post('/tutorials/:idOrSlug/feedback', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { feedback } = req.body;
    
    // Validate feedback
    if (!feedback || !Array.isArray(feedback)) {
      return res.status(400).json({
        error: 'Invalid feedback',
        message: 'Feedback must be an array of strings'
      });
    }
    
    // Optional: You can associate feedback with users if you have authentication
    // const userId = req.user?.id || 'anonymous';
    
    const result = await Tutorial.addFeedback(idOrSlug, feedback);
    
    if (!result) {
      return res.status(404).json({
        error: 'Tutorial not found',
        message: `Tutorial with ID/slug "${idOrSlug}" was not found`
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error in POST /api/tutorials/${req.params.idOrSlug}/feedback:`, error);
    res.status(500).json({
      error: 'Failed to add feedback',
      message: error.message
    });
  }
});

export default router;