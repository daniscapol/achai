import { query } from '../_lib/db.js';

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
      try {
        const result = await query(`
          SELECT DISTINCT category_name as name, category_slug as slug
          FROM courses 
          WHERE status = 'published' AND category_name IS NOT NULL
          ORDER BY category_name
        `);
        
        return res.status(200).json({
          success: true,
          data: result.rows
        });

      } catch (dbError) {
        console.error('Database Error:', dbError);
        return res.status(500).json({ 
          success: false,
          error: 'Database connection failed',
          message: dbError.message 
        });
      }
    }

    return res.status(405).json({ 
      success: false,
      error: `Method ${method} not allowed` 
    });

  } catch (error) {
    console.error('Course Categories API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}