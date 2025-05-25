import { query, testConnection, getDataSourceInfo } from './_lib/db.js';

export default async function handler(req, res) {
  try {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      try {
        // Test basic connection
        await testConnection();
        
        // Test a simple query
        const result = await query('SELECT NOW() as current_time, version() as db_version');
        
        // Get data source info
        const dataSourceInfo = getDataSourceInfo();
        
        // Check if tables exist
        const tablesCheck = await query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('news_articles', 'news_categories', 'courses', 'course_categories')
          ORDER BY table_name
        `);
        
        return res.status(200).json({
          success: true,
          connection: 'Connected',
          timestamp: result.rows[0].current_time,
          database_version: result.rows[0].db_version,
          data_source: dataSourceInfo,
          tables_found: tablesCheck.rows.map(row => row.table_name),
          tables_needed: ['news_articles', 'news_categories', 'courses', 'course_categories'],
          tables_missing: ['news_articles', 'news_categories', 'courses', 'course_categories']
            .filter(table => !tablesCheck.rows.find(row => row.table_name === table))
        });
      } catch (dbError) {
        console.error('Database test error:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Database connection failed',
          message: dbError.message,
          connection: 'Failed'
        });
      }
    }

    return res.status(405).json({ 
      success: false,
      error: `Method ${req.method} not allowed` 
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}