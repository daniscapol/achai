import { News } from '../src/utils/News.js';

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
      return res.status(200).end();
    }

    switch (method) {
      case 'GET':
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

      case 'POST':
        // Create new article (admin only)
        const articleData = req.body;
        
        // Basic validation
        if (!articleData.title || !articleData.content || !articleData.author_id) {
          return res.status(400).json({ 
            error: 'Missing required fields: title, content, author_id' 
          });
        }
        
        const newArticle = await News.create(articleData);
        return res.status(201).json({ article: newArticle });

      case 'PUT':
        // Update article (admin only)
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ error: 'Article ID is required' });
        }
        
        const updateData = req.body;
        const updatedArticle = await News.update(parseInt(id), updateData);
        
        if (!updatedArticle) {
          return res.status(404).json({ error: 'Article not found' });
        }
        
        return res.status(200).json({ article: updatedArticle });

      case 'DELETE':
        // Delete article (admin only)
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Article ID is required' });
        }
        
        const deletedArticle = await News.delete(parseInt(deleteId));
        
        if (!deletedArticle) {
          return res.status(404).json({ error: 'Article not found' });
        }
        
        return res.status(200).json({ 
          message: 'Article archived successfully',
          id: deletedArticle.id 
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }

  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}