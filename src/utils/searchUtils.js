/**
 * Utility functions for the unified search system
 */

// Ready to Use products data for search
const readyToUseProducts = [
  {
    id: 'relevance-ai',
    name: 'Relevance AI',
    description: 'Create and deploy your own AI workforce without coding',
    type: 'ready-to-use',
    category: 'AI Workforce Platform',
    tags: ['ai agents', 'automation', 'workflow', 'no-code', 'enterprise', 'business'],
    official: false,
    stars_numeric: 4500,
    local_image_path: '/assets/affiliate-images/relevance-ai/relevance-ai.png'
  },
  {
    id: 'customgpt',
    name: 'CustomGPT.ai',
    description: 'Build powerful AI chatbots that deliver exceptional customer experiences using your own business content',
    type: 'ready-to-use',
    category: 'AI Chatbot Platform',
    tags: ['chatbot', 'customer support', 'ai', 'automation', 'business', 'enterprise'],
    official: false,
    stars_numeric: 4200,
    local_image_path: '/assets/affiliate-images/customgpt/customgpt-logo-new.png'
  },
  {
    id: 'aistudios',
    name: 'AI Studios',
    description: 'Create lifelike AI avatars and videos for marketing, training, and customer engagement',
    type: 'ready-to-use',
    category: 'AI Video Platform',
    tags: ['video', 'avatar', 'marketing', 'content', 'production', 'multilingual'],
    official: false,
    stars_numeric: 3800,
    local_image_path: '/assets/affiliate-images/aistudios/aistudios-logo.png'
  },
  {
    id: 'rytr',
    name: 'Rytr',
    description: 'AI writing assistant that helps you create high-quality content in just seconds, at a fraction of the cost',
    type: 'ready-to-use',
    category: 'AI Writing Platform',
    tags: ['writing', 'content', 'marketing', 'copywriting', 'blog', 'social media'],
    official: false,
    stars_numeric: 4100,
    local_image_path: '/assets/affiliate-images/rytr/rytr-logo.png'
  }
];

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to wait between invocations
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Load and unify data from various sources
 * @returns {Promise<Array>} - Promise resolving to unified data array
 */
export const loadUnifiedData = async () => {
  try {
    console.log("=== START: loadUnifiedData called ===");
    
    // Try to use direct data if available (from App.jsx initialization)
    if (window.mcpServersDirectData && Array.isArray(window.mcpServersDirectData) && window.mcpServersDirectData.length > 0) {
      console.log(`Using direct data reference with ${window.mcpServersDirectData.length} servers`);
      
      // Generate servers with type property
      let servers = window.mcpServersDirectData.map(server => ({
        ...server,
        type: server.type || 'server' // Preserve type if it exists
      }));
      
      console.log(`Processed ${servers.length} servers from direct data reference`);
      console.log("Sample server data:", servers.slice(0, 1));
      
      // Continue with category generation and client addition
      let combined = await processServersAndCreateUnifiedData(servers);
      return combined;
    }
    
    // Try to get data from localStorage first
    const localData = localStorage.getItem('mcp_unified_data');
    if (localData) {
      const parsedData = JSON.parse(localData);
      console.log(`Found existing unified data in localStorage with ${parsedData.length} items`);
      return parsedData;
    }
    
    // Load servers from MCP servers data
    const mcpDataFromStorage = localStorage.getItem('mcp_servers_data');
    let servers = [];
    
    if (mcpDataFromStorage) {
      console.log("Found MCP servers data in localStorage");
      try {
        const parsedServers = JSON.parse(mcpDataFromStorage);
        console.log(`Parsed ${parsedServers.length} servers from localStorage`);
        
        // Check if we have data and it looks valid
        if (Array.isArray(parsedServers) && parsedServers.length > 0) {
          servers = parsedServers.map(server => ({
            ...server,
            type: 'server'
          }));
          
          console.log(`Processed ${servers.length} servers from localStorage`);
          console.log("Sample server data:", servers.slice(0, 1));
        } else {
          console.warn("Invalid or empty MCP server data in localStorage");
        }
      } catch (parseError) {
        console.error("Failed to parse MCP server data from localStorage:", parseError);
      }
    }
    
    // If we don't have servers yet, try loading from files
    if (servers.length === 0) {
      console.log("No servers in localStorage, trying to load from files");
      
      // Try loading from full data file
      try {
        console.log("Attempting to load mcp_servers_data.json");
        const serverModule = await import('../mcp_servers_data.json');
        
        if (serverModule.default && Array.isArray(serverModule.default) && serverModule.default.length > 0) {
          console.log(`Loaded ${serverModule.default.length} servers from data file`);
          
          servers = serverModule.default.map(server => ({
            ...server,
            type: 'server'
          }));
          
          // Save this data to localStorage for future use
          localStorage.setItem('mcp_servers_data', JSON.stringify(serverModule.default));
          console.log("Saved full data to localStorage");
        } else {
          console.warn("Full data file is empty or invalid");
        }
      } catch (error) {
        console.error("Could not load MCP server data from full file:", error);
        
        // Try alternative data file
        try {
          console.log("Attempting to load mcp_servers_data.json again as fallback");
          const alternativeModule = await import('../mcp_servers_data.json');
          
          if (alternativeModule.default && Array.isArray(alternativeModule.default) && alternativeModule.default.length > 0) {
            console.log(`Loaded ${alternativeModule.default.length} servers from fallback data file`);
            
            servers = alternativeModule.default.map(server => ({
              ...server,
              type: 'server'
            }));
            
            localStorage.setItem('mcp_servers_data', JSON.stringify(alternativeModule.default));
            console.log("Saved fallback data to localStorage");
          } else {
            console.warn("Fallback data file is empty or invalid");
          }
        } catch (altError) {
          console.error("Could not load any MCP server data:", altError);
        }
      }
    }
    
    // Check if we have any servers at this point
    if (servers.length === 0) {
      console.error("Failed to load any server data from any source");
      
      // Create an emergency dummy server as a last resort
      servers = [
        {
          id: 'emergency-server',
          name: 'Emergency Server',
          description: 'This is a dummy server created because no server data could be loaded',
          type: 'server',
          category: 'Emergency'
        }
      ];
      console.log("Created emergency server because no data was found");
    }
    
    // Process the servers and create unified data
    const combined = await processServersAndCreateUnifiedData(servers);
    return combined;
  } catch (err) {
    console.error("Critical error in loadUnifiedData:", err);
    return []; // Return empty array in case of error
  }
};

