import { testConnection, getDataSourceInfo } from '../_lib/db.js';

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

  if (req.method === 'GET') {
    try {
      // Test connection first
      await testConnection();
      const dataStatus = getDataSourceInfo();
      res.status(200).json(dataStatus);
    } catch (error) {
      console.error('Error getting data status:', error);
      res.status(500).json({
        type: 'error',
        message: 'AWS Database connection required. Cannot proceed without database connection.',
        source: 'none',
        error: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}