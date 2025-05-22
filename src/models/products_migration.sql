-- Migration script to update products table for tech hub
BEGIN;

-- Add new columns if they don't exist
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS icon_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) NOT NULL DEFAULT 'mcp_server',
  ADD COLUMN IF NOT EXISTS categories TEXT[], -- Store multiple categories as array
  ADD COLUMN IF NOT EXISTS github_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS official BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS docs_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS demo_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS language VARCHAR(100),
  ADD COLUMN IF NOT EXISTS license VARCHAR(100),
  ADD COLUMN IF NOT EXISTS creator VARCHAR(255),
  ADD COLUMN IF NOT EXISTS version VARCHAR(50),
  ADD COLUMN IF NOT EXISTS installation_command TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stars_numeric INTEGER DEFAULT 0;

-- Create constraint to ensure product_type is one of allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_type_check'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT product_type_check 
      CHECK (product_type IN ('mcp_server', 'mcp_client', 'ai_agent', 'ready_to_use'));
  END IF;
END$$;

-- Add unique constraint on slug if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key'
  ) THEN
    -- Generate slugs for existing products that don't have them
    UPDATE products 
    SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
    WHERE slug IS NULL OR slug = '';
    
    -- Add unique constraint
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END$$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_official ON products(official) WHERE official = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_stars_numeric ON products(stars_numeric);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Update existing products to have default values
UPDATE products 
SET 
  product_type = 'mcp_server',
  official = FALSE,
  categories = ARRAY[category] -- Convert single category to array
WHERE stars_numeric = 0;

COMMIT;