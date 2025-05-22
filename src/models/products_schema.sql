-- SQL script to create products table

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(100),
  sku VARCHAR(50) UNIQUE,
  inventory_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add indexes for improved performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;

-- Optional: Add sample data
INSERT INTO products (name, description, price, image_url, category, sku, inventory_count, is_featured, is_active)
VALUES
  ('Product 1', 'This is product 1 description', 19.99, '/assets/product1.jpg', 'Category A', 'SKU001', 100, true, true),
  ('Product 2', 'This is product 2 description', 29.99, '/assets/product2.jpg', 'Category B', 'SKU002', 75, false, true),
  ('Product 3', 'This is product 3 description', 39.99, '/assets/product3.jpg', 'Category A', 'SKU003', 50, true, true),
  ('Product 4', 'This is product 4 description', 49.99, '/assets/product4.jpg', 'Category C', 'SKU004', 25, false, true),
  ('Product 5', 'This is product 5 description', 59.99, '/assets/product5.jpg', 'Category B', 'SKU005', 15, true, true);

-- You would run this SQL script against your database to set up the products table