const { Pool } = require('pg');
const mcpServersData = require('./src/mcp_servers_data.json');

const pool = new Pool({
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'achai',
  password: 'TrinityPW1',
  database: 'achai',
  ssl: { rejectUnauthorized: false }
});

// Portuguese translations for MCP servers
const translations = {
  'PostgreSQL MCP Server': 'Servidor MCP PostgreSQL',
  'GitHub MCP Server': 'Servidor MCP GitHub',
  'Web Search MCP Server': 'Servidor MCP Pesquisa Web',
  'Redis MCP Server': 'Servidor MCP Redis',
  'Slack MCP Server': 'Servidor MCP Slack',
  'Connect to PostgreSQL databases through MCP': 'Conecte-se a bancos de dados PostgreSQL através do MCP',
  'Interact with GitHub repositories, issues, and PRs through MCP': 'Interaja com repositórios GitHub, issues e PRs através do MCP',
  'Perform web searches through MCP': 'Realize pesquisas na web através do MCP',
  'Connect to Redis for caching and data storage through MCP': 'Conecte-se ao Redis para cache e armazenamento de dados através do MCP',
  'Integrate with Slack channels and messaging through MCP': 'Integre com canais Slack e mensagens através do MCP'
};

async function insertMcpServers() {
  const client = await pool.connect();
  
  try {
    console.log('🔌 Connected to PostgreSQL database');
    
    // Start transaction
    await client.query('BEGIN');
    
    let insertedCount = 0;
    
    for (const server of mcpServersData) {
      const slug = server.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const namePt = translations[server.name] || server.name;
      const descriptionPt = translations[server.description] || server.description;
      
      try {
        // Check if this server already exists
        const existingServer = await client.query(
          'SELECT id FROM products WHERE name = $1 AND product_type = $2',
          [server.name, 'mcp_server']
        );
        
        if (existingServer.rows.length > 0) {
          console.log(`⚠️  Server "${server.name}" already exists, skipping...`);
          continue;
        }
        
        // Insert the server
        const result = await client.query(`
          INSERT INTO products (
            name, description, product_type, category, official, stars_numeric, 
            tags, is_active, is_featured, name_en, name_pt, description_en, 
            description_pt, language_code, created_at, updated_at, slug
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING id, name
        `, [
          server.name,
          server.description,
          'mcp_server',
          server.category,
          server.official,
          server.stars_numeric,
          server.tags,
          true, // is_active
          server.stars_numeric > 1800, // is_featured for popular servers
          server.name, // name_en
          namePt, // name_pt
          server.description, // description_en
          descriptionPt, // description_pt
          'en', // language_code
          new Date(), // created_at
          new Date(), // updated_at
          slug
        ]);
        
        console.log(`✅ Inserted: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
        insertedCount++;
        
      } catch (error) {
        console.error(`❌ Error inserting ${server.name}:`, error.message);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Verify insertions
    const finalCount = await client.query(
      "SELECT COUNT(*) as count FROM products WHERE product_type = 'mcp_server'"
    );
    
    console.log(`\n🎉 Successfully inserted ${insertedCount} MCP servers!`);
    console.log(`📈 Total MCP servers in database: ${finalCount.rows[0].count}`);
    
    // Show newly inserted servers
    if (insertedCount > 0) {
      const newServers = await client.query(`
        SELECT id, name, name_pt, category, stars_numeric, is_featured
        FROM products 
        WHERE product_type = 'mcp_server' AND name = ANY($1)
        ORDER BY stars_numeric DESC
      `, [mcpServersData.map(s => s.name)]);
      
      console.log('\n📋 Inserted MCP servers:');
      newServers.rows.forEach(server => {
        console.log(`   ${server.name} (${server.name_pt}) - ${server.category} - ⭐${server.stars_numeric} ${server.is_featured ? '🌟' : ''}`);
      });
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inserting MCP servers:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the insertion
insertMcpServers().catch(console.error);