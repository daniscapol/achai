/**
 * Extreme Navigation Fix for AchaAI Website
 * 
 * This script aggressively forces navigation to work on the product pages
 * by replacing all navigation events with direct window.location updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("Extreme Fix: Initializing navigation override");
  
  // Flag to track if we're on a product detail page
  let isProductPage = window.location.hash.startsWith('#/product/') || 
                      window.location.hash.startsWith('#/products/');
  
  // Function to check URL and enable/disable our fix
  const checkUrl = () => {
    const newIsProductPage = window.location.hash.startsWith('#/product/') || 
                            window.location.hash.startsWith('#/products/');
    
    if (newIsProductPage !== isProductPage) {
      isProductPage = newIsProductPage;
      console.log(`Extreme Fix: Product page status changed to ${isProductPage}`);
      
      if (isProductPage) {
        console.log("Extreme Fix: We're on a product page, enabling extreme navigation fix");
        enableExtremeFix();
      }
    }
  };
  
  // Function to patch all navigation links
  const enableExtremeFix = () => {
    // Quick check if we're on a product page
    if (!isProductPage) return;
    
    console.log("Extreme Fix: Finding and patching all navigation links");
    
    // Wait for DOM to be fully loaded
    setTimeout(() => {
      // Target all navigation links in the header
      const navLinks = document.querySelectorAll('header a[href^="#/"]');
      console.log(`Extreme Fix: Found ${navLinks.length} nav links to patch`);
      
      // Replace each link with a direct navigation link
      navLinks.forEach(link => {
        // Get target URL
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Clone the node to remove existing event listeners
        const newLink = link.cloneNode(true);
        
        // Add our direct navigation handler
        newLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`Extreme Fix: Direct navigation to ${href}`);
          
          // Use full URL navigation to ensure correct URL structure
          window.location.href = window.location.origin + href;
          
          // Return false to prevent any other handlers
          return false;
        });
        
        // Replace the original link
        if (link.parentNode) {
          link.parentNode.replaceChild(newLink, link);
        }
      });
      
      // Also target the logo link which might have special handling
      const logoLink = document.querySelector('header a[href="#/"]');
      if (logoLink) {
        const newLogoLink = logoLink.cloneNode(true);
        newLogoLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Extreme Fix: Direct navigation to home page");
          window.location.href = window.location.origin + '/#/';
          return false;
        });
        if (logoLink.parentNode) {
          logoLink.parentNode.replaceChild(newLogoLink, logoLink);
        }
      }
      
      console.log("Extreme Fix: Navigation links patched successfully");
    }, 500); // Wait for React to render the header
  };
  
  // Run initially
  checkUrl();
  
  // Also check whenever URL changes
  window.addEventListener('hashchange', () => {
    console.log(`Extreme Fix: URL changed to ${window.location.hash}`);
    checkUrl();
  });
  
  // Set interval to periodically check and reapply our fixes
  // This handles cases where React re-renders components
  setInterval(() => {
    if (isProductPage) {
      enableExtremeFix();
    }
  }, 2000);
  
  console.log("Extreme Fix: Navigation override initialized");
});