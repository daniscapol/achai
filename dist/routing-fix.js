/**
 * Comprehensive Routing Fix for AchaAI Website
 * 
 * This script fixes the mixed routing issues in the application by ensuring
 * all navigation works consistently regardless of current URL structure.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("Routing Fix: Initializing comprehensive routing fix");
  
  // Function to normalize URL path for consistent navigation
  const normalizeNavigation = () => {
    // Check if we're in path-based URL mode instead of hash-based
    const isPathBasedUrl = !window.location.pathname.startsWith('/#/') && 
                          window.location.pathname !== '/' &&
                          window.location.pathname.startsWith('/products/');
    
    console.log(`Routing Fix: Current URL path: ${window.location.pathname} - ${isPathBasedUrl ? 'PATH BASED' : 'HASH BASED'}`);
    
    // If we're in path-based URL mode, we need to normalize back to hash-based
    if (isPathBasedUrl) {
      console.log("Routing Fix: Redirecting from path-based to hash-based routing");
      
      // Extract the product ID from the URL
      const productId = window.location.pathname.split('/').pop();
      
      // Redirect to hash-based URL format
      if (productId && !isNaN(productId)) {
        window.location.href = `${window.location.origin}/#/products/${productId}`;
      } else {
        // If we can't extract a valid ID, just go to products page
        window.location.href = `${window.location.origin}/#/products`;
      }
    }
  };
  
  // Install click interceptor for all anchor links
  const installLinkInterceptor = () => {
    // Wait for DOM to render
    setTimeout(() => {
      // Find all navigation links in the header
      const navLinks = document.querySelectorAll('header a[href^="#/"]');
      
      if (navLinks.length === 0) {
        // Try again if no links found yet
        setTimeout(installLinkInterceptor, 500);
        return;
      }
      
      console.log(`Routing Fix: Installing interceptors on ${navLinks.length} navigation links`);
      
      // Patch each navigation link with our direct navigation handler
      navLinks.forEach(link => {
        // Skip if already patched
        if (link.getAttribute('data-routing-fixed') === 'true') {
          return;
        }
        
        // Get the target URL
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Clone node to remove existing event handlers
        const newLink = link.cloneNode(true);
        
        // Mark as patched
        newLink.setAttribute('data-routing-fixed', 'true');
        
        // Add our routing-fixed handler
        newLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log(`Routing Fix: Intercepted navigation to ${href}`);
          
          // Use correct URL format for consistent navigation
          window.location.href = `${window.location.origin}${href}`;
          
          return false;
        });
        
        // Replace the original link
        if (link.parentNode) {
          link.parentNode.replaceChild(newLink, link);
        }
      });
      
      console.log("Routing Fix: Navigation links patched for consistent routing");
    }, 500);
  };
  
  // First normalize the URL
  normalizeNavigation();
  
  // Then install interceptors for future navigation
  installLinkInterceptor();
  
  // Set up mutation observer to catch new navigation elements
  const observer = new MutationObserver((mutations) => {
    // If DOM changes significantly, reinstall our interceptors
    installLinkInterceptor();
  });
  
  // Start observing
  observer.observe(document.body, {
    subtree: true,
    childList: true
  });
  
  // Also listen for navigation events
  window.addEventListener('hashchange', () => {
    console.log(`Routing Fix: Hash changed to ${window.location.hash}`);
    installLinkInterceptor();
  });
  
  // Periodically check and reinstall interceptors
  setInterval(installLinkInterceptor, 2000);
  
  console.log("Routing Fix: Comprehensive routing fix initialized");
});