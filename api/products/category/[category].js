const Product = require('../../_lib/Product');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!category) {
      return res.status(400).json({ error: 'Category parameter is required' });
    }

    console.log(`Fetching products for category: ${category}, limit: ${limit}`);

    const products = await Product.getByCategory(category, limit);
    
    res.status(200).json({ 
      products,
      category,
      count: products.length
    });

  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}