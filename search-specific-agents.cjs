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

async function searchSpecificAgents() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Searching for specific agents that might be missing...\n');
    
    // List of agents the user mentioned
    const targetAgents = [
      'langraph',
      'semantic kernel',
      'langchain', 
      'haystack',
      'agentscope',
      'gpt pilot',
      'gpt engineer',
      'aider',
      'metagpt',
      'crewai',
      'babyagi',
      'autogpt',
      'autogen',
      'agents',
      'agentgpt'
    ];
    
    console.log('🎯 Searching for each target agent:\n');
    
    for (const agent of targetAgents) {
      const searchQuery = `
        SELECT id, name, image_url 
        FROM products 
        WHERE LOWER(name) LIKE LOWER($1)
        ORDER BY name
      `;
      
      const result = await client.query(searchQuery, [`%${agent}%`]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Found ${result.rows.length} match(es) for "${agent}":`);
        result.rows.forEach(product => {
          const imageStatus = product.image_url && 
                            !product.image_url.includes('🤖') && 
                            !product.image_url.includes('🧠') ? '✅' : '❌';
          console.log(`   ${imageStatus} ${product.name} (ID: ${product.id})`);
          if (product.image_url) {
            console.log(`      ${product.image_url.substring(0, 80)}${product.image_url.length > 80 ? '...' : ''}`);
          }
        });
      } else {
        console.log(`❌ No matches found for "${agent}"`);
      }
      console.log('');
    }
    
    // Let's also search for any products with emoji in image_url
    console.log('🔍 Searching for any remaining emoji placeholders:\n');
    
    const emojiQuery = `
      SELECT id, name, image_url 
      FROM products 
      WHERE image_url LIKE '%🤖%' OR image_url LIKE '%🧠%'
      ORDER BY name
    `;
    
    const emojiResult = await client.query(emojiQuery);
    
    if (emojiResult.rows.length > 0) {
      console.log(`❌ Found ${emojiResult.rows.length} products still with emoji placeholders:`);
      emojiResult.rows.forEach(product => {
        console.log(`   - ${product.name} (ID: ${product.id}): ${product.image_url}`);
      });
    } else {
      console.log('✅ No products found with emoji placeholders!');
    }
    
  } catch (error) {
    console.error('❌ Error searching for specific agents:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the search
searchSpecificAgents().catch(console.error);