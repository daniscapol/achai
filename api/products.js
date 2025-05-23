import { testConnection, getDataSourceInfo } from './_lib/db.js';
import Product from './_lib/Product.js';
import ProductMultilingual from './_lib/ProductMultilingual.js';

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
    
    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const language = req.query.language || req.query.lang || 'en';
      const search = req.query.search || req.query.q;
      const type = req.query.type;
      const category = req.query.category;
      
      let result;
      
      if (search) {
        // Use multilingual search
        result = await ProductMultilingual.search(search, page, limit, language);
      } else if (type) {
        // Get by type with language preference
        result = await ProductMultilingual.getByType(type, page, limit, language);
      } else if (category) {
        // Get by category with language preference  
        const products = await ProductMultilingual.getByCategory(category, limit, language);
        result = {
          products,
          pagination: { currentPage: 1, totalPages: 1, total: products.length },
          dataStatus: { type: 'success', source: 'postgres', message: 'Connected to PostgreSQL database', language }
        };
      } else {
        // Get all with language preference
        result = await ProductMultilingual.getAll(page, limit, language);
      }
      
      res.status(200).json(result);
      
    } else if (req.method === 'POST') {
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