#!/usr/bin/env node

/**
 * Comprehensive MCP Server Scraper
 * 
 * This script scrapes MCP servers from various sources and populates
 * the database with complete multilingual data including working images.
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // GitHub API
  GITHUB_API_BASE: 'https://api.github.com',
  GITHUB_SEARCH_LIMIT: 50, // Reduced for better quality
  
  // Image sources
  DEFAULT_IMAGES: {
    mcp_server: 'https://raw.githubusercontent.com/modelcontextprotocol/servers/main/docs/logo.png',
    fallback: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=MCP+Server'
  },
  
  // API endpoints for our database
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://www.achai.co/api' 
    : 'http://localhost:3001/api',
    
  // Rate limiting
  RATE_LIMIT_MS: 800, // 800ms between requests for faster processing
  
  // Translation API (mock for now, could use real translation service)
  ENABLE_TRANSLATION: true,
  
  // Output options
  SAVE_TO_FILE: true,
  SAVE_TO_DATABASE: true,
  
  // Quality filters
  MIN_STARS: 2, // Minimum stars for inclusion
  MAX_REPOS_TO_PROCESS: 100, // Maximum repositories to process
  PREFER_OFFICIAL: true // Prioritize official repos
};

// In-memory cache for rate limiting
const rateLimitCache = new Map();

/**
 * Rate-limited fetch wrapper
 */
