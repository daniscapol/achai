import { query } from './_lib/db.js';

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

    if (method === 'GET') {
      const { page = 1, limit = 20, search, category, popular, slug } = req.query;
      
      try {
        // Get single article by slug
        if (slug) {
          const result = await query(`
            SELECT 
              id, title, slug, content, excerpt, 
              author_id, category_id, published_at, updated_at, view_count as views_count
            FROM news_articles 
            WHERE slug = $1 AND status = 'published'
          `, [slug]);
          
          if (!result.rows[0]) {
            return res.status(404).json({ 
              success: false,
              error: 'Article not found' 
            });
          }
          
          // Increment view count
          await query(
            'UPDATE news_articles SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1',
            [result.rows[0].id]
          );
          
          return res.status(200).json({ 
            success: true,
            data: result.rows[0] 
          });
        }
        
        // Get popular articles
        if (popular) {
          const result = await query(`
            SELECT 
              id, title, slug, content, excerpt, 
              author_id, category_id, published_at, updated_at, view_count as views_count
            FROM news_articles 
            WHERE status = 'published'
            ORDER BY view_count DESC, published_at DESC
            LIMIT $1
          `, [parseInt(limit)]);
          
          return res.status(200).json({ 
            success: true,
            data: result.rows 
          });
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = 'WHERE status = \'published\'';
        let queryParams = [parseInt(limit), offset];
        let paramCount = 2;
        
        // Search articles
        if (search) {
          const searchPattern = `%${search}%`;
          whereClause += ` AND (title ILIKE $${++paramCount} OR content ILIKE $${paramCount} OR summary ILIKE $${paramCount})`;
          queryParams.splice(-2, 0, searchPattern);
        }
        
        // Filter by category
        if (category) {
          whereClause += ` AND category = $${++paramCount}`;
          queryParams.splice(-2, 0, category);
        }
        
        // Get total count
        const countResult = await query(
          `SELECT COUNT(*) FROM news_articles ${whereClause.replace('is_published', 'status')}`,
          queryParams.slice(0, -2)
        );
        const total = parseInt(countResult.rows[0].count);
        
        // Get articles
        const articlesResult = await query(`
          SELECT 
            id, title, slug, content, excerpt, 
            author_id, category_id, published_at, updated_at, view_count as views_count
          FROM news_articles 
          ${whereClause.replace('is_published', 'status')}
          ORDER BY published_at DESC
          LIMIT $1 OFFSET $2
        `, queryParams);
        
        const totalPages = Math.ceil(total / parseInt(limit));
        
        return res.status(200).json({
          success: true,
          data: articlesResult.rows,
          pagination: {
            total,
            totalPages,
            currentPage: parseInt(page),
            limit: parseInt(limit),
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        });

      } catch (dbError) {
        console.error('Database Error:', dbError);
        return res.status(500).json({ 
          success: false,
          error: 'Database connection failed',
          message: dbError.message 
        });
      }
    }

    // Handle other methods
    return res.status(405).json({ 
      success: false,
      error: `Method ${method} not allowed` 
    });

  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}