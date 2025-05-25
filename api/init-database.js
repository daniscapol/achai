import { query } from './_lib/db.js';

export default async function handler(req, res) {
  try {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
      console.log('Starting database initialization...');
      
      try {
        // Create news tables
        await query(`
          -- Create news_categories table
          CREATE TABLE IF NOT EXISTS news_categories (
              id SERIAL PRIMARY KEY,
              name VARCHAR(100) NOT NULL UNIQUE,
              slug VARCHAR(100) NOT NULL UNIQUE,
              description TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await query(`
          -- Create authors table
          CREATE TABLE IF NOT EXISTS authors (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              bio TEXT,
              avatar_url VARCHAR(512),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await query(`
          -- Create news_articles table
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
              meta_title VARCHAR(255),
              meta_description TEXT,
              meta_keywords TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        // Create courses tables
        await query(`
          -- Create course_categories table
          CREATE TABLE IF NOT EXISTS course_categories (
              id SERIAL PRIMARY KEY,
              name VARCHAR(100) NOT NULL UNIQUE,
              slug VARCHAR(100) NOT NULL UNIQUE,
              description TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await query(`
          -- Create courses table
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
              tags JSONB DEFAULT '[]'::jsonb,
              status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
              enrollment_count INTEGER DEFAULT 0,
              rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
              rating_count INTEGER DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        // Insert default categories
        await query(`
          INSERT INTO news_categories (name, slug, description) VALUES
              ('Product Updates', 'product-updates', 'Latest updates and releases for our products'),
              ('Industry News', 'industry-news', 'News and trends in the AI and MCP ecosystem'),
              ('Company News', 'company-news', 'Updates about our company and team'),
              ('Technical Articles', 'technical-articles', 'In-depth technical content and insights')
          ON CONFLICT (slug) DO NOTHING;
        `);
        
        await query(`
          INSERT INTO course_categories (name, slug, description) VALUES
              ('AI Development', 'ai-development', 'Courses on AI and machine learning development'),
              ('MCP Integration', 'mcp-integration', 'Learn how to integrate Model Context Protocol'),
              ('Agent Development', 'agent-development', 'Build and deploy AI agents'),
              ('Web Development', 'web-development', 'Modern web development with AI integration'),
              ('Data Science', 'data-science', 'Data analysis and science with AI tools')
          ON CONFLICT (slug) DO NOTHING;
        `);
        
        // Insert a default author
        await query(`
          INSERT INTO authors (name, email, bio) VALUES
              ('ACHAI Team', 'admin@achai.co', 'ACHAI content team and administrators')
          ON CONFLICT (email) DO NOTHING;
        `);
        
        // Insert sample news articles
        const authorResult = await query('SELECT id FROM authors WHERE email = $1', ['admin@achai.co']);
        const categoryResult = await query('SELECT id FROM news_categories WHERE slug = $1', ['technical-articles']);
        
        if (authorResult.rows.length > 0 && categoryResult.rows.length > 0) {
          const authorId = authorResult.rows[0].id;
          const categoryId = categoryResult.rows[0].id;
          
          await query(`
            INSERT INTO news_articles (title, slug, content, excerpt, author_id, category_id, status, published_at) VALUES
                ('Getting Started with MCP Server Development', 'getting-started-mcp-server-development', 
                 'Learn the fundamentals of building Model Context Protocol servers. This comprehensive guide covers everything from setup to deployment, including best practices for security, performance, and scalability. Whether you are new to MCP or looking to enhance your existing knowledge, this article provides practical insights and real-world examples to help you build robust MCP servers that can handle production workloads.', 
                 'A complete guide to building your first MCP server from scratch.',
                 $1, $2, 'published', NOW()),
                ('Building AI Agents with Advanced MCP Features', 'building-ai-agents-advanced-mcp-features',
                 'Explore advanced MCP capabilities for creating sophisticated AI agents. Discover how to leverage tools, resources, and prompts to build agents that can interact seamlessly with external systems. This tutorial covers advanced patterns, error handling, and optimization techniques that will take your AI agent development to the next level.', 
                 'Advanced techniques for creating powerful AI agents using MCP.',
                 $1, $2, 'published', NOW()),
                ('The Future of AI Integration with MCP', 'future-ai-integration-mcp',
                 'Model Context Protocol is revolutionizing how AI systems interact with external tools and data sources. In this forward-looking article, we explore the emerging trends, upcoming features, and potential applications that will shape the future of AI development. Learn about the roadmap ahead and how to prepare your projects for the next generation of AI integration.', 
                 'Insights into how MCP is shaping the future of AI development.',
                 $1, $2, 'published', NOW())
            ON CONFLICT (slug) DO NOTHING;
          `, [authorId, categoryId]);
        }
        
        // Insert sample courses
        const courseCategoryResult = await query('SELECT id FROM course_categories WHERE slug = $1', ['mcp-integration']);
        const aiCategoryResult = await query('SELECT id FROM course_categories WHERE slug = $1', ['ai-development']);
        
        if (courseCategoryResult.rows.length > 0) {
          const courseCategoryId = courseCategoryResult.rows[0].id;
          const aiCategoryId = aiCategoryResult.rows[0]?.id || courseCategoryId;
          
          await query(`
            INSERT INTO courses (title, slug, description, content, instructor_name, instructor_bio, price, category_id, status, difficulty_level, enrollment_count, rating, rating_count) VALUES
                ('MCP Fundamentals: Building AI Applications', 'mcp-fundamentals-building-ai-applications',
                 'Master the fundamentals of Model Context Protocol and learn to build powerful AI applications.',
                 'This comprehensive course covers everything you need to know about MCP development, from basic concepts to advanced implementations. You will learn how to set up your development environment, create your first MCP server, implement tools and resources, and deploy production-ready applications.',
                 'Dr. Sarah Chen', 'AI Research Scientist with 10+ years of experience', 99.99, $1, 'published', 'beginner', 245, 4.8, 42),
                ('Advanced AI Agent Development', 'advanced-ai-agent-development',
                 'Build sophisticated AI agents using cutting-edge MCP techniques and best practices.',
                 'Take your AI development skills to the next level with advanced agent architectures and real-world applications. This course covers complex agent patterns, multi-agent systems, and enterprise-level deployment strategies.',
                 'Prof. Michael Rodriguez', 'Computer Science Professor and AI Consultant', 149.99, $2, 'published', 'advanced', 128, 4.9, 28),
                ('Introduction to AI Development', 'introduction-to-ai-development',
                 'Perfect starting point for anyone interested in AI development and machine learning.',
                 'Start your AI journey with this beginner-friendly introduction to core concepts, tools, and practical applications. No prior experience required.',
                 'Dr. Lisa Wang', 'AI Education Specialist and Former Google Engineer', 0.00, $2, 'published', 'beginner', 512, 4.7, 89)
            ON CONFLICT (slug) DO NOTHING;
          `, [courseCategoryId, aiCategoryId]);
        }
        
        // Get counts for summary
        const newsCount = await query('SELECT COUNT(*) FROM news_articles WHERE status = $1', ['published']);
        const coursesCount = await query('SELECT COUNT(*) FROM courses WHERE status = $1', ['published']);
        const newsCategoriesCount = await query('SELECT COUNT(*) FROM news_categories');
        const courseCategoriesCount = await query('SELECT COUNT(*) FROM course_categories');
        
        return res.status(200).json({
          success: true,
          message: 'Database initialized successfully',
          summary: {
            news_articles: parseInt(newsCount.rows[0].count),
            courses: parseInt(coursesCount.rows[0].count),
            news_categories: parseInt(newsCategoriesCount.rows[0].count),
            course_categories: parseInt(courseCategoriesCount.rows[0].count)
          }
        });
      } catch (dbError) {
        console.error('Database initialization error:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Database initialization failed',
          message: dbError.message
        });
      }
    }

    return res.status(405).json({ 
      success: false,
      error: `Method ${req.method} not allowed` 
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}