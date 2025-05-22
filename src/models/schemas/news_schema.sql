-- News table schema
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    featured_image_url VARCHAR(512),
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    author_name VARCHAR(100) DEFAULT 'AchaAI Team',
    author_email VARCHAR(255),
    author_avatar_url VARCHAR(512),
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    is_breaking BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 3, -- estimated reading time in minutes
    source_url VARCHAR(512), -- if news is from external source
    source_name VARCHAR(100), -- name of external source
    excerpt TEXT, -- short excerpt for previews
    related_products TEXT[] DEFAULT ARRAY[]::TEXT[], -- related product IDs
    external_links JSONB DEFAULT '[]'::JSONB, -- related external links
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_publish_at TIMESTAMP NULL -- for scheduled publishing
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_is_featured ON news(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_news_is_published ON news(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_news_is_breaking ON news(is_breaking) WHERE is_breaking = TRUE;
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_view_count ON news(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_news_scheduled_publish ON news(scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;

-- GIN index for array fields for better search performance
CREATE INDEX IF NOT EXISTS idx_news_categories_gin ON news USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_news_tags_gin ON news USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_related_products_gin ON news USING GIN(related_products);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_news_search ON news USING GIN(to_tsvector('english', title || ' ' || description || ' ' || content));

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW
    EXECUTE FUNCTION update_news_updated_at(); 