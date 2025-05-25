import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './productRoutes.js';
import updateImageRoutes from './updateImageRoutes.js';
import workflowDb from '../../api/workflows.js';
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
    
    // Initialize workflow database tables
    await workflowDb.initializeWorkflowDatabase();
    console.log('Workflow database tables initialized');
    
    // Initialize default workflow templates
    await workflowDb.initializeDefaultTemplates();
    console.log('Default workflow templates initialized');
    
    // Initialize News and Courses database with improved error handling
    try {
      const { initNewsAndCourses } = await import('../../api/init-news-courses.js');
      await initNewsAndCourses();
      console.log('News and Courses database initialized');
    } catch (newsCoursesError) {
      console.log('Initializing News and Courses with basic schema...');
      
      // Create minimal schema for News and Courses if full initialization fails
      try {
        await db.query(`
          -- Create basic news categories
          CREATE TABLE IF NOT EXISTS news_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            slug VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Create basic authors table
          CREATE TABLE IF NOT EXISTS authors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            bio TEXT,
            avatar_url VARCHAR(512),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Create basic news articles table
          CREATE TABLE IF NOT EXISTS news_articles (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            content TEXT NOT NULL,
            excerpt TEXT,
            featured_image VARCHAR(512),
            author_id INTEGER REFERENCES authors(id) ON DELETE SET NULL,
            category_id INTEGER REFERENCES news_categories(id) ON DELETE SET NULL,
            status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
            published_at TIMESTAMP,
            view_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Create basic course categories
          CREATE TABLE IF NOT EXISTS course_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            slug VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Create basic courses table
          CREATE TABLE IF NOT EXISTS courses (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            description TEXT NOT NULL,
            content TEXT NOT NULL,
            thumbnail VARCHAR(512),
            instructor_name VARCHAR(255) NOT NULL,
            instructor_bio TEXT,
            price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
            currency VARCHAR(3) DEFAULT 'USD',
            duration_hours DECIMAL(5, 2),
            difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
            category_id INTEGER REFERENCES course_categories(id) ON DELETE SET NULL,
            status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
            enrollment_count INTEGER DEFAULT 0,
            rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
            rating_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Insert default categories
          INSERT INTO news_categories (name, slug, description) VALUES
            ('Product Updates', 'product-updates', 'Latest updates and releases for our products'),
            ('Industry News', 'industry-news', 'News and trends in the AI and MCP ecosystem'),
            ('Company News', 'company-news', 'Updates about our company and team'),
            ('Technical Articles', 'technical-articles', 'In-depth technical content and insights')
          ON CONFLICT (slug) DO NOTHING;

          INSERT INTO course_categories (name, slug, description) VALUES
            ('AI Development', 'ai-development', 'Courses on AI and machine learning development'),
            ('MCP Integration', 'mcp-integration', 'Learn how to integrate Model Context Protocol'),
            ('Agent Development', 'agent-development', 'Build and deploy AI agents'),
            ('Web Development', 'web-development', 'Modern web development with AI integration'),
            ('Data Science', 'data-science', 'Data analysis and science with AI tools')
          ON CONFLICT (slug) DO NOTHING;

          -- Insert default author
          INSERT INTO authors (name, email, bio) VALUES
            ('Admin', 'admin@achai.com', 'achAI Administrator')
          ON CONFLICT (email) DO NOTHING;
        `);
        
        console.log('Basic News and Courses schema created successfully');
      } catch (basicSchemaError) {
        console.log('News and Courses tables may already exist:', basicSchemaError.message);
      }
    }
    
    
    // First ensure the products table exists with proper schema
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
        slug VARCHAR(255),
        stars_numeric INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await db.query(createTableQuery);
    console.log('Products table created or verified');

    // Add missing columns if they don't exist (for existing tables)
    const alterTableQueries = [
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS stars_numeric INTEGER DEFAULT 0;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS categories TEXT[];`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'mcp_server';`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS official BOOLEAN DEFAULT FALSE;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`
    ];

    for (const query of alterTableQueries) {
      try {
        await db.query(query);
      } catch (err) {
        // Ignore errors for columns that already exist
        if (!err.message.includes('already exists')) {
          console.warn(`Warning: Could not add column: ${err.message}`);
        }
      }
    }

    // Update existing rows to have proper slug values if missing
    await db.query(`
      UPDATE products 
      SET slug = COALESCE(slug, LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))) 
      WHERE slug IS NULL OR slug = '';
    `);

    console.log('Products table schema updated successfully');
    
    // Create indexes if they don't exist (now safe since columns exist)
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
    'https://www.achai.co',
    'https://achai.co',
    /\.vercel\.app$/  // Allow all vercel.app subdomains
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'content-type', 'Authorization', 'authorization', 'Cache-Control', 'cache-control']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email sending endpoint for agents
app.post('/api/send-email', async (req, res) => {
  try {
    const { service, apiKey, emailData } = req.body;

    if (!service || !apiKey || !emailData) {
      return res.status(400).json({ error: 'Missing required fields: service, apiKey, emailData' });
    }

    let result;

    switch (service) {
      case 'resend':
        result = await sendWithResend(apiKey, emailData);
        break;
      case 'sendgrid':
        result = await sendWithSendGrid(apiKey, emailData);
        break;
      case 'mailgun':
        result = await sendWithMailgun(apiKey, emailData);
        break;
      default:
        return res.status(400).json({ error: `Unsupported email service: ${service}` });
    }

    res.status(200).json({ success: true, result });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send email' 
    });
  }
});

async function sendWithResend(apiKey, emailData) {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: ['daniscapol2@gmail.com'], // Force to your verified email for testing
      subject: `[TEST] ${emailData.subject} (intended for: ${emailData.to})`,
      text: `This email was intended for: ${emailData.to}\n\n${emailData.body}\n\n---\nThis is a test email sent to your verified address.`
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }

  return await response.json();
}

async function sendWithSendGrid(apiKey, emailData) {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: emailData.to, name: emailData.name }]
      }],
      from: { email: 'noreply@yourdomain.com', name: 'Your Name' },
      subject: emailData.subject,
      content: [{
        type: 'text/plain',
        value: emailData.body
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }

  return { message: 'Email sent successfully' };
}

async function sendWithMailgun(apiKey, emailData) {
  const fetch = (await import('node-fetch')).default;
  const domain = emailData.domain || 'sandboxXXX.mailgun.org';
  
  const formData = new URLSearchParams();
  formData.append('from', `Your Name <noreply@${domain}>`);
  formData.append('to', emailData.to);
  formData.append('subject', emailData.subject);
  formData.append('text', emailData.body);

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('api:' + apiKey).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mailgun error: ${error}`);
  }

  return await response.json();
}