async function rateLimitedFetch(url, options = {}) {
  const lastRequest = rateLimitCache.get('lastRequest') || 0;
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequest;
  
  if (timeSinceLastRequest < CONFIG.RATE_LIMIT_MS) {
    await new Promise(resolve => 
      setTimeout(resolve, CONFIG.RATE_LIMIT_MS - timeSinceLastRequest)
    );
  }
  
  rateLimitCache.set('lastRequest', Date.now());
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'MCP-Server-Scraper/1.0 (+https://achai.co)',
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
 * Search GitHub for MCP servers
 */
async function searchGitHubMCPServers() {
  console.log('🔍 Searching GitHub for MCP servers...');
  
  const searchQueries = [
    'mcp server',
    'model context protocol server',
    'mcp-server',
    '"mcp server"',
    'anthropic mcp',
    'claude mcp server'
  ];
  
  const allRepos = new Set();
  
  for (const query of searchQueries) {
    try {
      console.log(`  Searching: "${query}"`);
      
      const response = await rateLimitedFetch(
        `${CONFIG.GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${CONFIG.GITHUB_SEARCH_LIMIT}`
      );
      
      const data = await response.json();
      
      if (data.items) {
        data.items.forEach(repo => {
          // Filter for likely MCP servers
          if (isLikelyMCPServer(repo)) {
            allRepos.add(JSON.stringify(repo));
          }
        });
      }
      
      console.log(`    Found ${data.items?.length || 0} repositories`);
      
    } catch (error) {
      console.error(`Error searching for "${query}":`, error.message);
    }
  }
  
  const uniqueRepos = Array.from(allRepos).map(repo => JSON.parse(repo));
  console.log(`✅ Found ${uniqueRepos.length} unique MCP server repositories`);
  
  // Sort by quality and limit the number
  const sortedRepos = sortReposByQuality(uniqueRepos);
  const limitedRepos = sortedRepos.slice(0, CONFIG.MAX_REPOS_TO_PROCESS);
  
  console.log(`🎯 Processing top ${limitedRepos.length} repositories (limited from ${uniqueRepos.length})`);
  
  return limitedRepos;
}

/**
 * Check if a repository is likely an MCP server
 */
function isLikelyMCPServer(repo) {
  const name = repo.name.toLowerCase();
  const description = (repo.description || '').toLowerCase();
  const topics = repo.topics || [];
  
  // Apply quality filters
  if (repo.stargazers_count < CONFIG.MIN_STARS) {
    return false;
  }
  
  // Positive indicators
  const positiveKeywords = [
    'mcp', 'model context protocol', 'claude', 'anthropic',
    'server', 'tool', 'integration', 'plugin'
  ];
  
  // Negative indicators (exclude these)
  const negativeKeywords = [
    'client', 'frontend', 'website', 'documentation', 'docs',
    'tutorial', 'example', 'demo', 'test', 'awesome', 'list',
    'template', 'boilerplate', 'starter', 'hello-world'
  ];
  
  const text = `${name} ${description} ${topics.join(' ')}`;
  
  const hasPositive = positiveKeywords.some(keyword => text.includes(keyword));
  const hasNegative = negativeKeywords.some(keyword => text.includes(keyword));
  
  // Strong positive indicators for MCP servers
  const strongPositive = [
    'mcp-server', 'mcp server', 'modelcontextprotocol'
  ];
  const hasStrongPositive = strongPositive.some(keyword => text.includes(keyword));
  
  // Official repositories get priority
  const isOfficial = isOfficialRepo(repo);
  
  if (hasStrongPositive || isOfficial) {
    return !hasNegative; // Skip negative check for strong positives/official
  }
  
  return hasPositive && !hasNegative;
}

/**
 * Sort repositories by quality/relevance
 */
function sortReposByQuality(repos) {
  return repos.sort((a, b) => {
    // Official repos first
    const aOfficial = isOfficialRepo(a);
    const bOfficial = isOfficialRepo(b);
    if (aOfficial && !bOfficial) return -1;
    if (!aOfficial && bOfficial) return 1;
    
    // Then by stars
    if (a.stargazers_count !== b.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }
    
    // Then by update recency
    const aUpdated = new Date(a.updated_at);
    const bUpdated = new Date(b.updated_at);
    return bUpdated - aUpdated;
  });
}

/**
 * Get detailed repository information
 */
async function getRepoDetails(repo) {
  try {
    console.log(`📋 Getting details for ${repo.full_name}...`);
    
    // Get repository details
    const repoResponse = await rateLimitedFetch(`${CONFIG.GITHUB_API_BASE}/repos/${repo.full_name}`);
    const repoData = await repoResponse.json();
    
    // Get README content
    let readmeContent = '';
    try {
      const readmeResponse = await rateLimitedFetch(`${CONFIG.GITHUB_API_BASE}/repos/${repo.full_name}/readme`);
      const readmeData = await readmeResponse.json();
      readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
    } catch (error) {
      console.log(`    No README found for ${repo.full_name}`);
    }
    
    // Get package.json for npm packages
    let packageJson = null;
    try {
      const packageResponse = await rateLimitedFetch(`${CONFIG.GITHUB_API_BASE}/repos/${repo.full_name}/contents/package.json`);
      const packageData = await packageResponse.json();
      packageJson = JSON.parse(Buffer.from(packageData.content, 'base64').toString('utf-8'));
    } catch (error) {
      // No package.json, that's okay
    }
    
    return {
      repo: repoData,
      readme: readmeContent,
      packageJson
    };
    
  } catch (error) {
    console.error(`Error getting details for ${repo.full_name}:`, error.message);
    return null;
  }
}

/**
 * Extract MCP server information from repository data
 */
async function extractServerInfo(repoDetails) {
  const { repo, readme, packageJson } = repoDetails;
  
  // Extract name (prefer package.json name, fallback to repo name)
  const name = packageJson?.name || repo.name;
  
  // Extract description
  const description = repo.description || extractDescriptionFromReadme(readme) || `MCP server for ${name}`;
  
  // Extract installation command
  const installCommand = extractInstallCommand(readme, packageJson);
  
  // Extract documentation URL
  const docsUrl = repo.homepage || 
                  (readme.includes('docs.') ? extractDocsUrl(readme) : '') ||
                  `${repo.html_url}#readme`;
  
  // Extract demo URL (if any)
  const demoUrl = extractDemoUrl(readme);
  
  // Extract license
  const license = repo.license?.name || packageJson?.license || 'Unknown';
  
  // Extract creator/author
  const creator = packageJson?.author?.name || 
                  packageJson?.author || 
                  repo.owner.login;
  
  // Extract version
  const version = packageJson?.version || 'latest';
  
  // Extract language
  const language = repo.language || 'Unknown';
  
  // Generate tags
  const tags = generateTags(name, description, readme, repo.topics);
  
  // Generate categories
  const categories = generateCategories(name, description, readme);
  
  // Generate slug
  const slug = name.toLowerCase()
    .replace(/[@\/]/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return {
    name_en: name,
    description_en: description,
    name: name, // Legacy field
    description: description, // Legacy field
    slug,
    github_url: repo.html_url,
    docs_url: docsUrl,
    demo_url: demoUrl,
    installation_command: installCommand,
    license,
    creator,
    version,
    language,
    tags: tags,
    categories: categories,
    category: categories[0] || 'MCP Server',
    product_type: 'mcp_server',
    official: isOfficialRepo(repo),
    stars_numeric: repo.stargazers_count,
    is_featured: repo.stargazers_count > 50,
    is_active: true,
    image_url: await findServerImage(repo, readme),
    icon_url: await findServerIcon(repo),
    price: 0.00,
    inventory_count: 0
  };
}

/**
 * Extract description from README
 */
function extractDescriptionFromReadme(readme) {
  if (!readme) return null;
  
  // Look for description in common patterns
  const patterns = [
    /#{1,3}\s*Description\s*\n\s*(.+?)(?=\n\s*#{1,3}|\n\s*$)/i,
    /#{1,3}\s*About\s*\n\s*(.+?)(?=\n\s*#{1,3}|\n\s*$)/i,
    /^(.+?)(?=\n\s*#{1,3}|\n\s*##)/m, // First paragraph
  ];
  
  for (const pattern of patterns) {
    const match = readme.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/\n/g, ' ').substring(0, 200);
    }
  }
  
  return null;
}

/**
 * Extract installation command
 */
function extractInstallCommand(readme, packageJson) {
  if (packageJson) {
    return `npm install ${packageJson.name}`;
  }
  
  if (!readme) return '';
  
  // Look for installation commands in README
  const installPatterns = [
    /npm install ([^`\n]+)/i,
    /pip install ([^`\n]+)/i,
    /yarn add ([^`\n]+)/i,
    /cargo install ([^`\n]+)/i,
    /go install ([^`\n]+)/i
  ];
  
  for (const pattern of installPatterns) {
    const match = readme.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return '';
}

/**
 * Extract documentation URL from README
 */
function extractDocsUrl(readme) {
  const docPatterns = [
    /\[documentation\]\(([^)]+)\)/i,
    /\[docs\]\(([^)]+)\)/i,
    /(https?:\/\/[^)\s]+docs[^)\s]*)/i
  ];
  
  for (const pattern of docPatterns) {
    const match = readme.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '';
}

/**
 * Extract demo URL from README
 */
function extractDemoUrl(readme) {
  const demoPatterns = [
    /\[demo\]\(([^)]+)\)/i,
    /\[live demo\]\(([^)]+)\)/i,
    /(https?:\/\/[^)\s]+demo[^)\s]*)/i
  ];
  
  for (const pattern of demoPatterns) {
    const match = readme.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '';
}

/**
 * Generate tags based on content analysis
 */
function generateTags(name, description, readme, topics = []) {
  const content = `${name} ${description} ${readme}`.toLowerCase();
  const tags = new Set(topics);
  
  // Common MCP server tag patterns
  const tagPatterns = [
    { pattern: /database|db|sql|postgres|mysql/, tag: 'database' },
    { pattern: /file|filesystem|storage/, tag: 'filesystem' },
    { pattern: /web|http|api|rest/, tag: 'web' },
    { pattern: /git|github|version control/, tag: 'git' },
    { pattern: /docker|container/, tag: 'docker' },
    { pattern: /kubernetes|k8s/, tag: 'kubernetes' },
    { pattern: /aws|amazon|cloud/, tag: 'cloud' },
    { pattern: /slack|discord|chat/, tag: 'messaging' },
    { pattern: /email|mail/, tag: 'email' },
    { pattern: /calendar|schedule/, tag: 'calendar' },
    { pattern: /image|photo|picture/, tag: 'images' },
    { pattern: /pdf|document/, tag: 'documents' },
    { pattern: /search|index/, tag: 'search' },
    { pattern: /ai|llm|openai|anthropic/, tag: 'ai' },
    { pattern: /tool|utility/, tag: 'utility' }
  ];
  
  tagPatterns.forEach(({ pattern, tag }) => {
    if (pattern.test(content)) {
      tags.add(tag);
    }
  });
  
  // Always add core tags
  tags.add('mcp');
  tags.add('server');
  tags.add('integration');
  
  return Array.from(tags).slice(0, 10); // Limit to 10 tags
}

/**
 * Generate categories
 */
function generateCategories(name, description, readme) {
  const content = `${name} ${description} ${readme}`.toLowerCase();
  const categories = ['MCP Server']; // Always include base category
  
  const categoryPatterns = [
    { pattern: /database|db|sql/, category: 'Database' },
    { pattern: /file|storage/, category: 'Storage' },
    { pattern: /web|api|http/, category: 'Web Services' },
    { pattern: /tool|utility/, category: 'Development Tools' },
    { pattern: /integration|connector/, category: 'Integration' },
    { pattern: /ai|llm|machine learning/, category: 'AI/ML' },
    { pattern: /communication|chat|messaging/, category: 'Communication' },
    { pattern: /productivity|office/, category: 'Productivity' }
  ];
  
  categoryPatterns.forEach(({ pattern, category }) => {
    if (pattern.test(content) && !categories.includes(category)) {
      categories.push(category);
    }
  });
  
  return categories.slice(0, 3); // Limit to 3 categories
}

/**
 * Check if repository is official (from Anthropic or MCP organization)
 */
function isOfficialRepo(repo) {
  const officialOrgs = ['anthropics', 'modelcontextprotocol'];
  return officialOrgs.includes(repo.owner.login.toLowerCase());
}

/**
 * Find appropriate server image
 */
async function findServerImage(repo, readme) {
  // Try to find image in repository
  const imagePatterns = [
    /!\[.*?\]\((.*?\.(?:png|jpg|jpeg|gif|svg))\)/i,
    /(https?:\/\/[^)\s]+\.(?:png|jpg|jpeg|gif|svg))/i
  ];
  
  for (const pattern of imagePatterns) {
    const match = readme.match(pattern);
    if (match && match[1]) {
      let imageUrl = match[1];
      
      // Convert relative URLs to absolute
      if (imageUrl.startsWith('./') || imageUrl.startsWith('../')) {
        imageUrl = `https://raw.githubusercontent.com/${repo.full_name}/main/${imageUrl.replace(/^\.\//, '')}`;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `https://raw.githubusercontent.com/${repo.full_name}/main${imageUrl}`;
      }
      
      // Verify image exists
      try {
        const response = await rateLimitedFetch(imageUrl, { method: 'HEAD' });
        if (response.ok) {
          return imageUrl;
        }
      } catch (error) {
        // Image doesn't exist, continue searching
      }
    }
  }
  
  // Try common image locations
  const commonImages = [
    `https://raw.githubusercontent.com/${repo.full_name}/main/logo.png`,
    `https://raw.githubusercontent.com/${repo.full_name}/main/assets/logo.png`,
    `https://raw.githubusercontent.com/${repo.full_name}/main/docs/logo.png`,
    `https://raw.githubusercontent.com/${repo.full_name}/main/images/logo.png`
  ];
  
  for (const imageUrl of commonImages) {
    try {
      const response = await rateLimitedFetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        return imageUrl;
      }
    } catch (error) {
      // Continue to next image
    }
  }
  
  // Return default image
  return CONFIG.DEFAULT_IMAGES.fallback;
}

