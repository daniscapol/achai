import db from './src/utils/db.js';

async function initSampleData() {
  // Initialize database connection first
  try {
    await db.testConnection();
    console.log('📊 Database connection established');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }

  console.log('🚀 Adding sample data for News and Courses...');

  try {
    // Ensure we have authors and categories first
    const author = await db.query('SELECT id FROM authors WHERE email = $1', ['admin@achai.com']);
    if (author.rows.length === 0) {
      await db.query(`
        INSERT INTO authors (name, email, bio) VALUES
        ('Admin', 'admin@achai.com', 'achAI Administrator')
      `);
    }

    // Add sample news articles using the actual schema
    const sampleNews = [
      {
        title: "Introduction to Model Context Protocol (MCP)",
        slug: "introduction-to-model-context-protocol-mcp",
        content: "The Model Context Protocol (MCP) is revolutionizing how AI models interact with external systems. This comprehensive guide explores the fundamentals of MCP and its implementation strategies...",
        summary: "Learn the basics of Model Context Protocol and how it's changing AI development.",
        category: "Technical Articles",
        author: "ACHAI Team"
      },
      {
        title: "Building Your First AI Agent with MCP",
        slug: "building-your-first-ai-agent-with-mcp",
        content: "Step-by-step tutorial on creating powerful AI agents using the Model Context Protocol. We'll cover setup, configuration, and best practices for agent development...",
        summary: "A practical guide to creating AI agents using MCP technology.",
        category: "Technical Articles",
        author: "ACHAI Team"
      },
      {
        title: "MCP Server Development Best Practices",
        slug: "mcp-server-development-best-practices",
        content: "Essential best practices for developing robust MCP servers. Learn about security, performance optimization, and scalability considerations...",
        summary: "Essential tips for building production-ready MCP servers.",
        category: "Technical Articles", 
        author: "Development Team"
      }
    ];

    for (const article of sampleNews) {
      await db.query(`
        INSERT INTO news_articles (
          title, slug, content, summary, author, category,
          is_published, published_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, true, NOW(), NOW()
        ) ON CONFLICT (slug) DO NOTHING
      `, [article.title, article.slug, article.content, article.summary, article.author, article.category]);
    }

    // Add sample courses
    const sampleCourses = [
      {
        title: "MCP Fundamentals: Building AI Applications",
        slug: "mcp-fundamentals-building-ai-applications",
        description: "Master the fundamentals of Model Context Protocol and learn to build powerful AI applications.",
        content: "This comprehensive course covers everything you need to know about MCP development...",
        instructor_name: "Dr. Sarah Chen",
        instructor_bio: "AI Research Scientist with 10+ years of experience",
        price: 99.99,
        duration_hours: 8.5,
        difficulty_level: "beginner",
        category: "mcp-integration"
      },
      {
        title: "Advanced AI Agent Development",
        slug: "advanced-ai-agent-development", 
        description: "Build sophisticated AI agents using cutting-edge MCP techniques and best practices.",
        content: "Take your AI development skills to the next level with advanced agent architectures...",
        instructor_name: "Prof. Michael Rodriguez",
        instructor_bio: "Computer Science Professor and AI Consultant",
        price: 149.99,
        duration_hours: 12.0,
        difficulty_level: "advanced",
        category: "agent-development"
      }
    ];

    for (const course of sampleCourses) {
      await db.query(`
        INSERT INTO courses (
          title, slug, description, content, instructor_name, instructor_bio,
          price, currency, duration_hours, difficulty_level, status,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 'USD', $8, $9, 'published',
          NOW(), NOW()
        ) ON CONFLICT (slug) DO NOTHING
      `, [
        course.title, course.slug, course.description, course.content,
        course.instructor_name, course.instructor_bio, course.price,
        course.duration_hours, course.difficulty_level
      ]);
    }

    console.log('✅ Sample data added successfully');
    
    // Show counts
    const newsCount = await db.query('SELECT COUNT(*) FROM news_articles WHERE is_published = true');
    const coursesCount = await db.query('SELECT COUNT(*) FROM courses WHERE status = $1', ['published']);
    
    console.log(`📰 News articles: ${newsCount.rows[0].count}`);
    console.log(`📚 Courses: ${coursesCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initSampleData()
    .then(() => {
      console.log('✅ Sample data initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Sample data initialization failed:', error);
      process.exit(1);
    });
}

export { initSampleData };