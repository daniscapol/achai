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

    if (method === 'POST') {
      try {
        const {
          title,
          slug,
          description,
          content,
          instructor_name,
          instructor_bio,
          price = 0,
          currency = 'USD',
          duration_hours,
          difficulty_level = 'beginner',
          category,
          status = 'published'
        } = req.body;

        // Basic validation
        if (!title || !description || !content || !instructor_name) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: title, description, content, instructor_name'
          });
        }

        // Generate slug if not provided
        const courseSlug = slug || title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Get category ID by name
        let categoryId = null;
        if (category) {
          const categoryResult = await query(
            'SELECT id FROM course_categories WHERE name = $1',
            [category]
          );
          categoryId = categoryResult.rows[0]?.id || null;
        }

        // Insert new course
        const result = await query(`
          INSERT INTO courses (
            title, slug, description, content, instructor_name, instructor_bio,
            price, currency, duration_hours, difficulty_level, category_id,
            status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
          RETURNING *
        `, [
          title, courseSlug, description, content, instructor_name, instructor_bio,
          parseFloat(price), currency, parseFloat(duration_hours) || null,
          difficulty_level, categoryId, status
        ]);

        if (result.rows[0]) {
          return res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Course created successfully'
          });
        } else {
          return res.status(500).json({
            success: false,
            error: 'Failed to create course'
          });
        }

      } catch (dbError) {
        console.error('Database Error creating course:', dbError);
        
        // Handle unique constraint violation (duplicate slug)
        if (dbError.code === '23505') {
          return res.status(400).json({
            success: false,
            error: 'Course with this title/slug already exists'
          });
        }

        return res.status(500).json({
          success: false,
          error: 'Database error',
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