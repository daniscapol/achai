import { Router } from 'express';
import Product from '../models/Product.js';
import db from '../utils/db.js';

// Create Express router
const router = Router();

// Handle image URL updates
router.post('/update-image-urls', async (req, res) => {
  try {
    // Check if database is connected
    if (!db.isConnected()) {
      return res.status(500).json({ error: 'Database connection required' });
    }
    
    // Start transaction
    await db.query('BEGIN');
    
    // Update Claude Desktop
    console.log('Updating Claude Desktop (ID: 492)...');
    const claudeUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM91o7r1wba01xcHW15PLqbe-ONaTIjOO3g&s';
    
    const desktopResult = await db.query(
      'UPDATE products SET image_url = $1 WHERE id = 492 RETURNING id, name',
      [claudeUrl]
    );
    
    // Update other specific products
    const updates = [
      {
        id: 513,
        name: 'Sourcegraph Cody',
        url: 'https://about.sourcegraph.com/sourcegraph-mark.png'
      },
      {
        id: 515,
        name: 'GPT Computer Assistant',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png'
      },
      {
        id: 517,
        name: 'Cursor',
        url: 'https://avatars.githubusercontent.com/u/96096435?s=200&v=4'
      },
      {
        id: 519,
        name: 'Goose',
        url: 'https://avatars.githubusercontent.com/u/139895814?s=200&v=4'
      },
      {
        id: 520,
        name: 'Visual Studio Code',
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/1200px-Visual_Studio_Code_1.35_icon.svg.png'
      }
    ];
    
    const updateResults = [];
    
    for (const item of updates) {
      console.log(`Updating ${item.name} (ID: ${item.id})...`);
      const result = await db.query(
        'UPDATE products SET image_url = $1 WHERE id = $2 RETURNING id, name',
        [item.url, item.id]
      );
      
      if (result.rows.length > 0) {
        updateResults.push({ id: item.id, name: item.name, success: true });
      } else {
        updateResults.push({ id: item.id, name: item.name, success: false });
      }
    }
    
    // Update Claude CLI
    console.log('Updating Claude CLI products...');
    const cliResult = await db.query(
      "UPDATE products SET image_url = $1 WHERE name ILIKE '%Claude%CLI%' RETURNING id, name",
      [claudeUrl]
    );
    
    // Update Claude Code
    console.log('Updating Claude Code products...');
    const codeResult = await db.query(
      "UPDATE products SET image_url = $1 WHERE name ILIKE '%Claude%Code%' RETURNING id, name",
      [claudeUrl]
    );
    
    // Check for remaining local paths
    const remainingResult = await db.query(
      "SELECT id, name, image_url FROM products WHERE image_url LIKE '%/assets/client-logos/%'"
    );
    
    // Commit transaction
    await db.query('COMMIT');
    
    res.json({
      success: true,
      results: {
        claudeDesktop: desktopResult.rows,
        specificUpdates: updateResults,
        claudeCLI: cliResult.rows,
        claudeCode: codeResult.rows,
        remainingLocalPaths: remainingResult.rows
      }
    });
  } catch (error) {
    // Rollback in case of error
    try {
      await db.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    
    console.error('Error updating image URLs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;