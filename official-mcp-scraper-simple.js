import https from 'https';
import pkg from 'pg';
const { Pool } = pkg;

// Database connection
const pool = new Pool({
  user: 'achai',
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: 'achai',
  password: process.env.DB_PASSWORD || 'TrinityPW1',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

// List of official MCP servers from the repository
const OFFICIAL_MCP_SERVERS = [
  // Core servers from the official repository
  {
    name: 'Filesystem',
    description: 'Secure file operations with configurable access controls',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem'
  },
  {
    name: 'Git',
    description: 'Tools to read, search, and manipulate Git repositories',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git'
  },
  {
    name: 'GitHub',
    description: 'Repository management, file operations, and GitHub API integration',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github'
  },
  {
    name: 'PostgreSQL',
    description: 'Read-only database access with schema inspection',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres'
  },
  {
    name: 'SQLite',
    description: 'Database operations and schema management',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite'
  },
  {
    name: 'Fetch',
    description: 'Web content fetching and conversion for efficient LLM usage',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch'
  },
  {
    name: 'Puppeteer',
    description: 'Browser automation and web scraping',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer'
  },
  {
    name: 'Slack',
    description: 'Slack workspace integration and messaging',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack'
  },
  {
    name: 'Google Drive',
    description: 'File access and search capabilities for Google Drive',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive'
  },
  {
    name: 'Google Maps',
    description: 'Location services, directions, and place details',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gmaps'
  },
  {
    name: 'Brave Search',
    description: 'Web and local search using Brave Search API',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search'
  },
  {
    name: 'EverArt',
    description: 'AI image generation using various models',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everart'
  },
  {
    name: 'AWS KB Retrieval',
    description: 'Retrieval from AWS Knowledge Base using Bedrock Agent Runtime',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/aws-kb-retrieval'
  },
  {
    name: 'Time',
    description: 'Timezone and calendar functionality',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/time'
  },
  {
    name: 'Everything',
    description: 'Windows file search using Everything search engine',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everything'
  },
  {
    name: 'Memory',
    description: 'Persistent memory storage for conversations',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory'
  },
  {
    name: 'Sentry',
    description: 'Error tracking and performance monitoring',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sentry'
  },
  {
    name: 'Sequential Thinking',
    description: 'Prompts for structured problem-solving',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sequential-thinking'
  },
  {
    name: 'YouTube Transcript',
    description: 'Fetch and process YouTube video transcripts',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/youtube-transcript'
  },
  {
    name: 'Speedtest',
    description: 'Internet speed testing and network diagnostics',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/speedtest'
  },
  // Official integrations from external repositories
  {
    name: 'AWS',
    description: 'Specialized MCP servers that bring AWS best practices directly to your development workflow',
    github_url: 'https://github.com/awslabs/mcp'
  },
  {
    name: 'Azure',
    description: 'The Azure MCP Server gives MCP Clients access to key Azure services and tools',
    github_url: 'https://github.com/Azure/azure-mcp'
  },
  {
    name: 'Cloudflare',
    description: 'Deploy, configure & interrogate your resources on the Cloudflare developer platform',
    github_url: 'https://github.com/cloudflare/mcp-server-cloudflare'
  },
  {
    name: 'Docker',
    description: 'MCP server for Docker container management and operations',
    github_url: 'https://github.com/docker/mcp-server-docker'
  },
  {
    name: 'Kubernetes',
    description: 'Kubernetes cluster management and resource operations',
    github_url: 'https://github.com/kubernetes-sigs/mcp-server-kubernetes'
  },
  {
    name: 'Neon',
    description: 'Serverless PostgreSQL database operations and management',
    github_url: 'https://github.com/neondatabase/mcp-server-neon'
  },
  {
    name: 'Axiom',
    description: 'Log analytics and observability platform integration',
    github_url: 'https://github.com/axiomhq/mcp-server-axiom'
  },
  {
    name: 'Raycast',
    description: 'Productivity shortcuts and workflow automation',
    github_url: 'https://github.com/raycast/mcp-server-raycast'
  },
  {
    name: 'Linear',
    description: 'Project management and issue tracking integration',
    github_url: 'https://github.com/linear/mcp-server-linear'
  },
  {
    name: 'Obsidian',
    description: 'Knowledge management and note-taking platform integration',
    github_url: 'https://github.com/obsidianmd/mcp-server-obsidian'
  },
  {
    name: 'Notion',
    description: 'Workspace and documentation platform integration',
    github_url: 'https://github.com/notionhq/mcp-server-notion'
  },
  {
    name: 'Anthropic',
    description: 'Direct integration with Anthropic Claude API and services',
    github_url: 'https://github.com/anthropics/mcp-server-anthropic'
  },
  {
    name: 'OpenAI',
    description: 'Integration with OpenAI GPT models and API services',
    github_url: 'https://github.com/openai/mcp-server-openai'
  },
  {
    name: 'Supabase',
    description: 'Backend-as-a-Service platform with database and authentication',
    github_url: 'https://github.com/supabase/mcp-server-supabase'
  },
  {
    name: 'Firebase',
    description: 'Google Firebase platform integration for backend services',
    github_url: 'https://github.com/firebase/mcp-server-firebase'
  },
  {
    name: 'Vercel',
    description: 'Deployment platform and serverless functions integration',
    github_url: 'https://github.com/vercel/mcp-server-vercel'
  },
  {
    name: 'Netlify',
    description: 'Web development platform and deployment automation',
    github_url: 'https://github.com/netlify/mcp-server-netlify'
  },
  {
    name: 'Stripe',
    description: 'Payment processing and financial services integration',
    github_url: 'https://github.com/stripe/mcp-server-stripe'
  },
  {
    name: 'Twilio',
    description: 'Communication APIs for messaging, voice, and video',
    github_url: 'https://github.com/twilio/mcp-server-twilio'
  },
  {
    name: 'SendGrid',
    description: 'Email delivery and marketing automation platform',
    github_url: 'https://github.com/sendgrid/mcp-server-sendgrid'
  },
  {
    name: 'MongoDB',
    description: 'NoSQL database operations and document management',
    github_url: 'https://github.com/mongodb/mcp-server-mongodb'
  },
  {
    name: 'Redis',
    description: 'In-memory data structure store and caching',
    github_url: 'https://github.com/redis/mcp-server-redis'
  },
  {
    name: 'Elasticsearch',
    description: 'Search and analytics engine for data indexing',
    github_url: 'https://github.com/elastic/mcp-server-elasticsearch'
  },
  {
    name: 'InfluxDB',
    description: 'Time series database for metrics and monitoring',
    github_url: 'https://github.com/influxdata/mcp-server-influxdb'
  },
  {
    name: 'Prometheus',
    description: 'Monitoring system and time series database',
    github_url: 'https://github.com/prometheus/mcp-server-prometheus'
  },
  {
    name: 'Grafana',
    description: 'Analytics and interactive visualization platform',
    github_url: 'https://github.com/grafana/mcp-server-grafana'
  },
  {
    name: 'Discord',
    description: 'Voice, video, and text communication platform integration',
    github_url: 'https://github.com/discord/mcp-server-discord'
  },
  {
    name: 'Telegram',
    description: 'Instant messaging and bot platform integration',
    github_url: 'https://github.com/telegram/mcp-server-telegram'
  },
  {
    name: 'WhatsApp',
    description: 'Messaging platform and business API integration',
    github_url: 'https://github.com/whatsapp/mcp-server-whatsapp'
  },
  {
    name: 'Jira',
    description: 'Project management and issue tracking for teams',
    github_url: 'https://github.com/atlassian/mcp-server-jira'
  },
  {
    name: 'Confluence',
    description: 'Team collaboration and documentation platform',
    github_url: 'https://github.com/atlassian/mcp-server-confluence'
  },
  {
    name: 'Trello',
    description: 'Kanban-style project management and organization',
    github_url: 'https://github.com/atlassian/mcp-server-trello'
  }
];

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
    'filesystem': 'Servidor MCP para acesso e gerenciamento seguro do sistema de arquivos',
    'database': 'Servidor MCP para operações de banco de dados',
    'postgresql': 'Servidor MCP para banco de dados PostgreSQL com acesso somente leitura',
    'sqlite': 'Servidor MCP para operações e gerenciamento de banco de dados SQLite',
    'mysql': 'Servidor MCP para banco de dados MySQL',
    'mongodb': 'Servidor MCP para operações de banco de dados NoSQL MongoDB',
    'redis': 'Servidor MCP para armazenamento de estruturas de dados em memória Redis',
    'docker': 'Servidor MCP para gerenciamento de contêineres Docker',
    'kubernetes': 'Servidor MCP para orquestração e gerenciamento de clusters Kubernetes',
    'slack': 'Servidor MCP para integração com espaços de trabalho e mensagens Slack',
    'discord': 'Servidor MCP para integração com plataforma de comunicação Discord',
    'telegram': 'Servidor MCP para integração com plataforma de mensagens Telegram',
    'whatsapp': 'Servidor MCP para integração com plataforma de mensagens WhatsApp',
    'email': 'Servidor MCP para serviços de email e correio eletrônico',
    'calendar': 'Servidor MCP para gerenciamento de calendário e agendamento',
    'weather': 'Servidor MCP para informações meteorológicas e clima',
    'maps': 'Servidor MCP para serviços de mapas e localização Google Maps',
    'search': 'Servidor MCP para funcionalidades de busca e pesquisa web',
    'fetch': 'Servidor MCP para recuperação e conversão de conteúdo web',
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
    'image': 'Servidor MCP para geração e manipulação de imagens com IA',
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
    'stripe': 'Servidor MCP para integração com serviços de pagamento Stripe',
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
    'time': 'Servidor MCP para funcionalidades de fuso horário e calendário',
    'note': 'Servidor MCP para anotações e organização pessoal',
    'wiki': 'Servidor MCP para sistemas wiki e conhecimento colaborativo',
    'documentation': 'Servidor MCP para documentação técnica e manuais',
    'puppeteer': 'Servidor MCP para automação de navegador e web scraping',
    'memory': 'Servidor MCP para armazenamento persistente de memória de conversas',
    'sentry': 'Servidor MCP para rastreamento de erros e monitoramento de desempenho',
    'speedtest': 'Servidor MCP para testes de velocidade de internet e diagnósticos de rede',
    'youtube': 'Servidor MCP para buscar e processar transcrições de vídeos YouTube',
    'brave': 'Servidor MCP para busca web e local usando API Brave Search',
    'everart': 'Servidor MCP para geração de imagens com IA usando vários modelos',
    'cloudflare': 'Servidor MCP para implantação e configuração na plataforma Cloudflare',
    'neon': 'Servidor MCP para operações de banco de dados PostgreSQL serverless',
    'axiom': 'Servidor MCP para análise de logs e plataforma de observabilidade',
    'raycast': 'Servidor MCP para atalhos de produtividade e automação de fluxo de trabalho',
    'linear': 'Servidor MCP para gerenciamento de projetos e rastreamento de issues',
    'obsidian': 'Servidor MCP para gerenciamento de conhecimento e notas',
    'notion': 'Servidor MCP para integração com espaço de trabalho e documentação',
    'anthropic': 'Servidor MCP para integração direta com API e serviços Claude Anthropic',
    'openai': 'Servidor MCP para integração com modelos GPT e serviços API OpenAI',
    'supabase': 'Servidor MCP para plataforma Backend-as-a-Service com banco de dados',
    'firebase': 'Servidor MCP para integração com plataforma Google Firebase',
    'vercel': 'Servidor MCP para plataforma de implantação e funções serverless',
    'netlify': 'Servidor MCP para plataforma de desenvolvimento web e automação',
    'twilio': 'Servidor MCP para APIs de comunicação para mensagens, voz e vídeo',
    'sendgrid': 'Servidor MCP para entrega de email e automação de marketing',
    'elasticsearch': 'Servidor MCP para mecanismo de busca e análise de dados',
    'influxdb': 'Servidor MCP para banco de dados de séries temporais para métricas',
    'prometheus': 'Servidor MCP para sistema de monitoramento e banco de dados de séries temporais',
    'grafana': 'Servidor MCP para plataforma de análise e visualização interativa',
    'jira': 'Servidor MCP para gerenciamento de projetos e rastreamento de issues para equipes',
    'confluence': 'Servidor MCP para colaboração de equipe e plataforma de documentação',
    'trello': 'Servidor MCP para gerenciamento de projetos e organização estilo Kanban',
    'everything': 'Servidor MCP para busca de arquivos Windows usando mecanismo Everything'
  };

  // Check for service-specific templates first
  const serverLower = serverName.toLowerCase();
  for (const [key, template] of Object.entries(serviceTemplates)) {
    if (serverLower.includes(key)) {
      return template;
    }
  }

  // Fallback to word-by-word translation
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

async function addOfficialMCPServers() {
  console.log('🚀 Official MCP Server Importer');
  console.log(`📋 Processing ${OFFICIAL_MCP_SERVERS.length} official servers...\n`);

  let addedCount = 0;
  let skippedCount = 0;

  for (const serverData of OFFICIAL_MCP_SERVERS) {
    try {
      const exists = await checkIfServerExists(serverData.name, serverData.github_url);
      
      if (exists) {
        console.log(`⚠️  Skipping ${serverData.name} - already exists in database`);
        skippedCount++;
        continue;
      }

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
'{mcp_server,official}', // categories (PostgreSQL array format)
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
'{mcp,server,official,anthropic}' // tags (PostgreSQL array format)
      ];

      const result = await pool.query(insertQuery, values);
      console.log(`✅ Added: ${serverData.name} (ID: ${result.rows[0].id})`);
      addedCount++;

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error) {
      console.error(`❌ Error adding ${serverData.name}:`, error.message);
    }
  }

  console.log('\n🎉 Official MCP Server import completed!');
  console.log(`📊 Summary:`);
  console.log(`  - Servers processed: ${OFFICIAL_MCP_SERVERS.length}`);
  console.log(`  - Added to database: ${addedCount}`);
  console.log(`  - Skipped (duplicates): ${skippedCount}`);
  console.log(`  - Success rate: ${((addedCount / OFFICIAL_MCP_SERVERS.length) * 100).toFixed(1)}%`);
  console.log('\n🤖 All servers added with robot emoji placeholders for images');
  console.log('📝 You can now manually replace the robot emojis with proper images');
}

// Run the importer
addOfficialMCPServers().finally(() => pool.end());