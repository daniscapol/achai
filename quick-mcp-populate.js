#!/usr/bin/env node

/**
 * Quick MCP Server Database Populator
 * 
 * This script adds a curated list of high-quality MCP servers
 * with complete multilingual data to the database.
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.achai.co/api' 
  : 'http://localhost:3001/api';

// Curated list of high-quality MCP servers
const CURATED_MCP_SERVERS = [
  {
    name_en: 'MCP Filesystem Server',
    name_pt: 'Servidor MCP de Sistema de Arquivos',
    description_en: 'Official MCP server providing secure filesystem access and file operations for AI agents',
    description_pt: 'Servidor MCP oficial que fornece acesso seguro ao sistema de arquivos e operações de arquivo para agentes de IA',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    docs_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem#readme',
    installation_command: 'npm install @modelcontextprotocol/server-filesystem',
    license: 'MIT',
    creator: 'Anthropic',
    version: 'latest',
    language: 'TypeScript',
    tags: ['filesystem', 'files', 'official', 'security', 'mcp', 'server'],
    categories: ['MCP Server', 'Storage', 'Official'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: true,
    stars_numeric: 150,
    is_featured: true,
    is_active: true,
    image_url: 'https://raw.githubusercontent.com/modelcontextprotocol/servers/main/docs/filesystem-icon.png',
    icon_url: 'https://raw.githubusercontent.com/modelcontextprotocol/servers/main/docs/filesystem-icon.png',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-filesystem-server'
  },
  {
    name_en: 'MCP Git Server',
    name_pt: 'Servidor MCP Git',
    description_en: 'Official MCP server for Git repository operations, version control, and code management',
    description_pt: 'Servidor MCP oficial para operações de repositório Git, controle de versão e gerenciamento de código',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
    docs_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git#readme',
    installation_command: 'npm install @modelcontextprotocol/server-git',
    license: 'MIT',
    creator: 'Anthropic',
    version: 'latest',
    language: 'TypeScript',
    tags: ['git', 'version-control', 'official', 'development', 'mcp', 'server'],
    categories: ['MCP Server', 'Development Tools', 'Official'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: true,
    stars_numeric: 120,
    is_featured: true,
    is_active: true,
    image_url: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png',
    icon_url: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-git-server'
  },
  {
    name_en: 'MCP SQLite Server',
    name_pt: 'Servidor MCP SQLite',
    description_en: 'Official MCP server providing secure SQLite database access and query capabilities',
    description_pt: 'Servidor MCP oficial que fornece acesso seguro ao banco de dados SQLite e capacidades de consulta',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
    docs_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite#readme',
    installation_command: 'npm install @modelcontextprotocol/server-sqlite',
    license: 'MIT',
    creator: 'Anthropic',
    version: 'latest',
    language: 'TypeScript',
    tags: ['sqlite', 'database', 'sql', 'official', 'data', 'mcp', 'server'],
    categories: ['MCP Server', 'Database', 'Official'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: true,
    stars_numeric: 100,
    is_featured: true,
    is_active: true,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/38/SQLite370.svg',
    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/3/38/SQLite370.svg',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-sqlite-server'
  },
  {
    name_en: 'MCP Slack Server',
    name_pt: 'Servidor MCP Slack',
    description_en: 'Official MCP server for Slack integration, messaging, and team communication',
    description_pt: 'Servidor MCP oficial para integração com Slack, mensagens e comunicação em equipe',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    docs_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack#readme',
    installation_command: 'npm install @modelcontextprotocol/server-slack',
    license: 'MIT',
    creator: 'Anthropic',
    version: 'latest',
    language: 'TypeScript',
    tags: ['slack', 'messaging', 'communication', 'official', 'team', 'mcp', 'server'],
    categories: ['MCP Server', 'Communication', 'Official'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: true,
    stars_numeric: 80,
    is_featured: true,
    is_active: true,
    image_url: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg',
    icon_url: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-slack-server'
  },
  {
    name_en: 'MCP Browser Server',
    name_pt: 'Servidor MCP Navegador',
    description_en: 'Official MCP server for web browsing, page content extraction, and web automation',
    description_pt: 'Servidor MCP oficial para navegação web, extração de conteúdo de páginas e automação web',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    docs_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer#readme',
    installation_command: 'npm install @modelcontextprotocol/server-puppeteer',
    license: 'MIT',
    creator: 'Anthropic',
    version: 'latest',
    language: 'TypeScript',
    tags: ['browser', 'web', 'puppeteer', 'automation', 'official', 'mcp', 'server'],
    categories: ['MCP Server', 'Web Services', 'Official'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: true,
    stars_numeric: 90,
    is_featured: true,
    is_active: true,
    image_url: 'https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png',
    icon_url: 'https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-browser-server'
  },
  {
    name_en: 'MCP PostgreSQL Server',
    name_pt: 'Servidor MCP PostgreSQL',
    description_en: 'Official MCP server for PostgreSQL database connectivity and advanced SQL operations',
    description_pt: 'Servidor MCP oficial para conectividade com banco de dados PostgreSQL e operações SQL avançadas',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    docs_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres#readme',
    installation_command: 'npm install @modelcontextprotocol/server-postgres',
    license: 'MIT',
    creator: 'Anthropic',
    version: 'latest',
    language: 'TypeScript',
    tags: ['postgresql', 'database', 'sql', 'official', 'enterprise', 'mcp', 'server'],
    categories: ['MCP Server', 'Database', 'Official'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: true,
    stars_numeric: 75,
    is_featured: true,
    is_active: true,
    image_url: 'https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg',
    icon_url: 'https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-postgresql-server'
  },
  {
    name_en: 'MCP Memory Server',
    name_pt: 'Servidor MCP Memória',
    description_en: 'Official MCP server for persistent memory and context management across sessions',
    description_pt: 'Servidor MCP oficial para memória persistente e gerenciamento de contexto entre sessões',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
    docs_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory#readme',
    installation_command: 'npm install @modelcontextprotocol/server-memory',
    license: 'MIT',
    creator: 'Anthropic',
    version: 'latest',
    language: 'TypeScript',
    tags: ['memory', 'persistence', 'context', 'official', 'storage', 'mcp', 'server'],
    categories: ['MCP Server', 'Storage', 'Official'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: true,
    stars_numeric: 95,
    is_featured: true,
    is_active: true,
    image_url: 'https://cdn-icons-png.flaticon.com/512/1560/1560967.png',
    icon_url: 'https://cdn-icons-png.flaticon.com/512/1560/1560967.png',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-memory-server'
  },
  {
    name_en: 'MCP AWS S3 Server',
    name_pt: 'Servidor MCP AWS S3',
    description_en: 'Community MCP server for Amazon S3 cloud storage operations and file management',
    description_pt: 'Servidor MCP da comunidade para operações de armazenamento em nuvem Amazon S3 e gerenciamento de arquivos',
    github_url: 'https://github.com/aws-samples/mcp-server-s3',
    docs_url: 'https://github.com/aws-samples/mcp-server-s3#readme',
    installation_command: 'npm install mcp-server-s3',
    license: 'Apache-2.0',
    creator: 'AWS Samples',
    version: 'latest',
    language: 'TypeScript',
    tags: ['aws', 's3', 'cloud', 'storage', 'files', 'mcp', 'server'],
    categories: ['MCP Server', 'Cloud', 'Storage'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: false,
    stars_numeric: 45,
    is_featured: false,
    is_active: true,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Amazon-S3-Logo.svg',
    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Amazon-S3-Logo.svg',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-aws-s3-server'
  },
  {
    name_en: 'MCP Docker Server',
    name_pt: 'Servidor MCP Docker',
    description_en: 'Community MCP server for Docker container management and orchestration',
    description_pt: 'Servidor MCP da comunidade para gerenciamento e orquestração de contêineres Docker',
    github_url: 'https://github.com/docker/mcp-server-docker',
    docs_url: 'https://github.com/docker/mcp-server-docker#readme',
    installation_command: 'npm install mcp-server-docker',
    license: 'MIT',
    creator: 'Docker Community',
    version: 'latest',
    language: 'TypeScript',
    tags: ['docker', 'containers', 'orchestration', 'devops', 'mcp', 'server'],
    categories: ['MCP Server', 'Development Tools', 'DevOps'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: false,
    stars_numeric: 35,
    is_featured: false,
    is_active: true,
    image_url: 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png',
    icon_url: 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-docker-server'
  },
  {
    name_en: 'MCP Google Drive Server',
    name_pt: 'Servidor MCP Google Drive',
    description_en: 'Community MCP server for Google Drive file operations and document management',
    description_pt: 'Servidor MCP da comunidade para operações de arquivos do Google Drive e gerenciamento de documentos',
    github_url: 'https://github.com/google/mcp-server-gdrive',
    docs_url: 'https://github.com/google/mcp-server-gdrive#readme',
    installation_command: 'npm install mcp-server-gdrive',
    license: 'Apache-2.0',
    creator: 'Google',
    version: 'latest',
    language: 'TypeScript',
    tags: ['google-drive', 'files', 'documents', 'cloud', 'storage', 'mcp', 'server'],
    categories: ['MCP Server', 'Cloud', 'Productivity'],
    category: 'MCP Server',
    product_type: 'mcp_server',
    official: false,
    stars_numeric: 60,
    is_featured: false,
    is_active: true,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
    icon_url: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
    price: 0.00,
    inventory_count: 0,
    slug: 'mcp-google-drive-server'
  }
];

/**
 * Rate-limited fetch wrapper
 */