// Import news and courses routes
import newsRoutes from './newsRoutes.js';
import coursesRoutes from './coursesRoutes.js';

// Routes
app.use('/api/products', productRoutes);
app.use('/api/admin', updateImageRoutes);

// News and Courses API routes (using database)
app.use('/api/news', newsRoutes);
app.use('/api/courses', coursesRoutes);

// Mock data routes for testing (commented out - using database routes now)
// app.get('/api/news', (req, res) => {
//   const mockNews = [
//     {
//       id: 1,
//       title: "New MCP Server for Weather Data",
//       content: "We've just released a new MCP server that provides weather data from multiple sources...",
//       excerpt: "A new MCP server for weather data is now available",
//       author: "ACHAI Team",
//       published_date: "2024-01-15T10:00:00Z",
//       tags: ["mcp", "weather", "api"],
//       category: "Releases",
//       featured_image: "/assets/news/weather-server.jpg",
//       status: "published"
//     }
//   ];
//   res.json(mockNews);
// });

// Workflow API endpoints
app.post('/api/workflows', async (req, res) => {
  try {
    const { workflow, userId = 'anonymous' } = req.body;
    const savedWorkflow = await workflowDb.saveWorkflow(workflow, userId);
    res.json({ success: true, workflow: savedWorkflow });
  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/workflows/templates', async (req, res) => {
  try {
    const templates = await workflowDb.getWorkflowTemplates();
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error loading workflow templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/workflows/:id', async (req, res) => {
  try {
    const workflow = await workflowDb.loadWorkflow(req.params.id);
    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Error loading workflow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/workflow-executions', async (req, res) => {
  try {
    const execution = await workflowDb.saveWorkflowExecution(req.body);
    res.json({ success: true, execution });
  } catch (error) {
    console.error('Error saving workflow execution:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/workflow-executions/:id', async (req, res) => {
  try {
    const execution = await workflowDb.updateWorkflowExecution(req.params.id, req.body);
    res.json({ success: true, execution });
  } catch (error) {
    console.error('Error updating workflow execution:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/workflow-executions/:workflowId', async (req, res) => {
  try {
    const executions = await workflowDb.getWorkflowExecutions(req.params.workflowId);
    res.json({ success: true, executions });
  } catch (error) {
    console.error('Error loading workflow executions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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