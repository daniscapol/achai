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
        // Get single course by slug
        const result = await query(`
          SELECT 
            id, title, slug, description, content, thumbnail_url,
            instructor_name, instructor_bio, price, currency,
            duration_hours, difficulty_level as difficulty, status,
            enrollment_count, rating, rating_count,
            created_at, updated_at, category_name, category_slug
          FROM courses 
          WHERE slug = $1 AND status = 'published'
        `, [slug]);
        
        if (!result.rows[0]) {
          return res.status(404).json({ 
            success: false,
            error: 'Course not found' 
          });
        }
        
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
    console.error('Course Detail API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}