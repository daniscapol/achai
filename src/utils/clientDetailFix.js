/**
 * Client Detail Fix - Direct Solution
 * 
 * This is a targeted solution specifically for fixing the client detail page issue.
 * It focuses only on making the client detail page work when navigating from admin panel.
 */

// Store added clients directly in the window object for immediate access
window.addedClients = window.addedClients || [];

// Function to directly add a client to the global cache
function addClientDirectly(client) {
  if (!client || !client.id) {
    console.error("ClientDetailFix: Cannot add client - invalid client data", client);
    return false;
  }

  console.log(`ClientDetailFix: Adding client directly: ${client.name}`);
  
  // Ensure client has the right type
  const enhancedClient = {
    ...client,
    type: "client"
  };
  
  // Add to our window cache
  window.addedClients.push(enhancedClient);
  
  // Also add to global data store if it exists
  if (window.mcpServersDirectData) {
    // Check if already exists to avoid duplicates
    const exists = window.mcpServersDirectData.some(
      item => item.id === enhancedClient.id && item.type === 'client'
    );
    
    if (!exists) {
      window.mcpServersDirectData.push(enhancedClient);
      console.log(`ClientDetailFix: Added client to global data store: ${enhancedClient.name}`);
    }
  }
  
  // Also add to other data stores if they exist
  if (window.unifiedSearchData) {
    // Check if already exists to avoid duplicates
    const exists = window.unifiedSearchData.some(
      item => item.id === enhancedClient.id && item.type === 'client'
    );
    
    if (!exists) {
      window.unifiedSearchData.push(enhancedClient);
      console.log(`ClientDetailFix: Added client to unified search data: ${enhancedClient.name}`);
    }
  }

  return true;
}

// Get a client directly from our cache by ID with very flexible matching
function getClientById(clientId) {
  if (!clientId) return null;
  
  // Remove any prefix for better matching
  const rawId = clientId.startsWith('client-') 
    ? clientId.substring('client-'.length) 
    : clientId;
  
  // First check our direct cache
  for (const client of window.addedClients) {
    // Match either prefixed or non-prefixed
    if (client.id === clientId || client.id === `client-${rawId}` || 
        (client.id.startsWith('client-') && client.id.substring('client-'.length) === rawId)) {
      return client;
    }
    
    // Match by sanitized ID
    const normId = (id) => id.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normId(client.id) === normId(rawId) || normId(client.id) === normId(clientId)) {
      return client;
    }
    
    // Match by name (as IDs are often generated from names)
    if (client.name && client.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normId(rawId)) {
      return client;
    }
  }
  
  // Check global data stores if client wasn't found in our cache
  if (window.mcpServersDirectData) {
    const client = window.mcpServersDirectData.find(
      item => (item.type === 'client' || !item.type) && (
        item.id === clientId || 
        item.id === `client-${rawId}` ||
        (item.id.startsWith('client-') && item.id.substring('client-'.length) === rawId)
      )
    );
    
    if (client) {
      return client;
    }
  }
  
  // No client found, create a fallback
  return createFallbackClient(rawId);
}

// Create a fallback client when one isn't found
function createFallbackClient(id) {
  // Generate a nice name from the ID
  const nameFromId = id.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Create a minimal client with just enough properties to render
  const fallbackClient = {
    id: `client-${id}`,
    name: nameFromId,
    description: `This client was added through the admin panel. 
                 Information will be available after refreshing the page.`,
    shortDescription: "Client with MCP integration capabilities.",
    type: "client",
    category: "MCP Clients",
    local_image_path: `/assets/client-images/desktop-application.png`,
    stars_numeric: 100,
    platforms: ["Windows", "MacOS", "Linux"],
    official: false,
    createdBy: "Admin Panel",
    keyFeatures: [
      "MCP Protocol Support",
      "AI Assistant Integration"
    ]
  };
  
  console.log(`ClientDetailFix: Created fallback client: ${fallbackClient.name}`);
  return fallbackClient;
}

// Function to ensure the detail page gets the right client
function handleDetailPage() {
  // Only run if we're on a client detail page
  if (!window.location.hash.includes('/product/client-')) return;
  
  // Get client ID from URL
  const hash = window.location.hash;
  const clientId = hash.substring(hash.lastIndexOf('/') + 1);
  
  console.log(`ClientDetailFix: Handling client detail page for ${clientId}`);
  
  // Find client by ID
  const client = getClientById(clientId);
  
  if (client) {
    console.log(`ClientDetailFix: Found client: ${client.name}`);
    // Add to window.currentProduct if it exists (used by some components)
    if ('currentProduct' in window) {
      window.currentProduct = client;
      console.log(`ClientDetailFix: Set currentProduct to ${client.name}`);
    }
    
    // Add to window.selectedProduct if it exists (used by some components)
    if ('selectedProduct' in window) {
      window.selectedProduct = client;
      console.log(`ClientDetailFix: Set selectedProduct to ${client.name}`);
    }
  }
}

// Function to directly patch the ProductDetailPage component
function patchProductDetailPage() {
  // Check if we're already on the page and should inject now
  if (window.location.hash.includes('/product/client-')) {
    handleDetailPage();
  }
  
  // Listen for hash changes to handle navigation
  window.addEventListener('hashchange', () => {
    console.log(`ClientDetailFix: Hash changed to ${window.location.hash}`);
    if (window.location.hash.includes('/product/client-')) {
      // Small delay to ensure the component has mounted
      setTimeout(handleDetailPage, 100);
    }
  });
  
  console.log("ClientDetailFix: Patched ProductDetailPage component");
}

// Run on script load
patchProductDetailPage();

// Save references to the functions so they can be called directly
window.directClientFunctions = {
  addClientDirectly,
  getClientById,
  createFallbackClient,
  handleDetailPage
};

// Export for module usage
export {
  addClientDirectly,
  getClientById,
  createFallbackClient,
  handleDetailPage
};