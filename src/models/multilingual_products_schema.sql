-- SQL script to create multilingual products table structure
-- This will add language support to the existing products table

-- First, let's add new columns for multilingual support
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
ADD COLUMN IF NOT EXISTS name_pt VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_pt TEXT,
ADD COLUMN IF NOT EXISTS language_code VARCHAR(5) DEFAULT 'en';

-- Create indexes for performance on language fields
CREATE INDEX IF NOT EXISTS idx_products_language_code ON products(language_code);
CREATE INDEX IF NOT EXISTS idx_products_name_en ON products(name_en);
CREATE INDEX IF NOT EXISTS idx_products_name_pt ON products(name_pt);

-- Update existing products to populate the new language fields
-- Copy existing data to English fields as default
UPDATE products 
SET 
  name_en = name,
  description_en = description,
  language_code = 'en'
WHERE name_en IS NULL;

-- For products that don't have Portuguese translations yet, we'll create placeholders
UPDATE products 
SET 
  name_pt = name_en,
  description_pt = description_en
WHERE name_pt IS NULL;

-- Create a view that returns language-specific content based on a parameter
-- This will be useful for the API to fetch content in the correct language
CREATE OR REPLACE FUNCTION get_products_by_language(lang_code VARCHAR(5) DEFAULT 'en', page_num INTEGER DEFAULT 1, page_size INTEGER DEFAULT 100)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR(255),
  description TEXT,
  name_en VARCHAR(255),
  name_pt VARCHAR(255),
  description_en TEXT,
  description_pt TEXT,
  price DECIMAL(10, 2),
  image_url VARCHAR(512),
  icon_url VARCHAR(512),
  category VARCHAR(100),
  categories TEXT[],
  sku VARCHAR(50),
  product_type VARCHAR(50),
  github_url VARCHAR(512),
  official BOOLEAN,
  docs_url VARCHAR(512),
  demo_url VARCHAR(512),
  language VARCHAR(100),
  license VARCHAR(100),
  creator VARCHAR(100),
  version VARCHAR(50),
  installation_command TEXT,
  tags TEXT[],
  inventory_count INTEGER,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  slug VARCHAR(255),
  stars_numeric INTEGER,
  language_code VARCHAR(5),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
DECLARE
  offset_val INTEGER;
BEGIN
  offset_val := (page_num - 1) * page_size;
  
  RETURN QUERY
  SELECT 
    p.id,
    CASE 
      WHEN lang_code = 'pt' AND p.name_pt IS NOT NULL AND p.name_pt != '' THEN p.name_pt
      ELSE COALESCE(p.name_en, p.name)
    END as name,
    CASE 
      WHEN lang_code = 'pt' AND p.description_pt IS NOT NULL AND p.description_pt != '' THEN p.description_pt
      ELSE COALESCE(p.description_en, p.description)
    END as description,
    p.name_en,
    p.name_pt,
    p.description_en,
    p.description_pt,
    p.price,
    p.image_url,
    p.icon_url,
    p.category,
    p.categories,
    p.sku,
    p.product_type,
    p.github_url,
    p.official,
    p.docs_url,
    p.demo_url,
    p.language,
    p.license,
    p.creator,
    p.version,
    p.installation_command,
    p.tags,
    p.inventory_count,
    p.is_featured,
    p.is_active,
    p.slug,
    p.stars_numeric,
    p.language_code,
    p.created_at,
    p.updated_at
  FROM products p
  WHERE p.is_active = TRUE
  ORDER BY p.is_featured DESC, p.created_at DESC
  LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- Create a function to search products in multiple languages
CREATE OR REPLACE FUNCTION search_products_multilingual(
  search_term TEXT,
  lang_code VARCHAR(5) DEFAULT 'en',
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 100
)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR(255),
  description TEXT,
  name_en VARCHAR(255),
  name_pt VARCHAR(255),
  description_en TEXT,
  description_pt TEXT,
  price DECIMAL(10, 2),
  image_url VARCHAR(512),
  icon_url VARCHAR(512),
  category VARCHAR(100),
  categories TEXT[],
  sku VARCHAR(50),
  product_type VARCHAR(50),
  github_url VARCHAR(512),
  official BOOLEAN,
  docs_url VARCHAR(512),
  demo_url VARCHAR(512),
  language VARCHAR(100),
  license VARCHAR(100),
  creator VARCHAR(100),
  version VARCHAR(50),
  installation_command TEXT,
  tags TEXT[],
  inventory_count INTEGER,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  slug VARCHAR(255),
  stars_numeric INTEGER,
  language_code VARCHAR(5),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  relevance_score INTEGER
) AS $$
DECLARE
  offset_val INTEGER;
  search_pattern TEXT;
