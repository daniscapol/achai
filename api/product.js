import { testConnection } from './_lib/db.js';
import Product from './_lib/Product.js';
import ProductMultilingual from './_lib/ProductMultilingual.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test connection first
    await testConnection();
    
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    if (req.method === 'GET') {
      // Get single product by ID with language preference
      const language = req.query.language || req.query.lang || 'en';
      const product = await ProductMultilingual.getById(id, language);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json(product);
      
    } else if (req.method === 'DELETE') {
      // Delete product by ID
      const deleted = await Product.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json({ 
        message: 'Product deleted successfully',
        id: deleted.id 
      });
      
    } else if (req.method === 'PUT') {
      // Update product by ID
      const productData = req.body;
      
      // Map category to product_type if needed
      if (productData.category === 'AI Agent') {
        productData.product_type = 'ai_agent';
      } else if (productData.category === 'MCP Client') {
        productData.product_type = 'mcp_client';
      } else {
        productData.product_type = 'mcp_server';
      }
      
      const updatedProduct = await Product.updateById(id, productData);
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json(updatedProduct);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in product API:', error);
    res.status(500).json({ 
      error: 'Failed to process product: ' + error.message,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required.',
        source: 'none'
      }
    });
  }
}