/**
 * Helper function to process servers and create unified data
 * @param {Array} servers - Array of server data
 * @returns {Array} - Unified data array
 */
async function processServersAndCreateUnifiedData(servers) {
  // Generate categories from server data with improved slug handling
  const categoryMap = new Map();
  servers.forEach(server => {
    const category = server.category || 'Uncategorized';
    // Create slug more consistently - handle special characters uniformly
    const slug = category.toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/&/g, 'and')     // Replace & with and
      .replace(/[^\w-]/g, '-')  // Replace other special chars with hyphens
      .replace(/-+/g, '-')      // Collapse multiple hyphens
      .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
    
    // Create mapping between original form and slug for better search matching
    if (categoryMap.has(slug)) {
      categoryMap.set(slug, {
        ...categoryMap.get(slug),
        count: categoryMap.get(slug).count + 1,
        // Store original category forms for better matching
        originalForms: [...new Set([...categoryMap.get(slug).originalForms, category])]
      });
    } else {
      categoryMap.set(slug, {
        id: slug,
        name: category,
        slug: slug,
        count: 1,
        type: 'category',
        description: `Collection of ${category} MCP servers and clients`,
        originalForms: [category]
      });
    }
  });
  
  console.log(`Generated ${categoryMap.size} categories from server data`);
  
  // Load real client data from our MCP clients data file
  let realClients = [];
  try {
    console.log("Loading real MCP clients data from file");
    const clientsModule = await import('../mcp_clients_data.json');
    
    if (clientsModule.default && Array.isArray(clientsModule.default)) {
      // Add unique IDs to clients if they don't have them (handles empty array safely)
      realClients = clientsModule.default.map((client, index) => ({
        ...client,
        id: client.id || `client-${index + 1}`,
        // Ensure type is set to 'client'
        type: 'client'
      }));
      
      console.log(`Loaded ${realClients.length} real MCP clients from file`);
    } else {
      console.warn("Client data file is empty or invalid, using fallback data");
      realClients = []; // Use empty array instead of throwing error
    }
  } catch (error) {
    console.error("Error loading client data:", error);
    
    // Fallback to mock clients data if loading fails
    realClients = [
      {
        id: 'client-01',
        name: 'MCP CLI Client',
        description: 'Command line interface for interacting with MCP servers',
        type: 'client',
        category: 'CLI Tools',
        official: true,
        stars: 1240,
        stars_numeric: 1240,
        tags: ['cli', 'terminal', 'command-line']
      },
      {
        id: 'client-02',
        name: 'Claude Desktop',
        description: 'Official desktop application for Claude with MCP integration',
        type: 'client',
        category: 'Desktop Applications',
        official: true,
        stars: 8750,
        stars_numeric: 8750,
        tags: ['desktop', 'anthropic', 'claude', 'mcp-client']
      },
      {
        id: 'client-03',
        name: 'Cursor',
        description: 'AI-first code editor with built-in MCP support',
        type: 'client',
        category: 'Code Editors',
        official: false,
        stars: 19850,
        stars_numeric: 19850,
        tags: ['code-editor', 'development', 'ai']
      }
    ];
    console.log("Using fallback mock clients data");
  }
  
  console.log(`Added ${realClients.length} MCP clients`);
  
  // Create a set of client names to avoid duplicates and cross-contamination
  const clientNames = new Set();
  
  // Filter out duplicate clients by name
  const uniqueClients = realClients.filter(client => {
    if (!client.name) return true; // Keep clients without names
    
    const normalizedName = client.name.toLowerCase();
    if (clientNames.has(normalizedName)) {
      console.log(`Filtering out duplicate client: ${client.name}`);
      return false;
    }
    
    clientNames.add(normalizedName);
    return true;
  });
  
  console.log(`Filtered out ${realClients.length - uniqueClients.length} duplicate clients`);
  
  // Check for clients in server data
  const knownClientNames = [
    'claude desktop', 'vscode mcp extension', 'cursor', 'librechat', 'zed', 
    'eechat', '5ire', 'cherry studio', 'anthropic mcp client sdk',
    'claude mcp cli', 'mcp browser extension', 'continue', 'deepchat',
    'mcp cli client', 'chainlit', 'carrotai', 'aiaw', 'mindpal',
    'whatsmcp', 'chatmcp', 'hyperchat', 'seekchat'
  ];
  
  // Filter servers to make sure we don't have any clients mislabeled as servers
  const cleanedServers = servers.filter(server => {
    if (!server.name) return true;
    
    const normalizedName = server.name.toLowerCase();
    
    // Enhanced check for client names
    // First check for exact matches
    if (knownClientNames.includes(normalizedName)) {
      console.log(`FIXING TYPE (exact match): Found client incorrectly labeled as server: ${server.name}`);
      
      // Add it to the set of client names to avoid adding it again from realClients
      clientNames.add(normalizedName);
      
      // Update its type to client and add to uniqueClients
      uniqueClients.push({
        ...server,
        type: 'client' // Fix the type
      });
      
      return false; // Remove from servers list
    }
    
    // Then check for partial matches
    const isActuallyClient = knownClientNames.some(clientName => 
      normalizedName.includes(clientName) || 
      clientName.includes(normalizedName)
    );
    
    if (isActuallyClient) {
      console.log(`FIXING TYPE (partial match): Found client incorrectly labeled as server: ${server.name}`);
      
      // Add it to the set of client names to avoid adding it again from realClients
      clientNames.add(normalizedName);
      
      // Update its type to client and add to uniqueClients
      uniqueClients.push({
        ...server,
        type: 'client' // Fix the type
      });
      
      return false; // Remove from servers list
    }
    
    return true; // Keep in servers list
  });
  
  console.log(`Removed ${servers.length - cleanedServers.length} clients mislabeled as servers`);
  
  // Add Ready to Use products to the data
  const readyToUseItems = readyToUseProducts.map(product => ({
    ...product,
    type: 'ready-to-use' // Ensure the type is set correctly
  }));
  
  // Combine all data
  const combined = [
    ...cleanedServers,
    ...uniqueClients,
    ...readyToUseItems,
    ...Array.from(categoryMap.values())
  ];
  
  // Save to localStorage for faster loading next time
  localStorage.setItem('mcp_unified_data', JSON.stringify(combined));
  console.log(`Saved combined data (${combined.length} items) to localStorage`);
  
  // Log stats for debugging
  const stats = getDataStats(combined);
  console.log('Unified data stats:', stats);
  console.log(`Total: ${stats.total} items - Servers: ${stats.byType.server || 0}, Clients: ${stats.byType.client || 0}, Ready to Use: ${stats.byType['ready-to-use'] || 0}, Categories: ${stats.byType.category || 0}`);
  
  console.log("=== END: loadUnifiedData complete ===");
  return combined;
}

