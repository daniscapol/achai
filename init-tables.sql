-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Create course categories table
CREATE TABLE IF NOT EXISTS course_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create news article tags junction table
CREATE TABLE IF NOT EXISTS news_article_tags (
    article_id INTEGER REFERENCES news_articles(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Create course tags junction table
CREATE TABLE IF NOT EXISTS course_tags (
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, tag_id)
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

-- Insert sample news articles
INSERT INTO news_articles (title, slug, content, excerpt, author_id, category_id, status, published_at) 
SELECT 
    'Introduction to Model Context Protocol (MCP)',
    'introduction-to-model-context-protocol-mcp',
    'The Model Context Protocol (MCP) is revolutionizing how AI models interact with external systems. This comprehensive guide explores the fundamentals of MCP and its implementation strategies...',
    'Learn the basics of Model Context Protocol and how it''s changing AI development.',
    a.id,
    c.id,
    'published',
    NOW()
FROM authors a, news_categories c 
WHERE a.name = 'Admin' AND c.name = 'Technical Articles'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO news_articles (title, slug, content, excerpt, author_id, category_id, status, published_at) 
SELECT 
    'Building Your First AI Agent with MCP',
    'building-your-first-ai-agent-with-mcp',
    'Step-by-step tutorial on creating powerful AI agents using the Model Context Protocol. We''ll cover setup, configuration, and best practices for agent development...',
    'A practical guide to creating AI agents using MCP technology.',
    a.id,
    c.id,
    'published',
    NOW()
FROM authors a, news_categories c 
WHERE a.name = 'Admin' AND c.name = 'Technical Articles'
ON CONFLICT (slug) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (title, slug, description, content, instructor_name, instructor_bio, price, duration_hours, difficulty_level, category_id, status) 
SELECT 
    'MCP Fundamentals: Building AI Applications',
    'mcp-fundamentals-building-ai-applications',
    'Master the fundamentals of Model Context Protocol and learn to build powerful AI applications.',
    'This comprehensive course covers everything you need to know about MCP development...',
    'Dr. Sarah Chen',
    'AI Research Scientist with 10+ years of experience',
    99.99,
    8.5,
    'beginner',
    c.id,
    'published'
FROM course_categories c 
WHERE c.name = 'MCP Integration'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO courses (title, slug, description, content, instructor_name, instructor_bio, price, duration_hours, difficulty_level, category_id, status) 
SELECT 
    'Introduction to AI and Machine Learning',
    'introduction-to-ai-and-machine-learning',
    'Perfect starting point for anyone interested in AI and machine learning concepts.',
    'Start your AI journey with this beginner-friendly introduction to core concepts...',
    'Dr. Lisa Thompson',
    'Data Science Lead with expertise in ML education',
    0.00,
    6.0,
    'beginner',
    c.id,
    'published'
FROM course_categories c 
WHERE c.name = 'AI Development'
ON CONFLICT (slug) DO NOTHING;