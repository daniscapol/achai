-- Update image URLs for Claude Desktop and related products
UPDATE products 
SET image_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s' 
WHERE id = 492;

-- Update image URLs for Claude CLI products
UPDATE products 
SET image_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s' 
WHERE name ILIKE '%Claude%CLI%';

-- Update image URLs for Claude Code products
UPDATE products 
SET image_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s' 
WHERE name ILIKE '%Claude%Code%';

-- Update Sourcegraph Cody (ID: 513)
UPDATE products 
SET image_url = 'https://about.sourcegraph.com/sourcegraph-mark.png' 
WHERE id = 513;

-- Update GPT Computer Assistant (ID: 515)
UPDATE products 
SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png' 
WHERE id = 515;

-- Update Cursor (ID: 517)
UPDATE products 
SET image_url = 'https://avatars.githubusercontent.com/u/96096435?s=200&v=4' 
WHERE id = 517;

-- Update Goose (ID: 519)
UPDATE products 
SET image_url = 'https://avatars.githubusercontent.com/u/139895814?s=200&v=4' 
WHERE id = 519;

-- Update Visual Studio Code (ID: 520)
UPDATE products 
SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/1200px-Visual_Studio_Code_1.35_icon.svg.png' 
WHERE id = 520;

-- Verify the updates
SELECT id, name, image_url FROM products WHERE id IN (492, 513, 515, 517, 519, 520);

-- Check if any other products still use /assets/client-logos/
SELECT id, name, image_url FROM products WHERE image_url LIKE '%/assets/client-logos/%';