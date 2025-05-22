-- Tutorials table schema
CREATE TABLE IF NOT EXISTS tutorials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    featured_image_url VARCHAR(512),
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    difficulty_level VARCHAR(50) DEFAULT 'Beginner', -- Beginner, Intermediate, Advanced
    estimated_reading_time INTEGER DEFAULT 5, -- in minutes
    author_name VARCHAR(100) DEFAULT 'AchaAI Team',
    author_email VARCHAR(255),
    author_avatar_url VARCHAR(512),
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.0, -- 0.00 to 5.00
    rating_count INTEGER DEFAULT 0,
    sections JSONB DEFAULT '[]'::JSONB, -- Structured content sections
    prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],
    learning_outcomes TEXT[] DEFAULT ARRAY[]::TEXT[],
    resources JSONB DEFAULT '[]'::JSONB, -- Related links, downloads, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON tutorials(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials(category);
CREATE INDEX IF NOT EXISTS idx_tutorials_is_featured ON tutorials(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_tutorials_is_published ON tutorials(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_tutorials_difficulty ON tutorials(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_tutorials_created_at ON tutorials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_view_count ON tutorials(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_rating ON tutorials(rating_average DESC);

-- GIN index for array fields for better search performance
CREATE INDEX IF NOT EXISTS idx_tutorials_categories_gin ON tutorials USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_tutorials_tags_gin ON tutorials USING GIN(tags);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_tutorials_search ON tutorials USING GIN(to_tsvector('english', title || ' ' || description || ' ' || content));

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_tutorials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_tutorials_updated_at
    BEFORE UPDATE ON tutorials
    FOR EACH ROW
    EXECUTE FUNCTION update_tutorials_updated_at(); 