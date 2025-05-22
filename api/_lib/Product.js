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
}

export default Product;