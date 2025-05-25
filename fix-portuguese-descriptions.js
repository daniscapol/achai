#!/usr/bin/env node

/**
 * Fix Portuguese Descriptions Script
 * 
 * This script analyzes and fixes Portuguese descriptions in the database
 * that are in English, mixed language, or poorly translated.
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.achai.co/api' 
  : 'http://localhost:3001/api';

// Rate limiting
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Rate-limited fetch wrapper
 */
async function rateLimitedFetch(url, options = {}) {
  await delay(500); // 500ms delay between requests
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Portuguese-Description-Fixer/1.0',
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
 * Get all products from database
 */
async function getAllProducts() {
  try {
    console.log('🔍 Fetching all products from database...');
    
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await rateLimitedFetch(`${API_BASE_URL}/products?page=${page}&limit=100`);
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        allProducts = allProducts.concat(data.products);
        page++;
        hasMore = data.pagination && page <= data.pagination.totalPages;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`📋 Found ${allProducts.length} products in database`);
    return allProducts;
    
  } catch (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
}

/**
 * Analyze if a Portuguese description needs fixing
 */
function analyzePortugueseDescription(product) {
  const { name_en, description_en, name_pt, description_pt } = product;
  
  if (!description_pt || description_pt.trim() === '') {
    return { needsFix: true, reason: 'Missing Portuguese description', severity: 'high' };
  }
  
  // Check if description_pt is identical to description_en
  if (description_pt === description_en) {
    return { needsFix: true, reason: 'Portuguese description identical to English', severity: 'high' };
  }
  
  // Check for common Portuguese quality issues
  const issues = [];
  
  // Check for excessive English words
  const englishWords = ['server', 'tool', 'application', 'interface', 'management', 'platform', 'framework', 'engine', 'service', 'integration', 'workflow', 'automation', 'container', 'orchestration', 'repository', 'database', 'filesystem', 'storage', 'cloud', 'assistant', 'agent', 'model'];
  const portugueseText = description_pt.toLowerCase();
  const englishWordCount = englishWords.filter(word => portugueseText.includes(word)).length;
  
  if (englishWordCount > 3) {
    issues.push('Too many English words');
  }
  
  // Check for poor translation patterns
  const poorPatterns = [
    /servidor mcp para .* server/i,
    /servidor mcp para .* application/i,
    /servidor mcp para .* tool/i,
    /servidor mcp para .* platform/i,
    /mcp servidor/i, // Should be "servidor mcp"
    /ferramenta-use/i, // Poor translation of "tool-use"
  ];
  
  poorPatterns.forEach((pattern, index) => {
    if (pattern.test(description_pt)) {
      issues.push(`Poor translation pattern ${index + 1}`);
    }
  });
  
  // Check for redundancy
  if (description_pt.includes('servidor mcp') && description_pt.includes('mcp')) {
    const mcpCount = (description_pt.match(/mcp/gi) || []).length;
    if (mcpCount > 2) {
      issues.push('Redundant MCP mentions');
    }
  }
  
  if (issues.length > 0) {
    return { needsFix: true, reason: issues.join(', '), severity: 'medium' };
  }
  
  return { needsFix: false, reason: 'Good quality', severity: 'none' };
}

/**
 * Generate improved Portuguese description
 */
function generateImprovedPortugueseDescription(product) {
  const { name_en, description_en, product_type, categories, tags } = product;
  
  // Common Portuguese translations
  const translations = {
    // Technical terms
    'server': 'servidor',
    'client': 'cliente',
    'application': 'aplicação',
    'tool': 'ferramenta',
    'platform': 'plataforma',
    'framework': 'framework',
    'engine': 'motor',
    'service': 'serviço',
    'interface': 'interface',
    'management': 'gerenciamento',
    'automation': 'automação',
    'workflow': 'fluxo de trabalho',
    'integration': 'integração',
    'container': 'contêiner',
    'orchestration': 'orquestração',
    'repository': 'repositório',
    'database': 'banco de dados',
    'filesystem': 'sistema de arquivos',
    'storage': 'armazenamento',
    'cloud': 'nuvem',
    'assistant': 'assistente',
    'agent': 'agente',
    'model': 'modelo',
    'file': 'arquivo',
    'folder': 'pasta',
    'document': 'documento',
    'backup': 'backup',
    'restore': 'restaurar',
    'analysis': 'análise',
    'generation': 'geração',
    'processing': 'processamento',
    'operations': 'operações',
    'monitoring': 'monitoramento',
    'deployment': 'implantação',
    'configuration': 'configuração',
    'authentication': 'autenticação',
    'authorization': 'autorização',
    'security': 'segurança',
    'performance': 'desempenho',
    'optimization': 'otimização',
    'development': 'desenvolvimento',
    'coding': 'codificação',
    'programming': 'programação',
    'debugging': 'depuração',
    'testing': 'teste',
    'collaboration': 'colaboração',
    'communication': 'comunicação',
    'messaging': 'mensagens',
    'notification': 'notificação',
    'search': 'busca',
    'query': 'consulta',
    'visualization': 'visualização',
    'dashboard': 'painel',
    'reporting': 'relatórios',
    'analytics': 'análises',
    'monitoring': 'monitoramento',
    'logging': 'registro',
    'tracking': 'rastreamento',
    'scheduling': 'agendamento',
    'calendar': 'calendário',
    'task': 'tarefa',
    'project': 'projeto',
    'team': 'equipe',
    'user': 'usuário',
    'admin': 'administrador',
    'enterprise': 'empresarial',
    'business': 'negócios',
    'commercial': 'comercial',
    'open-source': 'código aberto',
    'free': 'gratuito',
    'premium': 'premium',
    'advanced': 'avançado',
    'professional': 'profissional',
    'simple': 'simples',
    'easy': 'fácil',
    'powerful': 'poderoso',
    'fast': 'rápido',
    'secure': 'seguro',
    'reliable': 'confiável',
    'scalable': 'escalável',
    'flexible': 'flexível',
    'customizable': 'personalizável',
    'portable': 'portátil',
    'cross-platform': 'multiplataforma'
  };
  
  // Product-specific descriptions based on common patterns
  const productDescriptions = {
    // File systems
    'filesystem': 'Servidor MCP para acesso e gerenciamento do sistema de arquivos local',
    'file-manager': 'Servidor MCP para gerenciamento avançado de arquivos e pastas',
    'storage': 'Servidor MCP para operações de armazenamento e backup',
    
    // Databases
    'sqlite': 'Servidor MCP para operações com banco de dados SQLite',
    'postgresql': 'Servidor MCP para conectividade e consultas PostgreSQL',
    'mysql': 'Servidor MCP para gerenciamento de banco de dados MySQL',
    'mongodb': 'Servidor MCP para operações com MongoDB',
    'database': 'Servidor MCP para operações de banco de dados',
    
    // Development tools
    'git': 'Servidor MCP para controle de versão e operações Git',
    'github': 'Servidor MCP para integração com GitHub',
    'vscode': 'Servidor MCP para integração com Visual Studio Code',
    'jetbrains': 'Servidor MCP para integração com IDEs JetBrains',
    'playwright': 'Servidor MCP para automação de navegador com Playwright',
    'docker': 'Servidor MCP para gerenciamento de contêineres Docker',
    'kubernetes': 'Servidor MCP para orquestração Kubernetes',
    
    // Cloud services
    'aws': 'Servidor MCP para integração com serviços Amazon Web Services',
    'azure': 'Servidor MCP para integração com Microsoft Azure',
    'gcp': 'Servidor MCP para integração com Google Cloud Platform',
    'cloudflare': 'Servidor MCP para serviços Cloudflare',
    'google-drive': 'Servidor MCP para operações com Google Drive',
    's3': 'Servidor MCP para operações com Amazon S3',
    
    // Communication
    'slack': 'Servidor MCP para integração e mensagens Slack',
    'discord': 'Servidor MCP para integração com Discord',
    'teams': 'Servidor MCP para integração com Microsoft Teams',
    'email': 'Servidor MCP para operações de email',
    'gmail': 'Servidor MCP para integração com Gmail',
    
    // Productivity
    'notion': 'Servidor MCP para integração com Notion',
    'obsidian': 'Servidor MCP para integração com Obsidian',
    'todoist': 'Servidor MCP para gerenciamento de tarefas Todoist',
    'calendar': 'Servidor MCP para operações de calendário',
    'excel': 'Servidor MCP para operações com planilhas Excel',
    
    // AI/ML
    'ollama': 'Servidor MCP para integração com modelos Ollama',
    'openai': 'Servidor MCP para integração com APIs OpenAI',
    'anthropic': 'Servidor MCP para integração com serviços Anthropic',
    'huggingface': 'Servidor MCP para integração com Hugging Face',
    
    // Monitoring
    'grafana': 'Servidor MCP para integração com Grafana',
    'prometheus': 'Servidor MCP para métricas Prometheus',
    'logging': 'Servidor MCP para gerenciamento de logs',
    
    // Web
    'web': 'Servidor MCP para operações web e automação de navegador',
    'browser': 'Servidor MCP para automação e controle de navegador',
    'puppeteer': 'Servidor MCP para automação web com Puppeteer',
    'selenium': 'Servidor MCP para automação web com Selenium'
  };
  
  // Try to match product description to known patterns
  const lowerName = name_en.toLowerCase();
  const lowerDesc = description_en.toLowerCase();
  const lowerTags = (tags || []).map(tag => tag.toLowerCase()).join(' ');
  const searchText = `${lowerName} ${lowerDesc} ${lowerTags}`;
  
  // Find the best matching description
  for (const [key, description] of Object.entries(productDescriptions)) {
    if (searchText.includes(key)) {
      return description;
    }
  }
  
  // Generate description based on product type and category
  let baseDescription = 'Servidor MCP';
  
  if (product_type === 'mcp_server') {
    baseDescription = 'Servidor MCP';
  } else if (product_type === 'mcp_client') {
    baseDescription = 'Cliente MCP';
  } else if (product_type === 'ai_agent') {
    baseDescription = 'Agente de IA';
  } else if (product_type === 'ready_to_use') {
    baseDescription = 'Solução pronta para uso';
  }
  
  // Add specific functionality based on categories
  const categoryMap = {
    'Database': 'para operações de banco de dados',
    'Storage': 'para gerenciamento de armazenamento',
    'File Systems': 'para operações de sistema de arquivos',
    'Cloud': 'para integração com serviços em nuvem',
    'Communication': 'para comunicação e mensagens',
    'Development Tools': 'para ferramentas de desenvolvimento',
    'Productivity': 'para produtividade e organização',
    'AI/ML': 'para inteligência artificial e machine learning',
    'Web Services': 'para serviços web e automação',
    'Monitoring': 'para monitoramento e métricas',
    'Security': 'para segurança e autenticação',
    'Integration': 'para integração e conectividade',
    'Automation': 'para automação de tarefas'
  };
  
  const primaryCategory = (categories && categories.length > 1) ? categories[1] : categories[0];
  const categoryDesc = categoryMap[primaryCategory] || 'para integração e automação';
  
  return `${baseDescription} ${categoryDesc}`;
}

/**
 * Update product with improved Portuguese description
 */
async function updateProductDescription(product, newDescription) {
  try {
    const response = await rateLimitedFetch(`${API_BASE_URL}/products?id=${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description_pt: newDescription
      })
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Portuguese Description Fixer\n');
  
  // Get all products
  const products = await getAllProducts();
  
  if (products.length === 0) {
    console.log('❌ No products found in database');
    return;
  }
  
  // Analyze products
  console.log('🔍 Analyzing Portuguese descriptions...\n');
  
  const needsFixing = [];
  const goodQuality = [];
  
  products.forEach(product => {
    const analysis = analyzePortugueseDescription(product);
    
    if (analysis.needsFix) {
      needsFixing.push({ product, analysis });
    } else {
      goodQuality.push(product);
    }
  });
  
  console.log(`📊 Analysis Results:`);
  console.log(`  - Good quality: ${goodQuality.length}`);
  console.log(`  - Needs fixing: ${needsFixing.length}`);
  console.log(`  - Total analyzed: ${products.length}\n`);
  
  if (needsFixing.length === 0) {
    console.log('🎉 All Portuguese descriptions are good quality!');
    return;
  }
  
  // Show problems found
  console.log('🔧 Products needing fixes:\n');
  needsFixing.forEach(({ product, analysis }, index) => {
    console.log(`${index + 1}. ${product.name_en} (ID: ${product.id})`);
    console.log(`   Current PT: "${product.description_pt}"`);
    console.log(`   Issue: ${analysis.reason} (${analysis.severity})`);
    console.log('');
  });
  
  // Fix descriptions
  console.log('🛠️  Fixing Portuguese descriptions...\n');
  
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const { product, analysis } of needsFixing) {
    try {
      const newDescription = generateImprovedPortugueseDescription(product);
      
      console.log(`[${fixedCount + errorCount + 1}/${needsFixing.length}] Fixing: ${product.name_en}`);
      console.log(`  Old: "${product.description_pt}"`);
      console.log(`  New: "${newDescription}"`);
      
      const result = await updateProductDescription(product, newDescription);
      
      if (result.success) {
        console.log(`  ✅ Updated successfully`);
        fixedCount++;
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        errorCount++;
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`  ❌ Error fixing ${product.name_en}:`, error.message);
      errorCount++;
    }
  }
  
  // Summary
  console.log('🎉 Portuguese description fixing completed!\n');
  console.log(`📊 Final Summary:`);
  console.log(`  - Products analyzed: ${products.length}`);
  console.log(`  - Already good quality: ${goodQuality.length}`);
  console.log(`  - Needed fixing: ${needsFixing.length}`);
  console.log(`  - Successfully fixed: ${fixedCount}`);
  console.log(`  - Failed to fix: ${errorCount}`);
  console.log(`  - Success rate: ${((fixedCount / needsFixing.length) * 100).toFixed(1)}%`);
  
  if (fixedCount > 0) {
    console.log('\n✅ Portuguese descriptions have been improved!');
    console.log('🔍 Check /secure-admin or the main website to see the updates.');
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as fixPortugueseDescriptions };