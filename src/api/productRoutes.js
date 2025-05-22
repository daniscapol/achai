import { Router } from 'express';
import Product from '../models/Product.js';
import db from '../utils/db.js';

// Create Express router
const router = Router();

// GET all products with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    
    const result = await Product.getAll(page, limit);
    // Add data status information
    if (!result.dataStatus) {
      result.dataStatus = db.getFallbackDataMessage();
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products from AWS database: ' + error.message,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required. Cannot access data without database connection.',
        source: 'none'
      }
    });
  }
});

// GET product by ID
router.get('/id/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        dataStatus: db.getFallbackDataMessage()
      });
    }
    
    // Add data status to the response
    res.json({
      ...product,
      dataStatus: db.getFallbackDataMessage()
    });
  } catch (error) {
    console.error(`Error fetching product with ID ${req.params.id}:`, error);
    res.status(500).json({ 
      error: `Failed to fetch product from AWS database: ${error.message}`, 
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required. Cannot access data without database connection.',
        source: 'none'
      }
    });
  }
});

// GET product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
    const product = result.rows[0];
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        dataStatus: db.getFallbackDataMessage()
      });
    }
    
    // Add data status to the response
    res.json({
      ...product,
      dataStatus: db.getFallbackDataMessage()
    });
  } catch (error) {
    console.error(`Error fetching product with slug ${req.params.slug}:`, error);
    res.status(500).json({ 
      error: `Failed to fetch product from AWS database: ${error.message}`,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required. Cannot access data without database connection.',
        source: 'none'
      }
    });
  }
});

// POST create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(`Error updating product with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.delete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error(`Error deleting product with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET search products
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Search query is required',
        dataStatus: db.getFallbackDataMessage()
      });
    }
    
    const result = await Product.search(query, page, limit);
    // Add data status if not already included
    if (!result.dataStatus) {
      result.dataStatus = db.getFallbackDataMessage();
    }
    res.json(result);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ 
      error: `Failed to search products from AWS database: ${error.message}`,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required. Cannot access data without database connection.',
        source: 'none'
      }
    });
  }
});

// GET filter products by category 
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    
    const result = await Product.filterByCategory(category, page, limit);
    // Add data status if not already included
    if (!result.dataStatus) {
      result.dataStatus = db.getFallbackDataMessage();
    }
    res.json(result);
  } catch (error) {
    console.error(`Error filtering products by category ${req.params.category}:`, error);
    res.status(500).json({ 
      error: `Failed to filter products by category from AWS database: ${error.message}`,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required. Cannot access data without database connection.',
        source: 'none'
      }
    });
  }
});

// GET filter by product type (mcp_server, mcp_client, ai_agent, ready_to_use)
router.get('/type/:productType', async (req, res) => {
  try {
    const { productType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    
    const result = await Product.filterByType(productType, page, limit);
    // Add data status if not already included
    if (!result.dataStatus) {
      result.dataStatus = db.getFallbackDataMessage();
    }
    res.json(result);
  } catch (error) {
    console.error(`Error filtering products by type ${req.params.productType}:`, error);
    res.status(500).json({ 
      error: `Failed to filter products by type from AWS database: ${error.message}`,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required. Cannot access data without database connection.',
        source: 'none'
      }
    });
  }
});

// GET featured products
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const featuredProducts = await Product.getFeatured(limit);
    res.json({
      products: featuredProducts,
      dataStatus: db.getFallbackDataMessage()
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ 
      error: `Failed to fetch featured products from AWS database: ${error.message}`,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required. Cannot access data without database connection.',
        source: 'none'
      }
    });
  }
});

// GET official products
router.get('/official', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const officialProducts = await Product.getOfficial(limit);
    res.json({
      products: officialProducts,
      dataStatus: db.getFallbackDataMessage()
    });
  } catch (error) {
    console.error('Error fetching official products:', error);
    res.status(500).json({ 
      error: `Failed to fetch official products from AWS database: ${error.message}`,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required. Cannot access data without database connection.',
        source: 'none'
      }
    });
  }
});

// POST bulk create products
router.post('/bulk', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }
    
    const createdProducts = await Product.bulkCreate(products);
    res.status(201).json(createdProducts);
  } catch (error) {
    console.error('Error bulk creating products:', error);
    res.status(500).json({ error: 'Failed to bulk create products', details: error.message });
  }
});

// PUT bulk update products
router.put('/bulk', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }
    
    // Check that each product has an ID
    const missingIds = products.some(product => !product.id);
    if (missingIds) {
      return res.status(400).json({ error: 'All products must have an ID for bulk update' });
    }
    
    const updatedProducts = await Product.bulkUpdate(products);
    res.json(updatedProducts);
  } catch (error) {
    console.error('Error bulk updating products:', error);
    res.status(500).json({ error: 'Failed to bulk update products', details: error.message });
  }
});

// DELETE bulk delete products
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }
    
    const deletedProducts = await Product.bulkDelete(ids);
    res.json({ 
      message: `Successfully deleted ${deletedProducts.length} products`, 
      deletedProducts 
    });
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    res.status(500).json({ error: 'Failed to bulk delete products' });
  }
});

// GET data source information with enhanced details
router.get('/data-status', async (req, res) => {
  try {
    // Check if database is connected
    if (db.isConnected()) {
      const dbInfo = await db.query('SELECT version(), current_database(), inet_server_addr() as host');
      const countResult = await db.query('SELECT COUNT(*) FROM products');
      const productCount = parseInt(countResult.rows[0].count);
      
      // Get type counts
      const typeCountsResult = await db.query(`
        SELECT product_type, COUNT(*) 
        FROM products 
        GROUP BY product_type 
        ORDER BY COUNT(*) DESC
      `);
      
      const typeCounts = typeCountsResult.rows.reduce((acc, row) => {
        acc[row.product_type || 'unknown'] = parseInt(row.count);
        return acc;
      }, {});
      
      res.json({
        type: 'success',
        source: 'postgres',
        message: 'Connected to AWS PostgreSQL database',
        host: dbInfo.rows[0].host,
        database: dbInfo.rows[0].current_database,
        version: dbInfo.rows[0].version,
        stats: {
          total_products: productCount,
          type_counts: typeCounts
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        type: 'error',
        source: 'none',
        message: 'AWS Database connection required. Cannot proceed without database connection.',
        error: 'Database connection required',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching data status:', error);
    res.status(500).json({ 
      type: 'error',
      source: 'none',
      message: 'Failed to connect to AWS database.',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;