BEGIN
  offset_val := (page_num - 1) * page_size;
  search_pattern := '%' || LOWER(search_term) || '%';
  
  RETURN QUERY
  SELECT 
    p.id,
    CASE 
      WHEN lang_code = 'pt' AND p.name_pt IS NOT NULL AND p.name_pt != '' THEN p.name_pt
      ELSE COALESCE(p.name_en, p.name)
    END as name,
    CASE 
      WHEN lang_code = 'pt' AND p.description_pt IS NOT NULL AND p.description_pt != '' THEN p.description_pt
      ELSE COALESCE(p.description_en, p.description)
    END as description,
    p.name_en,
    p.name_pt,
    p.description_en,
    p.description_pt,
    p.price,
    p.image_url,
    p.icon_url,
    p.category,
    p.categories,
    p.sku,
    p.product_type,
    p.github_url,
    p.official,
    p.docs_url,
    p.demo_url,
    p.language,
    p.license,
    p.creator,
    p.version,
    p.installation_command,
    p.tags,
    p.inventory_count,
    p.is_featured,
    p.is_active,
    p.slug,
    p.stars_numeric,
    p.language_code,
    p.created_at,
    p.updated_at,
    CASE
      WHEN LOWER(COALESCE(p.name_en, p.name)) LIKE search_pattern OR LOWER(COALESCE(p.name_pt, '')) LIKE search_pattern THEN 1
      WHEN LOWER(COALESCE(p.description_en, p.description)) LIKE search_pattern OR LOWER(COALESCE(p.description_pt, '')) LIKE search_pattern THEN 2
      WHEN LOWER(p.category) LIKE search_pattern THEN 3
      WHEN LOWER(p.creator) LIKE search_pattern THEN 4
      ELSE 5
    END as relevance_score
  FROM products p
  WHERE p.is_active = TRUE AND (
    LOWER(COALESCE(p.name_en, p.name)) LIKE search_pattern OR
    LOWER(COALESCE(p.name_pt, '')) LIKE search_pattern OR
    LOWER(COALESCE(p.description_en, p.description)) LIKE search_pattern OR
    LOWER(COALESCE(p.description_pt, '')) LIKE search_pattern OR
    LOWER(p.category) LIKE search_pattern OR
    LOWER(p.creator) LIKE search_pattern OR
    LOWER(p.language) LIKE search_pattern OR
    LOWER(search_term) = ANY(p.tags)
  )
  ORDER BY relevance_score, p.is_featured DESC, p.created_at DESC
  LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get product by ID with language preference
CREATE OR REPLACE FUNCTION get_product_by_id_multilingual(
  product_id INTEGER,
  lang_code VARCHAR(5) DEFAULT 'en'
)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR(255),
  description TEXT,
  name_en VARCHAR(255),
  name_pt VARCHAR(255),
  description_en TEXT,
  description_pt TEXT,
  price DECIMAL(10, 2),
  image_url VARCHAR(512),
  icon_url VARCHAR(512),
  category VARCHAR(100),
  categories TEXT[],
  sku VARCHAR(50),
  product_type VARCHAR(50),
  github_url VARCHAR(512),
  official BOOLEAN,
  docs_url VARCHAR(512),
  demo_url VARCHAR(512),
  language VARCHAR(100),
  license VARCHAR(100),
  creator VARCHAR(100),
  version VARCHAR(50),
  installation_command TEXT,
  tags TEXT[],
  inventory_count INTEGER,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  slug VARCHAR(255),
  stars_numeric INTEGER,
  language_code VARCHAR(5),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    CASE 
      WHEN lang_code = 'pt' AND p.name_pt IS NOT NULL AND p.name_pt != '' THEN p.name_pt
      ELSE COALESCE(p.name_en, p.name)
    END as name,
    CASE 
      WHEN lang_code = 'pt' AND p.description_pt IS NOT NULL AND p.description_pt != '' THEN p.description_pt
      ELSE COALESCE(p.description_en, p.description)
    END as description,
    p.name_en,
    p.name_pt,
    p.description_en,
    p.description_pt,
    p.price,
    p.image_url,
    p.icon_url,
    p.category,
    p.categories,
    p.sku,
    p.product_type,
    p.github_url,
    p.official,
    p.docs_url,
    p.demo_url,
    p.language,
    p.license,
    p.creator,
    p.version,
    p.installation_command,
    p.tags,
    p.inventory_count,
    p.is_featured,
    p.is_active,
    p.slug,
    p.stars_numeric,
    p.language_code,
    p.created_at,
    p.updated_at
  FROM products p
  WHERE p.id = product_id AND p.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;