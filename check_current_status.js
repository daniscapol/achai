import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'achai',
  password: 'TrinityPW1',
  database: 'achai',
  ssl: { rejectUnauthorized: false }
});

async function checkCurrentStatus() {
  try {
    await client.connect();
    console.log('🔍 Checking current translation status...\n');
    
    // Get total count
    const totalResult = await client.query('SELECT COUNT(*) as total FROM products WHERE is_active = true');
    const total = totalResult.rows[0].total;
    console.log(`📊 Total active products: ${total}`);
    
    // Check for placeholder text
    const placeholderResult = await client.query(`
      SELECT COUNT(*) as count FROM products 
      WHERE is_active = true AND (
        description_pt LIKE '%Este servidor MCP oferece funcionalidades avançadas%' OR
        description_pt LIKE '%Este cliente MCP foi desenvolvido%' OR
        description_pt LIKE '%Este agente de IA foi desenvolvido%'
      )
    `);
    const placeholderCount = placeholderResult.rows[0].count;
    console.log(`❌ Products with placeholder text: ${placeholderCount}`);
    
    // Check products with proper Portuguese translations
    const properResult = await client.query(`
      SELECT COUNT(*) as count FROM products 
      WHERE is_active = true 
        AND description_pt IS NOT NULL 
        AND description_pt != description_en
        AND description_pt NOT LIKE '%Este servidor MCP oferece%'
        AND description_pt NOT LIKE '%Este cliente MCP foi%'
        AND description_pt NOT LIKE '%Este agente de IA foi%'
        AND description_pt != ''
    `);
    const properCount = properResult.rows[0].count;
    console.log(`✅ Products with proper Portuguese translations: ${properCount}`);
    
    // Check products using English descriptions (no placeholder)
    const englishResult = await client.query(`
      SELECT COUNT(*) as count FROM products 
      WHERE is_active = true 
        AND (description_pt = description_en OR description_pt IS NULL OR description_pt = '')
        AND description_pt NOT LIKE '%Este servidor MCP oferece%'
        AND description_pt NOT LIKE '%Este cliente MCP foi%'
        AND description_pt NOT LIKE '%Este agente de IA foi%'
    `);
    const englishCount = englishResult.rows[0].count;
    console.log(`🔄 Products using English descriptions: ${englishCount}`);
    
    // Show some examples of each category
    console.log('\n📋 Examples of each category:');
    
    if (placeholderCount > 0) {
      console.log('\n❌ Products with placeholder text:');
      const placeholderExamples = await client.query(`
        SELECT id, name, LEFT(description_pt, 60) as preview
        FROM products 
        WHERE is_active = true AND (
          description_pt LIKE '%Este servidor MCP oferece funcionalidades avançadas%' OR
          description_pt LIKE '%Este cliente MCP foi desenvolvido%' OR
          description_pt LIKE '%Este agente de IA foi desenvolvido%'
        )
        LIMIT 5
      `);
      placeholderExamples.rows.forEach(row => {
        console.log(`   • ID ${row.id}: ${row.name} - "${row.preview}..."`);
      });
    }
    
    console.log('\n✅ Products with proper Portuguese translations:');
    const properExamples = await client.query(`
      SELECT id, name, LEFT(description_pt, 60) as preview
      FROM products 
      WHERE is_active = true 
        AND description_pt IS NOT NULL 
        AND description_pt != description_en
        AND description_pt NOT LIKE '%Este servidor MCP oferece%'
        AND description_pt NOT LIKE '%Este cliente MCP foi%'
        AND description_pt NOT LIKE '%Este agente de IA foi%'
        AND description_pt != ''
      LIMIT 5
    `);
    properExamples.rows.forEach(row => {
      console.log(`   • ID ${row.id}: ${row.name} - "${row.preview}..."`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCurrentStatus();