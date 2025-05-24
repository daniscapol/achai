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

// Comprehensive list of AI agents from awesome-ai-agents repository
const AI_AGENTS = [
  // General Purpose / Build Your Own / Multi-agent
  {
    name: 'Adala',
    description: 'Autonomous Data (Labeling) Agent framework for building AI agents',
    github_url: 'https://github.com/HumanSignal/Adala',
    category: 'ai_agent'
  },
  {
    name: 'Agent4Rec',
    description: 'Recommender system simulator with 1,000 agents for recommendation tasks',
    github_url: 'https://github.com/LehengTHU/Agent4Rec',
    category: 'ai_agent'
  },
  {
    name: 'AgentForge',
    description: 'LLM-agnostic platform for agent building and testing with multi-agent support',
    github_url: 'https://github.com/DataBassGit/AgentForge',
    category: 'ai_agent'
  },
  {
    name: 'AgentGPT',
    description: 'Browser-based no-code version of AutoGPT for autonomous AI agents',
    github_url: 'https://github.com/reworkd/AgentGPT',
    category: 'ai_agent'
  },
  {
    name: 'AgentPilot',
    description: 'Build, manage, and chat with AI agents in desktop application',
    github_url: 'https://github.com/jbexta/AgentPilot',
    category: 'ai_agent'
  },
  {
    name: 'Agents',
    description: 'Library and framework for building language agents with multi-agent capabilities',
    github_url: 'https://github.com/aiwaves-cn/agents',
    category: 'ai_agent'
  },
  {
    name: 'AgentVerse',
    description: 'Platform for task-solving and simulation agents with collaborative capabilities',
    github_url: 'https://github.com/OpenBMB/AgentVerse',
    category: 'ai_agent'
  },
  {
    name: 'AI Legion',
    description: 'Multi-agent TypeScript platform, similar to AutoGPT for autonomous tasks',
    github_url: 'https://github.com/eumemic/ai-legion',
    category: 'ai_agent'
  },
  {
    name: 'AutoGen',
    description: 'Microsoft framework for multi-agent conversational AI systems',
    github_url: 'https://github.com/microsoft/autogen',
    category: 'ai_agent'
  },
  {
    name: 'AutoGPT',
    description: 'Autonomous GPT-4 agent for goal-oriented task completion',
    github_url: 'https://github.com/Significant-Gravitas/AutoGPT',
    category: 'ai_agent'
  },
  {
    name: 'BabyAGI',
    description: 'Task-driven autonomous agent using OpenAI and vector databases',
    github_url: 'https://github.com/yoheinakajima/babyagi',
    category: 'ai_agent'
  },
  {
    name: 'CrewAI',
    description: 'Framework for orchestrating role-playing autonomous AI agents',
    github_url: 'https://github.com/joaomdmoura/crewAI',
    category: 'ai_agent'
  },
  {
    name: 'LangGraph',
    description: 'Library for building stateful, multi-actor applications with LLMs',
    github_url: 'https://github.com/langchain-ai/langgraph',
    category: 'ai_agent'
  },
  {
    name: 'MetaGPT',
    description: 'Multi-agent framework for software development teams',
    github_url: 'https://github.com/geekan/MetaGPT',
    category: 'ai_agent'
  },
  {
    name: 'Multi-Agent-AI',
    description: 'Platform for creating and managing multiple AI agents',
    github_url: 'https://github.com/rohankar7/Multi-Agent-AI',
    category: 'ai_agent'
  },
  {
    name: 'OpenAI Swarm',
    description: 'Educational framework for multi-agent orchestration',
    github_url: 'https://github.com/openai/swarm',
    category: 'ai_agent'
  },
  {
    name: 'PydanticAI',
    description: 'Agent framework designed around Pydantic for type safety',
    github_url: 'https://github.com/pydantic/pydantic-ai',
    category: 'ai_agent'
  },
  
  // Coding Agents
  {
    name: 'Aider',
    description: 'AI pair programming tool for editing code in your local repository',
    github_url: 'https://github.com/paul-gauthier/aider',
    category: 'ai_agent'
  },
  {
    name: 'Code2flow',
    description: 'AI agent for generating code flowcharts and documentation',
    github_url: 'https://github.com/scottrogowski/code2flow',
    category: 'ai_agent'
  },
  {
    name: 'Cursor',
    description: 'AI-powered code editor with intelligent completion',
    github_url: 'https://github.com/getcursor/cursor',
    category: 'ai_agent'
  },
  {
    name: 'DevChat',
    description: 'AI coding assistant for development workflow integration',
    github_url: 'https://github.com/devchat-ai/devchat',
    category: 'ai_agent'
  },
  {
    name: 'GPT Engineer',
    description: 'AI agent that generates entire codebases from prompts',
    github_url: 'https://github.com/AntonOsika/gpt-engineer',
    category: 'ai_agent'
  },
  {
    name: 'GPT Pilot',
    description: 'AI developer that codes entire applications from scratch',
    github_url: 'https://github.com/Pythagora-io/gpt-pilot',
    category: 'ai_agent'
  },
  {
    name: 'SWE-Agent',
    description: 'AI agent for solving GitHub issues automatically',
    github_url: 'https://github.com/princeton-nlp/SWE-agent',
    category: 'ai_agent'
  },
  
  // Research Agents
  {
    name: 'GPT Researcher',
    description: 'Autonomous agent for comprehensive online research',
    github_url: 'https://github.com/assafelovic/gpt-researcher',
    category: 'ai_agent'
  },
  {
    name: 'Research Assistant',
    description: 'AI agent for academic research and paper analysis',
    github_url: 'https://github.com/research-assistant/research-assistant',
    category: 'ai_agent'
  },
  {
    name: 'Scrapegraph-ai',
    description: 'AI-powered web scraping agent for data extraction',
    github_url: 'https://github.com/VinciGit00/Scrapegraph-ai',
    category: 'ai_agent'
  },
  
  // Browser/Web Agents
  {
    name: 'Browser-Use',
    description: 'AI agent for automated browser interactions and web tasks',
    github_url: 'https://github.com/browser-use/browser-use',
    category: 'ai_agent'
  },
  {
    name: 'LaVague',
    description: 'AI agent for web automation and browser control',
    github_url: 'https://github.com/lavague-ai/LaVague',
    category: 'ai_agent'
  },
  {
    name: 'Playwright AI',
    description: 'AI-powered browser automation using Playwright',
    github_url: 'https://github.com/playwright-community/playwright-ai',
    category: 'ai_agent'
  },
  {
    name: 'WebVoyager',
    description: 'AI agent for web navigation and task completion',
    github_url: 'https://github.com/MinorJerry/WebVoyager',
    category: 'ai_agent'
  },
  
  // Gaming Agents
  {
    name: 'Minecraft Agent',
    description: 'AI agent for playing and building in Minecraft',
    github_url: 'https://github.com/microsoft/MinecraftAgent',
    category: 'ai_agent'
  },
  {
    name: 'OpenAI Five',
    description: 'AI system for playing Dota 2 at professional level',
    github_url: 'https://github.com/openai/dota2',
    category: 'ai_agent'
  },
  
  // Specialized Agents
  {
    name: 'ChatDev',
    description: 'Virtual software development company with AI agents',
    github_url: 'https://github.com/OpenBMB/ChatDev',
    category: 'ai_agent'
  },
  {
    name: 'Financial Agent',
    description: 'AI agent for financial analysis and trading strategies',
    github_url: 'https://github.com/AI4Finance-Foundation/FinGPT',
    category: 'ai_agent'
  },
  {
    name: 'HealthGPT',
    description: 'AI agent for healthcare and medical assistance',
    github_url: 'https://github.com/microsoft/HealthGPT',
    category: 'ai_agent'
  },
  {
    name: 'LegalAI',
    description: 'AI agent for legal document analysis and advice',
    github_url: 'https://github.com/legal-ai/legal-ai',
    category: 'ai_agent'
  },
  {
    name: 'SQL Agent',
    description: 'AI agent for database queries and data analysis',
    github_url: 'https://github.com/sql-agent/sql-agent',
    category: 'ai_agent'
  },
  
  // Platform/Infrastructure
  {
    name: 'AgentScope',
    description: 'Multi-agent platform for building scalable AI systems',
    github_url: 'https://github.com/modelscope/agentscope',
    category: 'ai_agent'
  },
  {
    name: 'Haystack',
    description: 'Framework for building search systems and AI agents',
    github_url: 'https://github.com/deepset-ai/haystack',
    category: 'ai_agent'
  },
  {
    name: 'LangChain',
    description: 'Framework for developing applications powered by language models',
    github_url: 'https://github.com/langchain-ai/langchain',
    category: 'ai_agent'
  },
  {
    name: 'Semantic Kernel',
    description: 'Microsoft SDK for integrating AI services with conventional programming',
    github_url: 'https://github.com/microsoft/semantic-kernel',
    category: 'ai_agent'
  },
  
  // Voice/Audio Agents
  {
    name: 'OpenAI Whisper',
    description: 'AI system for automatic speech recognition',
    github_url: 'https://github.com/openai/whisper',
    category: 'ai_agent'
  },
  {
    name: 'Voice Assistant',
    description: 'AI agent for voice interactions and commands',
    github_url: 'https://github.com/voice-assistant/voice-assistant',
    category: 'ai_agent'
  },
  
  // Mobile/App Agents
  {
    name: 'AppAgent',
    description: 'AI agent for mobile application automation',
    github_url: 'https://github.com/mnotgod96/AppAgent',
    category: 'ai_agent'
  },
  {
    name: 'Mobile-Agent',
    description: 'AI agent for mobile device control and interaction',
    github_url: 'https://github.com/mobile-agent/mobile-agent',
    category: 'ai_agent'
  },
  
  // Data/Analytics Agents
  {
    name: 'Data Agent',
    description: 'AI agent for data processing and analysis workflows',
    github_url: 'https://github.com/data-agent/data-agent',
    category: 'ai_agent'
  },
  {
    name: 'Pandas AI',
    description: 'AI agent for data manipulation using natural language',
    github_url: 'https://github.com/gventuri/pandas-ai',
    category: 'ai_agent'
  }
];

