import db from './src/utils/db.js';

async function checkSchema() {
  try {
    await db.testConnection();
    console.log('📊 Database connection established');
    
    const result = await db.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'news_articles\' ORDER BY ordinal_position');
    console.log('News articles columns:', result.rows.map(r => r.column_name));
    
    const courses = await db.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'courses\' ORDER BY ordinal_position');
    console.log('Courses columns:', courses.rows.map(r => r.column_name));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();