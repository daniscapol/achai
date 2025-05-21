-- SQL Schema for Tutorials table

CREATE TABLE IF NOT EXISTS tutorials (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(512),
    author VARCHAR(100),
    category VARCHAR(100),
    difficulty VARCHAR(50) CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    reading_time VARCHAR(50),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT '{}',
    views_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    ratings_count INTEGER DEFAULT 0,
    avg_rating NUMERIC(3,2) DEFAULT 0,
    feedback_stats JSONB DEFAULT '{}'::jsonb,
    sections JSONB[] DEFAULT '{}'::jsonb[]
);

-- Create index on commonly searched fields
CREATE INDEX IF NOT EXISTS idx_tutorials_title ON tutorials (title);
CREATE INDEX IF NOT EXISTS idx_tutorials_tags ON tutorials USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_tutorials_category ON tutorials (category);
CREATE INDEX IF NOT EXISTS idx_tutorials_published ON tutorials (is_published);
CREATE INDEX IF NOT EXISTS idx_tutorials_featured ON tutorials (featured);

-- Add comments to table and columns
COMMENT ON TABLE tutorials IS 'Stores all tutorial content';
COMMENT ON COLUMN tutorials.id IS 'Primary key';
COMMENT ON COLUMN tutorials.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN tutorials.title IS 'Tutorial title';
COMMENT ON COLUMN tutorials.description IS 'Short description/summary of the tutorial';
COMMENT ON COLUMN tutorials.content IS 'Full markdown content of the tutorial';
COMMENT ON COLUMN tutorials.image_url IS 'URL to the tutorial featured image';
COMMENT ON COLUMN tutorials.author IS 'Author name';
COMMENT ON COLUMN tutorials.category IS 'Primary category';
COMMENT ON COLUMN tutorials.difficulty IS 'Difficulty level (Beginner, Intermediate, Advanced)';
COMMENT ON COLUMN tutorials.reading_time IS 'Estimated reading time';
COMMENT ON COLUMN tutorials.published_at IS 'Publication timestamp';
COMMENT ON COLUMN tutorials.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN tutorials.is_published IS 'Whether the tutorial is published or draft';
COMMENT ON COLUMN tutorials.tags IS 'Array of tags';
COMMENT ON COLUMN tutorials.views_count IS 'Number of views';
COMMENT ON COLUMN tutorials.featured IS 'Whether the tutorial is featured';
COMMENT ON COLUMN tutorials.ratings_count IS 'Number of user ratings';
COMMENT ON COLUMN tutorials.avg_rating IS 'Average user rating (1-5 scale)';
COMMENT ON COLUMN tutorials.feedback_stats IS 'JSON object containing feedback statistics';
COMMENT ON COLUMN tutorials.sections IS 'Array of JSON objects for tutorial sections';