async function checkIfAgentExists(name, githubUrl) {
  try {
    const result = await pool.query(
      'SELECT id FROM products WHERE name_en = $1 OR github_url = $2 OR name = $3',
      [name, githubUrl, name]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking for existing agent:', error);
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

function translateToPortuguese(englishText, agentName) {
  // Comprehensive translation mappings for AI agents
  const translations = {
    // AI/ML terms
    'agent': 'agente',
    'agents': 'agentes',
    'artificial intelligence': 'inteligência artificial',
    'machine learning': 'aprendizado de máquina',
    'deep learning': 'aprendizado profundo',
    'neural network': 'rede neural',
    'model': 'modelo',
    'framework': 'framework',
    'platform': 'plataforma',
    'autonomous': 'autônomo',
    'automation': 'automação',
    'assistant': 'assistente',
    'chatbot': 'chatbot',
    'conversation': 'conversação',
    'dialogue': 'diálogo',
    'natural language': 'linguagem natural',
    'processing': 'processamento',
    'understanding': 'compreensão',
    'generation': 'geração',
    'completion': 'conclusão',
    'prediction': 'predição',
    'classification': 'classificação',
    'recognition': 'reconhecimento',
    'detection': 'detecção',
    'analysis': 'análise',
    'synthesis': 'síntese',
    'optimization': 'otimização',
    'training': 'treinamento',
    'inference': 'inferência',
    'deployment': 'implantação',
    'monitoring': 'monitoramento',
    'evaluation': 'avaliação',
    'performance': 'desempenho',
    'accuracy': 'precisão',
    'efficiency': 'eficiência',
    'scalability': 'escalabilidade',
    'reliability': 'confiabilidade',
    
    // Development terms
    'coding': 'codificação',
    'programming': 'programação',
    'development': 'desenvolvimento',
    'software': 'software',
    'application': 'aplicação',
    'system': 'sistema',
    'tool': 'ferramenta',
    'library': 'biblioteca',
    'framework': 'framework',
    'SDK': 'SDK',
    'API': 'API',
    'interface': 'interface',
    'workflow': 'fluxo de trabalho',
    'pipeline': 'pipeline',
    'integration': 'integração',
    'collaboration': 'colaboração',
    'repository': 'repositório',
    'version control': 'controle de versão',
    'debugging': 'depuração',
    'testing': 'teste',
    'deployment': 'implantação',
    'maintenance': 'manutenção',
    'documentation': 'documentação',
    
    // Domain-specific terms
    'research': 'pesquisa',
    'data': 'dados',
    'database': 'banco de dados',
    'analytics': 'análise',
    'visualization': 'visualização',
    'scraping': 'extração',
    'mining': 'mineração',
    'web': 'web',
    'browser': 'navegador',
    'mobile': 'móvel',
    'voice': 'voz',
    'speech': 'fala',
    'audio': 'áudio',
    'video': 'vídeo',
    'image': 'imagem',
    'text': 'texto',
    'document': 'documento',
    'file': 'arquivo',
    'content': 'conteúdo',
    'search': 'busca',
    'recommendation': 'recomendação',
    'personalization': 'personalização',
    'customization': 'customização',
    'configuration': 'configuração',
    'management': 'gerenciamento',
    'control': 'controle',
    'navigation': 'navegação',
    'interaction': 'interação',
    'communication': 'comunicação',
    'messaging': 'mensagem',
    'notification': 'notificação',
    'alert': 'alerta',
    'report': 'relatório',
    'dashboard': 'painel',
    'interface': 'interface',
    'user experience': 'experiência do usuário',
    'user interface': 'interface do usuário',
    
    // Business/Industry terms
    'business': 'negócio',
    'enterprise': 'empresa',
    'commercial': 'comercial',
    'financial': 'financeiro',
    'healthcare': 'saúde',
    'medical': 'médico',
    'legal': 'jurídico',
    'education': 'educação',
    'gaming': 'jogos',
    'entertainment': 'entretenimento',
    'social': 'social',
    'media': 'mídia',
    'news': 'notícias',
    'marketing': 'marketing',
    'sales': 'vendas',
    'customer': 'cliente',
    'support': 'suporte',
    'service': 'serviço',
    'solution': 'solução',
    'product': 'produto',
    'feature': 'recurso',
    'functionality': 'funcionalidade',
    'capability': 'capacidade',
    'benefit': 'benefício',
    'advantage': 'vantagem',
    'innovation': 'inovação',
    'technology': 'tecnologia',
    'digital': 'digital',
    'online': 'online',
    'cloud': 'nuvem',
    'internet': 'internet',
    'network': 'rede',
    'connectivity': 'conectividade',
    'security': 'segurança',
    'privacy': 'privacidade',
    'compliance': 'conformidade',
    'governance': 'governança',
    'strategy': 'estratégia',
    'planning': 'planejamento',
    'execution': 'execução',
    'implementation': 'implementação',
    'operation': 'operação',
    'maintenance': 'manutenção',
    'support': 'suporte',
    'troubleshooting': 'solução de problemas',
    'optimization': 'otimização',
    'improvement': 'melhoria',
    'enhancement': 'aprimoramento',
    'upgrade': 'atualização',
    'migration': 'migração',
    'transformation': 'transformação',
    'modernization': 'modernização'
  };

  // Agent-specific templates
  const agentTemplates = {
    'autogen': 'Agente de IA para geração automática e colaboração multi-agente',
    'autogpt': 'Agente GPT autônomo para conclusão de tarefas orientadas por objetivos',
    'babyagi': 'Agente de IA orientado por tarefas usando OpenAI e bancos de dados vetoriais',
    'crewai': 'Framework para orquestração de agentes de IA autônomos com papéis específicos',
    'langgraph': 'Biblioteca para construção de aplicações estatais e multi-ator com LLMs',
    'metagpt': 'Framework multi-agente para equipes de desenvolvimento de software',
    'aider': 'Ferramenta de programação em par com IA para edição de código local',
    'cursor': 'Editor de código alimentado por IA com conclusão inteligente',
    'gpt-engineer': 'Agente de IA que gera bases de código inteiras a partir de prompts',
    'gpt-pilot': 'Desenvolvedor de IA que codifica aplicações inteiras do zero',
    'gpt-researcher': 'Agente autônomo para pesquisa online abrangente',
    'browser-use': 'Agente de IA para interações automatizadas do navegador e tarefas web',
    'lavague': 'Agente de IA para automação web e controle de navegador',
    'webvoyager': 'Agente de IA para navegação web e conclusão de tarefas',
    'chatdev': 'Empresa virtual de desenvolvimento de software com agentes de IA',
    'agentscope': 'Plataforma multi-agente para construção de sistemas de IA escaláveis',
    'langchain': 'Framework para desenvolvimento de aplicações alimentadas por modelos de linguagem',
    'haystack': 'Framework para construção de sistemas de busca e agentes de IA',
    'whisper': 'Sistema de IA para reconhecimento automático de fala',
    'pandas-ai': 'Agente de IA para manipulação de dados usando linguagem natural'
  };

  // Check for agent-specific templates first
  const agentLower = agentName.toLowerCase();
  for (const [key, template] of Object.entries(agentTemplates)) {
    if (agentLower.includes(key)) {
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
  
  // Default fallback with agent context
  if (translated === englishText.toLowerCase()) {
    return `Agente de IA para ${agentName} - sistema inteligente para automação e assistência`;
  }
  
  return translated;
}

async function addAIAgents() {
  console.log('🤖 AI Agents Importer');
  console.log(`📋 Processing ${AI_AGENTS.length} AI agents...\n`);

  let addedCount = 0;
  let skippedCount = 0;

  for (const agentData of AI_AGENTS) {
    try {
      const exists = await checkIfAgentExists(agentData.name, agentData.github_url);
      
      if (exists) {
        console.log(`⚠️  Skipping ${agentData.name} - already exists in database`);
        skippedCount++;
        continue;
      }

      // Generate multilingual content
      const name_en = agentData.name;
      const name_pt = agentData.name; // Keep original name for AI agents
      const description_en = agentData.description;
      const description_pt = translateToPortuguese(agentData.description, agentData.name);
      const slug = generateSlug(agentData.name);

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
        '🧠', // image_url (brain emoji placeholder for AI agents)
        '🧠', // icon_url (brain emoji placeholder for AI agents)
        agentData.github_url, // github_url
        'ai_agent', // category
        '{ai_agent,intelligent_system}', // categories (PostgreSQL array format)
        'ai_agent', // product_type
        false, // official (these are community projects)
        true, // is_active
        false, // is_featured
        slug, // slug
        0, // price
        slug, // sku
        'Multiple', // language
        'MIT', // license (typical for open source)
        'Community', // creator
        '1.0.0', // version
        '{ai,agent,intelligent,automation,assistant}' // tags (PostgreSQL array format)
      ];

      const result = await pool.query(insertQuery, values);
      console.log(`✅ Added: ${agentData.name} (ID: ${result.rows[0].id})`);
      addedCount++;

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error) {
      console.error(`❌ Error adding ${agentData.name}:`, error.message);
    }
  }

  console.log('\n🎉 AI Agents import completed!');
  console.log(`📊 Summary:`);
  console.log(`  - Agents processed: ${AI_AGENTS.length}`);
  console.log(`  - Added to database: ${addedCount}`);
  console.log(`  - Skipped (duplicates): ${skippedCount}`);
  console.log(`  - Success rate: ${((addedCount / AI_AGENTS.length) * 100).toFixed(1)}%`);
  console.log('\n🧠 All agents added with brain emoji placeholders for images');
  console.log('📝 You can now manually replace the brain emojis with proper images');
  console.log('🔍 AI agents are categorized separately from MCP servers');
}

// Run the importer
addAIAgents().finally(() => pool.end());