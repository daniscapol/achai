import db from './db.js';
const { query } = db;

export class Course {
  static async getAll(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await query(
        'SELECT COUNT(*) FROM courses WHERE status = $1',
        ['published']
      );
      const total = parseInt(countResult.rows[0].count);
      
      // Get courses
      const coursesResult = await query(`
        SELECT 
          c.*,
          cc.name as category_name,
          cc.slug as category_slug,
          array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        LEFT JOIN course_tags ct ON c.id = ct.course_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE c.status = $1
        GROUP BY c.id, cc.name, cc.slug
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
      `, ['published', limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        courses: coursesResult.rows,
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
      console.error('Error in Course.getAll:', error);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const result = await query(`
        SELECT 
          id, title, slug, description, content, thumbnail,
          instructor_name, instructor_bio, price, currency,
          duration_hours, difficulty_level, status, enrollment_count,
          rating, rating_count, created_at, updated_at
        FROM courses 
        WHERE id = $1 AND status = $2
      `, [id, 'published']);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Course.getById:', error);
      throw error;
    }
  }
  
  static async getBySlug(slug) {
    try {
      const result = await query(`
        SELECT 
          id, title, slug, description, content, thumbnail,
          instructor_name, instructor_bio, price, currency,
          duration_hours, difficulty_level, status, enrollment_count,
          rating, rating_count, created_at, updated_at
        FROM courses 
        WHERE slug = $1 AND status = $2
      `, [slug, 'published']);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Course.getBySlug:', error);
      throw error;
    }
  }
  
  static async getByCategory(categorySlug, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count for this category
      const countResult = await query(`
        SELECT COUNT(*) FROM courses c
        JOIN course_categories cc ON c.category_id = cc.id
        WHERE cc.slug = $1 AND c.status = $2
      `, [categorySlug, 'published']);
      
      const total = parseInt(countResult.rows[0].count);
      
      // Get courses
      const coursesResult = await query(`
        SELECT 
          c.*,
          cc.name as category_name,
          cc.slug as category_slug
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE cc.slug = $1 AND c.status = $2
        ORDER BY c.created_at DESC
        LIMIT $3 OFFSET $4
      `, [categorySlug, 'published', limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        courses: coursesResult.rows,
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
      console.error('Error in Course.getByCategory:', error);
      throw error;
    }
  }
  
  static async getByDifficulty(difficultyLevel, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count for this difficulty
      const countResult = await query(`
        SELECT COUNT(*) FROM courses
        WHERE difficulty_level = $1 AND status = $2
      `, [difficultyLevel, 'published']);
      
      const total = parseInt(countResult.rows[0].count);
      
      // Get courses
      const coursesResult = await query(`
        SELECT 
          c.*,
          cc.name as category_name,
          cc.slug as category_slug
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE c.difficulty_level = $1 AND c.status = $2
        ORDER BY c.rating DESC, c.created_at DESC
        LIMIT $3 OFFSET $4
      `, [difficultyLevel, 'published', limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        courses: coursesResult.rows,
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
      console.error('Error in Course.getByDifficulty:', error);
      throw error;
    }
  }
  
  static async create(courseData) {
    try {
      const {
        title,
        slug,
        description,
        content,
        thumbnail,
        instructor_name,
        instructor_bio,
        price = 0,
        currency = 'USD',
        duration_hours,
        difficulty_level = 'beginner',
        category_id,
        tags = [],
        status = 'draft'
      } = courseData;
      
      // Validate required fields
      if (!title) throw new Error('Title is required');
      if (!description) throw new Error('Description is required');
      if (!content) throw new Error('Content is required');
      if (!instructor_name) throw new Error('Instructor name is required');
      
      // Generate slug if not provided
      const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Start transaction
      await query('BEGIN');
      
      try {
        // Insert course
        const result = await query(`
          INSERT INTO courses (
            title, slug, description, content, thumbnail,
            instructor_name, instructor_bio, price, currency,
            duration_hours, difficulty_level, category_id, tags,
            status, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
          ) RETURNING *
        `, [
          title, finalSlug, description, content, thumbnail,
          instructor_name, instructor_bio, price, currency,
          duration_hours, difficulty_level, category_id, tags,
          status
        ]);
        
        const course = result.rows[0];
        
        // Handle tags in junction table
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
            
            // Create course-tag relationship
            await query(`
              INSERT INTO course_tags (course_id, tag_id)
              VALUES ($1, $2)
            `, [course.id, tagId]);
          }
        }
        
        await query('COMMIT');
        return course;
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error in Course.create:', error);
      throw error;
    }
  }
  
  static async update(id, courseData) {
    try {
      const {
        title,
        slug,
        description,
        content,
        thumbnail,
        instructor_name,
        instructor_bio,
        price,
        currency,
        duration_hours,
        difficulty_level,
        category_id,
        tags,
        status
      } = courseData;
      
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
      addField('description', description);
      addField('content', content);
      addField('thumbnail', thumbnail);
      addField('instructor_name', instructor_name);
      addField('instructor_bio', instructor_bio);
      addField('price', price);
      addField('currency', currency);
      addField('duration_hours', duration_hours);
      addField('difficulty_level', difficulty_level);
      addField('category_id', category_id);
      addField('status', status);
      
      // Handle tags as JSONB
      if (tags !== undefined) {
        updates.push(`tags = $${paramCount++}`);
        values.push(tags);
      }
      
      updates.push('updated_at = NOW()');
      values.push(id);
      
      await query('BEGIN');
      
      try {
        // Update course
        const result = await query(`
          UPDATE courses 
          SET ${updates.join(', ')}
          WHERE id = $${paramCount}
          RETURNING *
        `, values);
        
        const course = result.rows[0];
        
        // Update tags in junction table if provided
        if (tags !== undefined) {
          // Remove existing tags
          await query('DELETE FROM course_tags WHERE course_id = $1', [id]);
          
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
              INSERT INTO course_tags (course_id, tag_id)
              VALUES ($1, $2)
            `, [id, tagId]);
          }
        }
        
        await query('COMMIT');
        return course;
      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error in Course.update:', error);
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const result = await query(`
        UPDATE courses 
        SET status = 'archived', updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Course.delete:', error);
      throw error;
    }
  }
  
  static async search(searchTerm, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      
      // Get total count
      const countResult = await query(`
        SELECT COUNT(*) FROM courses
        WHERE status = 'published' AND (
          LOWER(title) LIKE $1 OR
          LOWER(description) LIKE $1 OR
          LOWER(content) LIKE $1 OR
          LOWER(instructor_name) LIKE $1
        )
      `, [searchPattern]);
      
      const total = parseInt(countResult.rows[0].count);
      
      // Get search results
      const coursesResult = await query(`
        SELECT 
          c.*,
          cc.name as category_name,
          cc.slug as category_slug
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE c.status = 'published' AND (
          LOWER(c.title) LIKE $1 OR
          LOWER(c.description) LIKE $1 OR
          LOWER(c.content) LIKE $1 OR
          LOWER(c.instructor_name) LIKE $1
        )
        ORDER BY 
          CASE WHEN LOWER(c.title) LIKE $1 THEN 1 ELSE 2 END,
          c.rating DESC,
          c.created_at DESC
        LIMIT $2 OFFSET $3
      `, [searchPattern, limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        courses: coursesResult.rows,
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
      console.error('Error in Course.search:', error);
      throw error;
    }
  }
  
  // Get course sections
  static async getSections(courseId) {
    try {
      const result = await query(`
        SELECT * FROM course_sections
        WHERE course_id = $1
        ORDER BY order_index
      `, [courseId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in Course.getSections:', error);
      throw error;
    }
  }
  
  // Create course section
  static async createSection(courseId, sectionData) {
    try {
      const { title, description, content, order_index, duration_minutes } = sectionData;
      
      const result = await query(`
        INSERT INTO course_sections (
          course_id, title, description, content, 
          order_index, duration_minutes, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        ) RETURNING *
      `, [courseId, title, description, content, order_index, duration_minutes]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in Course.createSection:', error);
      throw error;
    }
  }
  
  // Get all categories
  static async getCategories() {
    try {
      const result = await query(`
        SELECT cc.*, COUNT(c.id) as course_count
        FROM course_categories cc
        LEFT JOIN courses c ON cc.id = c.category_id AND c.status = 'published'
        GROUP BY cc.id
        ORDER BY cc.name
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error in Course.getCategories:', error);
      throw error;
    }
  }
  
  // Get popular courses
  static async getPopular(limit = 5) {
    try {
      const result = await query(`
        SELECT 
          c.*,
          cc.name as category_name,
          cc.slug as category_slug
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE c.status = 'published'
        ORDER BY c.enrollment_count DESC, c.rating DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in Course.getPopular:', error);
      throw error;
    }
  }
  
  // Get featured courses
  static async getFeatured(limit = 5) {
    try {
      const result = await query(`
        SELECT 
          c.*,
          cc.name as category_name,
          cc.slug as category_slug
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE c.status = 'published' AND c.rating >= 4
        ORDER BY c.rating DESC, c.enrollment_count DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in Course.getFeatured:', error);
      throw error;
    }
  }
  
  // Enroll user in course
  static async enroll(userId, courseId) {
    try {
      const result = await query(`
        INSERT INTO course_enrollments (user_id, course_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, course_id) DO NOTHING
        RETURNING *
      `, [userId, courseId]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in Course.enroll:', error);
      throw error;
    }
  }
  
  // Get user enrollments
  static async getUserEnrollments(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const countResult = await query(
        'SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1',
        [userId]
      );
      const total = parseInt(countResult.rows[0].count);
      
      const result = await query(`
        SELECT 
          ce.*,
          c.title,
          c.slug,
          c.description,
          c.thumbnail,
          c.instructor_name,
          c.duration_hours,
          c.difficulty_level,
          cc.name as category_name,
          cc.slug as category_slug
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE ce.user_id = $1
        ORDER BY ce.enrolled_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        enrollments: result.rows,
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
      console.error('Error in Course.getUserEnrollments:', error);
      throw error;
    }
  }
}

export default Course;