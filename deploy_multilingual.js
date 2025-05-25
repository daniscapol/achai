/**
 * Deployment script for multilingual database changes
 * Run this script to set up multilingual support for products
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  query_timeout: 30000,
  statement_timeout: 30000,
};

async function runSQL(client, sqlContent, description) {
  console.log(`\n🚀 Running: ${description}`);
  try {
    const result = await client.query(sqlContent);
    console.log(`✅ Successfully completed: ${description}`);
    return result;
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error.message);
    throw error;
  }
}

async function deployMultilingual() {
  console.log('🌍 Starting multilingual database deployment...\n');
  
  // Import pg dynamically
  const pg = await import('pg');
  const { Pool } = pg.default;
  
  const pool = new Pool(dbConfig);
  
  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Read SQL files
    const schemaPath = path.join(__dirname, 'src/models/multilingual_products_schema.sql');
    const translationPath = path.join(__dirname, 'src/models/translate_existing_products.sql');
    
    console.log('\n📖 Reading SQL files...');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    if (!fs.existsSync(translationPath)) {
      throw new Error(`Translation file not found: ${translationPath}`);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    const translationSQL = fs.readFileSync(translationPath, 'utf8');
    
    console.log('✅ SQL files loaded successfully');
    
    // Execute schema changes
    await runSQL(client, schemaSQL, 'Multilingual schema setup');
    
    // Execute translations
    await runSQL(client, translationSQL, 'Existing products translation');
    
    // Verify the changes
    console.log('\n🔍 Verifying multilingual setup...');
    
    const verificationQueries = [
      {
        name: 'Check new columns exist',
        sql: `SELECT column_name FROM information_schema.columns 
              WHERE table_name = 'products' 
              AND column_name IN ('name_en', 'name_pt', 'description_en', 'description_pt', 'language_code')
              ORDER BY column_name`
      },
      {
        name: 'Check products with Portuguese translations',
        sql: `SELECT COUNT(*) as count FROM products WHERE name_pt IS NOT NULL AND name_pt != ''`
      },
      {
        name: 'Sample multilingual product',
        sql: `SELECT id, name, name_en, name_pt, language_code FROM products WHERE name_pt IS NOT NULL LIMIT 1`
      }
    ];
    
    for (const query of verificationQueries) {
      try {
        const result = await client.query(query.sql);
        console.log(`✅ ${query.name}:`);
        console.log('   Result:', JSON.stringify(result.rows, null, 2));
      } catch (error) {
        console.error(`❌ ${query.name} failed:`, error.message);
      }
    }
    
    client.release();
    console.log('\n🎉 Multilingual deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Restart your application server');
    console.log('   2. Test the /products API with ?language=pt parameter');
    console.log('   3. Verify Portuguese content is displayed correctly');
    console.log('   4. Use the admin interface to add/edit multilingual content');
    
  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your database connection credentials');
    console.error('   2. Ensure the database is accessible');
    console.error('   3. Verify you have the necessary permissions');
    console.error('   4. Check the SQL files exist and are readable');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🌍 Multilingual Database Deployment Script

This script sets up multilingual support for the products database.

Usage:
  node deploy_multilingual.js

Environment Variables Required:
  DB_HOST     - Database host
  DB_USER     - Database username  
  DB_PASSWORD - Database password
  DB_NAME     - Database name
  DB_PORT     - Database port (default: 5432)

Features Added:
  ✅ New columns: name_en, name_pt, description_en, description_pt, language_code
  ✅ Database functions for language-aware queries
  ✅ Automatic translation of existing products
  ✅ Search functionality across all languages
  ✅ Performance indexes for multilingual queries

Safety:
  ✅ Non-destructive - existing data is preserved
  ✅ Adds new columns without removing old ones
  ✅ Fallback to English if Portuguese translation unavailable
`);
  process.exit(0);
}

// Check required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these variables and try again.');
  process.exit(1);
}

// Run the deployment
deployMultilingual().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});