/**
 * Find server icon
 */
async function findServerIcon(repo) {
  const iconPatterns = [
    `https://raw.githubusercontent.com/${repo.full_name}/main/icon.png`,
    `https://raw.githubusercontent.com/${repo.full_name}/main/assets/icon.png`,
    `https://raw.githubusercontent.com/${repo.full_name}/main/favicon.png`
  ];
  
  for (const iconUrl of iconPatterns) {
    try {
      const response = await rateLimitedFetch(iconUrl, { method: 'HEAD' });
      if (response.ok) {
        return iconUrl;
      }
    } catch (error) {
      // Continue to next icon
    }
  }
  
  return '';
}

/**
 * Generate Portuguese translations
 */
async function generatePortugueseTranslations(serverInfo) {
  if (!CONFIG.ENABLE_TRANSLATION) {
    return {
      name_pt: serverInfo.name_en,
      description_pt: serverInfo.description_en
    };
  }
  
  // Simple translation mapping for common terms
  const translations = {
    'server': 'servidor',
    'client': 'cliente',
    'database': 'banco de dados',
    'file': 'arquivo',
    'filesystem': 'sistema de arquivos',
    'web': 'web',
    'api': 'API',
    'tool': 'ferramenta',
    'integration': 'integração',
    'connector': 'conector',
    'service': 'serviço',
    'manager': 'gerenciador',
    'handler': 'manipulador',
    'provider': 'provedor',
    'interface': 'interface'
  };
  
  // For MVP, we'll create basic Portuguese versions
  // In production, you could integrate with Google Translate API or similar
  let name_pt = serverInfo.name_en;
  let description_pt = serverInfo.description_en;
  
  // Simple word replacement for common terms
  Object.entries(translations).forEach(([en, pt]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    name_pt = name_pt.replace(regex, pt);
    description_pt = description_pt.replace(regex, pt);
  });
  
  // Add Portuguese context
  if (!description_pt.toLowerCase().includes('servidor mcp')) {
    description_pt = `Servidor MCP para ${description_pt.toLowerCase()}`;
  }
  
  return { name_pt, description_pt };
}

