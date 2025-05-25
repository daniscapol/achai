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

async function checkProduct554() {
  try {
    await client.connect();
    console.log('🔍 Product 554 details:\n');
    
    const result = await client.query('SELECT * FROM products WHERE id = 554');
    
    if (result.rows.length === 0) {
      console.log('❌ Product ID 554 not found');
    } else {
      const product = result.rows[0];
      console.log('✅ Product ID 554 (MongoDB MCP Server):');
      console.log('🏷️  Name EN:', product.name_en || product.name);
      console.log('🏷️  Name PT:', product.name_pt);
      console.log('📝 Description EN:', product.description_en || product.description);
      console.log('📝 Description PT:', product.description_pt);
      console.log('🔧 Product Type:', product.product_type);
      console.log('🌍 Language Code:', product.language_code);
      console.log('📅 Updated:', product.updated_at);
      console.log('✅ Active:', product.is_active);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkProduct554();