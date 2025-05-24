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
    
    // First, let's check what columns exist in the products table
    const columnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('📋 Available columns:', columnsResult.rows.map(r => r.column_name).join(', '));
    console.log('');
    
    // Search for products that might be AI agents and have problematic images
    const searchQuery = `
      SELECT id, name, image_url 
      FROM products 
      WHERE (
        LOWER(name) LIKE '%agent%' OR
        LOWER(name) LIKE '%gpt%' OR 
        LOWER(name) LIKE '%langchain%' OR
        LOWER(name) LIKE '%langraph%' OR
        LOWER(name) LIKE '%crew%' OR
        LOWER(name) LIKE '%auto%' OR
        LOWER(name) LIKE '%baby%' OR
        LOWER(name) LIKE '%meta%' OR
        LOWER(name) LIKE '%semantic%' OR
        LOWER(name) LIKE '%haystack%' OR
        LOWER(name) LIKE '%aider%'
      )
      AND (
        image_url LIKE '%🤖%' OR
        image_url LIKE '%🧠%' OR
        image_url = '' OR
        image_url IS NULL OR
        image_url LIKE '%placeholder%' OR
        image_url LIKE '%emoji%'
      )
      ORDER BY name
    `;
    
    const result = await client.query(searchQuery);
    
    console.log(`📊 Found ${result.rows.length} AI agents with problematic images:\n`);
    
    if (result.rows.length > 0) {
      result.rows.forEach(product => {
        console.log(`❌ ${product.name} (ID: ${product.id})`);
        console.log(`   Current image: ${product.image_url || 'NULL'}\n`);
      });
    }
    
    // Also check for AI agents that might have broken URLs (not just emojis)
    const brokenUrlQuery = `
      SELECT id, name, image_url 
      FROM products 
      WHERE (
        LOWER(name) LIKE '%agent%' OR
        LOWER(name) LIKE '%gpt%' OR 
        LOWER(name) LIKE '%langchain%' OR
        LOWER(name) LIKE '%langraph%' OR
        LOWER(name) LIKE '%crew%' OR
        LOWER(name) LIKE '%auto%' OR
        LOWER(name) LIKE '%baby%' OR
        LOWER(name) LIKE '%meta%' OR
        LOWER(name) LIKE '%semantic%' OR
        LOWER(name) LIKE '%haystack%' OR
        LOWER(name) LIKE '%aider%'
      )
      ORDER BY name
    `;
    
    const allResult = await client.query(brokenUrlQuery);
    console.log(`\n📋 All potential AI agent products (${allResult.rows.length} total):`);
    
    allResult.rows.forEach(product => {
      const hasImage = product.image_url && !product.image_url.includes('🤖') && !product.image_url.includes('🧠');
      const imageStatus = hasImage ? '✅' : '❌';
      console.log(`${imageStatus} ${product.name} (ID: ${product.id})`);
      if (product.image_url) {
        console.log(`   Image: ${product.image_url.substring(0, 100)}${product.image_url.length > 100 ? '...' : ''}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error searching for AI agents:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the search
findRemainingAIAgents().catch(console.error);