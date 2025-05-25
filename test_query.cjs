const { Pool } = require('pg');

const pool = new Pool({
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'achai',
  password: 'TrinityPW1',
  database: 'achai',
  ssl: { rejectUnauthorized: false }
});

async function testQuery() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing your original query...\n');
    
    const result = await client.query(`
      SELECT id, product_type, "name", slug, description, long_description, 
             image_path, stars_numeric, category, github_url, npm_url, 
             created_by, "language", official, created_at, updated_at, 
             price, image_url, external_url, is_featured, is_active, 
             rating, reviews_count, sku, inventory_count, icon_url, 
             categories, docs_url, demo_url, license, creator, "version", 
             installation_command, tags, name_en, name_pt, description_en, 
             description_pt, language_code
      FROM public.products 
      WHERE product_type = 'ai_agent'
      ORDER BY stars_numeric DESC
      LIMIT 10
    `);
    
    console.log(`📊 Found ${result.rows.length} AI agents in database:`);
    
    result.rows.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.name_pt || 'No PT translation'})`);
      console.log(`   Type: ${agent.product_type}, Category: ${agent.category}`);
      console.log(`   Stars: ${agent.stars_numeric}, Featured: ${agent.is_featured}`);
      console.log(`   Description: ${agent.description}`);
      console.log(`   PT Description: ${agent.description_pt || 'No translation'}`);
      console.log('');
    });
    
  } finally {
    client.release();
    pool.end();
  }
}

testQuery().catch(console.error);