import NewsArticle from '../../src/models/NewsArticle.js';

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
      // Get specific news article by ID or slug
      const article = await NewsArticle.getByIdOrSlug(id);
      
      if (!article) {
        return res.status(404).json({
          error: 'News article not found',
          message: `News article with ID/slug "${id}" was not found`
        });
      }
      
      return res.status(200).json(article);
      
    } else if (method === 'PUT') {
      // Update an existing news article (admin only)
      if (!req.headers.authorization || req.headers.authorization !== 'Bearer admin-token') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You are not authorized to update news articles'
        });
      }
      
      const updatedArticle = await NewsArticle.update(id, req.body);
      if (!updatedArticle) {
        return res.status(404).json({
          error: 'News article not found',
          message: `News article with ID/slug "${id}" was not found`
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
      
      const deletedArticle = await NewsArticle.delete(id);
      if (!deletedArticle) {
        return res.status(404).json({
          error: 'News article not found',
          message: `News article with ID/slug "${id}" was not found`
        });
      }
      
      return res.status(200).json({
        message: 'News article deleted successfully',
        article: deletedArticle
      });
      
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({
        error: 'Method not allowed',
        message: `Method ${method} is not allowed`
      });
    }
    
  } catch (error) {
    console.error(`Error in news article [${req.query.id}] API:`, error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}