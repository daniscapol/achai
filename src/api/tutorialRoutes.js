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

// GET /api/tutorials - Get all tutorials with filtering, pagination, and search
router.get('/tutorials', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      difficulty,
      featured,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let baseQuery = `
      SELECT 
        id, title, slug, description, featured_image_url, category, categories, tags,
        difficulty_level, estimated_reading_time, author_name, author_avatar_url,
        is_featured, view_count, like_count, rating_average, rating_count,
        created_at, updated_at, published_at
      FROM tutorials 
      WHERE is_published = TRUE
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM tutorials WHERE is_published = TRUE';
    const queryParams = [];
    let paramCount = 0;

    // Add search filter
    if (search) {
      paramCount++;
      baseQuery += ` AND (
        title ILIKE $${paramCount} OR 
        description ILIKE $${paramCount} OR 
        content ILIKE $${paramCount} OR
        $${paramCount + 1} = ANY(tags)
      )`;
      countQuery += ` AND (
        title ILIKE $${paramCount} OR 
        description ILIKE $${paramCount} OR 
        content ILIKE $${paramCount} OR
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

    // Add difficulty filter
    if (difficulty) {
      paramCount++;
      baseQuery += ` AND difficulty_level = $${paramCount}`;
      countQuery += ` AND difficulty_level = $${paramCount}`;
      queryParams.push(difficulty);
    }

    // Add featured filter
    if (featured === 'true') {
      baseQuery += ' AND is_featured = TRUE';
      countQuery += ' AND is_featured = TRUE';
    }

    // Add sorting
    const validSortFields = ['created_at', 'updated_at', 'title', 'view_count', 'rating_average'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;
    
    // Add pagination
    baseQuery += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    // Execute queries
    const [tutorialsResult, countResult] = await Promise.all([
      db.query(baseQuery, queryParams),
      db.query(countQuery, queryParams.slice(0, paramCount))
    ]);

    const totalTutorials = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTutorials / parseInt(limit));

    res.json({
      tutorials: tutorialsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTutorials,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch tutorials' });
  }
});

// GET /api/tutorials/featured - Get featured tutorials
router.get('/tutorials/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const query = `
      SELECT 
        id, title, slug, description, featured_image_url, category, 
        difficulty_level, estimated_reading_time, author_name, author_avatar_url,
        view_count, rating_average, created_at
      FROM tutorials 
      WHERE is_published = TRUE AND is_featured = TRUE
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch featured tutorials' });
  }
});

// GET /api/tutorials/recent - Get recent tutorials
router.get('/tutorials/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const query = `
      SELECT 
        id, title, slug, description, featured_image_url, category,
        difficulty_level, estimated_reading_time, author_name, author_avatar_url,
        view_count, rating_average, created_at
      FROM tutorials 
      WHERE is_published = TRUE
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch recent tutorials' });
  }
});

// GET /api/tutorials/popular - Get popular tutorials
router.get('/tutorials/popular', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const query = `
      SELECT 
        id, title, slug, description, featured_image_url, category,
        difficulty_level, estimated_reading_time, author_name, author_avatar_url,
        view_count, rating_average, created_at
      FROM tutorials 
      WHERE is_published = TRUE
      ORDER BY view_count DESC, rating_average DESC
      LIMIT $1
    `;
    
    const result = await db.query(query, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching popular tutorials:', error);
    res.status(500).json({ error: 'Failed to fetch popular tutorials' });
  }
});

// GET /api/tutorials/categories - Get all tutorial categories
router.get('/tutorials/categories', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT category as name, COUNT(*) as count
      FROM tutorials 
      WHERE is_published = TRUE
      GROUP BY category
      ORDER BY count DESC, category ASC
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tutorial categories:', error);
    res.status(500).json({ error: 'Failed to fetch tutorial categories' });
  }
});

// GET /api/tutorials/:idOrSlug - Get tutorial by ID or slug
router.get('/tutorials/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    
    // Check if it's a number (ID) or string (slug)
    const isId = /^\d+$/.test(idOrSlug);
    
    const query = `
      SELECT * FROM tutorials 
      WHERE is_published = TRUE AND ${isId ? 'id = $1' : 'slug = $1'}
    `;
    
    const result = await db.query(query, [idOrSlug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    // Increment view count
    const updateViewQuery = `
      UPDATE tutorials SET view_count = view_count + 1 
      WHERE ${isId ? 'id = $1' : 'slug = $1'}
    `;
    await db.query(updateViewQuery, [idOrSlug]);

    const tutorial = result.rows[0];
    tutorial.view_count += 1; // Update the returned object

    res.json(tutorial);
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    res.status(500).json({ error: 'Failed to fetch tutorial' });
  }
});

