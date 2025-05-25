import db from '../src/utils/db.js';
const { query } = db;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initNewsAndCourses() {
  console.log('🚀 Initializing News and Courses database...');

  try {
    // Create news tables
    console.log('📰 Creating news tables...');
    const newsSchema = fs.readFileSync(path.join(__dirname, '../src/models/news_schema.sql'), 'utf8');
    await query(newsSchema);
    console.log('✅ News tables created');

    // Create courses tables
    console.log('📚 Creating courses tables...');
    const coursesSchema = fs.readFileSync(path.join(__dirname, '../src/models/courses_schema.sql'), 'utf8');
    await query(coursesSchema);
    console.log('✅ Courses tables created');

    // Create course relationships
    console.log('🔗 Creating course relationships...');
    const coursesRelationships = fs.readFileSync(path.join(__dirname, '../src/models/courses_relationships.sql'), 'utf8');
    await query(coursesRelationships);
    console.log('✅ Course relationships created');

    // Create tags table if it doesn't exist
    console.log('🏷️ Creating tags table...');
    await query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
      CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

      -- Create news article tags junction table
      CREATE TABLE IF NOT EXISTS news_article_tags (
        article_id INTEGER REFERENCES news_articles(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (article_id, tag_id)
      );

      CREATE INDEX IF NOT EXISTS idx_news_article_tags_article ON news_article_tags(article_id);
      CREATE INDEX IF NOT EXISTS idx_news_article_tags_tag ON news_article_tags(tag_id);
    `);
    console.log('✅ Tags tables created');

    // Insert sample news data
    console.log('📄 Inserting sample news data...');
    const sampleNewsData = [
      {
        title: "Introduction to Model Context Protocol (MCP)",
        slug: "introduction-to-model-context-protocol-mcp",
        content: "The Model Context Protocol (MCP) is revolutionizing how AI models interact with external systems. This comprehensive guide explores the fundamentals of MCP and its implementation strategies...",
        excerpt: "Learn the basics of Model Context Protocol and how it's changing AI development.",
        category: "Technical Articles",
        author: "Admin"
      },
      {
        title: "Building Your First AI Agent with MCP",
        slug: "building-your-first-ai-agent-with-mcp",
        content: "Step-by-step tutorial on creating powerful AI agents using the Model Context Protocol. We'll cover setup, configuration, and best practices for agent development...",
        excerpt: "A practical guide to creating AI agents using MCP technology.",
        category: "Technical Articles", 
        author: "Admin"
      },
      {
        title: "MCP Server Development Best Practices",
        slug: "mcp-server-development-best-practices",
        content: "Essential best practices for developing robust MCP servers. Learn about security, performance optimization, and scalability considerations...",
        excerpt: "Essential tips for building production-ready MCP servers.",
        category: "Technical Articles",
        author: "Admin"
      },
      {
        title: "achAI Platform Updates - January 2025",
        slug: "achai-platform-updates-january-2025",
        content: "Exciting new features and improvements coming to the achAI platform this month. We've added enhanced search capabilities, improved user interface, and expanded our MCP server collection...",
        excerpt: "Latest updates and improvements to the achAI platform.",
        category: "Product Updates",
        author: "Admin"
      }
    ];

    for (const article of sampleNewsData) {
      await query(`
        INSERT INTO news_articles (
          title, slug, content, excerpt, author_id, category_id, 
          status, published_at, created_at, updated_at
        ) 
        SELECT 
          $1, $2, $3, $4, 
          a.id, c.id, 
          'published', NOW(), NOW(), NOW()
        FROM authors a, news_categories c 
        WHERE a.name = $5 AND c.name = $6
        ON CONFLICT (slug) DO NOTHING
      `, [article.title, article.slug, article.content, article.excerpt, article.author, article.category]);
    }
    console.log('✅ Sample news data inserted');

    // Insert sample courses data
    console.log('📖 Inserting sample courses data...');
    const sampleCoursesData = [
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
        category: "MCP Integration"
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
        category: "Agent Development"
      },
      {
        title: "Introduction to AI and Machine Learning",
        slug: "introduction-to-ai-and-machine-learning",
        description: "Perfect starting point for anyone interested in AI and machine learning concepts.",
        content: "Start your AI journey with this beginner-friendly introduction to core concepts...",
        instructor_name: "Dr. Lisa Thompson",
        instructor_bio: "Data Science Lead with expertise in ML education",
        price: 0.00,
        duration_hours: 6.0,
        difficulty_level: "beginner",
        category: "AI Development"
      },
      {
        title: "Data Science with AI Tools",
        slug: "data-science-with-ai-tools",
        description: "Learn modern data science techniques enhanced by AI and machine learning tools.",
        content: "Combine traditional data science with modern AI tools for powerful insights...",
        instructor_name: "Dr. James Wilson",
        instructor_bio: "Senior Data Scientist and Analytics Expert",
        price: 79.99,
        duration_hours: 10.0,
        difficulty_level: "intermediate",
        category: "Data Science"
      }
    ];

    for (const course of sampleCoursesData) {
      await query(`
        INSERT INTO courses (
          title, slug, description, content, instructor_name, instructor_bio,
          price, currency, duration_hours, difficulty_level, category_id,
          status, created_at, updated_at
        ) 
        SELECT 
          $1, $2, $3, $4, $5, $6, $7, 'USD', $8, $9, 
          c.id, 'published', NOW(), NOW()
        FROM course_categories c 
        WHERE c.name = $10
        ON CONFLICT (slug) DO NOTHING
      `, [
        course.title, course.slug, course.description, course.content,
        course.instructor_name, course.instructor_bio, course.price,
        course.duration_hours, course.difficulty_level, course.category
      ]);
    }
    console.log('✅ Sample courses data inserted');

    // Add some sample tags
    console.log('🏷️ Adding sample tags...');
    const sampleTags = ['MCP', 'AI', 'Machine Learning', 'Tutorial', 'Beginner', 'Advanced', 'Python', 'JavaScript', 'API', 'Development'];
    
    for (const tagName of sampleTags) {
      await query(`
        INSERT INTO tags (name, slug, usage_count)
        VALUES ($1, $2, 0)
        ON CONFLICT (name) DO NOTHING
      `, [tagName, tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')]);
    }
    console.log('✅ Sample tags added');

    console.log('🎉 News and Courses database initialization complete!');
    
    // Show summary
    const newsCount = await query('SELECT COUNT(*) FROM news_articles WHERE status = $1', ['published']);
    const coursesCount = await query('SELECT COUNT(*) FROM courses WHERE status = $1', ['published']);
    const categoriesCount = await query('SELECT COUNT(*) FROM news_categories');
    const courseCategoriesCount = await query('SELECT COUNT(*) FROM course_categories');
    
    console.log('\n📊 Summary:');
    console.log(`   📰 News articles: ${newsCount.rows[0].count}`);
    console.log(`   📚 Courses: ${coursesCount.rows[0].count}`);
    console.log(`   📂 News categories: ${categoriesCount.rows[0].count}`);
    console.log(`   📂 Course categories: ${courseCategoriesCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initNewsAndCourses()
    .then(() => {
      console.log('✅ Initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

export { initNewsAndCourses };