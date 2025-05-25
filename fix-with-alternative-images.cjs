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

// Alternative reliable image sources using different CDNs
const ALTERNATIVE_IMAGES = {
  'sendgrid': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sendgrid/sendgrid-original.svg',
  'twilio': 'https://www.vectorlogo.zone/logos/twilio/twilio-icon.svg',
  'netlify': 'https://www.vectorlogo.zone/logos/netlify/netlify-icon.svg', 
  'linear': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linear/linear-original.svg',
  'sentry': 'https://www.vectorlogo.zone/logos/sentryio/sentryio-icon.svg'
};

async function fixWithAlternativeImages() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Starting to fix with alternative image sources...\n');
    
    let totalFixed = 0;
    const results = [];
    
    for (const [productName, newImageUrl] of Object.entries(ALTERNATIVE_IMAGES)) {
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
            SET image_url = $1, icon_url = $2
            WHERE id = $3
          `;
          
          await client.query(updateQuery, [newImageUrl, newImageUrl, product.id]);
          
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
    console.log('📊 FIXING WITH ALTERNATIVE IMAGES SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Total products fixed: ${totalFixed}`);
    console.log(`🔍 Product names processed: ${Object.keys(ALTERNATIVE_IMAGES).length}`);
    
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
    
    console.log('\n🎉 Alternative images fixing completed!');
    console.log('📋 Using sources: cdn.jsdelivr.net and vectorlogo.zone');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
fixWithAlternativeImages().catch(console.error);