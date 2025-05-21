import db from './src/utils/db.js';

// Wait a bit to ensure database connection is established
setTimeout(async () => {
  console.log('Checking for products with problematic image URLs...');
  
  try {
    // Check if database is connected
    console.log('Database connection status:', db.isConnected() ? 'Connected' : 'Not connected');
    
    if (!db.isConnected()) {
      console.log('Attempting to test connection...');
      await db.testConnection();
      console.log('Connection test result:', db.isConnected() ? 'Connected' : 'Failed');
    }
    
    if (db.isConnected()) {
      // Query to find products with NULL, empty, or client-logos image URLs
      const result = await db.query(`
        SELECT id, name, image_url, product_type
        FROM products
        WHERE image_url IS NULL 
           OR image_url = ''
           OR image_url LIKE '%/assets/client-logos/%'
        ORDER BY id
      `);
      
      // Also check separately for NULL or empty URLs 
      const nullResult = await db.query(`
        SELECT COUNT(*) as null_count 
        FROM products 
        WHERE image_url IS NULL
      `);
      
      const emptyResult = await db.query(`
        SELECT COUNT(*) as empty_count 
        FROM products 
        WHERE image_url = ''
      `);
      
      const clientLogosResult = await db.query(`
        SELECT COUNT(*) as client_logos_count 
        FROM products 
        WHERE image_url LIKE '%/assets/client-logos/%'
      `);
      
      // Output results in table format
      console.log('\nProducts with image URL issues:');
      console.log('-'.repeat(100));
      console.log('| ID   | Product Type      | Name                        | Image URL');
      console.log('-'.repeat(100));
      
      result.rows.forEach(row => {
        console.log(`| ${row.id.toString().padEnd(5)} | ${(row.product_type || '').padEnd(17)} | ${(row.name || '').substring(0, 25).padEnd(25)} | ${row.image_url || 'NULL'}`);
      });
      
      console.log('-'.repeat(100));
      console.log(`Total products with image issues: ${result.rows.length}`);
      console.log(`Products with NULL image_url: ${nullResult.rows[0].null_count}`);
      console.log(`Products with empty image_url: ${emptyResult.rows[0].empty_count}`);
      console.log(`Products with client-logos in URL: ${clientLogosResult.rows[0].client_logos_count}`);
    } else {
      console.log('Could not connect to database. Cannot run query.');
    }
  } catch (error) {
    console.error('Error running query:', error);
  } finally {
    process.exit(0);
  }
}, 2000);