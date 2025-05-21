import React, { useState, useEffect } from 'react';
import ReviewsSection from './ReviewsSection';
import { 
  ScrollReveal, 
  ParallaxEffect, 
  EnhancedButton,
  prefersReducedMotion
} from './animations';

// Helper function to get the right image for a product with improved client support
function getProductImage(product) {
  // First check if product has direct image properties
  if (product) {
    // If it has local_image_path, use it (this is set by our image downloader)
    if (product.local_image_path) {
      return product.local_image_path.startsWith('/') 
        ? product.local_image_path 
        : `/${product.local_image_path}`;
    }
    
    // If it has image_url, use it (normalizing paths as needed)
    if (product.image_url) {
      // For local development, prefer locally downloaded client images
      if (product.type === 'client') {
        const name = product.name.toLowerCase().replace(/[^\w]+/g, '-');
        // Try both png and jpg extensions
        const localPngPath = `/assets/client-images/${name}.png`;
        const localJpgPath = `/assets/client-images/${name}.jpg`;
        // Return the first one that exists (just assume png for now)
        return localPngPath;
      }
      
      if (product.image_url.startsWith('http')) {
        return product.image_url;
      } else {
        return product.image_url.startsWith('/') ? product.image_url : `/${product.image_url}`;
      }
    }
    
    // Same for image property
    if (product.image) {
      if (product.image.startsWith('http')) {
        return product.image;
      } else {
        return product.image.startsWith('/') ? product.image : `/${product.image}`;
      }
    }
    
    // Check for a valid icon URL
    if (product.icon && typeof product.icon === 'string' && !product.icon.startsWith('M')) {
      return product.icon;
    }
  }
  
  // If we have a product name, try to match by name
  const name = product && product.name ? product.name.toLowerCase() : '';
  const type = product && product.type ? product.type : 'server';
  
  // Client-specific special cases with better logos
  if (type === 'client') {
    // First check for specific client product logos by name
    if (name.includes('claude desktop')) {
      return '/assets/client-logos/claude-desktop.png';
    }
    if (name.includes('claude cli') || name.includes('claude mcp cli')) {
      return '/assets/client-logos/claude-cli.png';
    }
    if (name.includes('cursor')) {
      return '/assets/client-logos/cursor.png';
    }
    if (name.includes('zed')) {
      return '/assets/client-logos/zed.png';
    }
    if (name === '5ire' || name.includes('5ire')) {
      return '/assets/client-logos/5ire.png';
    }
    if (name.includes('vscode') || name.includes('vs code')) {
      return '/assets/client-logos/vscode.png';
    }
    if (name.includes('librechat')) {
      return '/assets/client-logos/librechat.png';
    }
    if (name.includes('eechat')) {
      return '/assets/client-logos/eechat.png';
    }
    if (name.includes('cherry studio')) {
      return '/assets/client-logos/cherry-studio.png';
    }
    if (name.includes('langchain')) {
      return '/assets/client-logos/langchain.png';
    }
    if (name.includes('chainlit')) {
      return '/assets/client-logos/chainlit.png';
    }
    if (name.includes('mcp cli')) {
      return '/assets/client-logos/mcp-cli.png';
    }
    if (name.includes('sdk') || name.includes('anthropic') && name.includes('sdk')) {
      return '/assets/client-logos/sdk.png';
    }
    if (name.includes('browser extension')) {
      return '/assets/client-logos/browser-extension.png';
    }
    if (name.includes('whatsmcp')) {
      return '/assets/client-images/messaging-integration.png';
    }
    if (name.includes('carrotai')) {
      return '/assets/client-images/web-application.png';
    }
    if (name.includes('mindpal')) {
      return '/assets/client-images/web-application.png';
    }
    if (name.includes('continue')) {
      return '/assets/client-images/ide-extension.png';
    }
    if (name.includes('deepchat')) {
      return '/assets/client-images/web-application.png';
    }
    if (name.includes('seekchat')) {
      return '/assets/client-images/desktop-application.png';
    }
    if (name.includes('chatmcp')) {
      return '/assets/client-images/web-application.png';
    }
    if (name.includes('hyperchat')) {
      return '/assets/client-images/desktop-application.png';
    }
    if (name.includes('aiaw')) {
      return '/assets/client-images/web-application.png';
    }
    
    // Try for a client logo in our client-logos directory first using name slug
    const slug = name.replace(/[^\w]+/g, '-');
    const localClientLogoPath = `/assets/client-logos/${slug}.png`;
    
    // First check if we have a specific product logo
    try {
      // This is just a check - we can't actually test if the file exists in the browser
      return localClientLogoPath;
    } catch (e) {
      console.log(`No specific logo found for ${name}, trying category-based image`);
    }
    
    // Category-specific fallbacks if no specific logo is available
    if (product.category) {
      const category = product.category.toLowerCase();
      
      if (category.includes('desktop') || category.includes('application')) {
        return '/assets/client-images/desktop-application.png';
      }
      if (category.includes('web')) {
        return '/assets/client-images/web-application.png';
      }
      if (category.includes('cli') || category.includes('command')) {
        return '/assets/client-images/cli-tool.png';
      }
      if (category.includes('librar') || category.includes('sdk')) {
        return '/assets/client-logos/sdk.png';
      }
      if (category.includes('code editor')) {
        return '/assets/client-images/code-editor.png';
      }
      if (category.includes('browser') || category.includes('extension')) {
        return '/assets/client-logos/browser-extension.png';
      }
      if (category.includes('ide')) {
        return '/assets/client-images/ide-extension.png';
      }
      if (category.includes('messaging') || category.includes('chat')) {
        return '/assets/client-images/messaging-integration.png';
      }
      if (category.includes('workflow') || category.includes('tools')) {
        return '/assets/client-images/web-application.png';
      }
    }
    
    // Default client fallback
    return '/assets/client-images/desktop-application.png';
  }
  
  // AI Agent specific image handling
  if (type === 'ai-agent') {
    // Generate a slug from the name and look for a specific image
    const slug = name.replace(/[^\w]+/g, '-');
    const localAgentImagePath = `/assets/ai-agent-images/${slug}.png`;
    
    // Try to use specific agent image if local_image_path is available
    if (product.local_image_path) {
      return product.local_image_path;
    }
    
    // Try to find an image based on the agent name
    if (name === 'autogpt' || name.includes('auto-gpt')) {
      return '/assets/ai-agent-images/autogpt.png';
    }
    if (name === 'agentgpt' || name.includes('agent-gpt')) {
      return '/assets/ai-agent-images/agentgpt.png';
    }
    if (name === 'babyagi' || name.includes('baby-agi')) {
      return '/assets/ai-agent-images/babyagi.png';
    }
    if (name === 'autogen' || name.includes('auto-gen')) {
      return '/assets/ai-agent-images/autogen.png';
    }
    
    // Use the default AI agent image as fallback
    return '/assets/ai-agent-images/default-agent.svg';
  }
  
  // Server-specific special cases
  if (name === 'clickhouse') {
    return '/assets/server-images/clickhouse.svg';
  }
  if (name === 'anthropic' || name.includes('claude')) {
    return '/assets/news-images/anthropic.jpg';
  }
  if (name.includes('llama')) {
    return '/assets/news-images/llama3.jpg';
  }
  if (name.includes('gemini')) {
    return '/assets/news-images/gemini.jpg';
  }
  if (name.includes('sora')) {
    return '/assets/news-images/sora.jpg';
  }
  
  // Default fallback
  return '/assets/news-images/fallback.jpg';
}

