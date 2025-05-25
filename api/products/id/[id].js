import { testConnection } from '../../_lib/db.js';
import Product from '../../_lib/Product.js';
import ProductMultilingual from '../../_lib/ProductMultilingual.js';

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
      console.log(`Fetching product ID: ${id} with language: ${language}`);
      
      const product = await ProductMultilingual.getById(id, language);
      if (!product) {
        console.log(`Product with ID ${id} not found in database`);
        return res.status(404).json({ error: 'Product not found' });
      }
      
      console.log(`Successfully found product: ${product.name} (ID: ${product.id})`);
      res.status(200).json(product);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in product ID API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product: ' + error.message,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required.',
        source: 'none'
      }
    });
  }
}