import { testConnection, query } from '../_lib/db.js';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    await testConnection();
    
    // Get database info
    const dbInfo = await query('SELECT version(), current_database(), inet_server_addr() as host');
    const countResult = await query('SELECT COUNT(*) FROM products');
    const productCount = parseInt(countResult.rows[0].count);
    
    // Get type counts
    const typeCountsResult = await query(`
      SELECT product_type, COUNT(*) 
      FROM products 
      GROUP BY product_type 
      ORDER BY COUNT(*) DESC
    `);
    
    const typeCounts = typeCountsResult.rows.reduce((acc, row) => {
      acc[row.product_type || 'unknown'] = parseInt(row.count);
      return acc;
    }, {});
    
    res.status(200).json({
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
}