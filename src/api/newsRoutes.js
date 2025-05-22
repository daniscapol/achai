import express from 'express';
import db from '../utils/db.js';

const router = express.Router();

// Utility function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
};

// GET /api/news - Get all news articles with filtering, pagination, and search
router.get('/news', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      featured,
      breaking,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let baseQuery = `
      SELECT 
        id, title, slug, description, excerpt, featured_image_url, category, categories, tags,
        author_name, author_avatar_url, is_featured, is_breaking, view_count, like_count,
        share_count, reading_time, source_name, source_url, created_at, updated_at, published_at
      FROM news 
      WHERE is_published = TRUE
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM news WHERE is_published = TRUE';
    const queryParams = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      baseQuery += ` AND (
        title ILIKE $${paramCount} OR 
        description ILIKE $${paramCount} OR 
        content ILIKE $${paramCount} OR
        excerpt ILIKE $${paramCount} OR
        $${paramCount + 1} = ANY(tags)
      )`;
      countQuery += ` AND (
        title ILIKE $${paramCount} OR 
        description ILIKE $${paramCount} OR 
        content ILIKE $${paramCount} OR
        excerpt ILIKE $${paramCount} OR
        $${paramCount + 1} = ANY(tags)
      )`;
      queryParams.push(`%${search}%`, search);
      paramCount++;
    }

    // Add category filter
    if (category) {
      paramCount++;
      baseQuery += ` AND (category = $${paramCount} OR $${paramCount} = ANY(categories))`;
      countQuery += ` AND (category = $${paramCount} OR $${paramCount} = ANY(categories))`;
      queryParams.push(category);
    }

    // Add featured filter
    if (featured === 'true') {
      baseQuery += ' AND is_featured = TRUE';
      countQuery += ' AND is_featured = TRUE';
    }

    // Add breaking filter
    if (breaking === 'true') {
      baseQuery += ' AND is_breaking = TRUE';
      countQuery += ' AND is_breaking = TRUE';
    }

    // Add sorting
    const validSortFields = ['created_at', 'updated_at', 'published_at', 'title', 'view_count'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;
    
    // Add pagination
    baseQuery += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    // Execute queries
    const [newsResult, countResult] = await Promise.all([
      db.query(baseQuery, queryParams),
      db.query(countQuery, queryParams.slice(0, paramCount))
    ]);

    const totalNews = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalNews / parseInt(limit));

    res.json({
      news: newsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalNews,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news articles' });
  }
});

// GET /api/news/featured - Get featured news articles
router.get('/news/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const query = `
      SELECT 
        id, title, slug, description, excerpt, featured_image_url, category, 
        author_name, author_avatar_url, view_count, reading_time, created_at, published_at
      FROM news 
      WHERE is_published = TRUE AND is_featured = TRUE
      ORDER BY published_at DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured news:', error);
    res.status(500).json({ error: 'Failed to fetch featured news' });
  }
});

// GET /api/news/breaking - Get breaking news articles
router.get('/news/breaking', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const query = `
      SELECT 
        id, title, slug, description, excerpt, featured_image_url, category,
        author_name, author_avatar_url, view_count, reading_time, created_at, published_at
      FROM news 
      WHERE is_published = TRUE AND is_breaking = TRUE
      ORDER BY published_at DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching breaking news:', error);
    res.status(500).json({ error: 'Failed to fetch breaking news' });
  }
});

// GET /api/news/recent - Get recent news articles
router.get('/news/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const query = `
      SELECT 
        id, title, slug, description, excerpt, featured_image_url, category,
        author_name, author_avatar_url, view_count, reading_time, created_at, published_at
      FROM news 
      WHERE is_published = TRUE
      ORDER BY published_at DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent news:', error);
    res.status(500).json({ error: 'Failed to fetch recent news' });
  }
});

