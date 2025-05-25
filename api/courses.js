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
      const { 
        page = 1, 
        limit = 20, 
        search, 
        category, 
        difficulty, 
        popular, 
        featured,
        slug,
        status = 'published',
        sort = 'newest'
      } = req.query;
      
      try {
        // Get single course by slug
        if (slug) {
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
        }
        
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let whereClause = 'WHERE status = $1';
        let queryParams = [status, parseInt(limit), offset];
        let paramCount = 1;
        
        // Search courses
        if (search) {
          const searchPattern = `%${search}%`;
          whereClause += ` AND (title ILIKE $${++paramCount} OR description ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
          queryParams.splice(-2, 0, searchPattern);
        }
        
        // Filter by category
        if (category) {
          whereClause += ` AND category_slug = $${++paramCount}`;
          queryParams.splice(-2, 0, category);
        }
        
        // Filter by difficulty
        if (difficulty) {
          whereClause += ` AND difficulty_level = $${++paramCount}`;
          queryParams.splice(-2, 0, difficulty);
        }
        
        // Get total count
        const countResult = await query(
          `SELECT COUNT(*) FROM courses c LEFT JOIN course_categories cc ON c.category_id = cc.id ${whereClause.replace('status =', 'c.status =').replace('category_slug =', 'cc.slug =').replace('difficulty_level =', 'c.difficulty_level =')}`,
          queryParams.slice(0, -2)
        );
        const total = parseInt(countResult.rows[0].count);
        
        // Determine sort order
        let orderBy = 'ORDER BY created_at DESC';
        if (sort === 'popular') {
          orderBy = 'ORDER BY enrollment_count DESC, rating DESC';
        } else if (sort === 'rating') {
          orderBy = 'ORDER BY rating DESC, rating_count DESC';
        } else if (sort === 'price_low') {
          orderBy = 'ORDER BY CAST(price AS DECIMAL) ASC';
        } else if (sort === 'price_high') {
          orderBy = 'ORDER BY CAST(price AS DECIMAL) DESC';
        }
        
        // Get courses
        const coursesResult = await query(`
          SELECT 
            c.id, c.title, c.slug, c.description, c.content, c.thumbnail as thumbnail_url,
            c.instructor_name, c.instructor_bio, c.price, c.currency,
            c.duration_hours, c.difficulty_level as difficulty, c.status,
            c.enrollment_count, c.rating, c.rating_count,
            c.created_at, c.updated_at, cc.name as category_name, cc.slug as category_slug
          FROM courses c
          LEFT JOIN course_categories cc ON c.category_id = cc.id
          ${whereClause.replace('status =', 'c.status =').replace('category_slug =', 'cc.slug =').replace('difficulty_level =', 'c.difficulty_level =')}
          ${orderBy.replace('created_at', 'c.created_at').replace('enrollment_count', 'c.enrollment_count').replace('rating', 'c.rating')}
          LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
        `, queryParams);
        
        const totalPages = Math.ceil(total / parseInt(limit));
        
        return res.status(200).json({
          success: true,
          data: coursesResult.rows,
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
    console.error('Courses API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}