import { testConnection } from '../../_lib/db.js';
import Product from '../../_lib/Product.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Test connection first
      await testConnection();
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      
      // Check for multiple possible AI agent types
      let result = await Product.getByType('ai_agent', page, limit);
      
      // If no ai_agent found, try 'agent' type as fallback
      if (result.products.length === 0) {
        result = await Product.getByType('agent', page, limit);
      }
      res.status(200).json(result);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in products/type/ai_agent API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch AI agents: ' + error.message,
      dataStatus: {
        type: 'error',
        message: 'AWS Database connection required.',
        source: 'none'
      }
    });
  }
}