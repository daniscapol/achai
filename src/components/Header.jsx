import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import EnhancedLanguageToggle from './EnhancedLanguageToggle';
import SimpleLanguageToggle from './SimpleLanguageToggle';

// Updated to accept search component prop and new categories navigation
const Header = ({ 
  onNavigateHome, 
  onNavigateCategories,
  onNavigateNewCategories,
  onNavigateWhatIsMcp, 
  onNavigateConnectToClaude, 
  onNavigateSubmit, 
  onNavigateCompare, 
  onNavigateReadyToUse,
  onNavigateProducts,
  onNavigateOriginalProducts,
  onNavigateProductManagement,
  searchComponent
}) => {
  // Fallback for Netflix UI since it's not implemented yet
  const { t, i18n } = useTranslation();
  const [forceUpdate, setForceUpdate] = useState(0);
  const onNavigateNetflixProducts = () => {
    window.location.href = '/products'; // Redirect to regular products page for now
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  
  // Create a safe navigation handler to ensure we always have fallbacks
  const safeNavigate = (e, navFunction) => {
    e.preventDefault();
    
    // Simple and direct navigation - just go to the homepage or specified path
    if (e.currentTarget.getAttribute('href') === '/' || e.currentTarget.getAttribute('href') === '#/') {
      window.location.href = '/';
    } else if (typeof navFunction === 'function') {
      try {
        navFunction();
      } catch (err) {
        console.error("Navigation error:", err);
        // Fallback for direct navigation
        window.location.href = e.currentTarget.getAttribute('href');
      }
    } else {
      // Use the href attribute directly for more reliable navigation
      window.location.href = e.currentTarget.getAttribute('href');
    }
  };
  
  // Detect scroll position to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Update active link based on current URL path
    const updateActiveLink = () => {
      const path = window.location.pathname.split('?')[0]; // Remove query params
      setActiveLink(path || '/');
    };
    
    window.addEventListener('popstate', updateActiveLink);
    updateActiveLink(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', updateActiveLink);
    };
  }, [i18n]);
  
  // Function to determine if a link is active
  const isActive = (path) => {
    if (path === '/' && activeLink === '/') return true;
    if (path !== '/' && activeLink.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={`text-gray-200 py-4 px-6 sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? 'bg-zinc-900/80 backdrop-blur-md shadow-lg border-b border-purple-500/20' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto flex justify-between items-center space-x-4">
        <div className="flex items-center">
          <a 
            href="/" 
            onClick={(e) => safeNavigate(e, onNavigateHome)} 
            className="flex items-center relative group"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img 
              src="/assets/logo.png" 
              alt="AchAI Logo" 
              className="h-20 w-auto mr-5 relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
            />
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300 relative z-10 drop-shadow-[0_0_2px_rgba(168,85,247,0.5)]">
              AchAI
            </span>
          </a>
        </div>
        
        {/* Desktop Navigation - centered with larger spacing */}
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-6">
          {[
            { path: '/', label: t('navigation.home'), href: '/', onClick: onNavigateHome },
            { path: '/ready-to-use', label: t('navigation.ready_to_use'), href: '/ready-to-use', badge: t('common.new'), onClick: onNavigateReadyToUse },
            { path: '/browse-categories', label: t('navigation.categories'), href: '/browse-categories', onClick: onNavigateNewCategories },
            { path: '/products', label: t('navigation.products'), href: '/products', onClick: onNavigateProducts },
            { path: '/news', label: 'News', href: '/news', onClick: () => window.location.href = '/news' },
            { path: '/courses', label: 'Courses', href: '/courses', onClick: () => window.location.href = '/courses' },
            { path: '/agents', label: 'AI Agents', href: '/agents', badge: 'Beta', onClick: () => window.location.href = '/agents' },
            // Temporarily hide Netflix UI option since it's not fully implemented
            // { path: '/netflix-products', label: 'Netflix UI', href: '/netflix-products', badge: 'New', onClick: onNavigateNetflixProducts },
            // Removed Product Admin from top navbar - accessible via secure-admin route
          ].map((item) => (
            <a 
              key={item.path}
              href={item.href}
              onClick={(e) => item.onClick ? safeNavigate(e, item.onClick) : safeNavigate(e)}
              className={`relative px-5 py-3 rounded-md transition-all duration-300 font-medium text-lg ${
                isActive(item.path) 
                  ? 'text-white bg-purple-500/20 before:absolute before:bottom-0 before:left-1/4 before:right-1/4 before:h-0.5 before:bg-purple-500' 
                  : 'hover:text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              <span className="relative z-10">{item.label}</span>
              {item.badge && (
                <span className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm px-2 py-0.5 rounded-full animate-pulse-glow">
                  {item.badge}
                </span>
              )}
              {isActive(item.path) && (
                <span className="absolute inset-0 bg-purple-400/5 rounded-md animate-pulse-glow opacity-50"></span>
              )}
            </a>
          ))}
        </nav>
        
        {/* Social Links and Language Toggle */}
        <div className="flex items-center gap-4">
          {/* Instagram Link */}
          <a 
            href="https://www.instagram.com/achaihub/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group"
            title="Follow us on Instagram"
          >
            <svg 
              className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          
          <SimpleLanguageToggle />
        </div>
        
        {/* Mobile Navigation Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-3 rounded-md transition-all duration-300 ${
              mobileMenuOpen 
                ? 'bg-purple-600 text-white' 
                : 'bg-zinc-800/60 hover:bg-purple-600/30'
            }`}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0)' }}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-gradient-to-b from-zinc-900/95 to-zinc-900/90 backdrop-blur-md border-b border-purple-500/20 py-4 px-6 md:hidden z-50 animate-fadeIn shadow-lg shadow-purple-900/10">
            {/* Enhanced Language Toggle and Social Links for mobile */}
            <div className="mb-4 flex justify-center items-center gap-4">
              {/* Instagram Link for mobile */}
              <a 
                href="https://www.instagram.com/achaihub/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group"
                title="Follow us on Instagram"
              >
                <svg 
                  className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              <SimpleLanguageToggle />
            </div>
            
            <nav className="flex flex-col space-y-1">
              {[
                { path: '/', label: t('navigation.home'), href: '/', onClick: onNavigateHome },
                { path: '/ready-to-use', label: t('navigation.ready_to_use'), href: '/ready-to-use', badge: t('common.new'), onClick: onNavigateReadyToUse },
                { path: '/browse-categories', label: t('navigation.categories'), href: '/browse-categories', onClick: onNavigateNewCategories },
                { path: '/products', label: t('navigation.products'), href: '/products', onClick: onNavigateProducts },
                { path: '/news', label: 'News', href: '/news', onClick: () => window.location.href = '/news' },
                { path: '/courses', label: 'Courses', href: '/courses', onClick: () => window.location.href = '/courses' },
                // Temporarily hide Netflix UI option since it's not fully implemented
                // { path: '/netflix-products', label: 'Netflix UI', href: '/netflix-products', badge: 'New', onClick: onNavigateNetflixProducts },
                // Removed Product Admin from mobile menu - accessible via secure-admin route
                { path: '/what-is-an-mcp-server', label: t('navigation.what_is_mcp'), href: '/what-is-an-mcp-server', onClick: onNavigateWhatIsMcp },
                { path: '/about-us', label: t('navigation.about_us'), href: '/about-us' },
                { path: '/submit', label: t('navigation.submit_server'), href: '/submit', onClick: onNavigateSubmit }
              ].map((item, index) => (
                <a 
                  key={item.path}
                  href={item.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    item.onClick ? safeNavigate(e, item.onClick) : safeNavigate(e);
                  }}
                  className={`relative px-5 py-4 rounded-md transition-all duration-300 text-lg ${
                    isActive(item.path) 
                      ? 'text-white bg-purple-500/10 border-l-2 border-purple-500 font-medium' 
                      : 'hover:text-purple-400 hover:bg-purple-500/5 border-l-2 border-transparent'
                  }`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    opacity: 0,
                    animation: 'fadeIn 0.3s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse-glow">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </a>
              ))}
              {/* Connect to Claude button removed */}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;