-- Migration: Create news_articles table
-- Date: 2024-01-23
-- Description: Creates the news_articles table for blog/news content management

-- Create categories table if it doesn't exist (for news categories)
CREATE TABLE IF NOT EXISTS news_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create authors table if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX idx_news_articles_slug ON news_articles(slug);
CREATE INDEX idx_news_articles_status ON news_articles(status);
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_author_id ON news_articles(author_id);
CREATE INDEX idx_news_articles_category_id ON news_articles(category_id);
CREATE INDEX idx_news_articles_status_published ON news_articles(status, published_at) WHERE status = 'published';

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_articles_updated_at 
    BEFORE UPDATE ON news_articles 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_news_categories_updated_at 
    BEFORE UPDATE ON news_categories 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_authors_updated_at 
    BEFORE UPDATE ON authors 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Insert some default categories
INSERT INTO news_categories (name, slug, description) VALUES
    ('Product Updates', 'product-updates', 'Latest updates and releases for our products'),
    ('Industry News', 'industry-news', 'News and trends in the AI and MCP ecosystem'),
    ('Company News', 'company-news', 'Updates about our company and team'),
    ('Technical Articles', 'technical-articles', 'In-depth technical content and insights')
ON CONFLICT (slug) DO NOTHING;

-- Insert a default author (admin)
INSERT INTO authors (name, email, bio) VALUES
    ('Admin', 'admin@achai.com', 'achAI Administrator')
ON CONFLICT (email) DO NOTHING;