/**
 * Data Preloader for AchaAI Website
 * 
 * This script preloads MCP server and client data from JSON files into the global window object.
 * It's designed to be loaded early in the page lifecycle to ensure data is available when components need it.
 */

(function() {
  console.log("Data Preloader: Initializing data loading process");
  
  /**
   * Load JSON data from a file and cache in localStorage
   */
  async function loadData(url, storageKey, fallbackArray = []) {
    try {
      // Try to fetch from localStorage cache first
      const cachedData = localStorage.getItem(storageKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Data Preloader: Using cached data for ${storageKey} (${parsed.length} items)`);
            return parsed;
          }
        } catch (e) {
          console.error(`Data Preloader: Error parsing cached data for ${storageKey}:`, e);
          // Continue to fetch fresh data
        }
      }
      
      // Fetch fresh data
      console.log(`Data Preloader: Fetching data from ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache successful response in localStorage
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`Data Preloader: Successfully loaded and cached ${data.length} items for ${storageKey}`);
      
      return data;
    } catch (e) {
      console.error(`Data Preloader: Error loading data from ${url}:`, e);
      console.log(`Data Preloader: Using fallback data for ${storageKey}`);
      return fallbackArray;
    }
  }
  
  /**
   * Extract unique categories from data sets
   */
  function extractCategories(datasets) {
    const categories = new Set();
    
    datasets.forEach(dataset => {
      if (!Array.isArray(dataset)) return;
      
      dataset.forEach(item => {
        if (item.category) {
          categories.add(item.category);
        }
        if (Array.isArray(item.categories)) {
          item.categories.forEach(cat => categories.add(cat));
        }
      });
    });
    
    return Array.from(categories).sort();
  }
  
  /**
   * Initialize the unified search data
   */
  function initializeUnifiedSearchData() {
    try {
      // Skip if already initialized
      if (window.unifiedSearchData && Array.isArray(window.unifiedSearchData) && window.unifiedSearchData.length > 0) {
        console.log(`Data Preloader: Unified search data already initialized with ${window.unifiedSearchData.length} items`);
        return;
      }
      
      // Combine all data sources
      const dataSources = [
        window.mcpServersData || [],
        window.mcpClientsData || [],
        window.aiAgentsData || []
      ];
      
      // Calculate total items
      const totalItems = dataSources.reduce((sum, source) => sum + (Array.isArray(source) ? source.length : 0), 0);
      
      // Merge all data into one array for unified search
      window.unifiedSearchData = [].concat(...dataSources.filter(Array.isArray));
      
      // Set up global categories data
      window.globalCategories = extractCategories(dataSources);
      
      console.log(`Data Preloader: Unified search data initialized with ${window.unifiedSearchData.length} items`);
    } catch (e) {
      console.error("Data Preloader: Error initializing unified search data:", e);
      window.unifiedSearchData = [];
    }
  }
  
  /**
   * Initialize all data
   */
  async function initializeAllData() {
    try {
      // Load server data
      const serversData = await loadData(
        '/src/mcp_servers_data.json', 
        'mcp_servers_data', 
        [
          {
            "id": "server-default-01",
            "name": "Default MCP Server",
            "description": "This is a fallback MCP server entry.",
            "type": "server",
            "category": "General",
            "official": true,
            "stars_numeric": 1000,
            "tags": ["fallback", "default", "mcp"]
          }
        ]
      );
      window.mcpServersData = serversData;
      
      // Also set as direct data for compatibility with components
      window.mcpServersDirectData = [...serversData];
      
      // Load clients data
      const clientsData = await loadData(
        '/src/mcp_clients_data.json', 
        'mcp_clients_data',
        [
          {
            "id": "client-default-01",
            "name": "Default MCP Client",
            "description": "This is a fallback MCP client entry.",
            "type": "client",
            "category": "General",
            "official": true,
            "stars_numeric": 500,
            "tags": ["fallback", "default", "mcp"]
          }
        ]
      );
      window.mcpClientsData = clientsData;
      
      // Add clients to the direct data array for compatibility
      if (window.mcpServersDirectData) {
        window.mcpServersDirectData = [...window.mcpServersDirectData, ...clientsData];
      }
      
      // Load AI agents data if available
      const aiAgentsData = await loadData(
        '/src/ai_agents_data.json', 
        'ai_agents_data',
        []
      );
      window.aiAgentsData = aiAgentsData;
      
      // Add AI agents to direct data if available
      if (aiAgentsData.length > 0 && window.mcpServersDirectData) {
        window.mcpServersDirectData = [...window.mcpServersDirectData, ...aiAgentsData];
      }
      
      // Initialize unified search data
      initializeUnifiedSearchData();
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('mcp_data_loaded', {
        detail: {
          serversCount: serversData.length,
          clientsCount: clientsData.length,
          aiAgentsCount: aiAgentsData.length,
          totalCount: window.unifiedSearchData ? window.unifiedSearchData.length : 0
        }
      }));
      
      console.log("Data Preloader: All data successfully loaded");
    } catch (e) {
      console.error("Data Preloader: Error initializing data:", e);
    }
  }
  
  // Run the initialization
  initializeAllData();
  
  // Also set up a polling mechanism to refresh data periodically
  setInterval(initializeAllData, 5 * 60 * 1000); // Refresh every 5 minutes
  
  console.log("Data Preloader: Initialization complete");
})();