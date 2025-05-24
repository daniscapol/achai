const { Pool } = require('pg');

const pool = new Pool({
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'achai',
  password: 'TrinityPW1',
  database: 'achai',
  ssl: { rejectUnauthorized: false }
});

async function testProductFetch() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing product fetch for ID 691...\n');
    
    // Test direct database query
    const result = await client.query(`
      SELECT id, name, description, product_type, category, stars_numeric, 
             name_en, name_pt, description_en, description_pt
      FROM products 
      WHERE id = $1
    `, [691]);
    
    if (result.rows.length > 0) {
      const product = result.rows[0];
      console.log('✅ Product found in database:');
      console.log(`   ID: ${product.id}`);
      console.log(`   Name: ${product.name} (${product.name_pt || 'No PT'})`);
      console.log(`   Type: ${product.product_type}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Description: ${product.description}`);
      console.log(`   PT Description: ${product.description_pt || 'No PT description'}`);
      console.log(`   Stars: ${product.stars_numeric}`);
    } else {
      console.log('❌ Product ID 691 not found in database');
    }
    
    // Also check what other IDs exist around that range
    console.log('\n🔍 Checking nearby product IDs:');
    const nearbyResult = await client.query(`
      SELECT id, name, product_type 
      FROM products 
      WHERE id BETWEEN $1 AND $2 
      ORDER BY id
    `, [688, 695]);
    
    nearbyResult.rows.forEach(product => {
      console.log(`   ID ${product.id}: ${product.name} (${product.product_type})`);
    });
    
  } finally {
    client.release();
    pool.end();
  }
}

testProductFetch().catch(console.error);