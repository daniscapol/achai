import { News } from '../../src/utils/News.js';

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (method === 'GET') {
      const categories = await News.getCategories();
      return res.status(200).json({ 
        success: true,
        data: categories 
      });
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} not allowed` });

  } catch (error) {
    console.error('News Categories API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}