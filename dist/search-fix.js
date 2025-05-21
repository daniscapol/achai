/**
 * SEARCH FUNCTIONALITY FIX
 * 
 * This script fixes issues with the global search bar where typing a single letter
 * causes the page to reload/redirect to the main page.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("Search Fix: Initializing search functionality fix");
  
  // Wait for React to fully render the components
  setTimeout(() => {
    // Find all search forms in the page
    const searchForms = document.querySelectorAll('form');
    
    searchForms.forEach(form => {
      const searchInput = form.querySelector('input[type="text"]');
      
      // Check if this is likely a search input
      if (searchInput && searchInput.placeholder && 
          (searchInput.placeholder.toLowerCase().includes('search') || 
           form.closest('[class*="search"]'))) {
        
        console.log("Search Fix: Found a search form, adding fix");
        
        // Override the form submit behavior
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          
          // Get the search term
          const searchTerm = searchInput.value.trim();
          if (!searchTerm) return;
          
          console.log(`Search Fix: Search submitted with term: "${searchTerm}"`);
          
          // Navigate without page reload
          const searchUrl = `#/search?q=${encodeURIComponent(searchTerm)}`;
          
          // Update URL without forcing reload
          window.location.hash = searchUrl;
          
          // Dispatch a custom event that React components can listen for
          window.dispatchEvent(new CustomEvent('search_submitted', {
            detail: { searchTerm, searchUrl }
          }));
          
          // Hide any dropdown or results panel that might be open
          const dropdowns = document.querySelectorAll('.absolute.z-30');
          dropdowns.forEach(dropdown => {
            if (dropdown.contains(searchInput)) {
              dropdown.style.display = 'none';
            }
          });
        });
        
        // Also monitor keydown events to prevent Enter from submitting the form directly
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            
            // Trigger custom submit event
            const submitEvent = new Event('submit', {
              bubbles: true,
              cancelable: true
            });
            
            form.dispatchEvent(submitEvent);
          }
        });
      }
    });
    
    // Also monitor hash changes to intercept search redirects
    window.addEventListener('hashchange', (e) => {
      // Check if this is a search hash
      if (window.location.hash.startsWith('#/search?q=')) {
        console.log("Search Fix: Detected search navigation");
        
        // Prevent the default page reload
        const currentUrl = window.location.href;
        if (currentUrl.includes('reload=true')) {
          console.log("Search Fix: Preventing unnecessary reload");
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
    
    console.log("Search Fix: Search functionality fix initialized");
  }, 1000); // Wait for 1 second to ensure all components are rendered
});