/**
 * Navigation Fix for AchaAI Website
 * 
 * This script addresses issues with the top navigation bar by ensuring
 * proper direct navigation without interference from event handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("Navigation Fix: Initializing site navigation fix");

  // Function to find all navigation links in the top bar
  const fixTopBarNavigation = () => {
    // Wait a moment for React to render the header
    setTimeout(() => {
      // Find all navigation links in the header
      const navLinks = document.querySelectorAll('header a[href^="#/"]');
      
      if (navLinks.length === 0) {
        console.log("Navigation Fix: No navigation links found yet, retrying later");
        // Try again later if links aren't found
        setTimeout(fixTopBarNavigation, 500);
        return;
      }
      
      console.log(`Navigation Fix: Found ${navLinks.length} navigation links in header`);
      
      // Add special click handler to each link to ensure direct navigation
      navLinks.forEach(link => {
        // Store original href
        const href = link.getAttribute('href');
        
        // Remove any existing click handlers by cloning and replacing the node
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // Add our clean click handler
        newLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log(`Navigation Fix: Direct navigation to ${href}`);
          window.location.hash = href.replace('#', '');
          
          // If clicking a link in the mobile menu, close the menu
          const mobileMenu = document.querySelector('.md\\:hidden .absolute');
          if (mobileMenu) {
            // Find the close button
            const closeButton = document.querySelector('button[aria-expanded="true"]');
            if (closeButton) {
              closeButton.click();
            }
          }
        });
      });
      
      console.log("Navigation Fix: Successfully patched navigation links");
    }, 300);
  };
  
  // Initial fix for top bar
  fixTopBarNavigation();
  
  // Fix navigation whenever the hash changes (page navigation)
  window.addEventListener('hashchange', () => {
    console.log("Navigation Fix: Hash changed, fixing navigation links");
    fixTopBarNavigation();
  });
  
  // Also fix navigation when DOM changes significantly
  // (Using MutationObserver would be better, but this is simpler for now)
  const bodyObserver = new MutationObserver((mutations) => {
    // Check if any mutations affected the header
    const headerMutations = mutations.some(mutation => {
      return mutation.target.tagName === 'HEADER' || 
        mutation.target.closest('header') !== null;
    });
    
    if (headerMutations) {
      console.log("Navigation Fix: Header DOM changed, fixing navigation links");
      fixTopBarNavigation();
    }
  });
  
  // Start observing the document with the configured parameters
  bodyObserver.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  console.log("Navigation Fix: Site navigation fix initialized");
});