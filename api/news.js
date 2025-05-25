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
            'UPDATE news_articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1',
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

    if (method === 'POST') {
      try {
        const {
          title,
          slug,
          content,
          excerpt,
          author,
          category,
          is_published = false
        } = req.body;

        // Basic validation
        if (!title || !content || !author || !category) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: title, content, author, category'
          });
        }

        // Generate slug if not provided
        const articleSlug = slug || title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Get or create author
        let authorId = null;
        const authorResult = await query(
          'SELECT id FROM authors WHERE name = $1',
          [author]
        );
        if (authorResult.rows.length > 0) {
          authorId = authorResult.rows[0].id;
        } else {
          // Create new author
          const newAuthorResult = await query(
            'INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING id',
            [author, `${author.toLowerCase().replace(/\s+/g, '.')}@achai.co`, `Author: ${author}`]
          );
          authorId = newAuthorResult.rows[0].id;
        }

        // Get category ID by name
        let categoryId = null;
        const categoryResult = await query(
          'SELECT id FROM news_categories WHERE name = $1',
          [category]
        );
        categoryId = categoryResult.rows[0]?.id || null;

        // Insert new article
        const result = await query(`
          INSERT INTO news_articles (
            title, slug, content, excerpt, author_id, category_id,
            status, published_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `, [
          title, articleSlug, content, excerpt, authorId, categoryId,
          is_published ? 'published' : 'draft',
          is_published ? new Date() : null
        ]);

        if (result.rows[0]) {
          return res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Article created successfully'
          });
        } else {
          return res.status(500).json({
            success: false,
            error: 'Failed to create article'
          });
        }

      } catch (dbError) {
        console.error('Database Error creating article:', dbError);
        
        // Handle unique constraint violation (duplicate slug)
        if (dbError.code === '23505') {
          return res.status(400).json({
            success: false,
            error: 'Article with this title/slug already exists'
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
    console.error('News API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}