/**
 * Search through data based on query and filters
 * @param {Array} data - The data to search through
 * @param {string} query - The search query
 * @param {Object} filters - Filters to apply to the search
 * @returns {Array} - Filtered and sorted results
 */
export const searchData = (data, query, filters = {}) => {
  if (!data || !Array.isArray(data)) return [];
  
  const {
    type = 'all',
    categories = [],
    minRating = 0,
    official = false
  } = filters;
  
  // Map view type to data type
  const typeMapping = {
    'all': ['server', 'client', 'ai-agent', 'category', 'ready-to-use'],
    'server': ['server'],
    'servers': ['server'],
    'client': ['client'],
    'clients': ['client'],
    'ai-agent': ['ai-agent'],
    'ai-agents': ['ai-agent'],
    'ready-to-use': ['ready-to-use'],
    'category': ['category'],
    'categories': ['category']
  };
  
  // Log the requested type for debugging
  console.log(`SEARCH DEBUG - Requested type: "${type}", maps to:`, typeMapping[type] || typeMapping.all);
  
  // Comprehensive list of known client names for correct classification
  const knownClientNames = [
    'claude desktop', 'vscode mcp extension', 'cursor', 'librechat', 'zed', 
    'eechat', '5ire', 'cherry studio', 'anthropic mcp client sdk',
    'claude mcp cli', 'mcp browser extension', 'continue', 'deepchat',
    'mcp cli client', 'chainlit', 'carrotai', 'aiaw', 'mindpal',
    'whatsmcp', 'chatmcp', 'hyperchat', 'seekchat', 'vscode', 
    'extension', 'client', 'desktop app', 'ide', 'editor', 'cli tool'
  ];
  
  // First pass: ensure all types are correct (this fixes client/server misclassification)
  for (const item of data) {
    if (item.name && typeof item.name === 'string') {
      const normalizedName = item.name.toLowerCase();
      
      // Check if this is a known client by name
      const isKnownClient = knownClientNames.some(clientName => 
        normalizedName.includes(clientName) || 
        clientName.includes(normalizedName)
      );
      
      // If this is a known client but not typed as client, update its type
      if (isKnownClient && item.type !== 'client') {
        console.log(`searchData: Fixing type for ${item.name} from ${item.type} to client`);
        item.type = 'client'; // Fix the type
      }
    }
  }
  
  // For client code compatibility, we support both singular and plural versions
  const allowedTypes = typeMapping[type] || typeMapping.all;
  
  // DEBUG: Log the search categories
  console.log(`SEARCH DEBUG - Search params:`, 
    {type, categories, minRating, official, allowedTypes});
  console.log(`SEARCH DEBUG - Data stats before filtering:`, getDataStats(data));
  
  // DEBUG: Log all available categories in the data for diagnosis
  if (categories.length > 0) {
    console.log("SEARCH DEBUG - Searching for categories:", categories);
    
    // Print a list of all available categories in the data
    const allCategories = new Set();
    data.forEach(item => {
      if (item.category) {
        allCategories.add(item.category);
      }
    });
    
    console.log("SEARCH DEBUG - All available categories in data:", 
      Array.from(allCategories).sort());
    
    // Search for items with categories close to what we're looking for
    console.log("SEARCH DEBUG - Items with similar categories:");
    data.filter(item => item.type === 'server').forEach(item => {
      if (item.category) {
        const catLower = item.category.toLowerCase();
        if (catLower.includes('database') || 
            catLower.includes('storage') || 
            catLower.includes('data')) {
          console.log(`- "${item.category}": ${item.name}`);
        }
      }
    });
  }
  
  // Filter the data - use a single pass for performance
  // EMERGENCY FIX: Direct mapping from subcategory slugs to possible category values in the data
  // This handles the case where our category slugs don't match what's in the data
  const categoryMappings = {
    // Server categories
    'databases-and-storage': ['database', 'storage', 'data', 'sql', 'nosql'],
    'web-and-search': ['web', 'search', 'browser', 'http', 'api'],
    'cloud-services': ['cloud', 'aws', 'azure', 'gcp', 'service'],
    'version-control': ['git', 'version', 'control', 'repository'],
    'utilities-and-files': ['utility', 'file', 'system', 'tools'],
    'communication': ['chat', 'message', 'communication', 'slack'],
    'analytics': ['analytics', 'metric', 'logging', 'monitor'],
    'security-and-auth': ['security', 'auth', 'authentication', 'authorization'],
    
    // Client categories
    'desktop-applications': ['desktop', 'application', 'electron', 'gui', 'app'],
    'web-applications': ['web', 'browser', 'online', 'website'],
    'code-editors': ['editor', 'ide', 'coding', 'programming', 'development'],
    'cli-tools': ['cli', 'terminal', 'command', 'shell', 'console'],
    'libraries': ['library', 'sdk', 'framework', 'api', 'development'],
    'ide-extensions': ['extension', 'plugin', 'addon', 'ide', 'vs-code'],
    'browser-extensions': ['browser', 'extension', 'addon', 'chrome', 'firefox'],
    'messaging-integrations': ['messaging', 'chat', 'whatsapp', 'telegram', 'slack'],
    'ai-workflow-tools': ['workflow', 'automation', 'no-code', 'orchestration', 'agents']
  };
  
  // DEBUG: If we're searching for a specific category, log what we map it to
  if (categories.length > 0) {
    categories.forEach(cat => {
      if (categoryMappings[cat]) {
        console.log(`EMERGENCY MAPPING: "${cat}" maps to keywords:`, categoryMappings[cat]);
      }
    });
  }

  const filteredResults = data.filter(item => {
    // Filter by type
    if (!allowedTypes.includes(item.type)) {
      return false;
    }
    
    // Filter by official status
    if (official && item.type !== 'category' && !item.official) {
      return false;
    }
    
    // Filter by minimum rating
    if (minRating > 0 && item.type !== 'category' && (item.stars_numeric || item.stars || 0) < minRating) {
      return false;
    }
    
    // EMERGENCY CATEGORY MATCHING: If we're searching for a mapped category, do direct keyword matching
    if (categories.length > 0 && item.type === 'server') {
      let foundEmergencyMatch = false;
      
      for (const cat of categories) {
        if (categoryMappings[cat]) {
          // For these special categories, match if ANY of the keywords are in the item name, description, or category
          const itemName = (item.name || '').toLowerCase();
          const itemDesc = (item.description || '').toLowerCase();
          const itemCat = (item.category || '').toLowerCase();
          
          // If ANY of the mapped keywords match, include this item
          const matchesKeyword = categoryMappings[cat].some(keyword => 
            itemName.includes(keyword) || 
            itemDesc.includes(keyword) || 
            itemCat.includes(keyword)
          );
          
          if (matchesKeyword) {
            // Log this match for debugging
            console.log(`EMERGENCY MATCH: "${item.name}" matches category "${cat}" via keyword matching`);
            foundEmergencyMatch = true;
            break;
          }
        }
      }
      
      // If we found an emergency match, include this item and skip normal category matching
      if (foundEmergencyMatch) {
        return true;
      }
    }
    
    // Filter by categories - more flexible matching
    if (categories.length > 0 && item.type !== 'category') {
      // Get the category from the item, normalize it
      const itemCategory = item.category ? item.category.toLowerCase() : '';
      const originalItemCategory = item.category || '';
      
      // Get additional categories from the item's categories array if it exists
      const itemCategories = item.categories && Array.isArray(item.categories) 
        ? item.categories.map(cat => cat.toLowerCase()) 
        : [];
      
      // DRASTIC DEBUG: Log everything about this item if its name contains database
      if (item.name && item.name.toLowerCase().includes('database')) {
        console.log("POTENTIAL DATABASE ITEM:", {
          name: item.name,
          type: item.type,
          category: item.category,
          itemCategory,
          searchCategories: categories
        });
      }
      
      // Check if any of the search categories match (with more flexible matching)
      const matchesCategory = categories.some(cat => {
        // Try multiple normalization approaches for the search category
        const searchCatOriginal = cat;
        const searchCatSpaces = cat.replace(/-/g, ' ').toLowerCase();
        const searchCatAmpersand = cat.replace(/-/g, ' ').replace(/\sand\s/g, ' & ').toLowerCase();
        const searchCatAnd = cat.replace(/-/g, ' ').replace(/\s&\s/g, ' and ').toLowerCase();
        
        // Multiple normalization approaches for the item category
        const normalizedItemCategoryWithAnd = itemCategory.replace(/\s&\s/g, ' and ').toLowerCase();
        const normalizedItemCategoryWithAmp = itemCategory.replace(/\sand\s/g, ' & ').toLowerCase();
        
        // Radical normalized versions that remove all special chars
        const radicalSearchCat = searchCatSpaces.replace(/[^a-z0-9]/g, '');
        const radicalItemCat = itemCategory.replace(/[^a-z0-9]/g, '');
        
        // Log detailed comparison for debugging
        if (itemCategory.includes('database') || searchCatSpaces.includes('database')) {
          console.log("DETAILED CATEGORY COMPARISON:", {
            itemName: item.name,
            originalCategory: originalItemCategory,
            searchCategory: cat,
            // Various normalized forms
            searchCatSpaces,
            searchCatAmpersand,
            searchCatAnd,
            normalizedItemCategoryWithAnd,
            normalizedItemCategoryWithAmp,
            // Radical normalization
            radicalSearchCat, 
            radicalItemCat
          });
        }
        
        // Check for exact match first
        if (itemCategory === searchCatSpaces || 
            itemCategory === searchCatAmpersand || 
            itemCategory === searchCatAnd) {
          return true;
        }
        
        // Check for containment in either direction
        if (normalizedItemCategoryWithAnd.includes(searchCatSpaces) || 
            searchCatSpaces.includes(normalizedItemCategoryWithAnd) ||
            normalizedItemCategoryWithAmp.includes(searchCatSpaces) ||
            searchCatSpaces.includes(normalizedItemCategoryWithAmp)) {
          return true;
        }
        
        // Check for radical match (all special chars removed)
        if (radicalSearchCat === radicalItemCat) {
          return true;
        }
        
        // Check against array of categories if available
        if (itemCategories.includes(searchCatSpaces) ||
            itemCategories.some(ic => ic.includes(searchCatSpaces) || searchCatSpaces.includes(ic))) {
          return true;
        }
        
        // Direct string comparison (case insensitive) as last resort
        if (originalItemCategory.toLowerCase() === cat.toLowerCase()) {
          return true;
        }
        
        return false;
      });
      
      // Log outcome of category matching
      if (itemCategory.includes('database') || categories.some(c => c.includes('database'))) {
        console.log(`Category match result for ${item.name}: ${matchesCategory}`);
      }
      
      if (!matchesCategory) {
        return false;
      }
    }
    
    // Filter by categories for category items - more flexible matching for category items
    if (categories.length > 0 && item.type === 'category') {
      return categories.some(cat => {
        // Normalize the slug format for comparison
        const normalizedSlug = cat.toLowerCase()
          .replace(/\s+/g, '-')     // Replace spaces with hyphens
          .replace(/&/g, 'and')     // Replace & with and
          .replace(/[^\w-]/g, '-')  // Replace other special chars with hyphens
          .replace(/-+/g, '-')      // Collapse multiple hyphens
          .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
          
        // Check both direct slug match and original forms if available  
        return item.slug === normalizedSlug ||
               item.slug === cat ||
               (item.originalForms && item.originalForms.some(form => 
                 form.toLowerCase() === cat.replace(/-/g, ' ').toLowerCase()
               ));
      });
    }
    
    // If search query provided, filter by it
    if (query && query.trim() !== '') {
      const lowerQuery = query.toLowerCase();
      return (
        (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
        (item.description && item.description.toLowerCase().includes(lowerQuery)) ||
        (item.category && item.category.toLowerCase().includes(lowerQuery)) ||
        (item.tags && Array.isArray(item.tags) && 
         item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) ||
        (item.keywords && Array.isArray(item.keywords) && 
         item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)))
      );
    }
    
    // Include all items if no query
    return true;
  });
  
  // Debug the filtered results
  console.log(`Filtered results stats:`, getDataStats(filteredResults));
  
  return filteredResults;
};

