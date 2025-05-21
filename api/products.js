import db from '../src/utils/db.js';
import Product from '../src/models/Product.js';

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
    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      
      const result = await Product.getAll(page, limit);
      
      // Add data status information
      if (!result.dataStatus) {
        result.dataStatus = db.getFallbackDataMessage();
      }
      
      res.status(200).json(result);
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