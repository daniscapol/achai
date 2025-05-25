import { query } from '../_lib/db.js';

export default async function handler(req, res) {
  try {
    const { method } = req;
    const { slug } = req.query;
    
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (method === 'GET') {
      try {
        // Get single article by slug
        const result = await query(`
          SELECT 
            id, title, slug, content, summary as excerpt, 
            author, category, published_at, updated_at, views_count
          FROM news_articles 
          WHERE slug = $1 AND is_published = true
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

      } catch (dbError) {
        console.error('Database Error:', dbError);
        return res.status(500).json({ 
          success: false,
          error: 'Database connection failed',
          message: dbError.message 
        });
      }
    }

    return res.status(405).json({ 
      success: false,
      error: `Method ${method} not allowed` 
    });

  } catch (error) {
    console.error('News Article API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}