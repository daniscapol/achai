import db from './db.js';
const { query } = db;

export class News {
  static async getAll(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM news_articles WHERE is_published = true'
      );
      const total = parseInt(countResult.rows[0].count);
      
      // Get articles
      const articlesResult = await query(`
        SELECT 
          n.*,
          n.author as author_name,
          n.summary as excerpt
        FROM news_articles n
        WHERE n.is_published = true
        ORDER BY n.published_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        articles: articlesResult.rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error in News.getAll:', error);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const result = await query(`
        SELECT 
          n.*,
          n.author as author_name,
          n.summary as excerpt
        FROM news_articles n
        WHERE n.id = $1 AND n.is_published = true
      `, [id]);
      
      // Increment view count
      if (result.rows[0]) {
        await query(
          'UPDATE news_articles SET views_count = views_count + 1 WHERE id = $1',
          [id]
        );
      }
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in News.getById:', error);
      throw error;
    }
  }
  
  static async getBySlug(slug) {
    try {
      const result = await query(`
        SELECT 
          n.*,
          a.name as author_name,
          a.email as author_email,
          a.bio as author_bio,
          a.avatar_url as author_avatar,
          c.name as category_name,
          c.slug as category_slug,
          array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
          array_agg(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL) as tag_ids
        FROM news_articles n
        LEFT JOIN authors a ON n.author_id = a.id
        LEFT JOIN news_categories c ON n.category_id = c.id
        LEFT JOIN news_article_tags nat ON n.id = nat.article_id
        LEFT JOIN tags t ON nat.tag_id = t.id
        WHERE n.slug = $1
        GROUP BY n.id, a.name, a.email, a.bio, a.avatar_url, c.name, c.slug
      `, [slug]);
      
      // Increment view count
      if (result.rows[0]) {
        await query(
          'UPDATE news_articles SET view_count = view_count + 1 WHERE id = $1',
          [result.rows[0].id]
        );
      }
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in News.getBySlug:', error);
      throw error;
    }
  }
  
  static async getByCategory(categorySlug, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count for this category
      const countResult = await query(`
        SELECT COUNT(*) FROM news_articles n
        JOIN news_categories c ON n.category_id = c.id
        WHERE c.slug = $1 AND n.status = $2
      `, [categorySlug, 'published']);
      
      const total = parseInt(countResult.rows[0].count);
      
      // Get articles
      const articlesResult = await query(`
        SELECT 
          n.*,
          a.name as author_name,
          a.avatar_url as author_avatar,
          c.name as category_name,
          c.slug as category_slug
        FROM news_articles n
        LEFT JOIN authors a ON n.author_id = a.id
        LEFT JOIN news_categories c ON n.category_id = c.id
        WHERE c.slug = $1 AND n.status = $2
        ORDER BY n.published_at DESC
        LIMIT $3 OFFSET $4
      `, [categorySlug, 'published', limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        articles: articlesResult.rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error in News.getByCategory:', error);
      throw error;
    }
  }
  
  static async create(articleData) {
    try {
      const {
        title,
        slug,
        content,
        excerpt,
        featured_image,
        author_id,
        category_id,
        tags = [],
        status = 'draft',
        published_at,
        meta_title,
        meta_description,
        meta_keywords
      } = articleData;
      
      // Validate required fields
      if (!title) throw new Error('Title is required');
      if (!content) throw new Error('Content is required');
      if (!author_id) throw new Error('Author is required');
      
      // Generate slug if not provided
      const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Start transaction
      await query('BEGIN');
      
      try {
        // Insert article
        const result = await query(`
          INSERT INTO news_articles (
            title, slug, content, excerpt, featured_image, 
            author_id, category_id, status, published_at,
            meta_title, meta_description, meta_keywords,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
          ) RETURNING *
        `, [
          title, finalSlug, content, excerpt, featured_image,
          author_id, category_id, status, published_at,
          meta_title, meta_description, meta_keywords
        ]);
        
        const article = result.rows[0];
        
        // Handle tags
        if (tags.length > 0) {
          for (const tagName of tags) {
            // Insert tag if doesn't exist
            const tagResult = await query(`
              INSERT INTO tags (name, slug)
              VALUES ($1, $2)
              ON CONFLICT (name) DO UPDATE SET usage_count = tags.usage_count + 1
              RETURNING id
            `, [tagName, tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')]);
            
            const tagId = tagResult.rows[0].id;
            
            // Create article-tag relationship
            await query(`
              INSERT INTO news_article_tags (article_id, tag_id)
              VALUES ($1, $2)
            `, [article.id, tagId]);
          }
        }
        
        await query('COMMIT');
        return article;
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error in News.create:', error);
      throw error;
    }
  }
  
  static async update(id, articleData) {
    try {
      const {
        title,
        slug,
        content,
        excerpt,
        featured_image,
        author_id,
        category_id,
        tags,
        status,
        published_at,
        meta_title,
        meta_description,
        meta_keywords
      } = articleData;
      
      // Build update query
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      const addField = (field, value) => {
        if (value !== undefined) {
          updates.push(`${field} = $${paramCount++}`);
          values.push(value);
        }
      };
      
      addField('title', title);
      addField('slug', slug);
      addField('content', content);
      addField('excerpt', excerpt);
      addField('featured_image', featured_image);
      addField('author_id', author_id);
      addField('category_id', category_id);
      addField('status', status);
      addField('published_at', published_at);
      addField('meta_title', meta_title);
      addField('meta_description', meta_description);
      addField('meta_keywords', meta_keywords);
      
      updates.push('updated_at = NOW()');
      values.push(id);
      
      await query('BEGIN');
      
      try {
        // Update article
        const result = await query(`
          UPDATE news_articles 
          SET ${updates.join(', ')}
          WHERE id = $${paramCount}
          RETURNING *
        `, values);
        
        const article = result.rows[0];
        
        // Update tags if provided
        if (tags !== undefined) {
          // Remove existing tags
          await query('DELETE FROM news_article_tags WHERE article_id = $1', [id]);
          
          // Add new tags
          for (const tagName of tags) {
            const tagResult = await query(`
              INSERT INTO tags (name, slug)
              VALUES ($1, $2)
              ON CONFLICT (name) DO UPDATE SET usage_count = tags.usage_count + 1
              RETURNING id
            `, [tagName, tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')]);
            
            const tagId = tagResult.rows[0].id;
            
            await query(`
              INSERT INTO news_article_tags (article_id, tag_id)
              VALUES ($1, $2)
            `, [id, tagId]);
          }
        }
        
        await query('COMMIT');
        return article;
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error in News.update:', error);
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const result = await query(`
        UPDATE news_articles 
        SET status = 'archived', updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in News.delete:', error);
      throw error;
    }
  }
  
  static async search(searchTerm, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      
      // Get total count
      const countResult = await query(`
        SELECT COUNT(*) FROM news_articles
        WHERE status = 'published' AND (
          LOWER(title) LIKE $1 OR
          LOWER(content) LIKE $1 OR
          LOWER(excerpt) LIKE $1
        )
      `, [searchPattern]);
      
      const total = parseInt(countResult.rows[0].count);
      
      // Get search results
      const articlesResult = await query(`
        SELECT 
          n.*,
          a.name as author_name,
          a.avatar_url as author_avatar,
          c.name as category_name,
          c.slug as category_slug
        FROM news_articles n
        LEFT JOIN authors a ON n.author_id = a.id
        LEFT JOIN news_categories c ON n.category_id = c.id
        WHERE n.status = 'published' AND (
          LOWER(n.title) LIKE $1 OR
          LOWER(n.content) LIKE $1 OR
          LOWER(n.excerpt) LIKE $1
        )
        ORDER BY 
          CASE WHEN LOWER(n.title) LIKE $1 THEN 1 ELSE 2 END,
          n.published_at DESC
        LIMIT $2 OFFSET $3
      `, [searchPattern, limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        articles: articlesResult.rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        searchTerm
      };
    } catch (error) {
      console.error('Error in News.search:', error);
      throw error;
    }
  }
  
  // Get all categories
  static async getCategories() {
    try {
      const result = await query(`
        SELECT c.*, COUNT(n.id) as article_count
        FROM news_categories c
        LEFT JOIN news_articles n ON c.id = n.category_id AND n.status = 'published'
        GROUP BY c.id
        ORDER BY c.name
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error in News.getCategories:', error);
      throw error;
    }
  }
  
  // Get popular articles
  static async getPopular(limit = 5) {
    try {
      const result = await query(`
        SELECT 
          n.*,
          a.name as author_name,
          a.avatar_url as author_avatar,
          c.name as category_name,
          c.slug as category_slug
        FROM news_articles n
        LEFT JOIN authors a ON n.author_id = a.id
        LEFT JOIN news_categories c ON n.category_id = c.id
        WHERE n.status = 'published'
        ORDER BY n.view_count DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in News.getPopular:', error);
      throw error;
    }
  }
  
  // Get related articles
  static async getRelated(articleId, limit = 3) {
    try {
      const result = await query(`
        WITH article_tags AS (
          SELECT tag_id FROM news_article_tags WHERE article_id = $1
        )
        SELECT DISTINCT
          n.*,
          a.name as author_name,
          a.avatar_url as author_avatar,
          c.name as category_name,
          c.slug as category_slug,
          COUNT(nat.tag_id) as common_tags
        FROM news_articles n
        LEFT JOIN authors a ON n.author_id = a.id
        LEFT JOIN news_categories c ON n.category_id = c.id
        JOIN news_article_tags nat ON n.id = nat.article_id
        WHERE n.id != $1 
          AND n.status = 'published'
          AND nat.tag_id IN (SELECT tag_id FROM article_tags)
        GROUP BY n.id, a.name, a.avatar_url, c.name, c.slug
        ORDER BY common_tags DESC, n.published_at DESC
        LIMIT $2
      `, [articleId, limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in News.getRelated:', error);
      throw error;
    }
  }
}

export default News;