/**
 * Get existing products from database to avoid duplicates
 */
async function getExistingProducts() {
  try {
    console.log('🔍 Fetching existing products to avoid duplicates...');
    
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await rateLimitedFetch(`${CONFIG.API_BASE_URL}/products?page=${page}&limit=100`);
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        allProducts = allProducts.concat(data.products);
        page++;
        hasMore = data.pagination && page <= data.pagination.totalPages;
      } else {
        hasMore = false;
      }
    }
    
    console.log(`📋 Found ${allProducts.length} existing products in database`);
    
    // Create lookup sets for fast duplicate checking
    const existingUrls = new Set();
    const existingSlugs = new Set();
    const existingNames = new Set();
    
    allProducts.forEach(product => {
      if (product.github_url) existingUrls.add(product.github_url.toLowerCase());
      if (product.slug) existingSlugs.add(product.slug.toLowerCase());
      if (product.name) existingNames.add(product.name.toLowerCase());
      if (product.name_en) existingNames.add(product.name_en.toLowerCase());
    });
    
    return { existingUrls, existingSlugs, existingNames, count: allProducts.length };
    
  } catch (error) {
    console.error('Error fetching existing products:', error.message);
    console.log('⚠️  Continuing without duplicate detection...');
    return { existingUrls: new Set(), existingSlugs: new Set(), existingNames: new Set(), count: 0 };
  }
}

