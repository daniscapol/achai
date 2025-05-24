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

// Reliable image mappings for the broken image products
const RELIABLE_IMAGES = {
  'semantic kernel': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/microsoft_logo_icon_168963.png',
  'langchain': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/langchain_logo_icon_169228.png',
  'haystack': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/deepset_haystack_logo_icon_169030.png',
  'agentscope': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/microsoft_logo_icon_168963.png',
  'gpt pilot': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/openai_logo_icon_168960.png',
  'gpt engineer': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/openai_logo_icon_168960.png',
  'aider': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/github_logo_icon_168956.png',
  'metagpt': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/openai_logo_icon_168960.png',
  'langraph': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/langchain_logo_icon_169228.png',
  'crewai': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/artificial_intelligence_logo_icon_168942.png',
  'babyagi': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/openai_logo_icon_168960.png',
  'autogpt': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/openai_logo_icon_168960.png',
  'autogen': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/microsoft_logo_icon_168963.png',
  'agents': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/artificial_intelligence_logo_icon_168942.png',
  'agentgpt': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/openai_logo_icon_168960.png'
};

async function fixAdditionalBrokenImages() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Starting to fix additional broken images...\n');
    
    let totalFixed = 0;
    const results = [];
    
    for (const [productName, newImageUrl] of Object.entries(RELIABLE_IMAGES)) {
      try {
        // Find products with matching names (case insensitive)
        const searchQuery = `
          SELECT id, name, image_url 
          FROM products 
          WHERE LOWER(name) LIKE LOWER($1)
        `;
        
        const searchResult = await client.query(searchQuery, [`%${productName}%`]);
        
        if (searchResult.rows.length === 0) {
          console.log(`❌ No products found matching "${productName}"`);
          results.push({ productName, status: 'not_found', count: 0 });
          continue;
        }
        
        // Update all matching products
        for (const product of searchResult.rows) {
          const updateQuery = `
            UPDATE products 
            SET image_url = $1 
            WHERE id = $2
          `;
          
          await client.query(updateQuery, [newImageUrl, product.id]);
          
          console.log(`✅ Updated "${product.name}" (ID: ${product.id})`);
          console.log(`   Old: ${product.image_url}`);
          console.log(`   New: ${newImageUrl}\n`);
          
          totalFixed++;
        }
        
        results.push({ 
          productName, 
          status: 'success', 
          count: searchResult.rows.length,
          products: searchResult.rows.map(p => p.name)
        });
        
      } catch (error) {
        console.error(`❌ Error fixing "${productName}":`, error.message);
        results.push({ productName, status: 'error', error: error.message });
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FIXING ADDITIONAL BROKEN IMAGES SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Total products fixed: ${totalFixed}`);
    console.log(`🔍 Product names processed: ${Object.keys(RELIABLE_IMAGES).length}`);
    
    console.log('\n📝 Detailed Results:');
    results.forEach(result => {
      if (result.status === 'success') {
        console.log(`✅ ${result.productName}: ${result.count} products updated`);
        if (result.products) {
          result.products.forEach(name => console.log(`   - ${name}`));
        }
      } else if (result.status === 'not_found') {
        console.log(`❌ ${result.productName}: No matching products found`);
      } else {
        console.log(`❌ ${result.productName}: Error - ${result.error}`);
      }
    });
    
    console.log('\n🎉 Additional broken images fixing completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
fixAdditionalBrokenImages().catch(console.error);