-- Sample insert statement
INSERT INTO tutorials (
    slug, 
    title,
    description,
    content,
    image_url,
    author,
    category,
    difficulty,
    reading_time,
    tags,
    featured,
    sections,
    ratings_count,
    avg_rating,
    feedback_stats
) 
-- Only insert if the records don't exist already
SELECT * FROM (VALUES (
    'getting-started-with-mcp-servers',
    'Getting Started with MCP Servers',
    'Learn how to set up and use MCP servers with Claude',
    '# Getting Started with MCP Servers\n\nThis tutorial will guide you through setting up your first MCP server with Claude.\n\n## What is MCP?\n\nModel Context Protocol (MCP) is an open protocol that enables LLMs to access external tools and data sources. With MCP, you can extend Claude''s capabilities to interact with databases, APIs, files, and more.\n\n## Installation\n\nTo get started, you need to install Claude Code CLI:\n\n```bash\nnpm install -g @anthropic/claude-code\n```\n\n## Adding an MCP Server\n\nOnce installed, you can add an MCP server using the following command:\n\n```bash\nclaude mcp add server-name /path/to/server\n```\n\n## Using MCP Servers\n\nAfter adding an MCP server, you can start using it in your conversations with Claude. Here''s an example:\n\n```\nUser: Use the postgres MCP server to query my database\nClaude: I''ll help you query your PostgreSQL database using the MCP server...\n```\n\n## Next Steps\n\nNow that you''ve set up your first MCP server, you might want to:\n\n1. Explore our catalog of available MCP servers\n2. Learn how to develop your own MCP server\n3. See advanced usage patterns for MCP',
    '/assets/tutorial-images/getting-started.jpg',
    'AchAI Team',
    'Servers',
    'Beginner',
    '5 min read',
    ARRAY['mcp', 'servers', 'setup'],
    TRUE,
    ARRAY[
        '{"title": "Introduction", "content": "This tutorial will guide you through setting up your first MCP server with Claude.", "order": 1}',
        '{"title": "What is MCP?", "content": "Model Context Protocol (MCP) is an open protocol that enables LLMs to access external tools and data sources. With MCP, you can extend Claude''s capabilities to interact with databases, APIs, files, and more.", "order": 2}',
        '{"title": "Installation", "content": "To get started, you need to install Claude Code CLI:\n\n```bash\nnpm install -g @anthropic/claude-code\n```", "order": 3}',
        '{"title": "Adding an MCP Server", "content": "Once installed, you can add an MCP server using the following command:\n\n```bash\nclaude mcp add server-name /path/to/server\n```", "order": 4}',
        '{"title": "Using MCP Servers", "content": "After adding an MCP server, you can start using it in your conversations with Claude. Here''s an example:\n\n```\nUser: Use the postgres MCP server to query my database\nClaude: I''ll help you query your PostgreSQL database using the MCP server...\n```", "order": 5}',
        '{"title": "Next Steps", "content": "Now that you''ve set up your first MCP server, you might want to:\n\n1. Explore our catalog of available MCP servers\n2. Learn how to develop your own MCP server\n3. See advanced usage patterns for MCP", "order": 6}'
    ]::jsonb[],
    12,
    4.5,
    '{"Easy to follow": 10, "Clear explanations": 8, "Good examples": 7, "Helpful code snippets": 5}'::jsonb
), (
    'creating-your-own-mcp-server',
    'Creating Your Own MCP Server',
    'A step-by-step guide to building custom MCP servers',
    '# Creating Your Own MCP Server\n\nThis tutorial walks you through creating a custom MCP server for Claude.\n\n## Prerequisites\n\n- Node.js 18+\n- Basic JavaScript knowledge\n- Claude Code CLI installed\n\n## Setting Up Your Project\n\nCreate a new directory for your MCP server and initialize it:\n\n```bash\nmkdir my-mcp-server\ncd my-mcp-server\nnpm init -y\n```\n\n## Install Dependencies\n\n```bash\nnpm install @anthropic/mcp-sdk typescript ts-node\n```\n\n## Create the Server Code\n\nCreate a file named `index.ts` with the following content:\n\n```typescript\nimport { MCPServer } from ''@anthropic/mcp-sdk'';\n\n// Create a new MCP server\nconst server = new MCPServer();\n\n// Register a resource\nserver.registerResource(''hello'', async () => {\n  return ''Hello, world!'';\n});\n\n// Register a tool\nserver.registerTool(''greet'', async ({ name }) => {\n  return `Hello, ${name}!`;\n});\n\n// Start the server\nserver.start();\n```\n\n## Testing Your Server\n\nYou can now build and test your server:\n\n```bash\nnpx ts-node index.ts\n```\n\n## Using Your Custom Server\n\nIn another terminal, add your server to Claude Code:\n\n```bash\nclaude mcp add my-server ./\n```\n\nNow you can use your custom server with Claude:\n\n```\nUser: Use my-server to greet Claude\nClaude: I''ll use the custom server to greet...\n```\n\n## Next Steps\n\n- Add more complex tools and resources\n- Implement authentication\n- Share your MCP server with others',
    '/assets/tutorial-images/custom-mcp-server.jpg',
    'AchAI Team',
    'Development',
    'Advanced',
    '10 min read',
    ARRAY['mcp', 'development', 'custom'],
    FALSE,
    ARRAY[
        '{"title": "Introduction", "content": "This tutorial walks you through creating a custom MCP server for Claude.", "order": 1}',
        '{"title": "Prerequisites", "content": "- Node.js 18+\n- Basic JavaScript knowledge\n- Claude Code CLI installed", "order": 2}',
        '{"title": "Setting Up Your Project", "content": "Create a new directory for your MCP server and initialize it:\n\n```bash\nmkdir my-mcp-server\ncd my-mcp-server\nnpm init -y\n```", "order": 3}',
        '{"title": "Install Dependencies", "content": "```bash\nnpm install @anthropic/mcp-sdk typescript ts-node\n```", "order": 4}',
        '{"title": "Create the Server Code", "content": "Create a file named `index.ts` with the following content:\n\n```typescript\nimport { MCPServer } from ''@anthropic/mcp-sdk'';\n\n// Create a new MCP server\nconst server = new MCPServer();\n\n// Register a resource\nserver.registerResource(''hello'', async () => {\n  return ''Hello, world!'';\n});\n\n// Register a tool\nserver.registerTool(''greet'', async ({ name }) => {\n  return `Hello, ${name}!`;\n});\n\n// Start the server\nserver.start();\n```", "order": 5}',
        '{"title": "Testing Your Server", "content": "You can now build and test your server:\n\n```bash\nnpx ts-node index.ts\n```", "order": 6}',
        '{"title": "Using Your Custom Server", "content": "In another terminal, add your server to Claude Code:\n\n```bash\nclaude mcp add my-server ./\n```\n\nNow you can use your custom server with Claude:\n\n```\nUser: Use my-server to greet Claude\nClaude: I''ll use the custom server to greet...\n```", "order": 7}',
        '{"title": "Next Steps", "content": "- Add more complex tools and resources\n- Implement authentication\n- Share your MCP server with others", "order": 8}'
    ]::jsonb[],
    8,
    4.2,
    '{"Good examples": 6, "Helpful code snippets": 8, "Clear explanations": 5, "Missing information": 2}'::jsonb
)) AS source(slug, title, description, content, image_url, author, category, difficulty, reading_time, tags, featured, sections, ratings_count, avg_rating, feedback_stats)
WHERE NOT EXISTS (SELECT 1 FROM tutorials t WHERE t.slug = source.slug);