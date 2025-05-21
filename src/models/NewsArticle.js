import db from '../utils/db.js';

class NewsArticle {
  // Get all news articles with optional pagination
  static async getAll(page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot access news articles without database connection.');
      }
      
      // If database is connected, use it
      const result = await db.query(
        'SELECT * FROM news_articles WHERE is_published = TRUE ORDER BY published_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      
      const countResult = await db.query('SELECT COUNT(*) FROM news_articles WHERE is_published = TRUE');
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        articles: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        },
        dataStatus: db.getFallbackDataMessage()
      };
    } catch (error) {
      console.error('Error fetching news articles:', error);
      
      // Fallback to static JSON data
      console.log('Falling back to static JSON data for news articles');
      try {
        const { default: staticData } = await import('../news/news_data.json', { assert: { type: 'json' } });
        
        // Add pagination info
        const articles = staticData || [];
        return {
          articles,
          pagination: {
            total: articles.length,
            totalPages: Math.ceil(articles.length / limit),
            currentPage: 1,
            limit
          },
          dataStatus: {
            type: 'warning',
            message: 'Using fallback static data: database connection failed',
            error: error.message
          }
        };
      } catch (fallbackError) {
        console.error('Error loading fallback news data:', fallbackError);
        throw new Error('Failed to fetch news articles: ' + error.message);
      }
    }
  }
  
  // Get news article by ID or slug
  static async getByIdOrSlug(idOrSlug) {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot access news article without database connection.');
      }
      
      // Try to fetch by ID (if numeric) or by slug
      const isNumeric = /^\d+$/.test(idOrSlug);
      let result;
      
      if (isNumeric) {
        result = await db.query('SELECT * FROM news_articles WHERE id = $1', [idOrSlug]);
      } else {
        result = await db.query('SELECT * FROM news_articles WHERE slug = $1', [idOrSlug]);
      }
      
      // If found, increment views count
      if (result.rows[0]) {
        await db.query(
          'UPDATE news_articles SET views_count = views_count + 1 WHERE id = $1',
          [result.rows[0].id]
        );
      }
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching news article with ID/slug ${idOrSlug}:`, error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../news/news_data.json', { assert: { type: 'json' } });
        const article = staticData.find(a => 
          a.id === idOrSlug || 
          a.slug === idOrSlug ||
          a.id === parseInt(idOrSlug, 10)
        );
        
        if (article) {
          return article;
        } else {
          return null;
        }
      } catch (fallbackError) {
        console.error('Error loading fallback news article data:', fallbackError);
        throw new Error(`Failed to fetch news article with ID/slug ${idOrSlug}: ${error.message}`);
      }
    }
  }
  
  // Create a new news article
  static async create(articleData) {
    const {
      title,
      summary,
      content,
      image_url,
      image_color,
      image_icon,
      source,
      source_url,
      category,
      external_url,
      author,
      tags = [],
      featured = false,
      is_published = true,
      slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null
    } = articleData;
    
    // Validate required fields
    if (!title) {
      throw new Error('Article title is required');
    }
    
    if (!summary) {
      throw new Error('Article summary is required');
    }
    
    if (!slug) {
      throw new Error('Article slug is required');
    }
    
    // Check if database is connected
    if (!db.isConnected()) {
      throw new Error('Database connection is required to create news articles.');
    }
    
    try {
      const result = await db.query(
        `INSERT INTO news_articles 
        (title, summary, content, image_url, image_color, image_icon, source, source_url,
        category, external_url, author, tags, featured, is_published, slug, published_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()) 
        RETURNING *`,
        [title, summary, content, image_url, image_color, image_icon, source, source_url,
        category, external_url, author, tags, featured, is_published, slug]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating news article:', error);
      
      // Specific error handling for duplicate slugs
      if (error.code === '23505') {
        throw new Error('A news article with this slug already exists');
      }
      
      throw error;
    }
  }
  
  // Update an existing news article
  static async update(idOrSlug, articleData) {
    // Check if database is connected
    if (!db.isConnected()) {
      throw new Error('Database connection is required to update news articles.');
    }
    
    try {
      // First, get the existing article
      const isNumeric = /^\d+$/.test(idOrSlug);
      let existingArticle;
      
      if (isNumeric) {
        const result = await db.query('SELECT * FROM news_articles WHERE id = $1', [idOrSlug]);
        existingArticle = result.rows[0];
      } else {
        const result = await db.query('SELECT * FROM news_articles WHERE slug = $1', [idOrSlug]);
        existingArticle = result.rows[0];
      }
      
      if (!existingArticle) {
        throw new Error(`News article with ID/slug ${idOrSlug} not found`);
      }
      
      // Build the query based on what fields are provided
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      // Helper function to add field to updates if defined
      const addField = (field, value) => {
        if (value !== undefined) {
          updates.push(`${field} = $${paramCount++}`);
          values.push(value);
        }
      };
      
      // Generate slug from title if title is provided but slug isn't
      let slugToUse = articleData.slug;
      if (!slugToUse && articleData.title) {
        slugToUse = articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      
      // Add all fields if they're defined
      addField('title', articleData.title);
      addField('summary', articleData.summary);
      addField('content', articleData.content);
      addField('image_url', articleData.image_url);
      addField('image_color', articleData.image_color);
      addField('image_icon', articleData.image_icon);
      addField('source', articleData.source);
      addField('source_url', articleData.source_url);
      addField('category', articleData.category);
      addField('external_url', articleData.external_url);
      addField('author', articleData.author);
      addField('featured', articleData.featured);
      addField('is_published', articleData.is_published);
      addField('slug', slugToUse);
      
      // Handle arrays separately
      if (articleData.tags !== undefined) {
        updates.push(`tags = $${paramCount++}`);
        values.push(articleData.tags);
      }
      
      // Add updated_at timestamp
      updates.push(`updated_at = NOW()`);
      
      // Add ID to values array as the last parameter
      values.push(existingArticle.id);
      
      const query = `
        UPDATE news_articles 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} 
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating news article with ID/slug ${idOrSlug}:`, error);
      
      // Specific error handling for duplicate slugs
      if (error.code === '23505') {
        throw new Error('A news article with this slug already exists');
      }
      
      throw error;
    }
  }
  
  // Delete a news article
  static async delete(idOrSlug) {
    // Check if database is connected
    if (!db.isConnected()) {
      throw new Error('Database connection is required to delete news articles.');
    }
    
    try {
      // First, get the existing article
      const isNumeric = /^\d+$/.test(idOrSlug);
      let existingArticle;
      
      if (isNumeric) {
        const result = await db.query('SELECT * FROM news_articles WHERE id = $1', [idOrSlug]);
        existingArticle = result.rows[0];
      } else {
        const result = await db.query('SELECT * FROM news_articles WHERE slug = $1', [idOrSlug]);
        existingArticle = result.rows[0];
      }
      
      if (!existingArticle) {
        throw new Error(`News article with ID/slug ${idOrSlug} not found`);
      }
      
      // Delete the article
      const result = await db.query('DELETE FROM news_articles WHERE id = $1 RETURNING *', [existingArticle.id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting news article with ID/slug ${idOrSlug}:`, error);
      throw error;
    }
  }
  
  // Search news articles by keyword
  static async search(query, page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;
    
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot search news articles without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM news_articles 
        WHERE is_published = TRUE AND (
          title ILIKE $1 
          OR summary ILIKE $1 
          OR content ILIKE $1
          OR category ILIKE $1
          OR $1 = ANY(tags)
        )
        ORDER BY published_at DESC 
        LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );
      
      const countResult = await db.query(
        `SELECT COUNT(*) FROM news_articles 
        WHERE is_published = TRUE AND (
          title ILIKE $1 
          OR summary ILIKE $1 
          OR content ILIKE $1
          OR category ILIKE $1
          OR $1 = ANY(tags)
        )`,
        [searchTerm]
      );
      
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        articles: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error('Error searching news articles:', error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../news/news_data.json', { assert: { type: 'json' } });
        
        // Filter by search term
        const lowerQuery = query.toLowerCase();
        const filteredArticles = staticData.filter(article => 
          article.title.toLowerCase().includes(lowerQuery) ||
          article.summary.toLowerCase().includes(lowerQuery) ||
          (article.content && article.content.toLowerCase().includes(lowerQuery)) ||
          (article.category && article.category.toLowerCase().includes(lowerQuery)) ||
          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
        
        // Add pagination info
        return {
          articles: filteredArticles.slice(offset, offset + limit),
          pagination: {
            total: filteredArticles.length,
            totalPages: Math.ceil(filteredArticles.length / limit),
            currentPage: page,
            limit
          },
          dataStatus: {
            type: 'warning',
            message: 'Using fallback static data: database connection failed',
            error: error.message
          }
        };
      } catch (fallbackError) {
        console.error('Error loading fallback news data for search:', fallbackError);
        throw new Error('Failed to search news articles: ' + error.message);
      }
    }
  }
  
  // Filter news articles by category
  static async filterByCategory(category, page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot filter news articles without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM news_articles 
        WHERE is_published = TRUE AND category = $1 
        ORDER BY published_at DESC 
        LIMIT $2 OFFSET $3`,
        [category, limit, offset]
      );
      
      const countResult = await db.query(
        `SELECT COUNT(*) FROM news_articles 
        WHERE is_published = TRUE AND category = $1`,
        [category]
      );
      
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        articles: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error(`Error filtering news articles by category ${category}:`, error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../news/news_data.json', { assert: { type: 'json' } });
        
        // Filter by category
        const filteredArticles = staticData.filter(article => 
          article.category && article.category.toLowerCase() === category.toLowerCase()
        );
        
        // Add pagination info
        return {
          articles: filteredArticles.slice(offset, offset + limit),
          pagination: {
            total: filteredArticles.length,
            totalPages: Math.ceil(filteredArticles.length / limit),
            currentPage: page,
            limit
          },
          dataStatus: {
            type: 'warning',
            message: 'Using fallback static data: database connection failed',
            error: error.message
          }
        };
      } catch (fallbackError) {
        console.error('Error loading fallback news data for category filter:', fallbackError);
        throw new Error(`Failed to filter news articles by category ${category}: ${error.message}`);
      }
    }
  }
  
  // Get featured news articles
  static async getFeatured(limit = 6) {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot get featured news articles without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM news_articles 
        WHERE is_published = TRUE AND featured = TRUE 
        ORDER BY published_at DESC 
        LIMIT $1`,
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching featured news articles:', error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../news/news_data.json', { assert: { type: 'json' } });
        
        // Return first few items as featured
        return staticData.slice(0, limit);
      } catch (fallbackError) {
        console.error('Error loading fallback featured news data:', fallbackError);
        throw new Error('Failed to fetch featured news articles: ' + error.message);
      }
    }
  }
  
  // Get news categories
  static async getCategories() {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot get news categories without database connection.');
      }
      
      const result = await db.query(
        `SELECT DISTINCT category FROM news_articles WHERE is_published = TRUE`
      );
      
      return result.rows.map(row => row.category).filter(Boolean);
    } catch (error) {
      console.error('Error fetching news categories:', error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../news/news_data.json', { assert: { type: 'json' } });
        
        // Extract unique categories
        const categories = [...new Set(staticData.map(article => article.category))].filter(Boolean);
        return categories;
      } catch (fallbackError) {
        console.error('Error loading fallback news categories:', fallbackError);
        throw new Error('Failed to fetch news categories: ' + error.message);
      }
    }
  }
  
  // Get recent news articles
  static async getRecent(limit = 5) {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot get recent news articles without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM news_articles 
        WHERE is_published = TRUE 
        ORDER BY published_at DESC 
        LIMIT $1`,
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching recent news articles:', error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../news/news_data.json', { assert: { type: 'json' } });
        
        // Sort by date and return most recent
        const sorted = [...staticData].sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          return dateB - dateA;
        });
        
        return sorted.slice(0, limit);
      } catch (fallbackError) {
        console.error('Error loading fallback recent news data:', fallbackError);
        throw new Error('Failed to fetch recent news articles: ' + error.message);
      }
    }
  }
  
  // Get popular news articles
  static async getPopular(limit = 5) {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot get popular news articles without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM news_articles 
        WHERE is_published = TRUE 
        ORDER BY views_count DESC 
        LIMIT $1`,
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching popular news articles:', error);
      
      // Fallback to static JSON data - just return first few items since we don't have view counts
      try {
        const { default: staticData } = await import('../news/news_data.json', { assert: { type: 'json' } });
        return staticData.slice(0, limit);
      } catch (fallbackError) {
        console.error('Error loading fallback popular news data:', fallbackError);
        throw new Error('Failed to fetch popular news articles: ' + error.message);
      }
    }
  }
}

export default NewsArticle;