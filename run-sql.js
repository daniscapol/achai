import fs from 'fs';
import pg from 'pg';

const dbConfig = {
  user: process.env.DB_USER || 'achai',
  host: process.env.DB_HOST || 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: process.env.DB_NAME || 'achai',
  password: process.env.DB_PASSWORD || 'TrinityPW1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: { rejectUnauthorized: false }
};

async function runSQL() {
  const client = new pg.Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');
    
    console.log('Reading SQL file...');
    const sql = fs.readFileSync('./create-tables-only.sql', 'utf8');
    
    console.log('Executing SQL...');
    await client.query(sql);
    
    console.log('✅ Tables created and sample data inserted successfully!');
    
    // Test the data
    const newsCount = await client.query('SELECT COUNT(*) FROM news_articles WHERE status = $1', ['published']);
    const coursesCount = await client.query('SELECT COUNT(*) FROM courses WHERE status = $1', ['published']);
    
    console.log(`📰 News articles: ${newsCount.rows[0].count}`);
    console.log(`📚 Courses: ${coursesCount.rows[0].count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

runSQL();