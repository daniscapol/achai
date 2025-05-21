/**
 * SIMPLE CLIENT NAVIGATION FIX
 * 
 * This is a minimal script that runs at page load to ensure clients added through
 * the admin panel are always accessible from their detail pages.
 */

// When DOM is loaded, set up our fix
document.addEventListener('DOMContentLoaded', () => {
  console.log("Simple Fix: Initializing client navigation fix");
  
  // Function to check if we're on a client detail page
  const isClientDetailPage = () => {
    return window.location.hash.startsWith('#/product/client-');
  };
  
  // Function to get client ID from URL
  const getClientIdFromUrl = () => {
    if (!isClientDetailPage()) return null;
    
    const hash = window.location.hash;
    const rawId = hash.substring('#/product/client-'.length);
    return rawId; 
  };
  
  // Function to handle client detail page navigation
  const handleClientDetailPage = () => {
    if (!isClientDetailPage()) return;
    
    const clientId = getClientIdFromUrl();
    if (!clientId) return;
    
    console.log(`Simple Fix: On client detail page for: ${clientId}`);
    
    // First check if we have client data in sessionStorage (from test page)
    let clientFromSession = null;
    try {
      const sessionData = sessionStorage.getItem('current_client_data');
      if (sessionData) {
        clientFromSession = JSON.parse(sessionData);
        console.log(`Simple Fix: Found client in sessionStorage: ${clientFromSession.name}`);
      }
    } catch (e) {
      console.error('Simple Fix: Error reading from sessionStorage:', e);
    }
    
    // Look for this client in storage (both sessionStorage and localStorage)
    const findClientInStorage = () => {
      // If we already found it in sessionStorage, return that
      if (clientFromSession) {
        return clientFromSession;
      }
      
      // First check sessionStorage directly (in case the event listener missed it)
      try {
        const sessionData = sessionStorage.getItem('current_client_data');
        if (sessionData) {
          const sessionClient = JSON.parse(sessionData);
          console.log(`Simple Fix: Found client in sessionStorage directly: ${sessionClient.name}`);
          return sessionClient;
        }
      } catch (e) {
        console.error('Simple Fix: Error reading from sessionStorage directly:', e);
      }
      
      // Try all known localStorage locations
      const storageKeys = [
        'mcp_clients_data',
        'mcp_clients_data_updated'
      ];
      
      for (const key of storageKeys) {
        try {
          const data = localStorage.getItem(key);
          if (!data) continue;
          
          const clients = JSON.parse(data);
          if (!Array.isArray(clients)) continue;
          
          // Look for match by ID
          const prefixedId = `client-${clientId}`;
          let client = clients.find(c => c.id === prefixedId || c.id === clientId);
          
          // If found, return it
          if (client) {
            console.log(`Simple Fix: Found client in ${key}`);
            return client;
          }
          
          // Try name-based matching - convert ID to potential name
          const nameFromId = clientId.replace(/-/g, ' ');
          client = clients.find(c => 
            c.name && c.name.toLowerCase() === nameFromId.toLowerCase()
          );
          
          if (client) {
            console.log(`Simple Fix: Found client by name in ${key}`);
            return client;
          }
          
          // Try exact ID matching without client- prefix for clients with full IDs
          client = clients.find(c => 
            c.id && clientId.includes(c.id.replace('client-', ''))
          );
          
          if (client) {
            console.log(`Simple Fix: Found client by partial ID match in ${key}`);
            return client;
          }
          
          // Try matching by partial name contained in ID
          const parts = clientId.split('-');
          for (const part of parts) {
            if (part.length < 3) continue; // Skip short parts
            
            client = clients.find(c => 
              c.name && c.name.toLowerCase().includes(part.toLowerCase())
            );
            
            if (client) {
              console.log(`Simple Fix: Found client by partial name "${part}" in ${key}`);
              return client;
            }
          }
        } catch (e) {
          console.error(`Simple Fix: Error reading from ${key}:`, e);
        }
      }
      
      return null;
    };
    
    // Find client in storage
    const client = findClientInStorage();
    
    if (client) {
      console.log("Simple Fix: Found client in storage, ensuring it's accessible");
      
      // Make sure the client is in the global data
      if (window.mcpServersDirectData) {
        // Check if it's already there
        const exists = window.mcpServersDirectData.some(item => 
          (item.id === client.id || item.id === `client-${clientId}`) && 
          item.type === 'client'
        );
        
        if (!exists) {
          console.log("Simple Fix: Adding client to global data");
          // Ensure type and ID are correct
          const fixedClient = {
            ...client,
            type: 'client',
            id: client.id.startsWith('client-') ? client.id : `client-${client.id}`
          };
          window.mcpServersDirectData.push(fixedClient);
          
          // Force a component update by dispatching an event
          window.dispatchEvent(new CustomEvent('client_data_updated'));
        }
      }
    } else {
      console.log("Simple Fix: Client not found in storage, creating fallback");
      
      // Create a fallback client
      const nameFromId = clientId
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      
      const fallbackClient = {
        id: `client-${clientId}`,
        name: nameFromId,
        description: "This client was added through the admin panel.",
        type: "client",
        category: "MCP Clients",
        local_image_path: "/assets/client-images/desktop-application.png",
        platforms: ["Windows", "MacOS", "Linux"]
      };
      
      // Add to global data if available
      if (window.mcpServersDirectData) {
        window.mcpServersDirectData.push(fallbackClient);
        console.log("Simple Fix: Added fallback client to global data");
        
        // Force a component update by dispatching an event
        window.dispatchEvent(new CustomEvent('client_data_updated'));
      }
      
      // Also save to storage for future use
      try {
        const storageKeys = ['mcp_clients_data', 'mcp_clients_data_updated'];
        
        for (const key of storageKeys) {
          const data = localStorage.getItem(key);
          const clients = data ? JSON.parse(data) : [];
          
          if (Array.isArray(clients)) {
            clients.push(fallbackClient);
            localStorage.setItem(key, JSON.stringify(clients));
            console.log(`Simple Fix: Added fallback client to ${key}`);
          }
        }
      } catch (e) {
        console.error("Simple Fix: Error saving fallback client:", e);
      }
    }
  };
  
  // Run immediately if we're on a client detail page
  handleClientDetailPage();
  
  // Set up event handler for hash changes
  // MODIFIED: Only run the handler when we're going to a client detail page
  window.addEventListener('hashchange', (event) => {
    if (window.location.hash.startsWith('#/product/client-')) {
      console.log('Simple Fix: Detected navigation to client page, handling');
      handleClientDetailPage();
    } else {
      console.log('Simple Fix: Hash change to non-client page, ignoring');
    }
  });
  
  // Set up event handler for client data changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'mcp_clients_data' || e.key === 'mcp_clients_data_updated' || e.key === 'current_client_data') {
      console.log(`Simple Fix: Storage change detected for ${e.key}`);
      handleClientDetailPage();
    }
  });
  
  // Listen for custom event from test page
  window.addEventListener('client_data_updated_from_test', (e) => {
    console.log('Simple Fix: Received client_data_updated_from_test event');
    handleClientDetailPage();
  });
  
  // Public API for adding clients
  window.simpleClientFix = {
    addClient: (client) => {
      if (!client || !client.id) return false;
      
      console.log(`Simple Fix: Adding client ${client.name}`);
      
      // Ensure the client has correct type and ID format
      const fixedClient = {
        ...client,
        type: 'client',
        id: client.id.startsWith('client-') ? client.id : `client-${client.id}`
      };
      
      // Add to all storage locations
      try {
        for (const key of ['mcp_clients_data', 'mcp_clients_data_updated']) {
          const data = localStorage.getItem(key);
          const clients = data ? JSON.parse(data) : [];
          
          if (Array.isArray(clients)) {
            // Check if client already exists
            const index = clients.findIndex(c => c.id === fixedClient.id);
            
            if (index >= 0) {
              // Update existing client
              clients[index] = fixedClient;
            } else {
              // Add new client
              clients.push(fixedClient);
            }
            
            localStorage.setItem(key, JSON.stringify(clients));
          }
        }
        
        // Add to global data if available
        if (window.mcpServersDirectData) {
          // Remove any existing version
          window.mcpServersDirectData = window.mcpServersDirectData.filter(item => 
            !(item.id === fixedClient.id && item.type === 'client')
          );
          
          // Add the updated version
          window.mcpServersDirectData.push(fixedClient);
          
          // Force a component update by dispatching an event
          window.dispatchEvent(new CustomEvent('client_data_updated'));
        }
        
        return true;
      } catch (e) {
        console.error("Simple Fix: Error adding client:", e);
        return false;
      }
    }
  };
  
  console.log("Simple Fix: Client navigation fix initialized");
});