/**
 * Check if a server already exists in the database
 */
function isDuplicate(server, existingData) {
  const { existingUrls, existingSlugs, existingNames } = existingData;
  
  // Check GitHub URL
  if (server.github_url && existingUrls.has(server.github_url.toLowerCase())) {
    return { isDupe: true, reason: 'GitHub URL already exists' };
  }
  
  // Check slug
  if (server.slug && existingSlugs.has(server.slug.toLowerCase())) {
    return { isDupe: true, reason: 'Slug already exists' };
  }
  
  // Check name (both English and legacy)
  if (server.name_en && existingNames.has(server.name_en.toLowerCase())) {
    return { isDupe: true, reason: 'Name already exists' };
  }
  
  if (server.name && existingNames.has(server.name.toLowerCase())) {
    return { isDupe: true, reason: 'Name already exists' };
  }
  
  return { isDupe: false, reason: null };
}

/**
 * Save servers to database with duplicate detection
 */
async function saveToDatabase(servers) {
  if (!CONFIG.SAVE_TO_DATABASE) {
    console.log('📄 Database saving disabled, skipping...');
    return;
  }
  
  console.log(`💾 Saving ${servers.length} servers to database...`);
  
  // Get existing products for duplicate detection
  const existingData = await getExistingProducts();
  
  let successCount = 0;
  let errorCount = 0;
  let duplicateCount = 0;
  
  for (const server of servers) {
    try {
      // Check for duplicates
      const dupeCheck = isDuplicate(server, existingData);
      if (dupeCheck.isDupe) {
        console.log(`  🔄 Skipped duplicate: ${server.name_en} (${dupeCheck.reason})`);
        duplicateCount++;
        continue;
      }
      
      const response = await rateLimitedFetch(`${CONFIG.API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(server)
      });
      
      if (response.ok) {
        const savedServer = await response.json();
        console.log(`  ✅ Saved: ${server.name_en} (ID: ${savedServer.id})`);
        successCount++;
        
        // Add to existing data to prevent duplicates within this batch
        existingData.existingUrls.add(server.github_url?.toLowerCase());
        existingData.existingSlugs.add(server.slug?.toLowerCase());
        existingData.existingNames.add(server.name_en?.toLowerCase());
        
      } else {
        const error = await response.text();
        console.log(`  ❌ Failed to save ${server.name_en}: ${error}`);
        errorCount++;
      }
      
    } catch (error) {
      console.error(`  ❌ Error saving ${server.name_en}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`✅ Database save complete:`);
  console.log(`  - Successfully added: ${successCount}`);
  console.log(`  - Duplicates skipped: ${duplicateCount}`);
  console.log(`  - Failed: ${errorCount}`);
  console.log(`  - Total processed: ${successCount + duplicateCount + errorCount}`);
}

/**
 * Save servers to JSON file
 */
async function saveToFile(servers, filename = 'scraped-mcp-servers.json') {
  if (!CONFIG.SAVE_TO_FILE) {
    console.log('📄 File saving disabled, skipping...');
    return;
  }
  
  const filePath = path.join(__dirname, filename);
  
  const data = {
    metadata: {
      scraped_at: new Date().toISOString(),
      count: servers.length,
      scraper_version: '1.0.0'
    },
    servers
  };
  
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved ${servers.length} servers to ${filePath}`);
}

/**
 * Main scraper function
 */
async function main() {
  console.log('🚀 Starting MCP Server Scraper...\n');
  
  try {
    // Step 1: Search GitHub for MCP servers
    const repos = await searchGitHubMCPServers();
    
    if (repos.length === 0) {
      console.log('❌ No MCP servers found');
      return;
    }
    
    console.log(`\n📊 Processing ${repos.length} repositories...\n`);
    
    // Step 2: Get detailed information for each repository
    const servers = [];
    
    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];
      console.log(`[${i + 1}/${repos.length}] Processing ${repo.full_name}...`);
      
      try {
        const repoDetails = await getRepoDetails(repo);
        if (!repoDetails) continue;
        
        const serverInfo = await extractServerInfo(repoDetails);
        const translations = await generatePortugueseTranslations(serverInfo);
        
        const completeServer = {
          ...serverInfo,
          ...translations
        };
        
        servers.push(completeServer);
        console.log(`  ✅ Processed: ${completeServer.name_en}`);
        
      } catch (error) {
        console.error(`  ❌ Error processing ${repo.full_name}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully processed ${servers.length} MCP servers\n`);
    
    // Step 3: Save results
    await Promise.all([
      saveToFile(servers),
      saveToDatabase(servers)
    ]);
    
    // Step 4: Summary
    console.log('\n🎉 Scraping completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  - Repositories searched: ${repos.length}`);
    console.log(`  - Servers processed: ${servers.length}`);
    console.log(`  - Success rate: ${((servers.length / repos.length) * 100).toFixed(1)}%`);
    
    // Show some examples
    if (servers.length > 0) {
      console.log('\n📋 Sample servers found:');
      servers.slice(0, 5).forEach(server => {
        console.log(`  • ${server.name_en} - ${server.description_en.substring(0, 80)}...`);
      });
    }
    
  } catch (error) {
    console.error('💥 Scraper failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${__filename}`) {
  main();
}

export { main as runScraper };