const { Pool } = require('pg');

// Database configuration with SSL
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

async function findRemainingAIAgents() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Searching for AI agents that might still need image fixes...\n');
    
    // Search for products that might be AI agents and have problematic images
    const searchQuery = `
      SELECT id, name, image_url, type 
      FROM products 
      WHERE (
        LOWER(name) LIKE '%agent%' OR
        LOWER(name) LIKE '%gpt%' OR 
        LOWER(name) LIKE '%ai%' OR
        LOWER(name) LIKE '%langchain%' OR
        LOWER(name) LIKE '%langraph%' OR
        LOWER(name) LIKE '%crew%' OR
        LOWER(name) LIKE '%auto%' OR
        LOWER(name) LIKE '%baby%' OR
        LOWER(name) LIKE '%meta%' OR
        LOWER(name) LIKE '%semantic%' OR
        LOWER(name) LIKE '%haystack%' OR
        LOWER(name) LIKE '%aider%' OR
        type = 'ai_agent'
      )
      AND (
        image_url LIKE '%emoji%' OR
        image_url LIKE '%🤖%' OR
        image_url LIKE '%🧠%' OR
        image_url = '' OR
        image_url IS NULL OR
        image_url LIKE '%placeholder%'
      )
      ORDER BY name
    `;
    
    const result = await client.query(searchQuery);
    
    console.log(`📊 Found ${result.rows.length} AI agents that might need image fixes:\n`);
    
    if (result.rows.length === 0) {
      console.log('✅ No AI agents found with problematic images!');
      
      // Let's also check all AI agents to see their current status
      const allAgentsQuery = `
        SELECT id, name, image_url, type 
        FROM products 
        WHERE type = 'ai_agent' OR (
          LOWER(name) LIKE '%agent%' OR
          LOWER(name) LIKE '%gpt%' OR 
          LOWER(name) LIKE '%langchain%' OR
          LOWER(name) LIKE '%crew%' OR
          LOWER(name) LIKE '%auto%'
        )
        ORDER BY name
      `;
      
      const allResult = await client.query(allAgentsQuery);
      console.log(`\n📋 All AI agent products (${allResult.rows.length} total):`);
      
      allResult.rows.forEach(product => {
        const imageStatus = product.image_url ? '✅' : '❌';
        console.log(`${imageStatus} ${product.name} (ID: ${product.id})`);
        if (product.image_url) {
          console.log(`   Image: ${product.image_url.substring(0, 80)}${product.image_url.length > 80 ? '...' : ''}`);
        }
        console.log('');
      });
      
    } else {
      result.rows.forEach(product => {
        console.log(`❌ ${product.name} (ID: ${product.id}, Type: ${product.type})`);
        console.log(`   Current image: ${product.image_url || 'NULL'}\n`);
      });
      
      console.log('🔧 These products need image fixes. Creating fix script...');
    }
    
  } catch (error) {
    console.error('❌ Error searching for AI agents:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the search
findRemainingAIAgents().catch(console.error);