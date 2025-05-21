import db from './src/utils/db.js';

// Claude image URL from the user
const claudeImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s';

async function updateImages() {
  try {
    console.log('Connecting to database...');
    
    // Update Claude Desktop (ID 492)
    console.log('Updating Claude Desktop (ID 492)...');
    const result1 = await db.query(
      'UPDATE products SET image_url = $1 WHERE id = 492 RETURNING id, name, image_url',
      [claudeImageUrl]
    );
    console.log('Claude Desktop updated:', result1.rows[0] || 'No update (product not found)');
    
    // Find and update other Claude products
    console.log('\nSearching for other Claude products...');
    const claudeProducts = await db.query(
      "SELECT id, name, product_type, image_url FROM products WHERE name ILIKE '%Claude%'"
    );
    console.log(`Found ${claudeProducts.rows.length} Claude-related products`);
    
    for (const product of claudeProducts.rows) {
      // Skip the already updated Claude Desktop
      if (product.id === 492) continue;
      
      // Update if it's Claude CLI or Claude Code
      if (product.name.includes('CLI') || product.name.includes('Code')) {
        console.log(`\nUpdating ${product.name} (ID ${product.id})...`);
        const updateResult = await db.query(
          'UPDATE products SET image_url = $1 WHERE id = $2 RETURNING id, name, image_url',
          [claudeImageUrl, product.id]
        );
        console.log('Updated:', updateResult.rows[0]);
      }
    }
    
    console.log('\nAll Claude image updates completed');
    
    // Now list all products with /assets/client-logos/ in image_url
    console.log('\nRemaining products with /assets/client-logos/ in image_url:');
    const remainingProducts = await db.query(
      "SELECT id, name, product_type, image_url FROM products WHERE image_url LIKE '%/assets/client-logos/%'"
    );
    
    if (remainingProducts.rows.length === 0) {
      console.log('No products found with /assets/client-logos/ in image_url');
    } else {
      console.log(`Found ${remainingProducts.rows.length} products:`);
      remainingProducts.rows.forEach(p => {
        console.log(`ID: ${p.id}, Name: ${p.name}, Image: ${p.image_url}`);
      });
    }
  } catch (error) {
    console.error('Error updating images:', error);
  } finally {
    // Close the database connection
    await db.end();
    console.log('Database connection closed');
  }
}

updateImages();