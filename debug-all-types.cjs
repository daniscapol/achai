const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: 'achai',
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: 'achai',
  password: 'TrinityPW1',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function debugAllTypes() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Debugging All Product Types...\n');
    
    // Check specific product type counts
    const productTypes = ['mcp_server', 'mcp_client', 'ai_agent'];
    
    for (const type of productTypes) {
      const query = `
        SELECT COUNT(*) as count
        FROM products 
        WHERE is_active = TRUE AND product_type = $1
      `;
      const result = await client.query(query, [type]);
      console.log(`📊 ${type}: ${result.rows[0].count} products`);
      
      // Get sample products for this type
      const sampleQuery = `
        SELECT id, name, category, product_type
        FROM products 
        WHERE is_active = TRUE AND product_type = $1
        ORDER BY name
        LIMIT 5
      `;
      const sampleResult = await client.query(sampleQuery, [type]);
      console.log(`   Sample ${type} products:`);
      sampleResult.rows.forEach(row => {
        console.log(`   - ID: ${row.id}, Name: "${row.name}"`);
      });
      console.log('');
    }
    
    // Test what the API would return for each type
    console.log('🔍 Testing what first 50 products contain by type:');
    const first50Query = `
      SELECT product_type, COUNT(*) as count
      FROM (
        SELECT product_type 
        FROM products 
        WHERE is_active = TRUE 
        ORDER BY is_featured DESC, created_at DESC 
        LIMIT 50
      ) first_50
      GROUP BY product_type
      ORDER BY count DESC
    `;
    const first50Result = await client.query(first50Query);
    console.log('   First 50 products breakdown:');
    first50Result.rows.forEach(row => {
      console.log(`   - ${row.product_type}: ${row.count}`);
    });
    
    console.log('\n✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the debug
debugAllTypes().catch(console.error);