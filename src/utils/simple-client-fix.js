/**
 * Simple Client Fix - A clean solution for client navigation issues
 * 
 * This lightweight utility ensures clients added through the admin panel
 * are properly accessible on their detail pages.
 */

// Client cache for quick access
const clientCache = {};

/**
 * Normalize a client ID for consistent lookup
 * @param {string} id - The client ID to normalize
 * @param {boolean} withPrefix - Whether to include the "client-" prefix
 * @returns {string} - Normalized client ID
 */
function normalizeClientId(id, withPrefix = false) {
  if (!id) return '';
  
  // Remove any existing client- prefix first
  let normalizedId = id;
  if (normalizedId.startsWith('client-')) {
    normalizedId = normalizedId.substring('client-'.length);
  }
  
  // Clean up the ID to ensure consistent format
  normalizedId = normalizedId.toLowerCase().trim()
    .replace(/[^\w-]/g, '-')  // Replace non-word characters with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
  
  // Return with or without prefix as requested
  return withPrefix ? `client-${normalizedId}` : normalizedId;
}

/**
 * Extract client ID from URL
 * @returns {string|null} - Client ID or null if not on a client page
 */
function getClientIdFromUrl() {
  const hash = window.location.hash;
  
  // Check for client product detail URL
  if (hash.startsWith('#/products/client-')) {
    const rawId = hash.substring('#/products/client-'.length);
    return normalizeClientId(rawId);
  }
  
  return null;
}

/**
 * Get all clients from localStorage
 * @returns {Array} - Array of client objects
 */
function getAllClients() {
  const keys = [
    'mcp_clients_data',
    'mcp_clients_data_updated'
  ];
  
  let allClients = [];
  const processedIds = new Set();
  
  // Check all storage keys
  for (const key of keys) {
    try {
      const data = localStorage.getItem(key);
      if (!data) continue;
      
      const parsedData = JSON.parse(data);
      if (!Array.isArray(parsedData)) continue;
      
      // Add unique clients with normalized IDs
      for (const client of parsedData) {
        if (!client || !client.id) continue;
        
        const normalizedId = normalizeClientId(client.id);
        if (!processedIds.has(normalizedId)) {
          processedIds.add(normalizedId);
          
          // Create a standardized client entry
          allClients.push({
            ...client,
            type: 'client',
            id: normalizeClientId(client.id, true)
          });
        }
      }
    } catch (error) {
      console.error(`Simple Fix: Error loading client data from ${key}`, error);
    }
  }
  
  console.log(`Simple Fix: Found ${allClients.length} clients`);
  return allClients;
}

/**
 * Find a client by ID using multiple strategies
 * @param {string} clientId - Client ID to find
 * @returns {Object|null} - Client object or null if not found
 */
function findClientById(clientId) {
  if (!clientId) return null;
  
  // Check cache first
  const normalizedId = normalizeClientId(clientId);
  if (clientCache[normalizedId]) {
    return clientCache[normalizedId];
  }
  
  // Get all clients
  const allClients = getAllClients();
  
  // Strategy 1: Exact ID match
  let client = allClients.find(c => normalizeClientId(c.id) === normalizedId);
  if (client) {
    clientCache[normalizedId] = client;
    return client;
  }
  
  // Strategy 2: Name-based match
  const idAsName = normalizedId.replace(/-/g, ' ');
  client = allClients.find(c => 
    c.name && c.name.toLowerCase() === idAsName
  );
  if (client) {
    clientCache[normalizedId] = client;
    return client;
  }
  
  // Strategy 3: Partial ID match
  client = allClients.find(c => 
    normalizeClientId(c.id).includes(normalizedId) || 
    (normalizedId.length > 3 && normalizeClientId(c.id).startsWith(normalizedId))
  );
  if (client) {
    clientCache[normalizedId] = client;
    return client;
  }
  
  // No client found
  return null;
}

/**
 * Create a fallback client when none is found
 * @param {string} clientId - Client ID
 * @returns {Object} - Fallback client object
 */