// This would typically be a link component from a router library
const Link = ({ to, children, className, onClick }) => <a href={to} className={className} onClick={onClick}>{children}</a>;

// Improved ProductDetailPage with enhanced client product support
const ProductDetailPage = ({ product, onNavigateBack }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [productData, setProductData] = useState(product); // Use state to allow updates
  const reducedMotion = prefersReducedMotion();
  
  // Helper to determine product type
  const isClient = productData && productData.type === 'client';
  const isAiAgent = productData && productData.type === 'ai-agent';
  
  // Debug information about the product
  console.log(`ProductDetailPage: Rendering ${isClient ? 'client' : isAiAgent ? 'AI agent' : 'server'} product:`, {
    id: productData?.id,
    name: productData?.name,
    type: productData?.type
  });
  
  // Get client ID from URL directly for better lookup
  const getClientIdFromUrl = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#/products/client-')) {
      const rawId = hash.substring('#/products/client-'.length);
      // Try to normalize if we have access to the utility
      if (window.normalizeClientId) {
        return window.normalizeClientId(rawId);
      }
      return rawId;
    }
    return null;
  };
  
  // Function to try getting client data directly for better reliability
  const fetchClientDirectly = () => {
    // Only run for client pages
    if (!isClient) return false;
    
    // Get ID from URL
    const clientId = getClientIdFromUrl();
    if (!clientId) return false;
    
    console.log(`ProductDetailPage: Trying to fetch client ${clientId} directly`);
    
    // Check if this matches the last viewed client ID for better offline support
    let lastViewedClient = null;
    try {
      const lastViewedClientId = localStorage.getItem('last_viewed_client_id');
      if (lastViewedClientId && (lastViewedClientId === clientId || 
          lastViewedClientId === `client-${clientId}` || 
          `client-${lastViewedClientId}` === clientId)) {
        console.log(`ProductDetailPage: This matches the last viewed client ID: ${lastViewedClientId}`);
        
        // Try to find this client in localStorage directly
        const storageKeys = ['mcp_clients_data', 'mcp_clients_data_updated'];
        for (const key of storageKeys) {
          try {
            const data = localStorage.getItem(key);
            if (!data) continue;
            
            const clients = JSON.parse(data);
            if (!Array.isArray(clients)) continue;
            
            // Look for exact match by last viewed ID
            const exactMatch = clients.find(c => 
              c.id === lastViewedClientId || 
              c.id === `client-${lastViewedClientId}` ||
              `client-${c.id}` === lastViewedClientId
            );
            
            if (exactMatch) {
              console.log('ProductDetailPage: Found client by last viewed ID in localStorage');
              lastViewedClient = exactMatch;
              break;
            }
          } catch (e) {
            console.error(`Error checking ${key} for last viewed client:`, e);
          }
        }
      }
    } catch (e) {
      console.error('Error checking last viewed client ID:', e);
    }
    
    // Check sessionStorage for clients passed from simple-test.html
    try {
      const sessionData = sessionStorage.getItem('current_client_data');
      if (sessionData) {
        const sessionClient = JSON.parse(sessionData);
        console.log('ProductDetailPage: Found client in sessionStorage:', sessionClient);
        setProductData(sessionClient);
        
        // Also inject to global data for better compatibility
        if (window.mcpServersDirectData && Array.isArray(window.mcpServersDirectData)) {
          const exists = window.mcpServersDirectData.some(item => 
            item.id === sessionClient.id && item.type === 'client'
          );
          
          if (!exists) {
            window.mcpServersDirectData.push(sessionClient);
            console.log('ProductDetailPage: Added sessionStorage client to global data');
          }
        }
        
        return true;
      }
    } catch (e) {
      console.error('Error reading from sessionStorage:', e);
    }
    
    // If we found a client from last viewed ID, use it
    if (lastViewedClient) {
      console.log('ProductDetailPage: Using client from last viewed ID:', lastViewedClient);
      setProductData(lastViewedClient);
      
      // Also inject to global data for better compatibility
      if (window.mcpServersDirectData && Array.isArray(window.mcpServersDirectData)) {
        const exists = window.mcpServersDirectData.some(item => 
          item.id === lastViewedClient.id && item.type === 'client'
        );
        
        if (!exists) {
          window.mcpServersDirectData.push(lastViewedClient);
          console.log('ProductDetailPage: Added last viewed client to global data');
        }
      }
      
      return true;
    }
    
    // Try the new direct data bridge if available
    if (window.addClientToCache && typeof window.addClientToCache === 'function' &&
        window.forceInject && typeof window.forceInject === 'function') {
      
      // Check if we have the client in global search data
      if (window.mcpServersDirectData && Array.isArray(window.mcpServersDirectData)) {
        // Look for the client with normalized ID if possible
        let clientMatch;
        
        if (window.normalizeClientId) {
          // Use our ID normalization function
          clientMatch = window.mcpServersDirectData.find(item => 
            item.type === 'client' && 
            window.normalizeClientId(item.id) === clientId
          );
        } else {
          // Fallback to simpler matching
          clientMatch = window.mcpServersDirectData.find(item => 
            item.type === 'client' && 
            (item.id === `client-${clientId}` || item.id === clientId)
          );
        }
        
        if (clientMatch) {
          console.log(`ProductDetailPage: Found client ${clientMatch.name} in global data`);
          setProductData(clientMatch);
          return true;
        }
      }
      
      // If we have createTestClient function, use it for fallback
      if (window.createTestClient && typeof window.createTestClient === 'function' && clientId.includes('test')) {
        // This is likely a test client, create it on the fly
        const testName = clientId.split('-').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
        
        console.log(`ProductDetailPage: Creating test client ${testName}`);
        const testClient = window.createTestClient(testName, {
          description: `Test client created dynamically for ${testName}`,
          shortDescription: "Test client with MCP capabilities",
          category: "Test Clients"
        });
        
        // Update our state with the test client
        setProductData(testClient);
        return true;
      }
    }
    
    // Try to use simple client fix API if available
    if (window.simpleClientFix && typeof window.simpleClientFix.addClient === 'function') {
      // Try to find client in localStorage directly
      try {
        const data = localStorage.getItem('mcp_clients_data');
        if (data) {
          const clients = JSON.parse(data);
          if (Array.isArray(clients)) {
            // Look for exact match by id first
            const exactMatch = clients.find(c => 
              c.id === `client-${clientId}` || c.id === clientId
            );
            
            if (exactMatch) {
              console.log('ProductDetailPage: Found exact client match in localStorage');
              setProductData(exactMatch);
              
              // Also add to global data
              if (window.mcpServersDirectData) {
                window.mcpServersDirectData.push(exactMatch);
              }
              
              return true;
            }
            
            // Try name-based matching
            const nameFromId = clientId.replace(/-/g, ' ');
            const nameMatch = clients.find(c => 
              c.name && c.name.toLowerCase() === nameFromId.toLowerCase()
            );
            
            if (nameMatch) {
              console.log('ProductDetailPage: Found client by name in localStorage');
              setProductData(nameMatch);
              
              // Also add to global data
              if (window.mcpServersDirectData) {
                window.mcpServersDirectData.push(nameMatch);
              }
              
              return true;
            }
          }
        }
      } catch (e) {
        console.error('Error searching localStorage for client:', e);
      }
    }
    
    return false;
  };
  
  // When component mounts, verify we have valid data
  useEffect(() => {
    // Try updating product from props
    if (product && product !== productData) {
      setProductData(product);
    }
    
    if (!productData || !productData.name) {
      console.error("Product detail loaded with incomplete product data", productData);
      
      // Try to fetch client directly as a last resort
      if (fetchClientDirectly()) {
        console.log("ProductDetailPage: Successfully fetched client directly");
      }
    } else {
      // Log successful product loading for debugging
      console.log("ProductDetailPage loaded successfully with product:", productData.name);
      
      // Fill in any missing properties to prevent rendering errors
      const updatedProduct = {...productData};
      
      if (!updatedProduct.shortDescription && updatedProduct.description) {
        updatedProduct.shortDescription = updatedProduct.description.substring(0, 150) + 
          (updatedProduct.description.length > 150 ? '...' : '');
      }
      
      if (!updatedProduct.categories && updatedProduct.category) {
        updatedProduct.categories = [updatedProduct.category];
      }
      
      if (!updatedProduct.keyFeatures) {
        updatedProduct.keyFeatures = [];
      }
      
      if (!updatedProduct.useCases) {
        updatedProduct.useCases = [];
      }
      
      // Update product if we made changes
      if (updatedProduct !== productData) {
        setProductData(updatedProduct);
      }
      
      // Set loaded state after a small delay for animation purposes
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [product]);
  
  // Listen for special storage events from the test page
  useEffect(() => {
    // Function to handle storage events including sessionStorage
    const handleSessionStorageChange = (event) => {
      if (event.key === 'current_client_data') {
        console.log("ProductDetailPage: Detected session storage change for client data");
        // Refetch the client data
        fetchClientDirectly();
      }
    };
    
    // Set up the event listener for a custom event we'll dispatch from simple-test.html
    window.addEventListener('client_data_updated_from_test', handleSessionStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('client_data_updated_from_test', handleSessionStorageChange);
    };
  }, []);
  
  // Add a hash change listener to handle direct navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#/products/client-')) {
        // Try the direct client fetching function
        fetchClientDirectly();
      }
    };
    
    // Set up listener
    window.addEventListener('hashchange', handleHashChange);
    
    // Clean up
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // If we still don't have a product, try one more time with direct fetch
  if (!productData) {
    // Try direct client fetch as last resort
    const directFetchResult = fetchClientDirectly();
    
    // If that failed too, show the not found message
    if (!directFetchResult) {
      return (
        <div className="container mx-auto p-4 text-gray-200">
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700 my-8">
            <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
            <p className="mb-4">
              The requested product could not be found. This may happen if:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-6 text-gray-300">
              <li>The product has been removed</li>
              <li>The URL is incorrect</li>
              <li>This is a new product that has just been added</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <EnhancedButton 
                onClick={onNavigateBack} 
                variant="primary" 
                className="text-white"
              >
                Go Back
              </EnhancedButton>
              
              <EnhancedButton 
                onClick={() => {
                  // Force data reload then try again
                  if (window.forceInject && typeof window.forceInject === 'function') {
                    window.forceInject();
                    // Try fetch again after a short delay
                    setTimeout(fetchClientDirectly, 500);
                  } else {
                    // If the direct data fix isn't available, just refresh
                    window.location.reload();
                  }
                }} 
                variant="secondary" 
                className="text-white"
              >
                Refresh Data
              </EnhancedButton>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto p-4 min-h-screen text-gray-200">
      <ScrollReveal 
        direction="down" 
        threshold={0.1} 
        className="w-full"
        duration="fast"
      >
        <div className="text-sm text-gray-400 mb-4">
          <Link to="#" onClick={(e) => {e.preventDefault(); onNavigateBack();}} className="hover:text-purple-400 transition-colors">
            Home ({isClient ? 'All Clients' : isAiAgent ? 'All AI Agents' : 'All Servers'})
          </Link> &gt; 
          <span className="text-gray-200"> {productData.name}</span>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 product-detail-content relative">
        <ScrollReveal 
          direction="left" 
          threshold={0.1} 
          className="md:col-span-2 relative z-10" /* Added relative positioning and z-index */
          duration="normal"
          delay={100}
        >
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700 transition-all hover:shadow-xl hover:border-zinc-600">
            <div className="flex items-center mb-4">
              <div className="relative w-20 h-20 rounded-lg mr-4 flex-shrink-0 bg-zinc-800/80">
                {/* No placeholder - we'll just use the actual image */}
                
                {/* Actual image with higher z-index */}
                {!imageError && (
                  <div className="absolute inset-0 flex items-center justify-center z-[10]">
                    <img 
                      src={getProductImage(product)} 
                      alt={`${product.name || 'Product'} logo`} 
                      className="w-auto max-w-[80%] h-auto max-h-[80%] rounded-lg object-contain p-2 transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        console.log(`Image failed to load for ${product.name}:`, e.target.src);
                        // If this is already a fallback image, show the error icon
                        if (e.target.src.includes('client-images') || e.target.src.includes('fallback')) {
                          // Prevent infinite error loops
                          e.target.onerror = null;
                          // Set error state to show fallback
                          setImageError(true);
                        } else {
                          // Try category-based fallback before showing error
                          const categoryImage = product && product.category && product.category.toLowerCase().includes('desktop') 
                            ? '/assets/client-images/desktop-application.png'
                            : '/assets/client-images/web-application.png';
                          
                          e.target.onerror = null; // Prevent loops
                          e.target.src = categoryImage;
                        }
                      }}
                      onLoad={() => {
                        console.log(`Image loaded successfully for ${product.name}`);
                      }}
                    />
                  </div>
                )}
                
                {/* Fallback that shows if image fails to load */}
                {imageError && (
                  <div 
                    className={`absolute inset-0 w-full h-full rounded-lg flex items-center justify-center text-white transition-transform duration-300 hover:scale-110 z-30 ${
                      isClient ? 'bg-blue-900/80' : 'bg-purple-900/80'
                    }`}
                  >
                    {isClient ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              <div className="animate-fadeIn" style={{ animationDelay: '200ms', opacity: isLoaded ? 1 : 0 }}>
                <h1 className="text-3xl font-bold text-gray-100">{product.name}</h1>
                <p className="text-sm text-gray-400">Created by <a href="#" className="text-orange-400 hover:underline transition-colors">{product.createdBy}</a></p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Type badge - different color for server, client, and AI agent */}
              <span className={`inline-flex items-center bg-${isClient ? 'blue' : isAiAgent ? 'amber' : 'purple'}-600/80 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                {isClient ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    MCP Client
                  </>
                ) : isAiAgent ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Agent
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                    </svg>
                    MCP Server
                  </>
                )}
              </span>
              
              {/* Official badge */}
              {product.official && (
                <span className="inline-flex items-center bg-green-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
                  </svg>
                  Official
                </span>
              )}
              
              {/* Platform badges for clients */}
              {isClient && product.platforms && Array.isArray(product.platforms) && product.platforms.length > 0 && (
                <div className="inline-flex items-center gap-1 flex-wrap">
                  {product.platforms.map(platform => (
                    <span key={platform} className="inline-flex items-center bg-zinc-700 text-gray-200 text-xs font-medium px-2 py-0.5 rounded-full">
                      {platform}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <ScrollReveal direction="up" delay={200} duration="fast">
              <p className="text-gray-300 mb-6">{product.shortDescription}</p>
            </ScrollReveal>

            <div className="mb-6 border-b border-zinc-700">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-purple-400 border-purple-500 transition-colors hover:text-purple-300">
                  About
                </button>
                {/* Add other tabs as needed */}
              </nav>
            </div>

            <ScrollReveal direction="up" delay={300} once={true} className="space-y-6">
              <div id="about-section">
                <h2 className="text-2xl font-semibold text-gray-100 mb-3">About {product.name}</h2>
                <p className="text-gray-300 mb-4 whitespace-pre-line">
                  {/* For clients, use the description directly since it's usually well-formatted */}
                  {isClient ? product.description : product.longDescription}
                </p>
                
                {/* Key Features section */}
                {(product.keyFeatures && product.keyFeatures.length > 0) ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-3">Key Features</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
                      {product.keyFeatures.map((feature, index) => (
                        <ScrollReveal key={index} direction="left" delay={100 + (index * 50)} duration="fast" once={true}>
                          <li>{feature}</li>
                        </ScrollReveal>
                      ))}
                    </ul>
                  </>
                ) : isClient && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-3">Key Features</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
                      <ScrollReveal direction="left" delay={100} duration="fast" once={true}>
                        <li>Implements the MCP (Model Context Protocol) for enhanced AI capabilities</li>
                      </ScrollReveal>
                      <ScrollReveal direction="left" delay={150} duration="fast" once={true}>
                        <li>Connect to and use various MCP servers from this marketplace</li>
                      </ScrollReveal>
                      <ScrollReveal direction="left" delay={200} duration="fast" once={true}>
                        <li>Provides an integrated user interface for AI interactions</li>
                      </ScrollReveal>
                      {product.platforms && product.platforms.includes('Web') && (
                        <ScrollReveal direction="left" delay={250} duration="fast" once={true}>
                          <li>Web-based interface accessible from any browser</li>
                        </ScrollReveal>
                      )}
                      {product.platforms && product.platforms.some(p => ['Windows', 'MacOS', 'Linux'].includes(p)) && (
                        <ScrollReveal direction="left" delay={300} duration="fast" once={true}>
                          <li>Desktop application for {product.platforms.filter(p => ['Windows', 'MacOS', 'Linux'].includes(p)).join(', ')} platforms</li>
                        </ScrollReveal>
                      )}
                      {product.programmingLanguage && (
                        <ScrollReveal direction="left" delay={350} duration="fast" once={true}>
                          <li>Built with {Array.isArray(product.programmingLanguage) ? product.programmingLanguage.join(', ') : product.programmingLanguage} for reliability and performance</li>
                        </ScrollReveal>
                      )}
                    </ul>
                  </>
                )}

                {/* Use Cases section */}
                {(product.useCases && product.useCases.length > 0) ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-3">Use Cases</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {product.useCases.map((useCase, index) => (
                        <ScrollReveal key={index} direction="left" delay={150 + (index * 50)} duration="fast" once={true}>
                          <li>{useCase}</li>
                        </ScrollReveal>
                      ))}
                    </ul>
                  </>
                ) : isClient && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-3">Use Cases</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <ScrollReveal direction="left" delay={150} duration="fast" once={true}>
                        <li>Using AI assistants with enhanced capabilities via MCP servers</li>
                      </ScrollReveal>
                      <ScrollReveal direction="left" delay={200} duration="fast" once={true}>
                        <li>Accessing specialized AI tools and resources through the MCP protocol</li>
                      </ScrollReveal>
                      <ScrollReveal direction="left" delay={250} duration="fast" once={true}>
                        <li>Integrating AI capabilities into your workflow</li>
                      </ScrollReveal>
                      {product.category === 'Desktop Applications' && (
                        <ScrollReveal direction="left" delay={300} duration="fast" once={true}>
                          <li>Desktop-based AI assistance with MCP server connectivity</li>
                        </ScrollReveal>
                      )}
                      {product.category === 'CLI Tools' && (
                        <ScrollReveal direction="left" delay={350} duration="fast" once={true}>
                          <li>Command-line access to AI capabilities powered by MCP servers</li>
                        </ScrollReveal>
                      )}
                      {product.category === 'Code Editors' && (
                        <ScrollReveal direction="left" delay={400} duration="fast" once={true}>
                          <li>AI-assisted coding and development with MCP server integration</li>
                        </ScrollReveal>
                      )}
                    </ul>
                  </>
                )}
                
                {/* MCP Integration section - only for clients */}
                {isClient && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-3">MCP Integration</h3>
                    <p className="text-gray-300 mb-4">
                      {product.name} integrates with the Model Context Protocol (MCP) to enhance AI capabilities. 
                      This open protocol enables AI applications to access external tools and data sources through standardized interfaces.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-zinc-800/60 p-3 rounded border border-zinc-700/60">
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">Resources</h4>
                        <p className="text-xs text-gray-300">
                          Access file-like data from MCP servers, including API responses, file contents, and structured information.
                        </p>
                      </div>
                      <div className="bg-zinc-800/60 p-3 rounded border border-zinc-700/60">
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">Tools</h4>
                        <p className="text-xs text-gray-300">
                          Execute functions provided by MCP servers, such as web searches, database queries, and specialized computations.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>

        <ScrollReveal 
          direction="right" 
          threshold={0.1} 
          className="md:col-span-1 flex flex-col gap-6 relative z-10 md:self-start" /* Changed space-y-6 to flex with gap for better control */
          duration="normal"
          delay={200}
        >
          <ParallaxEffect depth={reducedMotion ? 0 : 1} glare={true}>
            <div className={`bg-zinc-800 p-6 rounded-lg shadow-lg border border-${isClient ? 'blue' : isAiAgent ? 'amber' : 'purple'}-700/30 transition-all hover:shadow-xl hover:border-${isClient ? 'blue' : isAiAgent ? 'amber' : 'purple'}-600/40`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-100">Project Links</h3>
                {product.stars_numeric && 
                  <span className="text-yellow-400 flex items-center">
                    <svg className="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    {product.stars_numeric.toLocaleString()}
                  </span>
                }
              </div>
              
              {/* GitHub Repository Link */}
              {product.githubUrl && (
                <>
                  {/* For MCP Servers, use a large download button */}
                  {!isClient && !isAiAgent && (
                    <>
                      <EnhancedButton 
                        onClick={() => window.open(product.githubUrl, '_blank', 'noopener,noreferrer')}
                        variant="success"
                        fullWidth
                        className="mb-2 py-3 text-lg font-bold"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-6 h-6 mr-3" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                          </svg>
                          Download from GitHub
                        </span>
                      </EnhancedButton>
                      <p className="text-xs text-gray-400 text-center mb-4">
                        Get this MCP Server from its official GitHub repository
                      </p>
                    </>
                  )}
                  
                  {/* For clients and AI agents, use the standard GitHub repository button */}
                  {(isClient || isAiAgent) && (
                    <EnhancedButton 
                      onClick={() => window.open(product.githubUrl, '_blank', 'noopener,noreferrer')}
                      variant={isClient ? "accent" : "secondary"}
                      fullWidth
                      className="mb-2"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        GitHub Repository
                      </span>
                    </EnhancedButton>
                  )}
                </>
              )}
              
              {/* NPM Package Link */}
              {product.npmUrl && (
                <EnhancedButton 
                  onClick={() => window.open(product.npmUrl, '_blank', 'noopener,noreferrer')}
                  variant={isClient ? "secondary" : "accent"}
                  fullWidth
                  className="mb-2"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M0 0v16h16V0H0zm13 13h-2V5H8v8H3V3h10v10z"/>
                    </svg>
                    NPM Package
                  </span>
                </EnhancedButton>
              )}
              
              {/* Additional links for clients */}
              {isClient && (
                <>
                  {/* Website Link */}
                  {product.website && (
                    <EnhancedButton 
                      onClick={() => window.open(product.website, '_blank', 'noopener,noreferrer')}
                      variant="primary"
                      fullWidth
                      className="mb-2"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Visit Website
                      </span>
                    </EnhancedButton>
                  )}
                  
                  {/* Download Link for desktop apps */}
                  {product.website && (product.platforms || []).some(p => ['Windows', 'MacOS', 'Linux'].includes(p)) && (
                    <EnhancedButton 
                      onClick={() => window.open(product.website, '_blank', 'noopener,noreferrer')}
                      variant="success"
                      fullWidth
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Client
                      </span>
                    </EnhancedButton>
                  )}
                </>
              )}
            </div>
          </ParallaxEffect>
          
          {/* Sidebar content */}
          <ScrollReveal direction="right" delay={250} once={true}>
            <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700"></div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={300} once={true}>
            <div className={`bg-zinc-800 p-6 rounded-lg shadow-lg border border-${isClient ? 'blue' : isAiAgent ? 'amber' : 'purple'}-700/30 transition-all hover:shadow-xl hover:border-${isClient ? 'blue' : isAiAgent ? 'amber' : 'purple'}-600/40`} style={{ height: 'auto' }}>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories && product.categories.map((cat, index) => (
                  <span 
                    key={cat} 
                    className={`text-xs text-${isClient ? 'blue' : isAiAgent ? 'amber' : 'purple'}-300 bg-${isClient ? 'blue' : isAiAgent ? 'amber' : 'purple'}-800/70 px-2 py-1 rounded-full transition-all hover:bg-${isClient ? 'blue' : isAiAgent ? 'amber' : 'purple'}-700 cursor-pointer`}
                    style={{ 
                      animationDelay: `${100 + (index * 50)}ms`,
                      animationDuration: '300ms',
                      animation: 'fadeIn',
                      opacity: isLoaded ? 1 : 0
                    }}
                    onClick={() => {
                      // Convert category to slug format
                      const categorySlug = cat.toLowerCase().replace(/\s+/g, '-');
                      // Navigate to search page with this category
                      window.location.hash = `#/search?type=${isClient ? 'client' : 'server'}&category=${categorySlug}&sort=popularity`;
                    }}
                  >
                    {cat}
                  </span>
                ))}
                
                {/* Special tags for clients */}
                {isClient && product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-zinc-700 w-full">
                    <h4 className="text-xs font-semibold text-gray-400 w-full mb-1">Tags:</h4>
                    {product.tags.map((tag, index) => (
                      <span 
                        key={tag} 
                        className="text-xs text-gray-300 bg-zinc-700/70 px-2 py-1 rounded-full transition-all hover:bg-zinc-600"
                        style={{ 
                          animationDelay: `${300 + (index * 50)}ms`,
                          animationDuration: '300ms',
                          animation: 'fadeIn',
                          opacity: isLoaded ? 1 : 0
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Programming language info for clients */}
                {isClient && product.programmingLanguage && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-zinc-700 w-full">
                    <h4 className="text-xs font-semibold text-gray-400 w-full mb-1">Built with:</h4>
                    {Array.isArray(product.programmingLanguage) ? (
                      product.programmingLanguage.map((lang, index) => (
                        <span 
                          key={lang} 
                          className="text-xs text-emerald-300 bg-emerald-900/40 px-2 py-1 rounded-full"
                        >
                          {lang}
                        </span>
                      ))
                    ) : (
                      product.programmingLanguage.split(/,\s*/).map((lang, index) => (
                        <span 
                          key={lang} 
                          className="text-xs text-emerald-300 bg-emerald-900/40 px-2 py-1 rounded-full"
                        >
                          {lang.trim()}
                        </span>
                      ))
                    )}
                  </div>
                )}
                
                {/* License info */}
                {product.license && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-zinc-700 w-full">
                    <h4 className="text-xs font-semibold text-gray-400 w-full mb-1">License:</h4>
                    <span 
                      className="text-xs text-amber-300 bg-amber-900/40 px-2 py-1 rounded-full"
                    >
                      {product.license}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {product.similarTools && product.similarTools.length > 0 && (
            <ScrollReveal direction="right" delay={400} once={true}>
              <div className={`bg-zinc-800 p-6 rounded-lg shadow-lg border border-${isClient ? 'blue' : 'purple'}-700/30 transition-all hover:shadow-xl hover:border-${isClient ? 'blue' : 'purple'}-600/40`}>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Similar {isClient ? 'Clients' : 'Tools'}</h3>
                <div className="space-y-4">
                  {product.similarTools.map((tool, index) => (
                    <ScrollReveal key={tool.id || tool.name} direction="up" delay={200 + (index * 100)} once={true}>
                      <div>
                        <Link 
                          to={`#/products/${isClient ? `client-${tool.id || tool.name.toLowerCase().replace(/\s+/g, '-')}` : tool.id}`} 
                          onClick={(e) => {
                            e.preventDefault(); 
                            // Extract the ID from the URL if it doesn't have an ID property
                            let toolId = tool.id || (tool.url ? tool.url.split('/').pop() : null) || tool.name.toLowerCase().replace(/\s+/g, '-');
                            
                            // Apply client prefix if this is a client
                            if (isClient) {
                              toolId = `client-${toolId}`;
                            }
                            
                            if (toolId) {
                              console.log(`Navigating to similar tool: ${toolId}`);
                              
                              // Check if we're already on this product
                              const currentHash = window.location.hash;
                              const targetHash = `#/products/${toolId}`;
                              
                              // Update the URL
                              window.location.hash = targetHash;
                            }
                          }} 
                          className={`text-${isClient ? 'blue' : 'orange'}-400 hover:underline font-semibold transition-colors`}
                        >
                          {tool.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
          
          {/* AI agent-specific information section */}
          {isAiAgent && (
            <ScrollReveal direction="right" delay={500} once={true}>
              <div className="bg-amber-900/20 p-6 rounded-lg shadow-lg border border-amber-700/30 transition-all hover:shadow-xl hover:border-amber-600/40">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">AI Agent Information</h3>
                
                {/* GitHub stats if available */}
                {product.stars_numeric && (
                  <div className="mb-4 p-3 bg-zinc-800/50 rounded border border-zinc-700/80">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="text-sm font-semibold text-yellow-300">{product.stars_numeric.toLocaleString()} GitHub Stars</span>
                    </div>
                    <p className="text-xs text-gray-400">Popular open source AI agent with active development and community support</p>
                  </div>
                )}
                
                {/* Language information */}
                {product.language && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-amber-300 mb-2">Implementation Details</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs text-gray-300 font-semibold">Built with:</span>
                      <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full">
                        {product.language}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* AI capabilities section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">Agent Capabilities</h4>
                  <ul className="list-disc list-inside text-xs text-gray-300 mb-2 space-y-1">
                    <li>Goal-driven autonomous operation</li>
                    <li>Memory management and context tracking</li>
                    <li>Tool usage for expanded capabilities</li>
                    <li>Task decomposition and planning</li>
                    <li>Self-evaluation and adaptation</li>
                  </ul>
                </div>
                
                {/* Getting started */}
                <div>
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">Getting Started</h4>
                  <p className="text-xs text-gray-300 mb-2">
                    To get started with {product.name}:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-gray-300 mb-2 space-y-1">
                    <li>Clone the repository from GitHub</li>
                    <li>Install dependencies following the documentation</li>
                    <li>Configure your AI provider credentials</li>
                    <li>Run the agent with your specified goals</li>
                  </ol>
                  
                  {/* GitHub link callout */}
                  <div className="mt-3 p-2 bg-zinc-800/70 rounded border border-zinc-700/80 text-center">
                    <a href={product.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium">
                      Visit GitHub Repository →
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}
          
          {/* Client-specific information section */}
          {isClient && (
            <ScrollReveal direction="right" delay={500} once={true}>
              <div className="bg-blue-900/20 p-6 rounded-lg shadow-lg border border-blue-700/30 transition-all hover:shadow-xl hover:border-blue-600/40">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Client Information</h3>
                
                {/* GitHub stats if available */}
                {product.stars_numeric && (
                  <div className="mb-4 p-3 bg-zinc-800/50 rounded border border-zinc-700/80">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="text-sm font-semibold text-yellow-300">{product.stars_numeric.toLocaleString()} GitHub Stars</span>
                    </div>
                    <p className="text-xs text-gray-400">Popular open source project with active community support</p>
                  </div>
                )}
                
                {/* Compatible MCP Servers section */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">Compatible with MCP Servers</h4>
                  <p className="text-xs text-gray-300">
                    This client supports the open Model Context Protocol (MCP) specification, allowing it to connect to 
                    MCP servers like those found in this marketplace.
                  </p>
                </div>
                
                {/* Programming Language section for developers */}
                {product.programmingLanguage && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">Development Information</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-xs text-gray-300 font-semibold">Built with:</span>
                      {Array.isArray(product.programmingLanguage) 
                        ? product.programmingLanguage.map(lang => (
                            <span key={lang} className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full">
                              {lang}
                            </span>
                          ))
                        : product.programmingLanguage.split(/,\s*/).map(lang => (
                            <span key={lang} className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full">
                              {lang.trim()}
                            </span>
                          ))
                      }
                    </div>
                    {product.license && (
                      <div className="flex items-center">
                        <span className="text-xs text-gray-300 font-semibold mr-2">License:</span>
                        <span className="text-xs bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded-full">
                          {product.license}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Installation guidance */}
                <div>
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">Getting Started</h4>
                  <p className="text-xs text-gray-300 mb-2">
                    To use {product.name} with MCP servers:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-gray-300 mb-2 space-y-1">
                    <li>Install the client from the {product.website ? 'official website' : 'GitHub repository'}</li>
                    <li>Launch the application and navigate to settings</li>
                    <li>Add your MCP server configuration</li>
                    <li>Connect to start using the client with MCP capabilities</li>
                  </ol>
                  
                  {/* Platform-specific instructions */}
                  {product.platforms && product.platforms.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-xs font-semibold text-blue-300 mb-1">Available Platforms:</h5>
                      <div className="flex flex-wrap gap-1">
                        {product.platforms.map(platform => (
                          <span key={platform} className="text-xs bg-blue-800/40 text-blue-300 px-2 py-0.5 rounded-full">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 italic mt-3">
                    For detailed instructions, please visit the {product.website ? 'client\'s official documentation' : 'GitHub repository'}.
                  </p>
                </div>
                
                {/* Official status callout */}
                {product.official && (
                  <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-700/30">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
                      </svg>
                      <div>
                        <h5 className="text-sm font-semibold text-green-300 mb-1">Official Client</h5>
                        <p className="text-xs text-gray-300">
                          This is an officially supported MCP client, ensuring reliable compatibility with the MCP protocol.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}
        </ScrollReveal>
      </div>
      
      {/* Add Reviews Section - completely separate from the main grid */}
      <div className="clear-both mt-16 pt-8 border-t border-zinc-800"> {/* Increased spacing and added border for clearer separation */}
        <ScrollReveal direction="up" delay={500} once={true}>
          <ReviewsSection productId={product.id} productName={product.name} />
        </ScrollReveal>
      </div>
    </div>
  );
};

export default ProductDetailPage;
