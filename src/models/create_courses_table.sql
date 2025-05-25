-- Migration: Create courses table
-- Date: 2024-01-25
-- Description: Creates the courses table for course content management

-- Create course categories table if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category_id ON courses(category_id);
CREATE INDEX idx_courses_difficulty_level ON courses(difficulty_level);
CREATE INDEX idx_courses_tags ON courses USING gin(tags);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX idx_courses_status_published ON courses(status, created_at) WHERE status = 'published';
CREATE INDEX idx_courses_price ON courses(price);
CREATE INDEX idx_courses_rating ON courses(rating DESC);

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON courses 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_course_categories_updated_at 
    BEFORE UPDATE ON course_categories 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Insert some default categories
INSERT INTO course_categories (name, slug, description) VALUES
    ('AI Development', 'ai-development', 'Courses on AI and machine learning development'),
    ('MCP Integration', 'mcp-integration', 'Learn how to integrate Model Context Protocol'),
    ('Agent Development', 'agent-development', 'Build and deploy AI agents'),
    ('Web Development', 'web-development', 'Modern web development with AI integration'),
    ('Data Science', 'data-science', 'Data analysis and science with AI tools')
ON CONFLICT (slug) DO NOTHING;

-- Insert migration record
INSERT INTO migrations (name, applied_at) 
VALUES ('create_courses_table.sql', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;