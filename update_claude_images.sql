
CREATE OR REPLACE FUNCTION update_claude_images() RETURNS void AS 37748
BEGIN
    -- Update Claude Desktop
    UPDATE products 
    SET image_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s' 
    WHERE id = 492;
    
    -- Update any products with Claude CLI in the name
    UPDATE products
    SET image_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s'
    WHERE name ILIKE '%Claude%CLI%';
    
    -- Update any products with Claude Code in the name
    UPDATE products
    SET image_url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s'
    WHERE name ILIKE '%Claude%Code%';
    
    -- Return message
    RAISE NOTICE 'Claude image URLs updated successfully';
END;
37748 LANGUAGE plpgsql;

-- Call the function
SELECT update_claude_images();