/**
 * Sort search results in the standard order
 * @param {Array} results - The search results to sort
 * @param {string} sortOption - How to sort the results (name, popularity, etc.)
 * @returns {Array} - Sorted results
 */
export const sortSearchResults = (results, sortOption = 'relevance') => {
  const sortedResults = [...results];
  
  switch (sortOption) {
    case 'name':
      // Sort alphabetically by name
      return sortedResults.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
    case 'popularity':
      // Sort by stars/popularity (within each type)
      return sortedResults.sort((a, b) => {
        // If types are different, sort by type first
        if (a.type !== b.type) {
          const typeOrder = { category: 1, server: 2, client: 3 };
          return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
        }
        
        // Sort by stars within same type
        return (b.stars_numeric || b.stars || 0) - (a.stars_numeric || a.stars || 0);
      });
      
    case 'newest':
      // Sort by creation date (if available)
      return sortedResults.sort((a, b) => {
        // If types are different, sort by type first
        if (a.type !== b.type) {
          const typeOrder = { category: 1, server: 2, client: 3 };
          return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
        }
        
        // Sort by creation date or added date
        return (b.createdAt || b.addedAt || 0) - (a.createdAt || a.addedAt || 0);
      });
      
    case 'relevance':
    default:
      // Default sorting: categories first, then servers, then clients
      return sortedResults.sort((a, b) => {
        // Sort by type first
        const typeOrder = { category: 1, server: 2, client: 3 };
        const typeA = typeOrder[a.type] || 99;
        const typeB = typeOrder[b.type] || 99;
        
        if (typeA !== typeB) {
          return typeA - typeB;
        }
        
        // Then sort by popularity (stars) for servers and clients
        if (a.type !== 'category' && b.type !== 'category') {
          return (b.stars_numeric || b.stars || 0) - (a.stars_numeric || a.stars || 0);
        }
        
        // For categories, sort by count
        if (a.type === 'category' && b.type === 'category') {
          return (b.count || 0) - (a.count || 0);
        }
        
        // Fallback to name sort
        return (a.name || '').localeCompare(b.name || '');
      });
  }
};

