/**
 * Unified Routing Fix for MCP Website
 * 
 * This script fixes the inconsistency between hash-based routing (#/products/id)
 * and direct path routing (/products/id) by ensuring all navigation works correctly
 * regardless of the current URL format.
 */

(function() {
  console.log("Unified Routing Fix: Initializing...");
  
  // Determine if we're using direct path or hash-based routing
  const isDirectPath = window.location.pathname.includes('/products/');
  const isHashBased = window.location.hash.startsWith('#/products/');
  
  console.log(`Unified Routing Fix: Current route type - ${isDirectPath ? 'DIRECT PATH' : (isHashBased ? 'HASH BASED' : 'OTHER')}`);
  
  /**
   * Convert hash URL to direct path URL
   * Example: #/products/server-01 -> /products/server-01
   */
  function hashToDirectPath(hash) {
    if (!hash) return '/';
    return hash.replace('#', '');
  }
  
  /**
   * Convert direct path URL to hash URL
   * Example: /products/server-01 -> #/products/server-01
   */
  function directPathToHash(path) {
    if (!path || path === '/') return '#/';
    return '#' + path;
  }
  
  /**
   * Fix all navigation links to use consistent routing
   */
  function fixAllLinks() {
    // Get all navigation links
    const allLinks = document.querySelectorAll('a[href^="#/"], a[href^="/products/"]');
    
    if (allLinks.length === 0) {
      // No links found yet, which might be normal during initial load
      return;
    }
    
    console.log(`Unified Routing Fix: Found ${allLinks.length} navigation links to fix`);
    
    // Process each link
    allLinks.forEach(link => {
      // Skip if already fixed
      if (link.getAttribute('data-routing-fixed') === 'true') {
        return;
      }
      
      // Get the original href
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Clone the node to remove existing event listeners
      const newLink = link.cloneNode(true);
      newLink.setAttribute('data-routing-fixed', 'true');
      
      // Add unified click handler
      newLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Determine the target URL based on the link type
        let targetUrl;
        
        if (href.startsWith('#/')) {
          // It's a hash-based link
          if (isDirectPath) {
            // We're on a direct path page, convert hash to direct path
            targetUrl = window.location.origin + hashToDirectPath(href);
            console.log(`Unified Routing Fix: Converting hash to direct path: ${href} -> ${targetUrl}`);
          } else {
            // We're already on hash-based page, just update the hash
            targetUrl = href;
            console.log(`Unified Routing Fix: Using hash navigation: ${href}`);
          }
        } else if (href.startsWith('/products/')) {
          // It's a direct path link
          if (isDirectPath) {
            // We're already on direct path, use normal navigation
            targetUrl = href;
            console.log(`Unified Routing Fix: Using direct path navigation: ${href}`);
          } else {
            // We're on hash-based page, convert direct path to hash
            targetUrl = directPathToHash(href);
            console.log(`Unified Routing Fix: Converting direct path to hash: ${href} -> ${targetUrl}`);
          }
        } else {
          // It's some other type of link, use it as is
          targetUrl = href;
        }
        
        // Handle navigation based on target URL type
        if (targetUrl.startsWith('#')) {
          // It's a hash URL, update window.location.hash
          window.location.hash = targetUrl.substring(1);
        } else if (targetUrl.startsWith('http')) {
          // It's an absolute URL, use window.location.href
          window.location.href = targetUrl;
        } else {
          // It's a relative URL, prepend origin
          window.location.href = window.location.origin + targetUrl;
        }
        
        return false;
      });
      
      // Replace the original link
      if (link.parentNode) {
        link.parentNode.replaceChild(newLink, link);
      }
    });
    
    // Special handling for logo/home link
    const logoLink = document.querySelector('header a[href="#/"]');
    if (logoLink && logoLink.getAttribute('data-routing-fixed') !== 'true') {
      const newLogoLink = logoLink.cloneNode(true);
      newLogoLink.setAttribute('data-routing-fixed', 'true');
      
      newLogoLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Always go to homepage
        if (isDirectPath) {
          // If we're on a direct path, go to the base URL
          window.location.href = window.location.origin;
        } else {
          // If we're on hash-based, update the hash
          window.location.hash = '/';
        }
        
        return false;
      });
      
      if (logoLink.parentNode) {
        logoLink.parentNode.replaceChild(newLogoLink, logoLink);
      }
    }
    
    console.log("Unified Routing Fix: All navigation links fixed");
  }
  
  // Initialize fix when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(fixAllLinks, 500));
  } else {
    // DOM already loaded, run after a short delay
    setTimeout(fixAllLinks, 500);
  }
  
  // Set up mutation observer to process dynamically added links
  const observer = new MutationObserver(mutations => {
    let hasNewLinks = false;
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this node or its children have navigation links
            if ((node.tagName === 'A' && 
                 (node.getAttribute('href')?.startsWith('#/') || 
                  node.getAttribute('href')?.startsWith('/products/'))) || 
                (node.querySelectorAll && 
                 node.querySelectorAll('a[href^="#/"], a[href^="/products/"]').length > 0)) {
              hasNewLinks = true;
              break;
            }
          }
        }
      }
      
      if (hasNewLinks) break;
    }
    
    if (hasNewLinks) {
      fixAllLinks();
    }
  });
  
  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also run periodically to ensure all links are fixed
  setInterval(fixAllLinks, 2000);
  
  // Fix links when the hash changes
  window.addEventListener('hashchange', fixAllLinks);
  
  console.log("Unified Routing Fix: Initialization complete");
})();