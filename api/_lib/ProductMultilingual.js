import { query } from './db.js';

export class ProductMultilingual {
  // Get all products with language preference
  static async getAll(page = 1, limit = 100, language = 'en') {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countResult = await query('SELECT COUNT(*) FROM products WHERE is_active = TRUE');
      const total = parseInt(countResult.rows[0].count);
      
      // Get products with language preference
      const productsResult = await query(`
        SELECT 
          id,
          CASE 
            WHEN $1 = 'pt' AND name_pt IS NOT NULL AND name_pt != '' THEN name_pt
            ELSE COALESCE(name_en, name)
          END as name,
          CASE 
            WHEN $1 = 'pt' AND description_pt IS NOT NULL AND description_pt != '' THEN description_pt
            ELSE COALESCE(description_en, description)
          END as description,
          name_en,
          name_pt,
          description_en,
          description_pt,
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
          stars_numeric,
          language_code,
          created_at,
          updated_at
        FROM products 
        WHERE is_active = TRUE 
        ORDER BY is_featured DESC, created_at DESC 
        LIMIT $2 OFFSET $3
      `, [language, limit, offset]);
      
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
          message: 'Connected to PostgreSQL database',
          language: language
        }
      };
    } catch (error) {
      console.error('Error in ProductMultilingual.getAll:', error);
      throw error;
    }
  }
  
  // Get product by ID with language preference
  static async getById(id, language = 'en') {
    try {
      const result = await query(`
        SELECT 
          id,
          CASE 
            WHEN $2 = 'pt' AND name_pt IS NOT NULL AND name_pt != '' THEN name_pt
            ELSE COALESCE(name_en, name)
          END as name,
          CASE 
            WHEN $2 = 'pt' AND description_pt IS NOT NULL AND description_pt != '' THEN description_pt
            ELSE COALESCE(description_en, description)
          END as description,
          name_en,
          name_pt,
          description_en,
          description_pt,
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
          stars_numeric,
          language_code,
          created_at,
          updated_at
        FROM products 
        WHERE id = $1 AND is_active = TRUE
      `, [id, language]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in ProductMultilingual.getById:', error);
      throw error;
    }
  }
  
  // Get products by type with language preference
  static async getByType(productType, page = 1, limit = 100, language = 'en') {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count for this type
      const countResult = await query(
        'SELECT COUNT(*) FROM products WHERE product_type = $1 AND is_active = TRUE', 
        [productType]
      );
      const total = parseInt(countResult.rows[0].count);
      
      // Get products of this type with language preference
      const productsResult = await query(`
        SELECT 
          id,
          CASE 
            WHEN $4 = 'pt' AND name_pt IS NOT NULL AND name_pt != '' THEN name_pt
            ELSE COALESCE(name_en, name)
          END as name,
          CASE 
            WHEN $4 = 'pt' AND description_pt IS NOT NULL AND description_pt != '' THEN description_pt
            ELSE COALESCE(description_en, description)
          END as description,
          name_en,
          name_pt,
          description_en,
          description_pt,
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
          stars_numeric,
          language_code,
          created_at,
          updated_at
        FROM products 
        WHERE product_type = $1 AND is_active = TRUE 
        ORDER BY is_featured DESC, created_at DESC 
        LIMIT $2 OFFSET $3
      `, [productType, limit, offset, language]);
      
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
          message: 'Connected to PostgreSQL database',
          language: language
        }
      };
    } catch (error) {
      console.error('Error in ProductMultilingual.getByType:', error);
      throw error;
    }
  }
  
  // Search products in multiple languages
  static async search(searchTerm, page = 1, limit = 100, language = 'en') {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      
      // Get total count for search results
      const countResult = await query(`
        SELECT COUNT(*) FROM products 
        WHERE is_active = TRUE AND (
          LOWER(COALESCE(name_en, name)) LIKE $1 OR
          LOWER(COALESCE(name_pt, '')) LIKE $1 OR
          LOWER(COALESCE(description_en, description)) LIKE $1 OR
          LOWER(COALESCE(description_pt, '')) LIKE $1 OR
          LOWER(category) LIKE $1 OR
          LOWER(creator) LIKE $1 OR
          LOWER(language) LIKE $1 OR
          $2 = ANY(tags)
        )
      `, [searchPattern, searchTerm.toLowerCase()]);
      
      const total = parseInt(countResult.rows[0].count);
      
      // Get search results with language preference
      const productsResult = await query(`
        SELECT 
          id,
          CASE 
            WHEN $5 = 'pt' AND name_pt IS NOT NULL AND name_pt != '' THEN name_pt
            ELSE COALESCE(name_en, name)
          END as name,
          CASE 
            WHEN $5 = 'pt' AND description_pt IS NOT NULL AND description_pt != '' THEN description_pt
            ELSE COALESCE(description_en, description)
          END as description,
          name_en,
          name_pt,
          description_en,
          description_pt,
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
          stars_numeric,
          language_code,
          created_at,
          updated_at,
          CASE
            WHEN LOWER(COALESCE(name_en, name)) LIKE $1 OR LOWER(COALESCE(name_pt, '')) LIKE $1 THEN 1
            WHEN LOWER(COALESCE(description_en, description)) LIKE $1 OR LOWER(COALESCE(description_pt, '')) LIKE $1 THEN 2
            WHEN LOWER(category) LIKE $1 THEN 3
            WHEN LOWER(creator) LIKE $1 THEN 4
            ELSE 5
          END as relevance_score
        FROM products 
        WHERE is_active = TRUE AND (
          LOWER(COALESCE(name_en, name)) LIKE $1 OR
          LOWER(COALESCE(name_pt, '')) LIKE $1 OR
          LOWER(COALESCE(description_en, description)) LIKE $1 OR
          LOWER(COALESCE(description_pt, '')) LIKE $1 OR
          LOWER(category) LIKE $1 OR
          LOWER(creator) LIKE $1 OR
          LOWER(language) LIKE $1 OR
          $2 = ANY(tags)
        )
        ORDER BY 
          relevance_score,
          is_featured DESC, 
          created_at DESC 
        LIMIT $3 OFFSET $4
      `, [searchPattern, searchTerm.toLowerCase(), limit, offset, language]);
      
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
          message: 'Connected to PostgreSQL database',
          language: language
        }
      };
    } catch (error) {
      console.error('Error in ProductMultilingual.search:', error);
      throw error;
    }
  }
  
  // Create or update multilingual product
  static async createMultilingual(productData) {
    try {
      const {
        name_en,
        name_pt,
        description_en,
        description_pt,
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
        stars_numeric = 0,
        language_code = 'multi'
      } = productData;

      // Set fallback values for name and description
      const finalNameEn = name_en || productData.name;
      const finalNamePt = name_pt || name_en || productData.name;
      const finalDescEn = description_en || productData.description;
      const finalDescPt = description_pt || description_en || productData.description;

      const result = await query(`
        INSERT INTO products (
          name, name_en, name_pt, description, description_en, description_pt,
          price, image_url, icon_url, category, categories, sku, product_type, 
          github_url, official, docs_url, demo_url, language, license, creator, 
          version, installation_command, tags, inventory_count, is_featured, 
          is_active, slug, stars_numeric, language_code
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        ) RETURNING *
      `, [
        finalNameEn, finalNameEn, finalNamePt, finalDescEn, finalDescEn, finalDescPt,
        price, image_url, icon_url, category, categories || [category], sku, 
        product_type, github_url, official, docs_url, demo_url, language, license, 
        creator, version, installation_command, tags, inventory_count, is_featured, 
        is_active, slug, stars_numeric, language_code
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error in ProductMultilingual.createMultilingual:', error);
      throw error;
    }
  }
  
  // Update multilingual product
  static async updateMultilingual(id, productData) {
    try {
      const {
        name_en,
        name_pt,
        description_en,
        description_pt,
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
        stars_numeric,
        language_code
      } = productData;

      // Update both legacy and new language fields
      const result = await query(`
        UPDATE products SET
          name = COALESCE($1, name_en, name),
          name_en = COALESCE($1, name_en),
          name_pt = COALESCE($2, name_pt),
          description = COALESCE($3, description_en, description),
          description_en = COALESCE($3, description_en),
          description_pt = COALESCE($4, description_pt),
          price = COALESCE($5, price),
          image_url = COALESCE($6, image_url),
          icon_url = COALESCE($7, icon_url),
          category = COALESCE($8, category),
          categories = COALESCE($9, categories),
          sku = COALESCE($10, sku),
          product_type = COALESCE($11, product_type),
          github_url = COALESCE($12, github_url),
          official = COALESCE($13, official),
          docs_url = COALESCE($14, docs_url),
          demo_url = COALESCE($15, demo_url),
          language = COALESCE($16, language),
          license = COALESCE($17, license),
          creator = COALESCE($18, creator),
          version = COALESCE($19, version),
          installation_command = COALESCE($20, installation_command),
          tags = COALESCE($21, tags),
          inventory_count = COALESCE($22, inventory_count),
          is_featured = COALESCE($23, is_featured),
          is_active = COALESCE($24, is_active),
          slug = COALESCE($25, slug),
          stars_numeric = COALESCE($26, stars_numeric),
          language_code = COALESCE($27, language_code),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $28 AND is_active = TRUE
        RETURNING *
      `, [
        name_en, name_pt, description_en, description_pt, price, image_url, 
        icon_url, category, categories, sku, product_type, github_url, official,
        docs_url, demo_url, language, license, creator, version, 
        installation_command, tags, inventory_count, is_featured, is_active, 
        slug, stars_numeric, language_code, id
      ]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in ProductMultilingual.updateMultilingual:', error);
      throw error;
    }
  }
  
  // Get by category with language preference  
  static async getByCategory(category, limit = 10, language = 'en') {
    try {
      const result = await query(`
        SELECT 
          id,
          CASE 
            WHEN $3 = 'pt' AND name_pt IS NOT NULL AND name_pt != '' THEN name_pt
            ELSE COALESCE(name_en, name)
          END as name,
          CASE 
            WHEN $3 = 'pt' AND description_pt IS NOT NULL AND description_pt != '' THEN description_pt
            ELSE COALESCE(description_en, description)
          END as description,
          name_en,
          name_pt,
          description_en,
          description_pt,
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
          stars_numeric,
          language_code,
          created_at,
          updated_at
        FROM products 
        WHERE category = $1 AND is_active = TRUE 
        ORDER BY is_featured DESC, created_at DESC 
        LIMIT $2
      `, [category, limit, language]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in ProductMultilingual.getByCategory:', error);
      throw error;
    }
  }

  // Soft delete (same as original)
  static async deleteById(id) {
    try {
      const result = await query(`
        UPDATE products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND is_active = TRUE
        RETURNING id
      `, [id]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in ProductMultilingual.deleteById:', error);
      throw error;
    }
  }
}

export default ProductMultilingual;