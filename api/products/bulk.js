import { testConnection } from '../_lib/db.js';
import Product from '../_lib/Product.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test connection first
    await testConnection();
    
    if (req.method === 'POST') {
      const productsData = req.body;
      
      if (!Array.isArray(productsData)) {
        return res.status(400).json({ error: 'Expected array of products' });
      }
      
      const createdProducts = [];
      
      for (const productData of productsData) {
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
        
        const newProduct = await Product.create(productData);
        createdProducts.push(newProduct);
      }
      
      res.status(201).json({
        message: `Successfully created ${createdProducts.length} products`,
        products: createdProducts
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in products/bulk API:', error);
    res.status(500).json({ 
      error: 'Failed to create products: ' + error.message,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required.',
        source: 'none'
      }
    });
  }
}