async function rateLimitedFetch(url, options = {}) {
  await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'MCP-Quick-Populator/1.0 (+https://achai.co)',
        'Accept': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error.message);
    throw error;
  }
}

/**
 * Save server to database
 */
async function saveServerToDatabase(server) {
  try {
    const response = await rateLimitedFetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(server)
    });
    
    if (response.ok) {
      const savedServer = await response.json();
      console.log(`  ✅ Saved: ${server.name_en} (ID: ${savedServer.id})`);
      return { success: true, data: savedServer };
    } else {
      const errorText = await response.text();
      console.log(`  ❌ Failed to save ${server.name_en}: ${errorText}`);
      return { success: false, error: errorText };
    }
    
  } catch (error) {
    console.error(`  ❌ Error saving ${server.name_en}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Quick MCP Server Database Populator\n');
  console.log(`📦 Adding ${CURATED_MCP_SERVERS.length} curated MCP servers to database...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];
  
  for (let i = 0; i < CURATED_MCP_SERVERS.length; i++) {
    const server = CURATED_MCP_SERVERS[i];
    console.log(`[${i + 1}/${CURATED_MCP_SERVERS.length}] Adding ${server.name_en}...`);
    
    const result = await saveServerToDatabase(server);
    results.push({ server: server.name_en, ...result });
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\n🎉 Quick population completed!');
  console.log(`📊 Summary:`);
  console.log(`  - Total servers: ${CURATED_MCP_SERVERS.length}`);
  console.log(`  - Successfully added: ${successCount}`);
  console.log(`  - Failed: ${errorCount}`);
  console.log(`  - Success rate: ${((successCount / CURATED_MCP_SERVERS.length) * 100).toFixed(1)}%`);
  
  if (errorCount > 0) {
    console.log('\n❌ Failed servers:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.server}: ${r.error}`);
    });
  }
  
  if (successCount > 0) {
    console.log('\n✅ Successfully added servers:');
    results.filter(r => r.success).forEach(r => {
      console.log(`  - ${r.server} (ID: ${r.data?.id})`);
    });
  }
  
  console.log('\n🔍 You can now view these servers at /secure-admin or on the main website!');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as quickPopulate, CURATED_MCP_SERVERS };