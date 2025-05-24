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
      console.error(`Data Preloader: NO FALLBACK - API is required`);
      throw new Error(`Failed to load ${storageKey} from API - no fallbacks available`);
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
      // Determine API base URL based on environment
      const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname === 'localhost') 
        ? 'http://localhost:3001/api' 
        : '/api';
      
      console.log(`Data Preloader: Using API base URL: ${API_BASE_URL}`);
      
      // Load all products from API instead of static files
      const response = await fetch(`${API_BASE_URL}/products?limit=200`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const apiData = await response.json();
      const allProducts = apiData.products || [];
      
      console.log(`Data Preloader: Loaded ${allProducts.length} products from API`);
      
      // Separate products by type
      const serversData = allProducts.filter(p => p.product_type === 'mcp_server');
      const clientsData = allProducts.filter(p => p.product_type === 'mcp_client');  
      const agentsData = allProducts.filter(p => p.product_type === 'ai_agent');
      
      // Set global data for backwards compatibility
      window.mcpServersData = serversData;
      window.mcpClientsData = clientsData;
      window.aiAgentsData = agentsData;
      window.mcpServersDirectData = [...serversData, ...clientsData, ...agentsData];
      
      console.log(`Data Preloader: Separated into ${serversData.length} servers, ${clientsData.length} clients, ${agentsData.length} agents`);
      
      // Initialize unified search data
      initializeUnifiedSearchData();
      
      // Cache the API data in localStorage for performance
      localStorage.setItem('api_products_cache', JSON.stringify(allProducts));
      localStorage.setItem('api_cache_timestamp', Date.now().toString());
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('mcp_data_loaded', {
        detail: {
          serversCount: serversData.length,
          clientsCount: clientsData.length,
          aiAgentsCount: agentsData.length,
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