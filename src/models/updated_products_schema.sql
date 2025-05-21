-- SQL script to update products table to match the expected fields

-- First check if the table exists and drop it if it does
DROP TABLE IF EXISTS products;

-- Now create the table with all needed fields
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  image_url VARCHAR(512),
  icon_url VARCHAR(512),
  category VARCHAR(100),
  categories TEXT[], -- Array of categories
  sku VARCHAR(50),
  product_type VARCHAR(50) DEFAULT 'mcp_server',
  github_url VARCHAR(512),
  official BOOLEAN DEFAULT FALSE,
  docs_url VARCHAR(512),
  demo_url VARCHAR(512),
  language VARCHAR(100),
  license VARCHAR(100),
  creator VARCHAR(100),
  version VARCHAR(50),
  installation_command TEXT,
  tags TEXT[], -- Array of tags
  inventory_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  slug VARCHAR(255) NOT NULL,
  stars_numeric INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint for slug
CREATE UNIQUE INDEX idx_products_slug ON products(slug);

-- Add indexes for improved performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;