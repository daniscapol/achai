import Tutorial from '../../src/models/Tutorial.js';

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
    const { id } = req.query;
    const { method } = req;
    
    if (method === 'GET') {
      // Get specific tutorial by ID or slug
      const tutorial = await Tutorial.getByIdOrSlug(id);
      
      if (!tutorial) {
        return res.status(404).json({
          error: 'Tutorial not found',
          message: `Tutorial with ID/slug "${id}" was not found`
        });
      }
      
      return res.status(200).json(tutorial);
      
    } else if (method === 'PUT') {
      // Update an existing tutorial (admin only)
      if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You are not authorized to update tutorials'
        });
      }
      
      const updatedTutorial = await Tutorial.update(id, req.body);
      if (!updatedTutorial) {
        return res.status(404).json({
          error: 'Tutorial not found',
          message: `Tutorial with ID/slug "${id}" was not found`
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
      
      const deletedTutorial = await Tutorial.delete(id);
      if (!deletedTutorial) {
        return res.status(404).json({
          error: 'Tutorial not found',
          message: `Tutorial with ID/slug "${id}" was not found`
        });
      }
      
      return res.status(200).json({
        message: 'Tutorial deleted successfully',
        tutorial: deletedTutorial
      });
      
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({
        error: 'Method not allowed',
        message: `Method ${method} is not allowed`
      });
    }
    
  } catch (error) {
    console.error(`Error in tutorial [${req.query.id}] API:`, error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}