// POST /api/tutorials - Create new tutorial (open for setup)
router.post('/tutorials', async (req, res) => {
  try {
    const {
      title, description, content, featured_image_url, category, categories = [],
      tags = [], difficulty_level = 'Beginner', estimated_reading_time,
      author_name, author_email, author_avatar_url, meta_title, meta_description,
      is_featured = false, is_published = true, sections = [], prerequisites = [],
      learning_outcomes = [], resources = []
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const slug = generateSlug(title);

    // Check if slug already exists
    const existingSlug = await db.query('SELECT id FROM tutorials WHERE slug = $1', [slug]);
    if (existingSlug.rows.length > 0) {
      return res.status(400).json({ error: 'A tutorial with this title already exists' });
    }

    const query = `
      INSERT INTO tutorials (
        title, slug, description, content, featured_image_url, category, categories,
        tags, difficulty_level, estimated_reading_time, author_name, author_email,
        author_avatar_url, meta_title, meta_description, is_featured, is_published,
        sections, prerequisites, learning_outcomes, resources
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING *
    `;

    const values = [
      title, slug, description, content, featured_image_url, category, categories,
      tags, difficulty_level, estimated_reading_time, author_name, author_email,
      author_avatar_url, meta_title, meta_description, is_featured, is_published,
      JSON.stringify(sections), prerequisites, learning_outcomes, JSON.stringify(resources)
    ];

    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tutorial:', error);
    res.status(500).json({ error: 'Failed to create tutorial' });
  }
});

// PUT /api/tutorials/:idOrSlug - Update tutorial (Admin only)
router.put('/tutorials/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    
    // First check if tutorial exists
    const existingQuery = `
      SELECT id FROM tutorials WHERE ${isId ? 'id = $1' : 'slug = $1'}
    `;
    const existing = await db.query(existingQuery, [idOrSlug]);
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    const {
      title, description, content, featured_image_url, category, categories,
      tags, difficulty_level, estimated_reading_time, author_name, author_email,
      author_avatar_url, meta_title, meta_description, is_featured, is_published,
      sections, prerequisites, learning_outcomes, resources
    } = req.body;

    let slug = undefined;
    if (title) {
      slug = generateSlug(title);
      // Check if new slug conflicts with existing (except current tutorial)
      const slugCheck = await db.query(
        `SELECT id FROM tutorials WHERE slug = $1 AND ${isId ? 'id != $2' : 'slug != $2'}`,
        [slug, idOrSlug]
      );
      if (slugCheck.rows.length > 0) {
        return res.status(400).json({ error: 'A tutorial with this title already exists' });
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
    if (difficulty_level !== undefined) {
      updateFields.push(`difficulty_level = $${valueIndex++}`);
      values.push(difficulty_level);
    }
    if (estimated_reading_time !== undefined) {
      updateFields.push(`estimated_reading_time = $${valueIndex++}`);
      values.push(estimated_reading_time);
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
    if (sections !== undefined) {
      updateFields.push(`sections = $${valueIndex++}`);
      values.push(JSON.stringify(sections));
    }
    if (prerequisites !== undefined) {
      updateFields.push(`prerequisites = $${valueIndex++}`);
      values.push(prerequisites);
    }
    if (learning_outcomes !== undefined) {
      updateFields.push(`learning_outcomes = $${valueIndex++}`);
      values.push(learning_outcomes);
    }
    if (resources !== undefined) {
      updateFields.push(`resources = $${valueIndex++}`);
      values.push(JSON.stringify(resources));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE tutorials 
      SET ${updateFields.join(', ')}
      WHERE ${isId ? 'id = $' + valueIndex : 'slug = $' + valueIndex}
      RETURNING *
    `;
    values.push(idOrSlug);

    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tutorial:', error);
    res.status(500).json({ error: 'Failed to update tutorial' });
  }
});

// DELETE /api/tutorials/:idOrSlug - Delete tutorial (Admin only)
router.delete('/tutorials/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);
    
    const query = `
      DELETE FROM tutorials 
      WHERE ${isId ? 'id = $1' : 'slug = $1'}
      RETURNING id, title
    `;
    
    const result = await db.query(query, [idOrSlug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }

    res.json({ 
      message: 'Tutorial deleted successfully',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    res.status(500).json({ error: 'Failed to delete tutorial' });
  }
});

export default router; 