import fs from 'fs';
import https from 'https';
import pkg from 'pg';
const { Pool } = pkg;

// Database connection
const pool = new Pool({
  user: 'pumba',
  host: 'localhost',
  database: 'mcp_marketplace',
  password: 'pumba123',
  port: 5432,
});

async function fetchGitHubContent(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'MCP-Scraper/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    console.log(`📡 Fetching: ${url}`);
    
    https.get(url, options, (res) => {
      console.log(`📊 Response status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ Successfully parsed JSON response`);
          resolve(parsed);
        } catch (e) {
          console.log(`📄 Treating as plain text response`);
          resolve(data);
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Request failed:`, err.message);
      reject(err);
    });
  });
}

async function checkIfServerExists(name, githubUrl) {
  try {
    const result = await pool.query(
      'SELECT id FROM products WHERE name_en = $1 OR github_url = $2 OR name = $3',
      [name, githubUrl, name]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking for existing server:', error);
    return false;
  }
}

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function translateToPortuguese(englishText, serverName) {
  // Comprehensive translation mappings
  const translations = {
    // Technical terms
    'server': 'servidor',
    'client': 'cliente',
    'database': 'banco de dados',
    'file': 'arquivo',
    'filesystem': 'sistema de arquivos',
    'search': 'busca',
    'integration': 'integração',
    'API': 'API',
    'tool': 'ferramenta',
    'tools': 'ferramentas',
    'management': 'gerenciamento',
    'access': 'acesso',
    'retrieval': 'recuperação',
    'operations': 'operações',
    'content': 'conteúdo',
    'platform': 'plataforma',
    'service': 'serviço',
    'services': 'serviços',
    'data': 'dados',
    'web': 'web',
    'cloud': 'nuvem',
    'storage': 'armazenamento',
    'security': 'segurança',
    'authentication': 'autenticação',
    'authorization': 'autorização',
    'monitoring': 'monitoramento',
    'analytics': 'análise',
    'deployment': 'implantação',
    'configuration': 'configuração',
    'development': 'desenvolvimento',
    'productivity': 'produtividade',
    'workflow': 'fluxo de trabalho',
    'automation': 'automação',
    'notification': 'notificação',
    'messaging': 'mensagem',
    'communication': 'comunicação',
    'collaboration': 'colaboração',
    'repository': 'repositório',
    'version control': 'controle de versão',
    'backup': 'backup',
    'sync': 'sincronização',
    'real-time': 'tempo real',
    'streaming': 'streaming',
    'processing': 'processamento',
    'generation': 'geração',
    'conversion': 'conversão',
    'parsing': 'análise',
    'validation': 'validação',
    'optimization': 'otimização',
    'performance': 'desempenho',
    'scalability': 'escalabilidade',
    'reliability': 'confiabilidade',
    'availability': 'disponibilidade'
  };

  // Service-specific templates
  const serviceTemplates = {
    'aws': 'Servidor MCP para integração com serviços AWS Amazon Web Services',
    'azure': 'Servidor MCP para integração com serviços Microsoft Azure',
    'google': 'Servidor MCP para integração com serviços Google',
    'github': 'Servidor MCP para integração com GitHub e controle de versão',
    'git': 'Servidor MCP para operações de controle de versão Git',
    'filesystem': 'Servidor MCP para acesso e gerenciamento do sistema de arquivos',
    'database': 'Servidor MCP para operações de banco de dados',
    'mysql': 'Servidor MCP para banco de dados MySQL',
    'postgresql': 'Servidor MCP para banco de dados PostgreSQL',
    'sqlite': 'Servidor MCP para banco de dados SQLite',
    'mongodb': 'Servidor MCP para banco de dados MongoDB',
    'redis': 'Servidor MCP para cache e banco de dados Redis',
    'docker': 'Servidor MCP para gerenciamento de contêineres Docker',
    'kubernetes': 'Servidor MCP para orquestração Kubernetes',
    'slack': 'Servidor MCP para integração com Slack',
    'discord': 'Servidor MCP para integração com Discord',
    'email': 'Servidor MCP para serviços de email e correio eletrônico',
    'calendar': 'Servidor MCP para gerenciamento de calendário e agendamento',
    'weather': 'Servidor MCP para informações meteorológicas e clima',
    'maps': 'Servidor MCP para serviços de mapas e localização',
    'search': 'Servidor MCP para funcionalidades de busca e pesquisa',
    'fetch': 'Servidor MCP para recuperação e busca de conteúdo web',
    'web': 'Servidor MCP para operações e navegação web',
    'api': 'Servidor MCP para integração de APIs externas',
    'news': 'Servidor MCP para notícias e informações atualizadas',
    'social': 'Servidor MCP para integração com redes sociais',
    'analytics': 'Servidor MCP para análise de dados e métricas',
    'monitoring': 'Servidor MCP para monitoramento e observabilidade',
    'logging': 'Servidor MCP para registro e logs do sistema',
    'testing': 'Servidor MCP para testes e verificação de qualidade',
    'deployment': 'Servidor MCP para implantação e entrega contínua',
    'backup': 'Servidor MCP para backup e recuperação de dados',
    'security': 'Servidor MCP para segurança e proteção de dados',
    'encryption': 'Servidor MCP para criptografia e segurança',
    'ai': 'Servidor MCP para integração com inteligência artificial',
    'ml': 'Servidor MCP para aprendizado de máquina e ML',
    'nlp': 'Servidor MCP para processamento de linguagem natural',
    'image': 'Servidor MCP para processamento e manipulação de imagens',
    'video': 'Servidor MCP para processamento e manipulação de vídeo',
    'audio': 'Servidor MCP para processamento e manipulação de áudio',
    'text': 'Servidor MCP para processamento e manipulação de texto',
    'pdf': 'Servidor MCP para operações com documentos PDF',
    'excel': 'Servidor MCP para operações com planilhas Excel',
    'csv': 'Servidor MCP para processamento de arquivos CSV',
    'json': 'Servidor MCP para manipulação de dados JSON',
    'xml': 'Servidor MCP para processamento de documentos XML',
    'yaml': 'Servidor MCP para configuração e arquivos YAML',
    'markdown': 'Servidor MCP para processamento de documentos Markdown',
    'blog': 'Servidor MCP para gerenciamento de blog e conteúdo',
    'cms': 'Servidor MCP para sistema de gerenciamento de conteúdo',
    'ecommerce': 'Servidor MCP para comércio eletrônico e vendas online',
    'payment': 'Servidor MCP para processamento de pagamentos',
    'finance': 'Servidor MCP para serviços financeiros e bancários',
    'crypto': 'Servidor MCP para criptomoedas e blockchain',
    'iot': 'Servidor MCP para Internet das Coisas (IoT)',
    'home': 'Servidor MCP para automação residencial e casa inteligente',
    'health': 'Servidor MCP para monitoramento de saúde e bem-estar',
    'fitness': 'Servidor MCP para rastreamento de exercícios e fitness',
    'travel': 'Servidor MCP para serviços de viagem e turismo',
    'transport': 'Servidor MCP para serviços de transporte e mobilidade',
    'food': 'Servidor MCP para serviços de alimentação e receitas',
    'recipe': 'Servidor MCP para receitas culinárias e gastronomia',
    'music': 'Servidor MCP para serviços de música e streaming',
    'movie': 'Servidor MCP para filmes e entretenimento',
    'game': 'Servidor MCP para jogos e gamificação',
    'education': 'Servidor MCP para educação e aprendizado',
    'learning': 'Servidor MCP para plataformas de ensino e treinamento',
    'productivity': 'Servidor MCP para ferramentas de produtividade',
    'task': 'Servidor MCP para gerenciamento de tarefas e projetos',
    'time': 'Servidor MCP para rastreamento e gerenciamento de tempo',
    'note': 'Servidor MCP para anotações e organização pessoal',
    'wiki': 'Servidor MCP para sistemas wiki e conhecimento colaborativo',
    'documentation': 'Servidor MCP para documentação técnica e manuais'
  };

  // Check for service-specific templates first
  const serverLower = serverName.toLowerCase();
  for (const [key, template] of Object.entries(serviceTemplates)) {
    if (serverLower.includes(key)) {
      return template;
    }
  }

  // Fallback to generic translation
  let translated = englishText.toLowerCase();
  
  // Apply word-by-word translations
  for (const [english, portuguese] of Object.entries(translations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, portuguese);
  }

  // Capitalize first letter
  translated = translated.charAt(0).toUpperCase() + translated.slice(1);
  
  // Default fallback with server name context
  if (translated === englishText.toLowerCase()) {
    return `Servidor MCP para ${serverName} - ferramenta de integração e automação`;
  }
  
  return translated;
}

async function getOfficialMCPServers() {
  console.log('🚀 Official MCP Server Scraper');
  console.log('📡 Fetching server list from official repository...\n');

  try {
    // Get the main README content
    const readmeUrl = 'https://api.github.com/repos/modelcontextprotocol/servers/contents/README.md';
    const readmeResponse = await fetchGitHubContent(readmeUrl);
    
    if (!readmeResponse.content) {
      throw new Error('Could not fetch README content');
    }

    // Decode base64 content
    const readmeContent = Buffer.from(readmeResponse.content, 'base64').toString('utf-8');
    
    // Extract server information using regex patterns
    const servers = [];
    
    // Pattern for official servers section
    const officialServersMatch = readmeContent.match(/## Official Integrations.*?(?=##|$)/s);
    if (officialServersMatch) {
      const officialSection = officialServersMatch[0];
      
      // Extract each server entry
      const serverPattern = /\[([^\]]+)\]\(([^)]+)\)\s*-\s*([^\n]+)/g;
      let match;
      
      while ((match = serverPattern.exec(officialSection)) !== null) {
        const name = match[1].trim();
        const url = match[2].trim();
        const description = match[3].trim();
        
        if (name && url && description) {
          servers.push({
            name: name,
            description: description,
            github_url: url,
            category: 'mcp_server',
            product_type: 'mcp_server',
            official: true
          });
        }
      }
    }

    // Also get servers from the src directory
    const srcUrl = 'https://api.github.com/repos/modelcontextprotocol/servers/contents/src';
    try {
      const srcResponse = await fetchGitHubContent(srcUrl);
      
      if (Array.isArray(srcResponse)) {
        for (const item of srcResponse) {
          if (item.type === 'dir') {
            const serverName = item.name;
            const githubUrl = `https://github.com/modelcontextprotocol/servers/tree/main/src/${serverName}`;
            
            // Generate description based on server name
            const description = `Official MCP server for ${serverName} integration and operations`;
            
            servers.push({
              name: serverName,
              description: description,
              github_url: githubUrl,
              category: 'mcp_server',
              product_type: 'mcp_server',
              official: true
            });
          }
        }
      }
    } catch (srcError) {
      console.log('ℹ️  Could not fetch src directory, continuing with README servers only');
    }

    console.log(`📋 Found ${servers.length} servers from official repository`);
    
    // Check for duplicates and add to database
    let addedCount = 0;
    let skippedCount = 0;

    for (const serverData of servers) {
      const exists = await checkIfServerExists(serverData.name, serverData.github_url);
      
      if (exists) {
        console.log(`⚠️  Skipping ${serverData.name} - already exists in database`);
        skippedCount++;
        continue;
      }

      try {
        // Generate multilingual content
        const name_en = serverData.name;
        const name_pt = serverData.name; // Keep original name for MCP servers
        const description_en = serverData.description;
        const description_pt = translateToPortuguese(serverData.description, serverData.name);
        const slug = generateSlug(serverData.name);

        // Insert into database
        const insertQuery = `
          INSERT INTO products (
            name, name_en, name_pt, description, description_en, description_pt,
            image_url, icon_url, github_url, category, categories, product_type,
            official, is_active, is_featured, slug, created_at, updated_at,
            price, sku, language, license, creator, version, tags
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
            NOW(), NOW(), $17, $18, $19, $20, $21, $22, $23
          ) RETURNING id, name
        `;

        const values = [
          name_en, // name
          name_en, // name_en 
          name_pt, // name_pt
          description_en, // description
          description_en, // description_en
          description_pt, // description_pt
          '🤖', // image_url (robot emoji placeholder)
          '🤖', // icon_url (robot emoji placeholder)
          serverData.github_url, // github_url
          'mcp_server', // category
          '["mcp_server", "official"]', // categories
          'mcp_server', // product_type
          true, // official
          true, // is_active
          false, // is_featured
          slug, // slug
          0, // price
          slug, // sku
          'Multiple', // language
          'MIT', // license (typical for MCP servers)
          'Anthropic', // creator
          '1.0.0', // version
          '["mcp", "server", "official", "anthropic"]' // tags
        ];

        const result = await pool.query(insertQuery, values);
        console.log(`✅ Added: ${serverData.name} (ID: ${result.rows[0].id})`);
        addedCount++;

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error adding ${serverData.name}:`, error.message);
      }
    }

    console.log('\n🎉 Official MCP Server scraping completed!');
    console.log(`📊 Summary:`);
    console.log(`  - Servers found: ${servers.length}`);
    console.log(`  - Added to database: ${addedCount}`);
    console.log(`  - Skipped (duplicates): ${skippedCount}`);
    console.log(`  - Success rate: ${((addedCount / servers.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error fetching official servers:', error);
  } finally {
    await pool.end();
  }
}

// Run the scraper
getOfficialMCPServers();

export { getOfficialMCPServers };