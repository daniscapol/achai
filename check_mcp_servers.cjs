const { Pool } = require('pg');

const pool = new Pool({
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  port: 5432,
  user: 'achai',
  password: 'TrinityPW1',
  database: 'achai',
  ssl: { rejectUnauthorized: false }
});

async function checkMcpServers() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking MCP servers in database...\n');
    
    // Check total count
    const countResult = await client.query(`
      SELECT COUNT(*) as count FROM products WHERE product_type = 'mcp_server'
    `);
    console.log(`📊 Total MCP servers in database: ${countResult.rows[0].count}`);
    
    // Check for specific servers from JSON
    const specificServers = [
      'PostgreSQL MCP Server',
      'GitHub MCP Server', 
      'Web Search MCP Server',
      'Redis MCP Server',
      'Slack MCP Server'
    ];
    
    console.log('\n🔍 Checking specific servers from mcp_servers_data.json:');
    
    for (const serverName of specificServers) {
      const result = await client.query(`
        SELECT id, name, product_type, stars_numeric, official 
        FROM products 
        WHERE name = $1 AND product_type = 'mcp_server'
      `, [serverName]);
      
      if (result.rows.length > 0) {
        const server = result.rows[0];
        console.log(`✅ Found: ${server.name} (ID: ${server.id}, Stars: ${server.stars_numeric})`);
      } else {
        console.log(`❌ Missing: ${serverName}`);
      }
    }
    
    // Show all MCP servers ordered by stars
    console.log('\n📋 Top 10 MCP servers in database:');
    const topServers = await client.query(`
      SELECT id, name, name_pt, category, stars_numeric, official, is_featured
      FROM products 
      WHERE product_type = 'mcp_server' 
      ORDER BY stars_numeric DESC
      LIMIT 10
    `);
    
    topServers.rows.forEach((server, index) => {
      console.log(`${index + 1}. ${server.name} ${server.name_pt ? `(${server.name_pt})` : ''}`);
      console.log(`   Category: ${server.category}, Stars: ${server.stars_numeric}, Official: ${server.official} ${server.is_featured ? '🌟' : ''}`);
    });
    
    // Check if there are servers with 0 stars (might be from JSON but without proper star counts)
    const zeroStarServers = await client.query(`
      SELECT COUNT(*) as count FROM products 
      WHERE product_type = 'mcp_server' AND (stars_numeric = 0 OR stars_numeric IS NULL)
    `);
    console.log(`\n⚠️  Servers with 0 or null stars: ${zeroStarServers.rows[0].count}`);
    
  } finally {
    client.release();
    pool.end();
  }
}

checkMcpServers().catch(console.error);