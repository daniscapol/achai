import { testConnection, getDataSourceInfo } from './_lib/db.js';
import Product from './_lib/Product.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test connection first
    await testConnection();
    
    // Extract ID from URL path if present (e.g., /api/products/123)
    const url = req.url;
    const pathParts = url.split('?')[0].split('/');
    const productId = pathParts[pathParts.length - 1];
    const isIdRoute = productId && productId !== 'products' && /^\d+$/.test(productId);
    
    if (req.method === 'GET' && !isIdRoute) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      
      const result = await Product.getAll(page, limit);
      res.status(200).json(result);
      
    } else if (req.method === 'GET' && isIdRoute) {
      // Get single product by ID
      const product = await Product.getById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json(product);
      
    } else if (req.method === 'DELETE' && isIdRoute) {
      // Delete product by ID
      const deleted = await Product.deleteById(productId);
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json({ 
        message: 'Product deleted successfully',
        id: deleted.id 
      });
      
    } else if (req.method === 'PUT' && isIdRoute) {
      // Update product by ID
      const productData = req.body;
      const updatedProduct = await Product.updateById(productId, productData);
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json(updatedProduct);
      
    } else if (req.method === 'POST' && !isIdRoute) {
      const productData = req.body;
      
      // Generate slug if not provided
      if (!productData.slug) {
        productData.slug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      // Generate SKU if not provided
      if (!productData.sku) {
        productData.sku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      
      // Map category to product_type if needed
      if (productData.category === 'AI Agent') {
        productData.product_type = 'ai_agent';
      } else if (productData.category === 'MCP Client') {
        productData.product_type = 'mcp_client';
      } else {
        productData.product_type = 'mcp_server';
      }
      
      const newProduct = await Product.create(productData);
      res.status(201).json(newProduct);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in products API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products from AWS database: ' + error.message,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required. Cannot access data without database connection.',
        source: 'none'
      }
    });
  }
}