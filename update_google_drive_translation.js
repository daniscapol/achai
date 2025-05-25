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

async function updateGoogleDriveTranslation() {
  try {
    await client.connect();
    console.log('🔍 Updating Google Drive (ID 529) Portuguese translation...\n');
    
    const updateQuery = `
      UPDATE products 
      SET 
        description_pt = 'Integração Google Drive para acesso, busca e gerenciamento de arquivos através do protocolo MCP. Permite à IA acessar e manipular arquivos armazenados na nuvem.',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 529;
    `;
    
    await client.query(updateQuery);
    console.log('✅ Updated Google Drive Portuguese description');
    
    // Verify the update
    const result = await client.query('SELECT name_pt, description_pt FROM products WHERE id = 529');
    const product = result.rows[0];
    
    console.log('\n📋 Updated Google Drive:');
    console.log('🏷️  Name PT:', product.name_pt);
    console.log('📝 Description PT:', product.description_pt);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

updateGoogleDriveTranslation();