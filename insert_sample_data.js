import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read sample data
const tutorialsData = JSON.parse(fs.readFileSync(join(__dirname, 'sample_tutorials.json'), 'utf8'));
const newsData = JSON.parse(fs.readFileSync(join(__dirname, 'sample_news.json'), 'utf8'));

const API_BASE_URL = 'http://localhost:3001/api';

async function insertTutorials() {
  console.log('\n📚 Inserting sample tutorials...');
  
  for (const tutorial of tutorialsData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tutorials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tutorial)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created tutorial: "${result.title}"`);
      } else {
        const error = await response.json();
        console.log(`❌ Failed to create tutorial "${tutorial.title}": ${error.error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating tutorial "${tutorial.title}": ${error.message}`);
    }
  }
}

async function insertNews() {
  console.log('\n📰 Inserting sample news articles...');
  
  for (const article of newsData) {
    try {
      const response = await fetch(`${API_BASE_URL}/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created news article: "${result.title}"`);
      } else {
        const error = await response.json();
        console.log(`❌ Failed to create news article "${article.title}": ${error.error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating news article "${article.title}": ${error.message}`);
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
  await insertTutorials();
  await insertNews();
  
  console.log('\n✨ Sample data insertion completed!');
  console.log('\nYou can now:');
  console.log('1. View tutorials at: http://localhost:3001/api/tutorials');
  console.log('2. View news at: http://localhost:3001/api/news');
  console.log('3. Start the frontend with: npm run dev');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 