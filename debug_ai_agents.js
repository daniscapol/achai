const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  user: 'achai',
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: 'achai',
  password: 'TrinityPW1',
  port: 5432,
});

async function debugAIAgents() {
  try {
    console.log('🔍 Debugging AI Agents in database...\n');

    // First, let's see the table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `;
    
    const structureResult = await pool.query(structureQuery);
    console.log('📋 Table structure:');
    structureResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    console.log('');

    // Count total products
    const totalQuery = 'SELECT COUNT(*) as total FROM products';
    const totalResult = await pool.query(totalQuery);
    console.log(`📊 Total products in database: ${totalResult.rows[0].total}\n`);

    // Check products by product_type = 'ai_agent'
    const aiAgentTypeQuery = `
      SELECT COUNT(*) as count 
      FROM products 
      WHERE product_type = 'ai_agent'
    `;
    const aiAgentTypeResult = await pool.query(aiAgentTypeQuery);
    console.log(`🤖 Products with product_type = 'ai_agent': ${aiAgentTypeResult.rows[0].count}`);

    // Check products by category = 'AI Agent'
    const aiAgentCategoryQuery = `
      SELECT COUNT(*) as count 
      FROM products 
      WHERE category = 'AI Agent'
    `;
    const aiAgentCategoryResult = await pool.query(aiAgentCategoryQuery);
    console.log(`🏷️  Products with category = 'AI Agent': ${aiAgentCategoryResult.rows[0].count}`);

    // Check all distinct product_types
    const typesQuery = `
      SELECT product_type, COUNT(*) as count 
      FROM products 
      GROUP BY product_type 
      ORDER BY count DESC
    `;
    const typesResult = await pool.query(typesQuery);
    console.log('\n📋 All product types:');
    typesResult.rows.forEach(row => {
      console.log(`  ${row.product_type || 'NULL'}: ${row.count}`);
    });

    // Check all distinct categories
    const categoriesQuery = `
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category 
      ORDER BY count DESC
    `;
    const categoriesResult = await pool.query(categoriesQuery);
    console.log('\n🗂️  All categories:');
    categoriesResult.rows.forEach(row => {
      console.log(`  ${row.category || 'NULL'}: ${row.count}`);
    });

    // Get sample AI agent records
    const sampleQuery = `
      SELECT id, name, product_type, category 
      FROM products 
      WHERE product_type = 'ai_agent' OR category = 'AI Agent'
      LIMIT 10
    `;
    const sampleResult = await pool.query(sampleQuery);
    console.log('\n🔍 Sample AI agent records:');
    sampleResult.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Name: ${row.name}, Type: ${row.product_type}, Category: ${row.category}`);
    });

    // Check for case sensitivity issues
    const caseQuery = `
      SELECT DISTINCT product_type 
      FROM products 
      WHERE LOWER(product_type) LIKE '%ai%' OR LOWER(product_type) LIKE '%agent%'
    `;
    const caseResult = await pool.query(caseQuery);
    console.log('\n🔤 Product types containing "ai" or "agent" (case insensitive):');
    caseResult.rows.forEach(row => {
      console.log(`  "${row.product_type}"`);
    });

  } catch (error) {
    console.error('❌ Error querying database:', error);
  } finally {
    await pool.end();
  }
}

debugAIAgents();