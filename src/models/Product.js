import db from '../utils/db.js';

class Product {
  // Get all products with optional pagination
  static async getAll(page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('AWS Database connection required. Cannot access data without database connection.');
      }
      
      // If database is connected, use it
      const result = await db.query(
        'SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      
      const countResult = await db.query('SELECT COUNT(*) FROM products');
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        products: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        },
        dataStatus: db.getFallbackDataMessage()
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products from AWS database: ' + error.message);
    }
  }
  
  // Get product by ID
  static async getById(id) {
    try {
      // If database is not connected, throw an error
      if (!db.isConnected()) {
        throw new Error('AWS Database connection required. Cannot access data without database connection.');
      }
      
      const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw new Error(`Failed to fetch product with ID ${id} from AWS database: ${error.message}`);
    }
  }
  
  // Create a new product
  static async create(productData) {
    // Log the received product data
    console.log('Creating product with data:', JSON.stringify(productData, null, 2));
    console.log('Multilingual fields received:');
    console.log('- name_en:', productData.name_en);
    console.log('- name_pt:', productData.name_pt);
    console.log('- description_en:', productData.description_en);
    console.log('- description_pt:', productData.description_pt);
    
    const {
      // Multilingual fields
      name_en,
      name_pt,
      description_en,
      description_pt,
      // Legacy fields (for backward compatibility)
      name,
      description,
      price = 0, // Optional for tech products
      image_url,
      icon_url,
      category,
      categories = [], // New field for multiple categories
      sku,
      product_type = 'mcp_server', // Default to MCP Server
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
    
    // Check if AWS database is connected
    if (!db.isConnected()) {
      throw new Error('AWS Database connection is required to create products. Please ensure you have a working connection to the AWS database.');
    }
    
    try {
      console.log('Executing SQL query with required fields including slug');
      console.log('Values being inserted:');
      console.log('- finalName:', finalName);
      console.log('- finalDescription:', finalDescription);
      console.log('- name_en:', name_en);
      console.log('- name_pt:', name_pt);
      console.log('- description_en:', description_en);
      console.log('- description_pt:', description_pt);
      console.log('- finalSlug:', finalSlug);
      
      const result = await db.query(
        `INSERT INTO products 
        (name, description, name_en, name_pt, description_en, description_pt, 
        price, image_url, icon_url, category, categories, sku, 
        product_type, github_url, official, docs_url, demo_url, language, license, 
        creator, version, installation_command, tags, inventory_count, 
        is_featured, is_active, slug, stars_numeric, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW(), NOW()) 
        RETURNING *`,
        [finalName, finalDescription, name_en, name_pt, description_en, description_pt, 
        price, image_url, icon_url, category, categoriesArray, sku, 
        product_type, github_url, official, docs_url, demo_url, language, license, 
        creator, version, installation_command, tags, inventory_count, 
        is_featured, is_active, finalSlug, stars_numeric]
      );
      
      console.log('Product created successfully:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating product:', error);
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
      
      // Specific error handling for common PostgreSQL errors
      if (error.code === '23505') {
        throw new Error('A product with this slug or SKU already exists');
      }
      
      throw error;
    }
  }
  
  // Update an existing product
  static async update(id, productData) {
    // Extract all possible fields from productData
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
    
    // Check if AWS database is connected
    if (!db.isConnected()) {
      throw new Error('AWS Database connection is required to update products. Please ensure you have a working connection to the AWS database.');
    }
    
    try {
      // Generate slug from name if name is provided but slug isn't
      let slugToUse = slug;
      if (!slugToUse && (name || name_en)) {
        const nameForSlug = name || name_en;
        slugToUse = nameForSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
      addField('slug', slugToUse);
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
      
      const query = `
        UPDATE products 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} 
        RETURNING *
      `;
      
      console.log('Update query:', query);
      console.log('Update values:', values);
      
      const result = await db.query(query, values);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
      
      // Specific error handling for common PostgreSQL errors
      if (error.code === '23505') {
        throw new Error('A product with this slug or SKU already exists');
      }
      
      throw error;
    }
  }
  
  // Delete a product
  static async delete(id) {
    // Check if AWS database is connected
    if (!db.isConnected()) {
      throw new Error('AWS Database connection is required to delete products. Please ensure you have a working connection to the AWS database.');
    }
    
    try {
      const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  }
  
  // Search products by various criteria
  static async search(query, page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;
    
    try {
      const result = await db.query(
        `SELECT * FROM products 
        WHERE name ILIKE $1 
        OR description ILIKE $1 
        OR category ILIKE $1
        OR $1 = ANY(categories)
        OR $1 = ANY(tags)
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3`,
        [searchTerm, limit, offset]
      );
      
      const countResult = await db.query(
        `SELECT COUNT(*) FROM products 
        WHERE name ILIKE $1 
        OR description ILIKE $1 
        OR category ILIKE $1
        OR $1 = ANY(categories)
        OR $1 = ANY(tags)`,
        [searchTerm]
      );
      
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        products: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
  
  // Filter products by category
  static async filterByCategory(category, page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    
    try {
      const result = await db.query(
        `SELECT * FROM products 
        WHERE category = $1 
        OR $1 = ANY(categories)
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3`,
        [category, limit, offset]
      );
      
      const countResult = await db.query(
        `SELECT COUNT(*) FROM products 
        WHERE category = $1 
        OR $1 = ANY(categories)`,
        [category]
      );
      
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        products: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error(`Error filtering products by category ${category}:`, error);
      throw error;
    }
  }
  
  // Filter products by type
  static async filterByType(productType, page = 1, limit = 100) {
    const offset = (page - 1) * limit;
    
    try {
      console.log(`[Model] Filtering by product_type=${productType}, page=${page}, limit=${limit}`);
      
      const result = await db.query(
        'SELECT * FROM products WHERE product_type = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [productType, limit, offset]
      );
      
      console.log(`[Model] Found ${result.rows.length} products of type "${productType}"`);
      
      // If no results, let's also query to see what types actually exist in the database
      if (result.rows.length === 0) {
        console.log('[Model] No products found for this type. Checking available types...');
        const typesResult = await db.query(
          'SELECT DISTINCT product_type, COUNT(*) FROM products GROUP BY product_type'
        );
        console.log('[Model] Available product types in database:', 
          typesResult.rows.map(r => `${r.product_type}: ${r.count}`).join(', ')
        );
      }
      
      const countResult = await db.query(
        'SELECT COUNT(*) FROM products WHERE product_type = $1',
        [productType]
      );
      
      const totalCount = parseInt(countResult.rows[0].count);
      
      return {
        products: result.rows,
        pagination: {
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit
        },
        dataStatus: {
          type: 'success',
          message: `Found ${result.rows.length} products of type ${productType}`,
          source: 'postgres'
        }
      };
    } catch (error) {
      console.error(`Error filtering products by type ${productType}:`, error);
      throw error;
    }
  }
  
  // Get featured products
  static async getFeatured(limit = 6) {
    try {
      const result = await db.query(
        'SELECT * FROM products WHERE is_featured = true AND is_active = true ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }
  
  // Get official products
  static async getOfficial(limit = 10) {
    try {
      const result = await db.query(
        'SELECT * FROM products WHERE official = true ORDER BY stars_numeric DESC LIMIT $1',
        [limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching official products:', error);
      throw error;
    }
  }
  
  // Bulk create products
  static async bulkCreate(productsData) {
    try {
      // Start a transaction
      await db.query('BEGIN');
      
      const createdProducts = [];
      
      for (const productData of productsData) {
        // Generate slug if not provided
        if (!productData.slug && productData.name) {
          productData.slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }
        
        // Convert single category to array if categories is empty
        if (!productData.categories && productData.category) {
          productData.categories = [productData.category];
        }
        
        const result = await Product.create(productData);
        createdProducts.push(result);
      }
      
      // Commit the transaction
      await db.query('COMMIT');
      
      return createdProducts;
    } catch (error) {
      // Rollback in case of error
      await db.query('ROLLBACK');
      console.error('Error in bulk create products:', error);
      throw error;
    }
  }
  
  // Bulk update products
  static async bulkUpdate(productsData) {
    try {
      // Start a transaction
      await db.query('BEGIN');
      
      const updatedProducts = [];
      
      for (const productData of productsData) {
        if (!productData.id) {
          throw new Error('Product ID is required for update');
        }
        
        const result = await Product.update(productData.id, productData);
        updatedProducts.push(result);
      }
      
      // Commit the transaction
      await db.query('COMMIT');
      
      return updatedProducts;
    } catch (error) {
      // Rollback in case of error
      await db.query('ROLLBACK');
      console.error('Error in bulk update products:', error);
      throw error;
    }
  }
  
  // Bulk delete products
  static async bulkDelete(productIds) {
    try {
      // Start a transaction
      await db.query('BEGIN');
      
      const deletedProducts = [];
      
      for (const id of productIds) {
        const result = await Product.delete(id);
        if (result) {
          deletedProducts.push(result);
        }
      }
      
      // Commit the transaction
      await db.query('COMMIT');
      
      return deletedProducts;
    } catch (error) {
      // Rollback in case of error
      await db.query('ROLLBACK');
      console.error('Error in bulk delete products:', error);
      throw error;
    }
  }
}

export default Product;