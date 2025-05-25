import pg from 'pg';

const dbConfig = {
  user: process.env.DB_USER || 'achai',
  host: process.env.DB_HOST || 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: process.env.DB_NAME || 'achai',
  password: process.env.DB_PASSWORD || 'TrinityPW1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: { rejectUnauthorized: false }
};

async function addSampleData() {
  const client = new pg.Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');
    
    // Insert sample news articles
    console.log('Adding sample news articles...');
    
    // Get author and category IDs
    const authorResult = await client.query('SELECT id FROM authors WHERE email = $1', ['admin@achai.com']);
    const categoryResult = await client.query('SELECT id FROM news_categories WHERE slug = $1', ['technical-articles']);
    
    if (authorResult.rows.length === 0) {
      console.log('No author found, skipping news articles');
    } else if (categoryResult.rows.length === 0) {
      console.log('No category found, skipping news articles');
    } else {
      const authorId = authorResult.rows[0].id;
      const categoryId = categoryResult.rows[0].id;
      
      const newsArticles = [
        {
          title: 'Introduction to Model Context Protocol (MCP)',
          slug: 'introduction-to-model-context-protocol-mcp',
          content: 'The Model Context Protocol (MCP) is revolutionizing how AI models interact with external systems. This comprehensive guide explores the fundamentals of MCP and its implementation strategies. Learn how to integrate MCP into your AI applications and unlock new possibilities for AI-powered automation.',
          excerpt: 'Learn the basics of Model Context Protocol and how it\'s changing AI development.'
        },
        {
          title: 'Building Your First AI Agent with MCP',
          slug: 'building-your-first-ai-agent-with-mcp',
          content: 'Step-by-step tutorial on creating powerful AI agents using the Model Context Protocol. We\'ll cover setup, configuration, and best practices for agent development. This hands-on guide will take you from zero to having a working AI agent.',
          excerpt: 'A practical guide to creating AI agents using MCP technology.'
        },
        {
          title: 'MCP Server Development Best Practices',
          slug: 'mcp-server-development-best-practices',
          content: 'Essential best practices for developing robust MCP servers. Learn about security, performance optimization, and scalability considerations when building production-ready MCP implementations.',
          excerpt: 'Essential tips for building production-ready MCP servers.'
        },
        {
          title: 'achAI Platform Updates - January 2025',
          slug: 'achai-platform-updates-january-2025',
          content: 'Exciting new features and improvements coming to the achAI platform this month. We\'ve added enhanced search capabilities, improved user interface, and expanded our MCP server collection with over 100 new integrations.',
          excerpt: 'Latest updates and improvements to the achAI platform.'
        }
      ];
      
      for (const article of newsArticles) {
        await client.query(
          `INSERT INTO news_articles (title, slug, content, excerpt, author_id, category_id, status, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'published', NOW())
           ON CONFLICT (slug) DO NOTHING`,
          [article.title, article.slug, article.content, article.excerpt, authorId, categoryId]
        );
      }
      console.log('✅ News articles added');
    }
    
    // Insert sample courses
    console.log('Adding sample courses...');
    
    const mcpCategoryResult = await client.query('SELECT id FROM course_categories WHERE slug = $1', ['mcp-integration']);
    const aiCategoryResult = await client.query('SELECT id FROM course_categories WHERE slug = $1', ['ai-development']);
    
    if (mcpCategoryResult.rows.length > 0) {
      const mcpCategoryId = mcpCategoryResult.rows[0].id;
      
      await client.query(
        `INSERT INTO courses (title, slug, description, content, instructor_name, instructor_bio, price, duration_hours, difficulty_level, category_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published')
         ON CONFLICT (slug) DO NOTHING`,
        [
          'MCP Fundamentals: Building AI Applications',
          'mcp-fundamentals-building-ai-applications',
          'Master the fundamentals of Model Context Protocol and learn to build powerful AI applications.',
          'This comprehensive course covers everything you need to know about MCP development. From basic concepts to advanced implementation patterns, you\'ll learn how to create robust MCP servers and clients.',
          'Dr. Sarah Chen',
          'AI Research Scientist with 10+ years of experience in distributed systems and AI integration',
          99.99,
          8.5,
          'beginner',
          mcpCategoryId
        ]
      );
    }
    
    if (aiCategoryResult.rows.length > 0) {
      const aiCategoryId = aiCategoryResult.rows[0].id;
      
      await client.query(
        `INSERT INTO courses (title, slug, description, content, instructor_name, instructor_bio, price, duration_hours, difficulty_level, category_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published')
         ON CONFLICT (slug) DO NOTHING`,
        [
          'Introduction to AI and Machine Learning',
          'introduction-to-ai-and-machine-learning',
          'Perfect starting point for anyone interested in AI and machine learning concepts.',
          'Start your AI journey with this beginner-friendly introduction to core concepts. Learn about neural networks, machine learning algorithms, and practical AI applications.',
          'Dr. Lisa Thompson',
          'Data Science Lead with expertise in ML education and practical AI applications',
          0.00,
          6.0,
          'beginner',
          aiCategoryId
        ]
      );
      
      await client.query(
        `INSERT INTO courses (title, slug, description, content, instructor_name, instructor_bio, price, duration_hours, difficulty_level, category_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published')
         ON CONFLICT (slug) DO NOTHING`,
        [
          'Advanced AI Agent Development',
          'advanced-ai-agent-development',
          'Build sophisticated AI agents using cutting-edge techniques and best practices.',
          'Take your AI development skills to the next level with advanced agent architectures, multi-modal AI systems, and complex reasoning patterns.',
          'Prof. Michael Rodriguez',
          'Computer Science Professor and AI Consultant specializing in autonomous systems',
          149.99,
          12.0,
          'advanced',
          aiCategoryId
        ]
      );
    }
    
    console.log('✅ Courses added');
    
    // Test the data
    const newsCount = await client.query('SELECT COUNT(*) FROM news_articles WHERE status = $1', ['published']);
    const coursesCount = await client.query('SELECT COUNT(*) FROM courses WHERE status = $1', ['published']);
    
    console.log('\n📊 Summary:');
    console.log(`📰 News articles: ${newsCount.rows[0].count}`);
    console.log(`📚 Courses: ${coursesCount.rows[0].count}`);
    console.log('\n🎉 Sample data added successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

addSampleData();