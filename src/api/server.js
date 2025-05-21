import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './productRoutes.js';
import updateImageRoutes from './updateImageRoutes.js';
import tutorialRoutes from './tutorialRoutes.js';
import newsRoutes from './newsRoutes.js';
import db from '../utils/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.API_PORT || 3001;

// Database configuration - use environment variables with fallback values
const dbConfig = {
  user: process.env.DB_USER || 'achai',
  host: process.env.DB_HOST || 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: process.env.DB_NAME || 'achai',
  password: process.env.DB_PASSWORD || 'TrinityPW1',
  port: parseInt(process.env.DB_PORT || '5432', 10)
};

// Initialize database schema
async function initDatabase() {
  try {
    console.log(`Initializing PostgreSQL database schema on ${dbConfig.host}...`);
    
    // Test database connection first
    await db.testConnection();
    console.log('PostgreSQL database connection successful');
    
    // Initialize tutorials schema if files exist
    const tutorialSchemaPath = path.join(__dirname, '../models/schemas/tutorials_schema.sql');
    if (fs.existsSync(tutorialSchemaPath)) {
      const tutorialSchema = fs.readFileSync(tutorialSchemaPath, 'utf8');
      await db.query(tutorialSchema);
      console.log('Tutorials schema initialized successfully');
    }
    
    // Initialize news schema if files exist
    const newsSchemaPath = path.join(__dirname, '../models/schemas/news_schema.sql');
    if (fs.existsSync(newsSchemaPath)) {
      const newsSchema = fs.readFileSync(newsSchemaPath, 'utf8');
      await db.query(newsSchema);
      console.log('News schema initialized successfully');
    }
    
    // First ensure the products table exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) DEFAULT 0,
        image_url VARCHAR(512),
        icon_url VARCHAR(512),
        category VARCHAR(100),
        categories TEXT[],
        sku VARCHAR(50),
        product_type VARCHAR(50) DEFAULT 'mcp_server',
        github_url VARCHAR(512),
        official BOOLEAN DEFAULT FALSE,
        docs_url VARCHAR(512),
        demo_url VARCHAR(512),
        language VARCHAR(100),
        license VARCHAR(100),
        creator VARCHAR(100),
        version VARCHAR(50),
        installation_command TEXT,
        tags TEXT[],
        inventory_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        slug VARCHAR(255) NOT NULL,
        stars_numeric INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await db.query(createTableQuery);
    console.log('Products table created or verified');
    
    // Create indexes if they don't exist
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;
      CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    `;
    
    await db.query(createIndexesQuery);
    console.log('Database indexes created or verified');
    
    // Load data from JSON files if the database is empty
    const checkDataQuery = 'SELECT COUNT(*) FROM products';
    const dataCount = await db.query(checkDataQuery);
    
    if (parseInt(dataCount.rows[0].count) === 0) {
      console.log('Database is empty, importing initial data...');
      
      // Import MCP servers
      const mcpServersDataPath = path.join(__dirname, '../mcp_servers_data.json');
      if (fs.existsSync(mcpServersDataPath)) {
        const serversData = JSON.parse(fs.readFileSync(mcpServersDataPath, 'utf8'));
        
        for (const server of serversData) {
          const insertQuery = `
            INSERT INTO products (
              name, description, price, image_url, category, categories, 
              product_type, github_url, official, docs_url, stars_numeric,
              tags, is_featured, is_active, slug
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) ON CONFLICT (slug) DO NOTHING;
          `;
          
          await db.query(insertQuery, [
            server.name,
            server.description || '',
            server.price || 0,
            server.image_url || '',
            server.category || 'Uncategorized',
            server.categories || [server.category || 'Uncategorized'],
            'server',
            server.github_url || '',
            server.official || false,
            server.docs_url || '',
            server.stars_numeric || 0,
            server.tags || [],
            server.is_featured || false,
            true,
            server.id.replace(/[^a-z0-9]+/g, '-').toLowerCase()
          ]);
        }
        console.log(`Imported ${serversData.length} MCP servers`);
      }
      
      // Import MCP clients
      const mcpClientsDataPath = path.join(__dirname, '../mcp_clients_data.json');
      if (fs.existsSync(mcpClientsDataPath)) {
        const clientsData = JSON.parse(fs.readFileSync(mcpClientsDataPath, 'utf8'));
        
        for (const client of clientsData) {
          const insertQuery = `
            INSERT INTO products (
              name, description, price, image_url, category, categories, 
              product_type, github_url, official, docs_url, stars_numeric,
              tags, is_featured, is_active, slug
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) ON CONFLICT (slug) DO NOTHING;
          `;
          
          await db.query(insertQuery, [
            client.name,
            client.description || '',
            client.price || 0,
            client.image_url || '',
            client.category || 'Uncategorized',
            client.categories || [client.category || 'Uncategorized'],
            'client',
            client.github_url || '',
            client.official || false,
            client.docs_url || '',
            client.stars_numeric || 0,
            client.tags || [],
            client.is_featured || false,
            true,
            client.id.replace(/[^a-z0-9]+/g, '-').toLowerCase()
          ]);
        }
        console.log(`Imported ${clientsData.length} MCP clients`);
      }
      
      // Import AI agents if available
      const aiAgentsDataPath = path.join(__dirname, '../ai_agents_data.json');
      if (fs.existsSync(aiAgentsDataPath)) {
        const agentsData = JSON.parse(fs.readFileSync(aiAgentsDataPath, 'utf8'));
        
        for (const agent of agentsData) {
          const insertQuery = `
            INSERT INTO products (
              name, description, price, image_url, category, categories, 
              product_type, github_url, official, docs_url, stars_numeric,
              tags, is_featured, is_active, slug
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) ON CONFLICT (slug) DO NOTHING;
          `;
          
          await db.query(insertQuery, [
            agent.name,
            agent.description || '',
            agent.price || 0,
            agent.image_url || '',
            agent.category || 'Uncategorized',
            agent.categories || [agent.category || 'Uncategorized'],
            'agent',
            agent.github_url || '',
            agent.official || false,
            agent.docs_url || '',
            agent.stars_numeric || 0,
            agent.tags || [],
            agent.is_featured || false,
            true,
            agent.id?.replace(/[^a-z0-9]+/g, '-').toLowerCase() || `agent-${Math.floor(Math.random() * 10000)}`
          ]);
        }
        console.log(`Imported ${agentsData.length} AI agents`);
      }
    }
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

// Middleware
// Enable CORS for all routes with specific configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5174',
    'https://achai-9epuqi7r9-daniscapols-projects.vercel.app',
    'https://achai.vercel.app',
    /\.vercel\.app$/  // Allow all vercel.app subdomains
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'content-type', 'Authorization', 'authorization', 'Cache-Control', 'cache-control']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/admin', updateImageRoutes);
app.use('/api', tutorialRoutes);
app.use('/api', newsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    dataSource: db.getDataSourceInfo()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('ERROR OCCURRED:', err);
  console.error('Error stack:', err.stack);
  console.error('Request body:', req.body);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server with database initialization
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`
------------------------------------------------------
🚀 API Server running on port ${PORT}
------------------------------------------------------
✅ Connected to PostgreSQL database successfully
   Host: ${dbConfig.host}
   User: ${dbConfig.user}
   Database: ${dbConfig.database}
   
💡 All data is being served from PostgreSQL database
------------------------------------------------------
`);
  });
}).catch(err => {
  console.error('Failed to initialize server:', err);
  
  // Exit with error code instead of starting with fallback data
  console.error(`
------------------------------------------------------
❌ API Server FAILED to start - DATABASE CONNECTION REQUIRED
------------------------------------------------------
❌ Database initialization failed: ${err.message}
   
🔧 To fix database connection issues:
   1. Make sure PostgreSQL is installed and running
   2. Check database credentials:
      Host: ${dbConfig.host}
      User: ${dbConfig.user}
      Database: ${dbConfig.database}
      Port: ${dbConfig.port}
   3. Ensure server is accessible from your network
   
⚠️ Server will not start without database connection
------------------------------------------------------
`);
  
  // Exit the process instead of continuing with fallback data
  process.exit(1);
});

export default app;