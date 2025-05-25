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
          id, title, slug, content, summary as excerpt, 
          author, category, published_at, updated_at, views_count
        FROM news_articles 
        WHERE is_published = true
        ORDER BY published_at DESC
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
          id, title, slug, content, summary as excerpt, 
          author, category, published_at, updated_at, views_count
        FROM news_articles 
        WHERE id = $1 AND is_published = true
      `, [id]);
      
      // Increment view count
      if (result.rows[0]) {
        await query(
          'UPDATE news_articles SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1',
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
          id, title, slug, content, summary as excerpt, 
          author, category, published_at, updated_at, views_count
        FROM news_articles 
        WHERE slug = $1 AND is_published = true
      `, [slug]);
      
      // Increment view count
      if (result.rows[0]) {
        await query(
          'UPDATE news_articles SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1',
          [result.rows[0].id]
        );
      }
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in News.getBySlug:', error);
      throw error;
    }
  }
  
  static async getByCategory(categoryName, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count for this category
      const countResult = await query(
        'SELECT COUNT(*) FROM news_articles WHERE category = $1 AND is_published = true',
        [categoryName]
      );
      const total = parseInt(countResult.rows[0].count);
      
      // Get articles for this category
      const articlesResult = await query(`
        SELECT 
          id, title, slug, content, summary as excerpt, 
          author, category, published_at, updated_at, views_count
        FROM news_articles 
        WHERE category = $1 AND is_published = true
        ORDER BY published_at DESC
        LIMIT $2 OFFSET $3
      `, [categoryName, limit, offset]);
      
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
  
  static async search(searchTerm, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${searchTerm}%`;
      
      // Get total count for search
      const countResult = await query(`
        SELECT COUNT(*) FROM news_articles 
        WHERE (title ILIKE $1 OR content ILIKE $1 OR summary ILIKE $1) 
        AND is_published = true
      `, [searchPattern]);
      const total = parseInt(countResult.rows[0].count);
      
      // Get search results
      const articlesResult = await query(`
        SELECT 
          id, title, slug, content, summary as excerpt, 
          author, category, published_at, updated_at, views_count
        FROM news_articles 
        WHERE (title ILIKE $1 OR content ILIKE $1 OR summary ILIKE $1) 
        AND is_published = true
        ORDER BY published_at DESC
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
        }
      };
    } catch (error) {
      console.error('Error in News.search:', error);
      throw error;
    }
  }
  
  static async getCategories() {
    try {
      const result = await query(`
        SELECT DISTINCT category as name, category as slug
        FROM news_articles 
        WHERE is_published = true AND category IS NOT NULL
        ORDER BY category
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error in News.getCategories:', error);
      throw error;
    }
  }
  
  static async getPopular(limit = 10) {
    try {
      const result = await query(`
        SELECT 
          id, title, slug, content, summary as excerpt, 
          author, category, published_at, updated_at, views_count
        FROM news_articles 
        WHERE is_published = true
        ORDER BY views_count DESC, published_at DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in News.getPopular:', error);
      throw error;
    }
  }
  
  static async create(data) {
    try {
      // Auto-generate slug if not provided
      const slug = data.slug || data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const result = await query(`
        INSERT INTO news_articles (
          title, slug, content, summary, author, category, is_published, published_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        data.title,
        slug,
        data.content,
        data.summary || data.excerpt,
        data.author,
        data.category,
        data.is_published || false,
        data.published_at || new Date(),
        new Date()
      ]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in News.create:', error);
      throw error;
    }
  }
  
  static async update(id, data) {
    try {
      const result = await query(`
        UPDATE news_articles 
        SET title = $1, content = $2, summary = $3, author = $4, 
            category = $5, is_published = $6, updated_at = $7
        WHERE id = $8
        RETURNING *
      `, [
        data.title,
        data.content,
        data.summary || data.excerpt,
        data.author,
        data.category,
        data.is_published,
        new Date(),
        id
      ]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in News.update:', error);
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const result = await query(`
        UPDATE news_articles 
        SET is_published = false, updated_at = $1
        WHERE id = $2
        RETURNING *
      `, [new Date(), id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in News.delete:', error);
      throw error;
    }
  }
}