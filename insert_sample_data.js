import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE_URL = 'http://localhost:3001/api';

async function insertProducts() {
  console.log('\n📦 Inserting sample products...');
  
  // Read MCP servers data
  const serversData = JSON.parse(fs.readFileSync(join(__dirname, 'src/mcp_servers_data.json'), 'utf8'));
  
  for (const product of serversData.slice(0, 10)) { // Only insert first 10 for testing
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          description: product.description || '',
          price: product.price || 0,
          image_url: product.image_url || '',
          category: product.category || 'Uncategorized',
          product_type: 'server',
          github_url: product.github_url || '',
          official: product.official || false,
          docs_url: product.docs_url || '',
          stars_numeric: product.stars_numeric || 0,
          tags: product.tags || [],
          is_featured: product.is_featured || false,
          slug: product.id?.replace(/[^a-z0-9]+/g, '-').toLowerCase() || `server-${Math.random()}`
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created product: "${result.name}"`);
      } else {
        const error = await response.json();
        console.log(`❌ Failed to create product "${product.name}": ${error.error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating product "${product.name}": ${error.message}`);
    }
  }
}

async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      const health = await response.json();
      console.log('🟢 API is running and database is connected');
      console.log(`   Database: ${health.dataSource.host}`);
      return true;
    } else {
      console.log('🔴 API is not responding correctly');
      return false;
    }
  } catch (error) {
    console.log(`🔴 Cannot connect to API: ${error.message}`);
    console.log('   Make sure the API server is running with: npm run server');
    return false;
  }
}

async function main() {
  console.log('🚀 Starting data insertion process...');
  
  // Check if API is available
  const apiHealthy = await checkAPIHealth();
  if (!apiHealthy) {
    process.exit(1);
  }
  
  // Insert sample data
  await insertProducts();
  
  console.log('\n✨ Sample data insertion completed!');
  console.log('\nYou can now:');
  console.log('1. View products at: http://localhost:3001/api/products');
  console.log('2. Start the frontend with: npm run dev');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});