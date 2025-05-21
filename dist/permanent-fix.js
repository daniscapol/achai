/**
 * Permanent Navigation Fix for AchaAI Website
 * 
 * This script handles both hash-based and direct path navigation issues.
 * It's designed to be loaded on every page and only apply fixes where needed.
 */

(function() {
  console.log("Permanent Fix: Initializing universal navigation fix");
  
  // Determine if we're using path-based or hash-based routing
  const isDirectPathUrl = window.location.pathname.includes('/products/');
  console.log(`Permanent Fix: URL type - ${isDirectPathUrl ? 'DIRECT PATH' : 'HASH BASED'}`);
  
  /**
   * Main function to fix all navigation links
   */
  function fixNavigationLinks() {
    // Target all navigation links in the header
    const navLinks = document.querySelectorAll('a[href^="#/"]');
    
    if (navLinks.length === 0) {
      // No links found yet, which is normal during initial load
      return;
    }
    
    console.log(`Permanent Fix: Found ${navLinks.length} navigation links to fix`);
    
    // Handle each navigation link
    navLinks.forEach(link => {
      // Skip if already fixed
      if (link.getAttribute('data-permanent-fixed') === 'true') {
        return;
      }
      
      // Get target URL
      const hashPath = link.getAttribute('href');
      if (!hashPath) return;
      
      // Clone the node to remove existing event listeners
      const newLink = link.cloneNode(true);
      newLink.setAttribute('data-permanent-fixed', 'true');
      
      // Add our direct navigation handler
      newLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // For direct path URLs, use full URL navigation
        if (isDirectPathUrl) {
          console.log(`Permanent Fix: Direct path navigation to ${hashPath}`);
          window.location.href = window.location.origin + hashPath;
        } 
        // For hash-based URLs, just update the hash
        else {
          console.log(`Permanent Fix: Hash-based navigation to ${hashPath}`);
          window.location.hash = hashPath.replace('#', '');
        }
        
        return false;
      });
      
      // Replace the original link
      if (link.parentNode) {
        link.parentNode.replaceChild(newLink, link);
      }
    });
    
    // Also handle the home/logo link which might have special handling
    const logoLink = document.querySelector('header a[href="#/"]');
    if (logoLink && logoLink.getAttribute('data-permanent-fixed') !== 'true') {
      const newLogoLink = logoLink.cloneNode(true);
      newLogoLink.setAttribute('data-permanent-fixed', 'true');
      
      newLogoLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Always go to homepage
        console.log("Permanent Fix: Navigating to home page");
        window.location.href = window.location.origin + '/#/';
        
        return false;
      });
      
      if (logoLink.parentNode) {
        logoLink.parentNode.replaceChild(newLogoLink, logoLink);
      }
    }
  }
  
  // Run our fix once DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(fixNavigationLinks, 500));
  } else {
    // DOM already loaded, run after a short delay
    setTimeout(fixNavigationLinks, 500);
  }
  
  // Set up mutation observer to catch new navigation elements
  const observer = new MutationObserver((mutations) => {
    // Only run fix if navigation links might have changed
    const headerMutations = mutations.some(mutation => {
      return mutation.target.tagName === 'HEADER' || 
             mutation.target.closest('header') !== null;
    });
    
    if (headerMutations) {
      fixNavigationLinks();
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also run periodically to ensure links are fixed
  setInterval(fixNavigationLinks, 2000);
  
  console.log("Permanent Fix: Universal navigation fix initialized");
})();