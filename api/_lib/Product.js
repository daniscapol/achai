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
        name,
        description,
        price = 0,
        image_url,
        icon_url,
        category,
        categories,
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

      const result = await query(`
        INSERT INTO products (
          name, description, price, image_url, icon_url, category, categories, 
          sku, product_type, github_url, official, docs_url, demo_url, language, 
          license, creator, version, installation_command, tags, inventory_count, 
          is_featured, is_active, slug, stars_numeric
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
          $16, $17, $18, $19, $20, $21, $22, $23, $24
        ) RETURNING *
      `, [
        name, description, price, image_url, icon_url, category, 
        categories || [category], sku, product_type, github_url, official, 
        docs_url, demo_url, language, license, creator, version, 
        installation_command, tags, inventory_count, is_featured, is_active, 
        slug, stars_numeric
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error in Product.create:', error);
      throw error;
    }
  }
  
  static async updateById(id, productData) {
    try {
      const {
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

      const result = await query(`
        UPDATE products SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          image_url = COALESCE($4, image_url),
          icon_url = COALESCE($5, icon_url),
          category = COALESCE($6, category),
          categories = COALESCE($7, categories),
          sku = COALESCE($8, sku),
          product_type = COALESCE($9, product_type),
          github_url = COALESCE($10, github_url),
          official = COALESCE($11, official),
          docs_url = COALESCE($12, docs_url),
          demo_url = COALESCE($13, demo_url),
          language = COALESCE($14, language),
          license = COALESCE($15, license),
          creator = COALESCE($16, creator),
          version = COALESCE($17, version),
          installation_command = COALESCE($18, installation_command),
          tags = COALESCE($19, tags),
          inventory_count = COALESCE($20, inventory_count),
          is_featured = COALESCE($21, is_featured),
          is_active = COALESCE($22, is_active),
          slug = COALESCE($23, slug),
          stars_numeric = COALESCE($24, stars_numeric),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $25 AND is_active = TRUE
        RETURNING *
      `, [
        name, description, price, image_url, icon_url, category,
        categories, sku, product_type, github_url, official,
        docs_url, demo_url, language, license, creator, version,
        installation_command, tags, inventory_count, is_featured,
        is_active, slug, stars_numeric, id
      ]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in Product.updateById:', error);
      throw error;
    }
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