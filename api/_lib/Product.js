import { query } from './db.js';

export class Product {
  static async getAll(page = 1, limit = 100) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM products WHERE is_active = TRUE');
      const total = parseInt(countResult.rows[0].count);
      
      // Get products
      const productsResult = await query(`
        SELECT * FROM products 
        WHERE is_active = TRUE 
        ORDER BY is_featured DESC, created_at DESC 
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        products: productsResult.rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        dataStatus: {
          type: 'success',
          source: 'postgres',
          message: 'Connected to PostgreSQL database'
        }
      };
    } catch (error) {
      console.error('Error in Product.getAll:', error);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const result = await query('SELECT * FROM products WHERE id = $1 AND is_active = TRUE', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Product.getById:', error);
      throw error;
    }
  }
  
  static async getByType(productType, page = 1, limit = 100) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count for this type
      const countResult = await query(
        'SELECT COUNT(*) FROM products WHERE product_type = $1 AND is_active = TRUE', 
        [productType]
      );
      const total = parseInt(countResult.rows[0].count);
      
      // Get products of this type
      const productsResult = await query(`
        SELECT * FROM products 
        WHERE product_type = $1 AND is_active = TRUE 
        ORDER BY is_featured DESC, created_at DESC 
        LIMIT $2 OFFSET $3
      `, [productType, limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        products: productsResult.rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        dataStatus: {
          type: 'success',
          source: 'postgres',
          message: 'Connected to PostgreSQL database'
        }
      };
    } catch (error) {
      console.error('Error in Product.getByType:', error);
      throw error;
    }
  }
  
  static async create(productData) {
    try {
      const {
        // Multilingual fields
        name_en,
        name_pt,
        description_en,
        description_pt,
        // Legacy fields (for backward compatibility)
        name,
        description,
        price = 0,
        image_url,
        icon_url,
        category,
        categories = [],
        sku,
        product_type = 'mcp_server',
        github_url,
        official = false,
        docs_url,
        demo_url,
        language,
        license,
        creator,
        version,
        installation_command,
        tags = [],
        inventory_count = 0,
        is_featured = false,
        is_active = true,
        slug,
        stars_numeric = 0
      } = productData;

      // Set legacy fields to English values for backward compatibility
      const finalName = name || name_en;
      const finalDescription = description || description_en;
      const finalSlug = slug || (finalName ? finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null);
      
      // Validate required fields
      if (!finalName) {
        throw new Error('Product name (English) is required');
      }
      
      if (!finalDescription) {
        throw new Error('Product description (English) is required');
      }
      
      if (!finalSlug) {
        throw new Error('Product slug is required');
      }

      // Convert single category to array if categories is empty
      const categoriesArray = categories.length > 0 ? categories : (category ? [category] : []);

      const result = await query(`
        INSERT INTO products (
          name, description, name_en, name_pt, description_en, description_pt, 
          price, image_url, icon_url, category, categories, sku, 
          product_type, github_url, official, docs_url, demo_url, language, license, 
          creator, version, installation_command, tags, inventory_count, 
          is_featured, is_active, slug, stars_numeric, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW()
        ) RETURNING *
      `, [
        finalName, finalDescription, name_en, name_pt, description_en, description_pt, 
        price, image_url, icon_url, category, categoriesArray, sku, 
        product_type, github_url, official, docs_url, demo_url, language, license, 
        creator, version, installation_command, tags, inventory_count, 
        is_featured, is_active, finalSlug, stars_numeric
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error in Product.create:', error);
      throw error;
    }
  }
  
  static async update(id, productData) {
    try {
      const {
        // Multilingual fields
        name_en,
        name_pt,
        description_en,
        description_pt,
        // Legacy fields
        name,
        description,
        price,
        image_url,
        icon_url,
        category,
        categories,
        sku,
        product_type,
        github_url,
        official,
        docs_url,
        demo_url,
        language,
        license,
        creator,
        version,
        installation_command,
        tags,
        inventory_count,
        is_featured,
        is_active,
        slug,
        stars_numeric
      } = productData;

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
      
      // Add all fields if they're defined
      addField('name', name);
      addField('description', description);
      // Add multilingual fields
      addField('name_en', name_en);
      addField('name_pt', name_pt);
      addField('description_en', description_en);
      addField('description_pt', description_pt);
      addField('price', price);
      addField('image_url', image_url);
      addField('icon_url', icon_url);
      addField('category', category);
      addField('sku', sku);
      addField('product_type', product_type);
      addField('github_url', github_url);
      addField('official', official);
      addField('docs_url', docs_url);
      addField('demo_url', demo_url);
      addField('language', language);
      addField('license', license);
      addField('creator', creator);
      addField('version', version);
      addField('installation_command', installation_command);
      addField('inventory_count', inventory_count);
      addField('is_featured', is_featured);
      addField('is_active', is_active);
      addField('slug', slug);
      addField('stars_numeric', stars_numeric);
      
      // Handle arrays separately with type casting
      if (categories !== undefined) {
        updates.push(`categories = $${paramCount++}`);
        values.push(categories);
      }
      
      if (tags !== undefined) {
        updates.push(`tags = $${paramCount++}`);
        values.push(tags);
      }
      
      // Add updated_at timestamp
      updates.push(`updated_at = NOW()`);
      
      // Add ID to values array as the last parameter
      values.push(id);
      
      const result = await query(`
        UPDATE products 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} 
        RETURNING *
      `, values);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Product.update:', error);
      throw error;
    }
  }

  static async updateById(id, productData) {
    // Delegate to the new update method for backward compatibility
    return this.update(id, productData);
  }
  
  static async deleteById(id) {
    try {
      const result = await query(`
        UPDATE products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = TRUE
        RETURNING id
      `, [id]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Product.deleteById:', error);
      throw error;
    }
  }
  
  static async getByCategory(category, limit = 10) {
    try {
      const result = await query(`
        SELECT * FROM products 
        WHERE category = $1 AND is_active = TRUE 
        ORDER BY is_featured DESC, created_at DESC 
        LIMIT $2
      `, [category, limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in Product.getByCategory:', error);
      throw error;
    }
  }

  static async search(searchTerm, page = 1, limit = 100) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      
      // Get total count for search results
      const countResult = await query(`
        SELECT COUNT(*) FROM products 
        WHERE is_active = TRUE AND (
          LOWER(name) LIKE $1 OR 
          LOWER(description) LIKE $1 OR 
          LOWER(category) LIKE $1 OR
          LOWER(creator) LIKE $1 OR
          LOWER(language) LIKE $1 OR
          $2 = ANY(tags)
        )
      `, [searchPattern, searchTerm.toLowerCase()]);
      
      const total = parseInt(countResult.rows[0].count);
      
      // Get search results
      const productsResult = await query(`
        SELECT * FROM products 
        WHERE is_active = TRUE AND (
          LOWER(name) LIKE $1 OR 
          LOWER(description) LIKE $1 OR 
          LOWER(category) LIKE $1 OR
          LOWER(creator) LIKE $1 OR
          LOWER(language) LIKE $1 OR
          $2 = ANY(tags)
        )
        ORDER BY 
          CASE WHEN LOWER(name) LIKE $1 THEN 1 ELSE 2 END,
          is_featured DESC, 
          created_at DESC 
        LIMIT $3 OFFSET $4
      `, [searchPattern, searchTerm.toLowerCase(), limit, offset]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        products: productsResult.rows,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        searchTerm,
        dataStatus: {
          type: 'success',
          source: 'postgres',
          message: 'Connected to PostgreSQL database'
        }
      };
    } catch (error) {
      console.error('Error in Product.search:', error);
      throw error;
    }
  }
}

export default Product;