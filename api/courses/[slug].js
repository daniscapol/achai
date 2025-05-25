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
            c.id, c.title, c.slug, c.description, c.content, c.thumbnail as thumbnail_url,
            c.instructor_name, c.instructor_bio, c.price, c.currency,
            c.duration_hours, c.difficulty_level as difficulty, c.status,
            c.enrollment_count, c.rating, c.rating_count,
            c.created_at, c.updated_at, cc.name as category_name, cc.slug as category_slug
          FROM courses c
          LEFT JOIN course_categories cc ON c.category_id = cc.id
          WHERE c.slug = $1 AND c.status = 'published'
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