/**
 * Find a client by ID or name directly from all available sources
 * @param {string} query - The client ID or name to search for
 * @returns {Object|null} - The client object or null if not found
 */
export const findClientDirectly = (query) => {
  if (!query) return null;
  
  console.log(`findClientDirectly: Looking for client "${query}"`);
  
  try {
    // First check sessionStorage for recent test clients
    const sessionData = sessionStorage.getItem('current_client_data');
    if (sessionData) {
      const sessionClient = JSON.parse(sessionData);
      console.log(`Found client in sessionStorage: ${sessionClient.name}`);
      
      // Spread the client to ensure all properties are copied
      return { ...sessionClient, type: 'client' };
    }
  } catch (e) {
    console.error('Error checking sessionStorage:', e);
  }
  
  // Check localStorage for client data
  const storageKeys = [
    'mcp_clients_data',
    'mcp_clients_data_updated'
  ];
  
  for (const key of storageKeys) {
    try {
      const data = localStorage.getItem(key);
      if (!data) continue;
      
      const clients = JSON.parse(data);
      if (!Array.isArray(clients) || clients.length === 0) continue;
      
      console.log(`Checking ${clients.length} clients in ${key}`);
      
      // Normalize the query for different matching strategies
      const normalizedQuery = query.toLowerCase().replace(/^client-/, '');
      const prefixedQuery = `client-${normalizedQuery}`;
      const spaceQuery = normalizedQuery.replace(/-/g, ' ');
      
      // First try exact ID match
      let client = clients.find(c => 
        c.id === query || 
        c.id === normalizedQuery || 
        c.id === prefixedQuery
      );
      
      if (client) {
        console.log(`Found client by ID: ${client.name}`);
        return { ...client, type: 'client' };
      }
      
      // Try name-based matching
      client = clients.find(c => 
        c.name && c.name.toLowerCase() === spaceQuery.toLowerCase()
      );
      
      if (client) {
        console.log(`Found client by name: ${client.name}`);
        return { ...client, type: 'client' };
      }
      
      // Try partial name matching
      client = clients.find(c => 
        c.name && c.name.toLowerCase().includes(spaceQuery.toLowerCase())
      );
      
      if (client) {
        console.log(`Found client by partial name: ${client.name}`);
        return { ...client, type: 'client' };
      }
      
      // Try matching by words in the name
      const words = spaceQuery.split(' ').filter(w => w.length > 2);
      if (words.length > 0) {
        for (const word of words) {
          client = clients.find(c => 
            c.name && c.name.toLowerCase().includes(word.toLowerCase())
          );
          
          if (client) {
            console.log(`Found client by word "${word}": ${client.name}`);
            return { ...client, type: 'client' };
          }
        }
      }
    } catch (e) {
      console.error(`Error checking ${key}:`, e);
    }
  }
  
  // Check global data reference
  if (window.mcpServersDirectData && Array.isArray(window.mcpServersDirectData)) {
    console.log(`Checking ${window.mcpServersDirectData.length} items in global data`);
    
    // Filter to just clients
    const globalClients = window.mcpServersDirectData.filter(item => item.type === 'client');
    console.log(`Found ${globalClients.length} clients in global data`);
    
    // Apply the same matching logic
    const normalizedQuery = query.toLowerCase().replace(/^client-/, '');
    const prefixedQuery = `client-${normalizedQuery}`;
    const spaceQuery = normalizedQuery.replace(/-/g, ' ');
    
    // First try exact ID match
    let client = globalClients.find(c => 
      c.id === query || 
      c.id === normalizedQuery || 
      c.id === prefixedQuery
    );
    
    if (client) {
      console.log(`Found client by ID in global data: ${client.name}`);
      return { ...client, type: 'client' };
    }
    
    // Try name-based matching
    client = globalClients.find(c => 
      c.name && c.name.toLowerCase() === spaceQuery.toLowerCase()
    );
    
    if (client) {
      console.log(`Found client by name in global data: ${client.name}`);
      return { ...client, type: 'client' };
    }
    
    // Try partial name matching
    client = globalClients.find(c => 
      c.name && c.name.toLowerCase().includes(spaceQuery.toLowerCase())
    );
    
    if (client) {
      console.log(`Found client by partial name in global data: ${client.name}`);
      return { ...client, type: 'client' };
    }
  }
  
  // No client found
  console.log(`No client found for "${query}"`);
  return null;
};

