-- SQL script to alter products table to add missing columns

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Check and add icon_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'icon_url') THEN
        ALTER TABLE products ADD COLUMN icon_url VARCHAR(512);
    END IF;

    -- Check and add categories
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'categories') THEN
        ALTER TABLE products ADD COLUMN categories TEXT[];
    END IF;

    -- Check and add product_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'product_type') THEN
        ALTER TABLE products ADD COLUMN product_type VARCHAR(50) DEFAULT 'mcp_server';
    END IF;

    -- Check and add github_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'github_url') THEN
        ALTER TABLE products ADD COLUMN github_url VARCHAR(512);
    END IF;

    -- Check and add official
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'official') THEN
        ALTER TABLE products ADD COLUMN official BOOLEAN DEFAULT FALSE;
    END IF;

    -- Check and add docs_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'docs_url') THEN
        ALTER TABLE products ADD COLUMN docs_url VARCHAR(512);
    END IF;

    -- Check and add demo_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'demo_url') THEN
        ALTER TABLE products ADD COLUMN demo_url VARCHAR(512);
    END IF;

    -- Check and add language
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'language') THEN
        ALTER TABLE products ADD COLUMN language VARCHAR(100);
    END IF;

    -- Check and add license
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'license') THEN
        ALTER TABLE products ADD COLUMN license VARCHAR(100);
    END IF;

    -- Check and add creator
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'creator') THEN
        ALTER TABLE products ADD COLUMN creator VARCHAR(100);
    END IF;

    -- Check and add version
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'version') THEN
        ALTER TABLE products ADD COLUMN version VARCHAR(50);
    END IF;

    -- Check and add installation_command
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'installation_command') THEN
        ALTER TABLE products ADD COLUMN installation_command TEXT;
    END IF;

    -- Check and add tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[];
    END IF;

    -- Check and add slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'slug') THEN
        ALTER TABLE products ADD COLUMN slug VARCHAR(255);
        
        -- Generate slugs for existing products
        UPDATE products SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
        WHERE slug IS NULL;
        
        -- Add NOT NULL constraint
        ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
    END IF;

    -- Check and add stars_numeric
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'stars_numeric') THEN
        ALTER TABLE products ADD COLUMN stars_numeric INTEGER DEFAULT 0;
    END IF;

    -- Make price optional (can be null)
    ALTER TABLE products ALTER COLUMN price DROP NOT NULL;
    ALTER TABLE products ALTER COLUMN price SET DEFAULT 0;

    -- Make sku not required (drop unique constraint if exists)
    BEGIN
        ALTER TABLE products DROP CONSTRAINT products_sku_key;
    EXCEPTION
        WHEN undefined_object THEN
            -- Constraint doesn't exist, do nothing
    END;

END$$;

-- Create slug index if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'products' AND indexname = 'idx_products_slug'
    ) THEN
        CREATE UNIQUE INDEX idx_products_slug ON products(slug);
    END IF;
END$$;

-- Create product_type index if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'products' AND indexname = 'idx_products_product_type'
    ) THEN
        CREATE INDEX idx_products_product_type ON products(product_type);
    END IF;
END$$;