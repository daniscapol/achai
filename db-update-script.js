import pg from 'pg';

// Database connection configuration
const pool = new pg.Pool({
  user: 'achai',
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: 'achai',
  password: 'TrinityPW1',
  port: 5432,
  schema: 'public'
});

// Image URL updates
const updates = [
  {
    id: 492,
    name: 'Claude Desktop',
    newUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s'
  },
  {
    id: 513,
    name: 'Sourcegraph Cody',
    newUrl: 'https://about.sourcegraph.com/sourcegraph-mark.png'
  },
  {
    id: 515,
    name: 'GPT Computer Assistant',
    newUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png'
  },
  {
    id: 517,
    name: 'Cursor',
    newUrl: 'https://avatars.githubusercontent.com/u/96096435?s=200&v=4'
  },
  {
    id: 519,
    name: 'Goose',
    newUrl: 'https://avatars.githubusercontent.com/u/139895814?s=200&v=4'
  },
  {
    id: 520,
    name: 'Visual Studio Code',
    newUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/1200px-Visual_Studio_Code_1.35_icon.svg.png'
  }
];

// Claude products
const claudeImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s';

async function updateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Update specific products
    for (const update of updates) {
      console.log(`Updating ${update.name} (ID: ${update.id})...`);
      const result = await client.query(
        'UPDATE products SET image_url = $1 WHERE id = $2 RETURNING id, name, image_url',
        [update.newUrl, update.id]
      );
      
      if (result.rows.length > 0) {
        console.log(`✓ Updated ${update.name}`);
      } else {
        console.log(`⚠ Product not found: ${update.name} (ID: ${update.id})`);
      }
    }
    
    // Update Claude CLI products
    console.log('\nUpdating Claude CLI products...');
    const cliResult = await client.query(
      "UPDATE products SET image_url = $1 WHERE name ILIKE '%Claude%CLI%' AND id != 492 RETURNING id, name",
      [claudeImageUrl]
    );
    console.log(`✓ Updated ${cliResult.rowCount} Claude CLI products`);
    
    // Update Claude Code products
    console.log('\nUpdating Claude Code products...');
    const codeResult = await client.query(
      "UPDATE products SET image_url = $1 WHERE name ILIKE '%Claude%Code%' AND id != 492 RETURNING id, name",
      [claudeImageUrl]
    );
    console.log(`✓ Updated ${codeResult.rowCount} Claude Code products`);
    
    // Check for any remaining products with local paths
    console.log('\nChecking for remaining products with local paths...');
    const remainingResult = await client.query(
      "SELECT id, name, image_url FROM products WHERE image_url LIKE '%/assets/client-logos/%'"
    );
    
    if (remainingResult.rows.length > 0) {
      console.log(`⚠ Found ${remainingResult.rows.length} products still using local paths:`);
      remainingResult.rows.forEach(row => {
        console.log(`   ID: ${row.id}, Name: ${row.name}, URL: ${row.image_url}`);
      });
    } else {
      console.log('✓ No products using local paths found');
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('\n✅ All updates committed successfully');
    
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error occurred, changes rolled back:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    // Close the pool
    await pool.end();
  }
}

// Run the update
updateDatabase().catch(console.error);