// GET /api/news/popular - Get popular news articles
router.get('/news/popular', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const query = `
      SELECT 
        id, title, slug, description, excerpt, featured_image_url, category,
        author_name, author_avatar_url, view_count, reading_time, created_at, published_at
      FROM news 
      WHERE is_published = TRUE
      ORDER BY view_count DESC, share_count DESC, like_count DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching popular news:', error);
    res.status(500).json({ error: 'Failed to fetch popular news' });
  }
});

// GET /api/news/categories - Get all news categories
router.get('/news/categories', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT category as name, COUNT(*) as count
      FROM news 
      WHERE is_published = TRUE
      GROUP BY category
      ORDER BY count DESC, category ASC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching news categories:', error);
    res.status(500).json({ error: 'Failed to fetch news categories' });
  }
});

// GET /api/news/:idOrSlug - Get news article by ID or slug
router.get('/news/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    
    // Check if it's a number (ID) or string (slug)
    const isId = /^\d+$/.test(idOrSlug);
    
    const query = `
      SELECT * FROM news 
      WHERE is_published = TRUE AND ${isId ? 'id = $1' : 'slug = $1'}
    `;
    
    const result = await db.query(query, [idOrSlug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News article not found' });
    }

    // Increment view count
    const updateViewQuery = `
      UPDATE news SET view_count = view_count + 1 
      WHERE ${isId ? 'id = $1' : 'slug = $1'}
    `;
    await db.query(updateViewQuery, [idOrSlug]);

    const newsArticle = result.rows[0];
    newsArticle.view_count += 1; // Update the returned object

    res.json(newsArticle);
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({ error: 'Failed to fetch news article' });
  }
});

// POST /api/news - Create new news article (Admin only)
router.post('/news', async (req, res) => {
  try {
    const {
      title, description, content, excerpt, featured_image_url, category, categories = [],
      tags = [], author_name, author_email, author_avatar_url, meta_title, meta_description,
      is_featured = false, is_published = true, is_breaking = false, reading_time,
      source_url, source_name, related_products = [], external_links = [], scheduled_publish_at
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const slug = generateSlug(title);

    // Check if slug already exists
    const existingSlug = await db.query('SELECT id FROM news WHERE slug = $1', [slug]);
    if (existingSlug.rows.length > 0) {
      return res.status(400).json({ error: 'A news article with this title already exists' });
    }

    const query = `
      INSERT INTO news (
        title, slug, description, content, excerpt, featured_image_url, category, categories,
        tags, author_name, author_email, author_avatar_url, meta_title, meta_description,
        is_featured, is_published, is_breaking, reading_time, source_url, source_name,
        related_products, external_links, scheduled_publish_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING *
    `;

    const values = [
      title, slug, description, content, excerpt, featured_image_url, category, categories,
      tags, author_name, author_email, author_avatar_url, meta_title, meta_description,
      is_featured, is_published, is_breaking, reading_time, source_url, source_name,
      related_products, JSON.stringify(external_links), scheduled_publish_at
    ];

    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating news article:', error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});

// PUT /api/news/:idOrSlug - Update news article (Admin only)
router.put('/news/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    
    // First check if news article exists
    const existingQuery = `
      SELECT id FROM news WHERE ${isId ? 'id = $1' : 'slug = $1'}
    `;
    const existing = await db.query(existingQuery, [idOrSlug]);
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'News article not found' });
    }

    const {
      title, description, content, excerpt, featured_image_url, category, categories,
      tags, author_name, author_email, author_avatar_url, meta_title, meta_description,
      is_featured, is_published, is_breaking, reading_time, source_url, source_name,
      related_products, external_links, scheduled_publish_at
    } = req.body;

    let slug = undefined;
    if (title) {
      slug = generateSlug(title);
      // Check if new slug conflicts with existing (except current article)
      const slugCheck = await db.query(
        `SELECT id FROM news WHERE slug = $1 AND ${isId ? 'id != $2' : 'slug != $2'}`,
        [slug, idOrSlug]
      );
      if (slugCheck.rows.length > 0) {
        return res.status(400).json({ error: 'A news article with this title already exists' });
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let valueIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${valueIndex++}`);
      values.push(title);
      updateFields.push(`slug = $${valueIndex++}`);
      values.push(slug);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${valueIndex++}`);
      values.push(description);
    }
    if (content !== undefined) {
      updateFields.push(`content = $${valueIndex++}`);
      values.push(content);
    }
    if (excerpt !== undefined) {
      updateFields.push(`excerpt = $${valueIndex++}`);
      values.push(excerpt);
    }
    if (featured_image_url !== undefined) {
      updateFields.push(`featured_image_url = $${valueIndex++}`);
      values.push(featured_image_url);
    }
    if (category !== undefined) {
      updateFields.push(`category = $${valueIndex++}`);
      values.push(category);
    }
    if (categories !== undefined) {
      updateFields.push(`categories = $${valueIndex++}`);
      values.push(categories);
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${valueIndex++}`);
      values.push(tags);
    }
    if (author_name !== undefined) {
      updateFields.push(`author_name = $${valueIndex++}`);
      values.push(author_name);
    }
    if (author_email !== undefined) {
      updateFields.push(`author_email = $${valueIndex++}`);
      values.push(author_email);
    }
    if (author_avatar_url !== undefined) {
      updateFields.push(`author_avatar_url = $${valueIndex++}`);
      values.push(author_avatar_url);
    }
    if (meta_title !== undefined) {
      updateFields.push(`meta_title = $${valueIndex++}`);
      values.push(meta_title);
    }
    if (meta_description !== undefined) {
      updateFields.push(`meta_description = $${valueIndex++}`);
      values.push(meta_description);
    }
    if (is_featured !== undefined) {
      updateFields.push(`is_featured = $${valueIndex++}`);
      values.push(is_featured);
    }
    if (is_published !== undefined) {
      updateFields.push(`is_published = $${valueIndex++}`);
      values.push(is_published);
    }
    if (is_breaking !== undefined) {
      updateFields.push(`is_breaking = $${valueIndex++}`);
      values.push(is_breaking);
    }
    if (reading_time !== undefined) {
      updateFields.push(`reading_time = $${valueIndex++}`);
      values.push(reading_time);
    }
    if (source_url !== undefined) {
      updateFields.push(`source_url = $${valueIndex++}`);
      values.push(source_url);
    }
    if (source_name !== undefined) {
      updateFields.push(`source_name = $${valueIndex++}`);
      values.push(source_name);
    }
    if (related_products !== undefined) {
      updateFields.push(`related_products = $${valueIndex++}`);
      values.push(related_products);
    }
    if (external_links !== undefined) {
      updateFields.push(`external_links = $${valueIndex++}`);
      values.push(JSON.stringify(external_links));
    }
    if (scheduled_publish_at !== undefined) {
      updateFields.push(`scheduled_publish_at = $${valueIndex++}`);
      values.push(scheduled_publish_at);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE news 
      SET ${updateFields.join(', ')}
      WHERE ${isId ? 'id = $' + valueIndex : 'slug = $' + valueIndex}
      RETURNING *
    `;
    values.push(idOrSlug);

    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

// DELETE /api/news/:idOrSlug - Delete news article (Admin only)
router.delete('/news/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    
    const query = `
      DELETE FROM news 
      WHERE ${isId ? 'id = $1' : 'slug = $1'}
      RETURNING id, title
    `;
    
    const result = await db.query(query, [idOrSlug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json({ 
      message: 'News article deleted successfully',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting news article:', error);
    res.status(500).json({ error: 'Failed to delete news article' });
  }
});

export default router; 