/**
 * Generate search suggestions based on a query
 * @param {string} query - The search query 
 * @param {Array} data - The data to generate suggestions from
 * @returns {Array} - Array of search suggestions
 */
export const generateSearchSuggestions = (query, data) => {
  if (!query || !query.trim() || !data || !Array.isArray(data)) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase();
  
  // Extract terms from data to build suggestions
  const terms = new Set();
  
  // Add all names, categories, and tags to the terms set
  data.forEach(item => {
    if (item.name) {
      terms.add(item.name);
    }
    
    if (item.category) {
      terms.add(item.category);
    }
    
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => terms.add(tag));
    }
    
    if (item.keywords && Array.isArray(item.keywords)) {
      item.keywords.forEach(keyword => terms.add(keyword));
    }
  });
  
  // Filter terms by the query and convert to array of suggestions
  return Array.from(terms)
    .filter(term => term.toLowerCase().includes(lowerQuery))
    .sort((a, b) => {
      // Prioritize terms that start with the query
      const aStartsWith = a.toLowerCase().startsWith(lowerQuery);
      const bStartsWith = b.toLowerCase().startsWith(lowerQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Then sort by length (shorter terms first)
      return a.length - b.length;
    })
    .slice(0, 10); // Limit to 10 suggestions
};

/**
 * Extract relevant search terms from the search query
 * @param {string} query - The search query
 * @returns {Array} - An array of relevant search terms
 */
export const extractSearchTerms = (query) => {
  if (!query || !query.trim()) {
    return [];
  }
  
  // Split query into words
  const words = query.toLowerCase().split(/\s+/);
  
  // Remove common words and duplicates
  const commonWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'about', 'mcp', 'server', 'client', 'search', 'find', 'how', 'what', 'when', 'where', 'who'
  ];
  
  return [...new Set(words)]
    .filter(word => word.length > 2 && !commonWords.includes(word));
};

/**
 * Helper function to get statistics about the unified data
 * @param {Array} data - The unified data array
 * @returns {Object} - Statistics about the data
 */
export const getDataStats = (data) => {
  if (!data || !Array.isArray(data)) {
    return { total: 0, byType: {}, byCategory: {} };
  }
  
  const stats = {
    total: data.length,
    byType: {},
    byCategory: {}
  };
  
  // Count items by type and category
  data.forEach(item => {
    const type = item.type || 'unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    
    const category = item.category || 'unknown';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
  });
  
  return stats;
};