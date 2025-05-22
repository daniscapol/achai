/**
 * Admin Panel Refresh Bridge
 * 
 * This file provides direct functionality to ensure data added in the admin panel
 * is immediately available throughout the application.
 */

// Store original localStorage to use for our operations
const originalLocalStorage = window.localStorage;

// Create a proxy handler to intercept localStorage operations
const localStorageHandler = {
  get(target, prop) {
    // For getItem, use the latest data directly from localStorage
    if (prop === 'getItem') {
      return function(key) {
        console.log(`Enhanced getItem for key: ${key}`);
        
        // These keys should always be fetched fresh from storage
        const keysToAlwaysFetch = [
          'mcp_servers_data',
          'mcp_clients_data',
          'mcp_clients_data_updated',
          'ai_agents_data',
          'mcp_unified_data'
        ];
        
        if (keysToAlwaysFetch.includes(key)) {
          try {
            const value = originalLocalStorage.getItem(key);
            if (value) {
              console.log(`Fresh data fetched for ${key}`);
              return value;
            }
          } catch (e) {
            console.error(`Error getting fresh data for ${key}:`, e);
          }
        }
        
        // For other keys, use normal behavior
        return target[prop].apply(target, arguments);
      };
    }
    
    // For setItem, trigger data refresh across components
    if (prop === 'setItem') {
      return function(key, value) {
        // Detect admin panel updates
        const keysToMonitor = [
          'mcp_servers_data',
          'mcp_clients_data',
          'mcp_clients_data_updated',
          'ai_agents_data',
          'mcp_unified_data',
          'admin_panel_update'
        ];
        
        // Apply the original operation
        const result = target[prop].apply(target, arguments);
        
        // If this is a key we care about, broadcast an update
        if (keysToMonitor.includes(key)) {
          console.log(`Broadcasting update for ${key}`);
          
          // Dispatch a custom event for components to listen to
          window.dispatchEvent(new CustomEvent('mcp_data_updated', { 
            detail: { key, timestamp: new Date().toISOString() }
          }));
          
          // For cross-tab communication
          try {
            // We need to use a different key to avoid infinite loops
            originalLocalStorage.setItem('_mcp_update_signal', Date.now().toString());
          } catch (e) {
            console.error("Error setting update signal:", e);
          }
        }
        
        return result;
      };
    }
    
    // Default behavior for other properties
    return target[prop];
  }
};

// Apply our proxy to localStorage
try {
  window.localStorage = new Proxy(originalLocalStorage, localStorageHandler);
  console.log("AdminRefreshBridge: Enhanced localStorage to improve data consistency");
} catch (e) {
  console.error("Error setting up localStorage proxy:", e);
}

// Listen for update signals from the admin panel
const setupUpdateListener = () => {
  let manualInitComplete = false;
  const pendingUpdates = {};
  
  // Function to refresh all data after updates
  const refreshAllCachedData = () => {
    try {
      console.log("Refreshing all cached data references");
      
      // Force App.jsx to reload data by clearing its cache
      if (window.mcpServersDirectData) {
        window.mcpServersDirectData = null;
      }
      
      // Force search system to reload by clearing unified data
      if (window.unifiedSearchData) {
        window.unifiedSearchData = null;
      }
      
      // Trigger a custom event for components to listen to
      window.dispatchEvent(new CustomEvent('mcp_full_refresh'));
      
      return true;
    } catch (e) {
      console.error("Error refreshing cached data:", e);
      return false;
    }
  };
  
  // Listen for storage events (cross-tab)
  window.addEventListener('storage', (e) => {
    if (e.key === '_mcp_update_signal') {
      console.log("Detected cross-tab update signal");
      refreshAllCachedData();
    }
  });
  
  // Listen for direct updates (same-tab)
  window.addEventListener('mcp_data_updated', (e) => {
    const key = e.detail?.key;
    const timestamp = e.detail?.timestamp || new Date().toISOString();
    
    // Throttle updates to avoid excessive refreshes
    if (key) {
      pendingUpdates[key] = timestamp;
      
      // Schedule a refresh after a short delay to batch updates
      setTimeout(() => {
        if (Object.keys(pendingUpdates).length > 0) {
          console.log(`Processing ${Object.keys(pendingUpdates).length} pending updates`);
          refreshAllCachedData();
          
          // Clear pending updates
          for (const key in pendingUpdates) {
            delete pendingUpdates[key];
          }
        }
      }, 100);
    }
  });
  
  // Manual initialization to refresh data on startup
  if (!manualInitComplete) {
    setTimeout(() => {
      refreshAllCachedData();
      manualInitComplete = true;
    }, 500);
  }
};

// Set up the update listener
setupUpdateListener();

// Function to manually trigger refresh
const forceDataRefresh = () => {
  window.dispatchEvent(new CustomEvent('mcp_data_updated', { 
    detail: { key: 'manual_refresh', timestamp: new Date().toISOString() }
  }));
  return true;
};

// Auto-refresh timer to periodically check for updates
let autoRefreshTimerId = null;

// Setup auto-refresh (refreshes every 5 seconds)
const setupAutoRefresh = (enabled = true) => {
  if (enabled && !autoRefreshTimerId) {
    autoRefreshTimerId = setInterval(() => {
      console.log("Auto-refresh: Checking for updates");
      forceDataRefresh();
    }, 5000);
    return true;
  } else if (!enabled && autoRefreshTimerId) {
    clearInterval(autoRefreshTimerId);
    autoRefreshTimerId = null;
    return true;
  }
  return false;
};

// Expose functions globally to allow direct access from EntityManager
window.adminRefreshBridge = {
  forceDataRefresh,
  setupAutoRefresh
};

// Also export normally for ESM import support
export { forceDataRefresh, setupAutoRefresh };

// Start with auto-refresh disabled
setupAutoRefresh(false);