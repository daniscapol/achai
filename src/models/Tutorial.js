import db from '../utils/db.js';

class Tutorial {
  // Get all tutorials with optional pagination
  static async getAll(page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot access tutorials without database connection.');
      }
      
      // If database is connected, use it
      const result = await db.query(
        'SELECT * FROM tutorials WHERE is_published = TRUE ORDER BY published_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      
      const countResult = await db.query('SELECT COUNT(*) FROM tutorials WHERE is_published = TRUE');
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        tutorials: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        },
        dataStatus: db.getFallbackDataMessage()
      };
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      
      // Fallback to static JSON data
      console.log('Falling back to static JSON data for tutorials');
      try {
        const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
        
        // Add pagination info
        const tutorials = staticData || [];
        return {
          tutorials,
          pagination: {
            total: tutorials.length,
            totalPages: Math.ceil(tutorials.length / limit),
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
        console.error('Error loading fallback tutorials data:', fallbackError);
        throw new Error('Failed to fetch tutorials: ' + error.message);
      }
    }
  }
  
  // Get tutorial by ID or slug
  static async getByIdOrSlug(idOrSlug) {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot access tutorial without database connection.');
      }
      
      // Try to fetch by ID (if numeric) or by slug
      const isNumeric = /^\d+$/.test(idOrSlug);
      let result;
      
      if (isNumeric) {
        result = await db.query('SELECT * FROM tutorials WHERE id = $1', [idOrSlug]);
      } else {
        result = await db.query('SELECT * FROM tutorials WHERE slug = $1', [idOrSlug]);
      }
      
      // If found, increment views count
      if (result.rows[0]) {
        await db.query(
          'UPDATE tutorials SET views_count = views_count + 1 WHERE id = $1',
          [result.rows[0].id]
        );
      }
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching tutorial with ID/slug ${idOrSlug}:`, error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
        const tutorial = staticData.find(t => 
          t.id === idOrSlug || 
          t.slug === idOrSlug ||
          t.id === parseInt(idOrSlug, 10)
        );
        
        if (tutorial) {
          return tutorial;
        } else {
          return null;
        }
      } catch (fallbackError) {
        console.error('Error loading fallback tutorial data:', fallbackError);
        throw new Error(`Failed to fetch tutorial with ID/slug ${idOrSlug}: ${error.message}`);
      }
    }
  }
  
  // Create a new tutorial
  static async create(tutorialData) {
    const {
      title,
      description,
      content,
      image_url,
      author,
      category,
      difficulty,
      reading_time,
      tags = [],
      featured = false,
      is_published = true,
      slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null
    } = tutorialData;
    
    // Validate required fields
    if (!title) {
      throw new Error('Tutorial title is required');
    }
    
    if (!description) {
      throw new Error('Tutorial description is required');
    }
    
    if (!content) {
      throw new Error('Tutorial content is required');
    }
    
    if (!slug) {
      throw new Error('Tutorial slug is required');
    }
    
    // Check if database is connected
    if (!db.isConnected()) {
      throw new Error('Database connection is required to create tutorials.');
    }
    
    try {
      const result = await db.query(
        `INSERT INTO tutorials 
        (title, description, content, image_url, author, category, difficulty, 
        reading_time, tags, featured, is_published, slug, published_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) 
        RETURNING *`,
        [title, description, content, image_url, author, category, difficulty, 
        reading_time, tags, featured, is_published, slug]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating tutorial:', error);
      
      // Specific error handling for duplicate slugs
      if (error.code === '23505') {
        throw new Error('A tutorial with this slug already exists');
      }
      
      throw error;
    }
  }
  
  // Update an existing tutorial
  static async update(idOrSlug, tutorialData) {
    // Check if database is connected
    if (!db.isConnected()) {
      throw new Error('Database connection is required to update tutorials.');
    }
    
    try {
      // First, get the existing tutorial
      const isNumeric = /^\d+$/.test(idOrSlug);
      let existingTutorial;
      
      if (isNumeric) {
        const result = await db.query('SELECT * FROM tutorials WHERE id = $1', [idOrSlug]);
        existingTutorial = result.rows[0];
      } else {
        const result = await db.query('SELECT * FROM tutorials WHERE slug = $1', [idOrSlug]);
        existingTutorial = result.rows[0];
      }
      
      if (!existingTutorial) {
        throw new Error(`Tutorial with ID/slug ${idOrSlug} not found`);
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
      let slugToUse = tutorialData.slug;
      if (!slugToUse && tutorialData.title) {
        slugToUse = tutorialData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      
      // Add all fields if they're defined
      addField('title', tutorialData.title);
      addField('description', tutorialData.description);
      addField('content', tutorialData.content);
      addField('image_url', tutorialData.image_url);
      addField('author', tutorialData.author);
      addField('category', tutorialData.category);
      addField('difficulty', tutorialData.difficulty);
      addField('reading_time', tutorialData.reading_time);
      addField('featured', tutorialData.featured);
      addField('is_published', tutorialData.is_published);
      addField('slug', slugToUse);
      
      // Handle arrays separately
      if (tutorialData.tags !== undefined) {
        updates.push(`tags = $${paramCount++}`);
        values.push(tutorialData.tags);
      }
      
      // Add updated_at timestamp
      updates.push(`updated_at = NOW()`);
      
      // Add ID to values array as the last parameter
      values.push(existingTutorial.id);
      
      const query = `
        UPDATE tutorials 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} 
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating tutorial with ID/slug ${idOrSlug}:`, error);
      
      // Specific error handling for duplicate slugs
      if (error.code === '23505') {
        throw new Error('A tutorial with this slug already exists');
      }
      
      throw error;
    }
  }
  
  // Delete a tutorial
  static async delete(idOrSlug) {
    // Check if database is connected
    if (!db.isConnected()) {
      throw new Error('Database connection is required to delete tutorials.');
    }
    
    try {
      // First, get the existing tutorial
      const isNumeric = /^\d+$/.test(idOrSlug);
      let existingTutorial;
      
      if (isNumeric) {
        const result = await db.query('SELECT * FROM tutorials WHERE id = $1', [idOrSlug]);
        existingTutorial = result.rows[0];
      } else {
        const result = await db.query('SELECT * FROM tutorials WHERE slug = $1', [idOrSlug]);
        existingTutorial = result.rows[0];
      }
      
      if (!existingTutorial) {
        throw new Error(`Tutorial with ID/slug ${idOrSlug} not found`);
      }
      
      // Delete the tutorial
      const result = await db.query('DELETE FROM tutorials WHERE id = $1 RETURNING *', [existingTutorial.id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting tutorial with ID/slug ${idOrSlug}:`, error);
      throw error;
    }
  }
  
  // Search tutorials by keyword
  static async search(query, page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;
    
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot search tutorials without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM tutorials 
        WHERE is_published = TRUE AND (
          title ILIKE $1 
          OR description ILIKE $1 
          OR content ILIKE $1
          OR category ILIKE $1
          OR $1 = ANY(tags)
        )
        ORDER BY published_at DESC 
        LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );
      
      const countResult = await db.query(
        `SELECT COUNT(*) FROM tutorials 
        WHERE is_published = TRUE AND (
          title ILIKE $1 
          OR description ILIKE $1 
          OR content ILIKE $1
          OR category ILIKE $1
          OR $1 = ANY(tags)
        )`,
        [searchTerm]
      );
      
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        tutorials: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error('Error searching tutorials:', error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
        
        // Filter by search term
        const lowerQuery = query.toLowerCase();
        const filteredTutorials = staticData.filter(tutorial => 
          tutorial.title.toLowerCase().includes(lowerQuery) ||
          tutorial.description.toLowerCase().includes(lowerQuery) ||
          (tutorial.content && tutorial.content.toLowerCase().includes(lowerQuery)) ||
          (tutorial.category && tutorial.category.toLowerCase().includes(lowerQuery)) ||
          (tutorial.tags && tutorial.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
        
        // Add pagination info
        return {
          tutorials: filteredTutorials.slice(offset, offset + limit),
          pagination: {
            total: filteredTutorials.length,
            totalPages: Math.ceil(filteredTutorials.length / limit),
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
        console.error('Error loading fallback tutorials data for search:', fallbackError);
        throw new Error('Failed to search tutorials: ' + error.message);
      }
    }
  }
  
  // Filter tutorials by category
  static async filterByCategory(category, page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot filter tutorials without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM tutorials 
        WHERE is_published = TRUE AND category = $1 
        ORDER BY published_at DESC 
        LIMIT $2 OFFSET $3`,
        [category, limit, offset]
      );
      
      const countResult = await db.query(
        `SELECT COUNT(*) FROM tutorials 
        WHERE is_published = TRUE AND category = $1`,
        [category]
      );
      
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        tutorials: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error(`Error filtering tutorials by category ${category}:`, error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
        
        // Filter by category
        const filteredTutorials = staticData.filter(tutorial => 
          tutorial.category && tutorial.category.toLowerCase() === category.toLowerCase()
        );
        
        // Add pagination info
        return {
          tutorials: filteredTutorials.slice(offset, offset + limit),
          pagination: {
            total: filteredTutorials.length,
            totalPages: Math.ceil(filteredTutorials.length / limit),
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
        console.error('Error loading fallback tutorials data for category filter:', fallbackError);
        throw new Error(`Failed to filter tutorials by category ${category}: ${error.message}`);
      }
    }
  }
  
  // Get featured tutorials
  static async getFeatured(limit = 6) {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot get featured tutorials without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM tutorials 
        WHERE is_published = TRUE AND featured = TRUE 
        ORDER BY published_at DESC 
        LIMIT $1`,
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching featured tutorials:', error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
        
        // Return first few items as featured
        return staticData.slice(0, limit);
      } catch (fallbackError) {
        console.error('Error loading fallback featured tutorials data:', fallbackError);
        throw new Error('Failed to fetch featured tutorials: ' + error.message);
      }
    }
  }
  
  // Get tutorial categories
  static async getCategories() {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot get tutorial categories without database connection.');
      }
      
      const result = await db.query(
        `SELECT DISTINCT category FROM tutorials WHERE is_published = TRUE`
      );
      
      return result.rows.map(row => row.category).filter(Boolean);
    } catch (error) {
      console.error('Error fetching tutorial categories:', error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
        
        // Extract unique categories
        const categories = [...new Set(staticData.map(tutorial => tutorial.category))].filter(Boolean);
        return categories;
      } catch (fallbackError) {
        console.error('Error loading fallback tutorial categories:', fallbackError);
        throw new Error('Failed to fetch tutorial categories: ' + error.message);
      }
    }
  }
  
  // Get recent tutorials
  static async getRecent(limit = 5) {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot get recent tutorials without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM tutorials 
        WHERE is_published = TRUE 
        ORDER BY published_at DESC 
        LIMIT $1`,
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching recent tutorials:', error);
      
      // Fallback to static JSON data
      try {
        const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
        
        // Sort by date and return most recent
        const sorted = [...staticData].sort((a, b) => {
          const dateA = a.datePublished ? new Date(a.datePublished) : new Date(0);
          const dateB = b.datePublished ? new Date(b.datePublished) : new Date(0);
          return dateB - dateA;
        });
        
        return sorted.slice(0, limit);
      } catch (fallbackError) {
        console.error('Error loading fallback recent tutorials data:', fallbackError);
        throw new Error('Failed to fetch recent tutorials: ' + error.message);
      }
    }
  }
  
  // Get popular tutorials
  static async getPopular(limit = 5) {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot get popular tutorials without database connection.');
      }
      
      const result = await db.query(
        `SELECT * FROM tutorials 
        WHERE is_published = TRUE 
        ORDER BY views_count DESC 
        LIMIT $1`,
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching popular tutorials:', error);
      
      // Fallback to static JSON data - just return first few items since we don't have view counts
      try {
        const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
        return staticData.slice(0, limit);
      } catch (fallbackError) {
        console.error('Error loading fallback popular tutorials data:', fallbackError);
        throw new Error('Failed to fetch popular tutorials: ' + error.message);
      }
    }
  }
  
  // Add a rating to a tutorial
  static async addRating(idOrSlug, rating) {
    // Validate input
    if (!idOrSlug) {
      throw new Error('Tutorial ID or slug is required');
    }
    
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Rating must be a number between 1 and 5');
    }
    
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot add rating without database connection.');
      }
      
      // First, get the tutorial
      const isNumeric = /^\d+$/.test(idOrSlug);
      let tutorial;
      
      if (isNumeric) {
        const result = await db.query('SELECT * FROM tutorials WHERE id = $1', [idOrSlug]);
        tutorial = result.rows[0];
      } else {
        const result = await db.query('SELECT * FROM tutorials WHERE slug = $1', [idOrSlug]);
        tutorial = result.rows[0];
      }
      
      if (!tutorial) {
        throw new Error(`Tutorial with ID/slug ${idOrSlug} not found`);
      }
      
      // Update the tutorial's rating
      // In a real application, you would store individual ratings in a separate table
      // and calculate the average rating based on all ratings
      const currentRatings = tutorial.ratings_count || 0;
      const currentAvgRating = tutorial.avg_rating || 0;
      
      // Calculate new average rating
      const newRatingsCount = currentRatings + 1;
      const newAvgRating = ((currentAvgRating * currentRatings) + rating) / newRatingsCount;
      
      // Update the tutorial
      const updateResult = await db.query(
        `UPDATE tutorials 
        SET ratings_count = $1, avg_rating = $2, updated_at = NOW() 
        WHERE id = $3 
        RETURNING *`,
        [newRatingsCount, newAvgRating, tutorial.id]
      );
      
      // Return the updated tutorial with the user's rating included
      const updatedTutorial = updateResult.rows[0];
      if (updatedTutorial) {
        updatedTutorial.userRating = rating;
      }
      
      return updatedTutorial;
    } catch (error) {
      console.error(`Error adding rating to tutorial with ID/slug ${idOrSlug}:`, error);
      
      // Fallback for when database is not available
      if (!db.isConnected()) {
        try {
          // Get tutorial from static data
          const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
          const tutorial = staticData.find(t => 
            t.id === idOrSlug || 
            t.slug === idOrSlug || 
            t.id === parseInt(idOrSlug, 10)
          );
          
          if (tutorial) {
            // For static data, just return the tutorial with the user's rating
            // (we can't actually update the static data)
            return {
              ...tutorial,
              userRating: rating
            };
          }
        } catch (fallbackError) {
          console.error('Error loading fallback tutorial data for rating:', fallbackError);
        }
      }
      
      throw error;
    }
  }
  
  // Add feedback to a tutorial
  static async addFeedback(idOrSlug, feedback) {
    // Validate input
    if (!idOrSlug) {
      throw new Error('Tutorial ID or slug is required');
    }
    
    if (!feedback || !Array.isArray(feedback)) {
      throw new Error('Feedback must be an array of strings');
    }
    
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('Database connection required. Cannot add feedback without database connection.');
      }
      
      // First, get the tutorial
      const isNumeric = /^\d+$/.test(idOrSlug);
      let tutorial;
      
      if (isNumeric) {
        const result = await db.query('SELECT * FROM tutorials WHERE id = $1', [idOrSlug]);
        tutorial = result.rows[0];
      } else {
        const result = await db.query('SELECT * FROM tutorials WHERE slug = $1', [idOrSlug]);
        tutorial = result.rows[0];
      }
      
      if (!tutorial) {
        throw new Error(`Tutorial with ID/slug ${idOrSlug} not found`);
      }
      
      // In a real application, you would store individual feedback in a separate table
      // For now, just track the count of each feedback type
      const feedbackStats = tutorial.feedback_stats || {};
      
      // Update feedback stats
      feedback.forEach(item => {
        feedbackStats[item] = (feedbackStats[item] || 0) + 1;
      });
      
      // Update the tutorial
      const updateResult = await db.query(
        `UPDATE tutorials 
        SET feedback_stats = $1, updated_at = NOW() 
        WHERE id = $2 
        RETURNING *`,
        [feedbackStats, tutorial.id]
      );
      
      // Return the updated tutorial with the user's feedback included
      const updatedTutorial = updateResult.rows[0];
      if (updatedTutorial) {
        updatedTutorial.userFeedback = feedback;
      }
      
      return updatedTutorial;
    } catch (error) {
      console.error(`Error adding feedback to tutorial with ID/slug ${idOrSlug}:`, error);
      
      // Fallback for when database is not available
      if (!db.isConnected()) {
        try {
          // Get tutorial from static data
          const { default: staticData } = await import('../tutorials/tutorials_data.json', { assert: { type: 'json' } });
          const tutorial = staticData.find(t => 
            t.id === idOrSlug || 
            t.slug === idOrSlug || 
            t.id === parseInt(idOrSlug, 10)
          );
          
          if (tutorial) {
            // For static data, just return the tutorial with the user's feedback
            // (we can't actually update the static data)
            return {
              ...tutorial,
              userFeedback: feedback
            };
          }
        } catch (fallbackError) {
          console.error('Error loading fallback tutorial data for feedback:', fallbackError);
        }
      }
      
      throw error;
    }
  }
}

export default Tutorial;