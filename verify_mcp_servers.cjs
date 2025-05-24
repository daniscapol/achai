const { Pool } = require('pg');

const pool = new Pool({
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'achai',
  password: 'TrinityPW1',
  database: 'achai',
  ssl: { rejectUnauthorized: false }
});

async function verifyMcpServers() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing your original query for MCP servers...\n');
    
    const result = await client.query(`
      SELECT id, product_type, "name", slug, description, long_description, 
             image_path, stars_numeric, category, github_url, npm_url, 
             created_by, "language", official, created_at, updated_at, 
             price, image_url, external_url, is_featured, is_active, 
             rating, reviews_count, sku, inventory_count, icon_url, 
             categories, docs_url, demo_url, license, creator, "version", 
             installation_command, tags, name_en, name_pt, description_en, 
             description_pt, language_code
      FROM public.products 
      WHERE product_type = 'mcp_server'
      ORDER BY stars_numeric DESC
      LIMIT 15
    `);
    
    console.log(`📊 Found ${result.rows.length} MCP servers in database:\n`);
    
    result.rows.forEach((server, index) => {
      console.log(`${index + 1}. ${server.name} ${server.name_pt ? `(${server.name_pt})` : ''}`);
      console.log(`   Type: ${server.product_type}, Category: ${server.category}`);
      console.log(`   Stars: ${server.stars_numeric}, Featured: ${server.is_featured}, Official: ${server.official}`);
      console.log(`   Description: ${server.description}`);
      if (server.description_pt && server.description_pt !== server.description) {
        console.log(`   PT Description: ${server.description_pt}`);
      }
      console.log('');
    });
    
    // Specifically check the servers we just inserted
    console.log('🎯 Checking the servers from mcp_servers_data.json:');
    const specificServers = ['PostgreSQL MCP Server', 'GitHub MCP Server', 'Web Search MCP Server', 'Slack MCP Server'];
    
    for (const serverName of specificServers) {
      const serverResult = await client.query(`
        SELECT name, name_pt, stars_numeric, is_featured 
        FROM products 
        WHERE name = $1 AND product_type = 'mcp_server'
      `, [serverName]);
      
      if (serverResult.rows.length > 0) {
        const server = serverResult.rows[0];
        console.log(`✅ ${server.name} (${server.name_pt}) - ⭐${server.stars_numeric} ${server.is_featured ? '🌟' : ''}`);
      }
    }
    
  } finally {
    client.release();
    pool.end();
  }
}

verifyMcpServers().catch(console.error);