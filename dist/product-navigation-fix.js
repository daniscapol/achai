/**
 * Product Navigation Fix Script
 * This script fixes navigation issues on product detail pages
 */
(function() {
  // Function to check if we're on a product detail page
  function isProductDetailPage() {
    return window.location.pathname.includes('/products/');
  }

  // Function to fix all navigation links
  function fixNavigationLinks() {
    if (!isProductDetailPage()) return;
    
    console.log("[Navigation Fix] Applying fix to hash links on product detail page");
    
    // Get all links with hash-based navigation
    document.querySelectorAll('a[href^="#/"]').forEach(link => {
      // Skip if already fixed
      if (link.hasAttribute('data-direct-fixed')) return;
      
      // Mark as fixed
      link.setAttribute('data-direct-fixed', 'true');
      
      // Get original href
      const originalHref = link.getAttribute('href');
      
      // Replace the href with a javascript: URL that handles navigation
      link.setAttribute('href', 'javascript:void(0)');
      
      // Add click handler
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log("[Navigation Fix] Redirecting to:", window.location.origin + originalHref);
        
        // Navigate to root with hash
        window.location.href = window.location.origin + originalHref;
        
        return false;
      }, true);
    });
  }

  // Function to set up mutation observer for dynamically added links
  function setupObserver() {
    if (!isProductDetailPage()) return;
    
    // Create MutationObserver to watch for new links
    const observer = new MutationObserver(mutations => {
      let shouldFix = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          shouldFix = true;
        }
      });
      
      if (shouldFix) {
        fixNavigationLinks();
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log("[Navigation Fix] Observer set up for dynamic links");
  }

  // Run the fix
  function init() {
    if (!isProductDetailPage()) return;
    
    console.log("[Navigation Fix] Initializing on product detail page");
    
    // Apply initial fix
    fixNavigationLinks();
    
    // Set up observer for future updates
    setupObserver();
  }

  // Check if the DOM is ready
  if (document.readyState === 'loading') {
    // If still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is ready, run now
    init();
  }
  
  // Also run on load to make sure all links are fixed
  window.addEventListener('load', fixNavigationLinks);
})();