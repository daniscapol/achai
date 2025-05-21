-- SQL Schema for News Articles table

CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(512),
    image_color VARCHAR(100),
    image_icon VARCHAR(100),
    source VARCHAR(100),
    source_url VARCHAR(512),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE,
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    views_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    author VARCHAR(100),
    external_url VARCHAR(512)
);

-- Create index on commonly searched fields
CREATE INDEX IF NOT EXISTS idx_news_title ON news_articles (title);
CREATE INDEX IF NOT EXISTS idx_news_tags ON news_articles USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles (category);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles (is_published);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news_articles (featured);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_articles (published_at);

-- Add comments to table and columns
COMMENT ON TABLE news_articles IS 'Stores all news articles';
COMMENT ON COLUMN news_articles.id IS 'Primary key';
COMMENT ON COLUMN news_articles.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN news_articles.title IS 'Article title';
COMMENT ON COLUMN news_articles.summary IS 'Short summary of the article';
COMMENT ON COLUMN news_articles.content IS 'Full markdown content of the article';
COMMENT ON COLUMN news_articles.image_url IS 'URL to the article featured image';
COMMENT ON COLUMN news_articles.image_color IS 'Gradient color for UI displays';
COMMENT ON COLUMN news_articles.image_icon IS 'Icon identifier for UI displays';
COMMENT ON COLUMN news_articles.source IS 'Source of the news (e.g., company name)';
COMMENT ON COLUMN news_articles.source_url IS 'URL to the source website';
COMMENT ON COLUMN news_articles.published_at IS 'Publication timestamp';
COMMENT ON COLUMN news_articles.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN news_articles.is_published IS 'Whether the article is published or draft';
COMMENT ON COLUMN news_articles.category IS 'Primary category';
COMMENT ON COLUMN news_articles.tags IS 'Array of tags';
COMMENT ON COLUMN news_articles.views_count IS 'Number of views';
COMMENT ON COLUMN news_articles.featured IS 'Whether the article is featured';
COMMENT ON COLUMN news_articles.author IS 'Author name';
COMMENT ON COLUMN news_articles.external_url IS 'URL to external article if applicable';

-- Sample insert statement
INSERT INTO news_articles (
    slug,
    title,
    summary,
    content,
    image_url,
    image_color,
    image_icon,
    source,
    source_url,
    published_at,
    category,
    tags,
    featured,
    author,
    external_url
)
-- Only insert if the records don't exist already
SELECT * FROM (VALUES (
    'anthropic-releases-claude-3-opus',
    'Anthropic Releases Claude 3 Opus, Most Powerful Model Yet',
    'Anthropic has released Claude 3 Opus, its most powerful AI model to date. Claude 3 Opus outperforms GPT-4 on multiple benchmarks including reasoning, mathematics, coding, and knowledge.',
    '# Anthropic Releases Claude 3 Opus, Most Powerful Model Yet\n\nAnthropic has released Claude 3 Opus, its most powerful AI model to date. Claude 3 Opus outperforms GPT-4 on multiple benchmarks including reasoning, mathematics, coding, and knowledge. The model features enhanced context understanding, improved reasoning capabilities, and stronger guardrails for safety.\n\n## Key Features\n\n- 200K token context window\n- Superior performance on mathematical and scientific reasoning\n- Enhanced coding capabilities\n- Multimodal capabilities for image understanding\n- Improved safety and reduced hallucinations\n\n## Benchmark Results\n\nClaude 3 Opus shows significant improvements over previous models and competitors:\n\n- MMLU: 86.8%\n- GSM8K: 95.3%\n- HumanEval: 84.9%\n\n## Availability\n\nClaude 3 Opus is available now through Anthropic''s API and Claude.ai website. Developers can access the model through the API with a starting price of $15 per million input tokens and $75 per million output tokens.',
    '/assets/news-images/claude3.jpg',
    'from-purple-500 to-indigo-600',
    'brain',
    'Anthropic',
    'https://www.anthropic.com/news',
    TIMESTAMP '2024-03-04',
    'Model Releases',
    ARRAY['Anthropic', 'Claude', 'Large Language Models', 'AI Safety'],
    TRUE,
    'AchAI Team',
    'https://www.anthropic.com/news/claude-3-family'
), (
    'google-launches-gemini-15-pro',
    'Google Launches Gemini 1.5 Pro with 1 Million Token Context Window',
    'Google has launched Gemini 1.5 Pro, featuring a groundbreaking 1 million token context window. This massive increase in context capacity allows the model to process and reason across extremely long inputs.',
    '# Google Launches Gemini 1.5 Pro with 1 Million Token Context Window\n\nGoogle has launched Gemini 1.5 Pro, featuring a groundbreaking 1 million token context window. This massive increase in context capacity allows the model to process and reason across extremely long inputs, including entire codebases, books, or hours of video.\n\n## Revolutionary Context Window\n\nGemini 1.5 Pro''s 1 million token context window represents a significant leap forward in LLM capabilities. For comparison:\n\n- GPT-4 offers a 128K token context window\n- Claude 3 offers a 200K token context window\n\nThis expanded context enables entirely new use cases like analyzing and reasoning across:\n\n- Entire codebases\n- Full books and lengthy research papers\n- Hours of transcribed audio or video\n- Thousands of documents at once\n\n## Technical Innovations\n\nAccording to Google, this breakthrough comes from a new architecture called "Recurrent Memory Transformer," which allows the model to efficiently process and retrieve information across massive context lengths without the computational explosion normally associated with transformer attention mechanisms.\n\n## Early Access and Pricing\n\nGemini 1.5 Pro is available now in limited preview through Google AI Studio and Vertex AI. Pricing has not been announced for the 1M context version, though Google indicates it will use a mixture-of-experts architecture to keep computational costs reasonable.',
    '/assets/news-images/gemini.jpg',
    'from-indigo-500 to-blue-600',
    'brain',
    'Google DeepMind',
    'https://deepmind.google/blog/',
    TIMESTAMP '2024-02-15',
    'Model Releases',
    ARRAY['Google', 'Gemini', 'LLMs', 'Long Context'],
    FALSE,
    'AchAI Team',
    'https://deepmind.google/technologies/gemini/1.5/'
)) AS source(slug, title, summary, content, image_url, image_color, image_icon, source, source_url, published_at, category, tags, featured, author, external_url)
WHERE NOT EXISTS (SELECT 1 FROM news_articles n WHERE n.slug = source.slug);