function createFallbackClient(clientId) {
  const normalizedId = normalizeClientId(clientId, true);
  const nameFromId = normalizeClientId(clientId)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Create a simple fallback client
  const fallbackClient = {
    id: normalizedId,
    name: nameFromId,
    description: "This client was added through the admin panel.",
    type: "client",
    category: "MCP Clients",
    local_image_path: "/assets/client-images/desktop-application.png",
    platforms: ["Windows", "MacOS", "Linux"],
    stars_numeric: 100,
    official: false
  };
  
  // Cache it for future use
  clientCache[normalizeClientId(clientId)] = fallbackClient;
  
  return fallbackClient;
}

/**
 * Add a client to storage and cache
 * @param {Object} client - Client object to add
 */
function addClient(client) {
  if (!client || !client.id) return;
  
  // Standardize client object
  const normalizedId = normalizeClientId(client.id);
  const standardizedClient = {
    ...client,
    id: normalizeClientId(normalizedId, true),
    type: 'client'
  };
  
  // Add to cache
  clientCache[normalizedId] = standardizedClient;
  
  // Add to storage for persistence
  for (const key of ['mcp_clients_data', 'mcp_clients_data_updated']) {
    try {
      const existing = localStorage.getItem(key);
      const clients = existing ? JSON.parse(existing) : [];
      
      // Check if client already exists
      const existingIndex = clients.findIndex(c => 
        normalizeClientId(c.id) === normalizedId
      );
      
      if (existingIndex >= 0) {
        // Update existing
        clients[existingIndex] = standardizedClient;
      } else {
        // Add new
        clients.push(standardizedClient);
      }
      
      // Save back to storage
      localStorage.setItem(key, JSON.stringify(clients));
    } catch (error) {
      console.error(`Simple Fix: Error updating ${key}`, error);
    }
  }
  
  // Add to global data stores
  if (window.mcpServersDirectData) {
    // Remove any existing version
    window.mcpServersDirectData = window.mcpServersDirectData.filter(item => 
      !(item.type === 'client' && normalizeClientId(item.id) === normalizedId)
    );
    
    // Add new version
    window.mcpServersDirectData.push(standardizedClient);
  }
  
  console.log(`Simple Fix: Added client '${standardizedClient.name}' to storage and cache`);
}

/**
 * Handle client detail page navigation
 * Makes sure the current client is found and available
 */
function handleClientDetail() {
  const clientId = getClientIdFromUrl();
  if (!clientId) return;
  
  console.log(`Simple Fix: Handling client detail for ID: ${clientId}`);
  
  // Look for client
  let client = findClientById(clientId);
  
  // Create fallback if not found
  if (!client) {
    console.log(`Simple Fix: Client not found, creating fallback`);
    client = createFallbackClient(clientId);
  }
  
  // Ensure client is in global data
  if (window.mcpServersDirectData) {
    // Check if client already exists
    const exists = window.mcpServersDirectData.some(item => 
      item.type === 'client' && normalizeClientId(item.id) === normalizeClientId(clientId)
    );
    
    if (!exists) {
      console.log(`Simple Fix: Adding client to global data`);
      window.mcpServersDirectData.push(client);
    }
  }
  
  // Update currentProduct if it exists
  if ('currentProduct' in window) {
    window.currentProduct = client;
  }
}

// Run on script load
console.log("Simple Fix: Initializing client fix");

// Handle current URL
handleClientDetail();

// Watch for URL changes
window.addEventListener('hashchange', () => {
  console.log(`Simple Fix: URL changed to ${window.location.hash}`);
  
  // Run with a small delay to ensure components are mounted
  setTimeout(handleClientDetail, 100);
});

// Setup custom event for client added
window.addEventListener('mcp_data_updated', () => {
  // If we're on a client detail page, check if our client changed
  const clientId = getClientIdFromUrl();
  if (clientId) {
    setTimeout(handleClientDetail, 100);
  }
});

// Expose global functions
window.simpleClientFix = {
  addClient,
  findClient: findClientById,
  normalizeId: normalizeClientId,
  createFallback: createFallbackClient
};

// Export for module usage
export {
  addClient,
  findClientById,
  normalizeClientId,
  createFallbackClient,
  handleClientDetail
};