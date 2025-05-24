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

async function debugAIAgents() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Debugging AI Agents in Database...\n');
    
    // Check total products
    const totalQuery = 'SELECT COUNT(*) FROM products WHERE is_active = TRUE';
    const totalResult = await client.query(totalQuery);
    console.log(`📊 Total active products: ${totalResult.rows[0].count}`);
    
    // Check by product_type
    const productTypeQuery = `
      SELECT product_type, COUNT(*) 
      FROM products 
      WHERE is_active = TRUE 
      GROUP BY product_type 
      ORDER BY COUNT(*) DESC
    `;
    const productTypeResult = await client.query(productTypeQuery);
    console.log('\n📋 Products by product_type:');
    productTypeResult.rows.forEach(row => {
      console.log(`   ${row.product_type || 'NULL'}: ${row.count}`);
    });
    
    // Check by category
    const categoryQuery = `
      SELECT category, COUNT(*) 
      FROM products 
      WHERE is_active = TRUE 
      GROUP BY category 
      ORDER BY COUNT(*) DESC
    `;
    const categoryResult = await client.query(categoryQuery);
    console.log('\n📋 Products by category:');
    categoryResult.rows.forEach(row => {
      console.log(`   ${row.category || 'NULL'}: ${row.count}`);
    });
    
    // Specific AI agent queries
    const aiAgentQueries = [
      {
        name: "product_type = 'ai_agent'",
        query: "SELECT COUNT(*) FROM products WHERE is_active = TRUE AND product_type = 'ai_agent'"
      },
      {
        name: "category = 'AI Agent'", 
        query: "SELECT COUNT(*) FROM products WHERE is_active = TRUE AND category = 'AI Agent'"
      },
      {
        name: "name contains 'agent' (case insensitive)",
        query: "SELECT COUNT(*) FROM products WHERE is_active = TRUE AND LOWER(name) LIKE '%agent%'"
      },
      {
        name: "Combined AI agent conditions",
        query: "SELECT COUNT(*) FROM products WHERE is_active = TRUE AND (product_type = 'ai_agent' OR category = 'AI Agent' OR LOWER(name) LIKE '%agent%')"
      }
    ];
    
    console.log('\n🤖 AI Agent specific counts:');
    for (const queryObj of aiAgentQueries) {
      const result = await client.query(queryObj.query);
      console.log(`   ${queryObj.name}: ${result.rows[0].count}`);
    }
    
    // Get sample AI agent products
    const sampleQuery = `
      SELECT id, name, category, product_type, is_active
      FROM products 
      WHERE is_active = TRUE 
        AND (product_type = 'ai_agent' OR category = 'AI Agent' OR LOWER(name) LIKE '%agent%')
      ORDER BY name
      LIMIT 10
    `;
    const sampleResult = await client.query(sampleQuery);
    console.log('\n🔍 Sample AI Agent products:');
    sampleResult.rows.forEach(row => {
      console.log(`   ID: ${row.id}, Name: "${row.name}", Category: "${row.category}", Type: "${row.product_type}"`);
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
debugAIAgents().catch(console.error);