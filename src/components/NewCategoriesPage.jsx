import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollReveal, ParallaxEffect, EnhancedCard } from './animations';

/**
 * Enhanced Categories Page with proper redirections to the Products page
 * All navigation links use proper path-based routing to /products with appropriate filters
 */

// Improved Link component that properly handles direct navigation
const Link = ({ to, children, className, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    } else {
      // If no onClick is provided, navigate directly to the path
      console.log(`Link navigating to: ${to}`);
      window.location.href = to;
    }
  };
  
  return (
    <a 
      href={to} 
      className={className} 
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

// Main Category Hero Card - premium animated version
const CategoryHeroCard = ({ title, description, icon, color, linkTo, onClick, iconPath, count }) => {
  const { t } = useTranslation();
  return (
    <ParallaxEffect depth={2.5} glare={true}>
      <Link
        to={linkTo}
        onClick={(e) => {
          console.log(`CategoryHeroCard clicked: ${linkTo}`);
          e.preventDefault();
          if (onClick) {
            onClick();
          } else {
            console.log(`No onClick provided, using direct navigation to: ${linkTo}`);
            window.location.href = linkTo;
          }
        }}
        className={`group block p-8 rounded-2xl transition-all duration-500 border-2 border-${color}-500/30 hover:border-${color}-500/70 h-full relative overflow-hidden bg-gradient-to-br from-${color}-900/30 via-zinc-900/95 to-zinc-900`}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYyem0wLTEydi0yaC0ydjRoNHYtMmgtMnptMCAxOGgtMnY0aDJ2LTR6bTItMTh2LTRoNHYyaC0ydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
        
        {/* Premium animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent bg-[length:200%_200%] group-hover:bg-[length:100%_100%] transition-all duration-1000 opacity-0 group-hover:opacity-100`}></div>
        
        {/* Multiple animated glow bubbles */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-${color}-500/10 opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-125`}></div>
        <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl bg-${color}-500/10 opacity-0 group-hover:opacity-70 transition-all duration-1000 delay-300 group-hover:scale-125`}></div>
        
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-opacity duration-500">
          <div className={`absolute -inset-[100%] top-0 h-[50%] w-[200%] opacity-20 bg-gradient-to-r from-transparent via-${color}-200 to-transparent transform -rotate-45 translate-x-0 group-hover:translate-x-full transition-transform duration-1500 ease-in-out`}></div>
        </div>
        
        {/* Main content with enhanced animations */}
        <div className="relative z-10">
          <div className={`mb-6 w-16 h-16 rounded-xl flex items-center justify-center text-${color}-400 bg-${color}-500/10 group-hover:bg-${color}-500/30 group-hover:text-${color}-300 transition-all duration-500 relative overflow-hidden shadow-lg group-hover:shadow-${color}-500/30`}>
            {/* Icon highlight effect */}
            <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-${color}-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700`}></div>
            {/* Circle animation behind the icon */}
            <div className={`absolute inset-0 rounded-full bg-${color}-500/0 group-hover:bg-${color}-500/10 scale-0 group-hover:scale-100 transition-all duration-700 delay-100`}></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 relative z-10 transform group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
            </svg>
          </div>
          
          <h3 className={`text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white group-hover:from-white group-hover:to-${color}-300 transition-colors duration-500 mb-3`}>
            {title}
          </h3>
          
          <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mb-6 transform group-hover:translate-y-[-2px] transition-transform">
            {description}
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <span className={`text-${color}-400 inline-flex items-center text-sm font-medium group-hover:text-${color}-300 transition-colors duration-300`}>
              {count && <span className="mr-2 font-semibold transform group-hover:scale-110 transition-transform duration-300">{count}+</span>}
              {t('categories.browse')} {title}
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-2 transform group-hover:translate-x-2 transition-all duration-500 ease-out`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </ParallaxEffect>
  );
};

// Subcategory Card - for sub-categories within major groups with premium animations
const SubcategoryCard = ({ name, icon, description, count, linkTo, onClick, color }) => {
  const { t } = useTranslation();
  return (
    <ParallaxEffect depth={0.8} glare={true}>
      <Link
        to={linkTo}
        onClick={(e) => {
          console.log(`SubcategoryCard clicked: ${linkTo}`);
          e.preventDefault();
          if (onClick) onClick();
          else window.location.href = linkTo;
        }}
        className={`group flex flex-col h-full relative overflow-hidden rounded-xl border border-zinc-700 hover:border-${color}-500/30 p-5 transition-all duration-300 bg-zinc-900/60 hover:bg-zinc-800/80`}
      >
        {/* Premium background effects */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYyem0wLTEydi0yaC0ydjRoNHYtMmgtMnptMCAxOGgtMnY0aDJ2LTR6bTItMTh2LTRoNHYyaC0ydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
        
        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-opacity duration-300">
          <div className={`absolute -inset-[100%] top-0 h-[50%] w-[200%] opacity-10 bg-gradient-to-r from-transparent via-${color}-200 to-transparent transform -rotate-45 translate-x-0 group-hover:translate-x-full transition-transform duration-2000 ease-in-out`}></div>
        </div>
        
        {/* Subtle background effect on hover - neutral colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/0 to-zinc-700/0 group-hover:from-zinc-700/5 group-hover:to-zinc-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        {/* Subtle bottom line that animates in - very light effect */}
        <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[1px] bg-gradient-to-r from-zinc-500/20 to-transparent transition-all duration-700 ease-out"></div>
        
        {/* Icon with category color */}
        <div className={`text-${color}-400 mb-3 relative`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10 transform group-hover:scale-110 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
        
        {/* Name with subtle hover color */}
        <h4 className={`text-lg font-semibold text-white group-hover:text-${color}-50 mb-2 transition-colors duration-300`}>{name}</h4>
        
        {/* Description with subtle movement */}
        {description && (
          <p className="text-sm text-gray-400 group-hover:text-gray-300 mb-3 line-clamp-2 transform group-hover:translate-y-[-1px] transition-all duration-300">
            {description}
          </p>
        )}
        
        {/* Count & Arrow with category color */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-500">
            <span className="inline-block transform group-hover:scale-110 transition-transform duration-300">{count}</span> {count === 1 ? t('common.item') : t('common.items')}
          </span>
          <span className={`relative text-${color}-400`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 relative z-10 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </ParallaxEffect>
  );
};

// Main section component for a category group with subcategories
const CategorySection = ({ title, description, color, icon, subcategories, linkTo, onNavigateToCategory, categoryType }) => {
  const { t } = useTranslation();
  return (
    <div className="mb-20">
      <div className="mb-8">
        <h2 className={`text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center`}>
          <span className={`inline-block w-3 h-3 rounded-full bg-${color}-500 mr-3`}></span>
          {title}
        </h2>
        <p className="text-gray-300 max-w-4xl mb-3">{description}</p>
        <Link 
          to={linkTo} 
          onClick={(e) => {
            e.preventDefault();
            console.log(`CategorySection "View all" clicked: ${linkTo}`);
            // Extract category type from linkTo (server, client, ai-agent)
            const typeMatch = linkTo.match(/type=([^&]+)/);
            const type = typeMatch ? typeMatch[1] : 'all';
            onNavigateToCategory(type);
          }}
          className={`inline-flex items-center text-${color}-400 hover:text-${color}-300 text-sm font-medium transition-colors duration-200`}
        >
          {t('categories.view_all')} {title.toLowerCase()}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {subcategories.map((subcategory, index) => (
          <ScrollReveal
            key={subcategory.name}
            direction="up"
            threshold={0.1}
            delay={index * 50}
            once={true}
          >
            <SubcategoryCard
              name={subcategory.name}
              icon={subcategory.icon}
              description={subcategory.description}
              count={subcategory.count}
              color={color}
              linkTo={subcategory.linkTo}
              onClick={() => {
                // Extract type and category from the linkTo URL
                const typeMatch = subcategory.linkTo.match(/type=([^&]+)/);
                const categoryMatch = subcategory.linkTo.match(/category=([^&]+)/);
                
                const type = typeMatch ? typeMatch[1] : 'all';
                
                // Important: Always use the slug from the subcategory object for consistent navigation
                // This ensures we're using the exact same slug format as defined in our data
                const category = subcategory.slug;
                
                console.log(`SubcategoryCard clicked: type=${type}, category=${category}, subcategory name=${subcategory.name}`);
                
                // Navigate using both type and specific category
                onNavigateToCategory(type, category);
              }}
            />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

// New enhanced CategoriesPage component
const NewCategoriesPage = ({ onNavigateToCategorySearch }) => {
  const { t } = useTranslation();
  
  // MCP Server data - with accurate counts based on keyword matching  
  const serverSubcategories = [
    {
      name: t('categories.subcategories.mcp_servers.databases_storage.name'),
      slug: "databases-and-storage",
      keywords: ['database', 'storage', 'data', 'sql', 'nosql'],
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
      description: t('categories.subcategories.mcp_servers.databases_storage.description'),
      count: 10,
      linkTo: "/products?type=server&category=databases-and-storage"
    },
    {
      name: t('categories.subcategories.mcp_servers.web_search.name'),
      slug: "web-and-search",
      keywords: ['web', 'search', 'browser', 'http', 'api'],
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      description: t('categories.subcategories.mcp_servers.web_search.description'),
      count: 8,
      linkTo: "/products?type=server&category=web-and-search"
    },
    {
      name: t('categories.subcategories.mcp_servers.cloud_services.name'),
      slug: "cloud-services",
      keywords: ['cloud', 'aws', 'azure', 'gcp', 'service'],
      icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
      description: t('categories.subcategories.mcp_servers.cloud_services.description'),
      count: 7,
      linkTo: "/products?type=server&category=cloud-services"
    },
    {
      name: t('categories.subcategories.mcp_servers.version_control.name'),
      slug: "version-control",
      keywords: ['git', 'version', 'control', 'repository'],
      icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      description: t('categories.subcategories.mcp_servers.version_control.description'),
      count: 5,
      linkTo: "/products?type=server&category=version-control"
    },
    {
      name: t('categories.subcategories.mcp_servers.utilities_files.name'),
      slug: "utilities-and-files",
      keywords: ['utility', 'file', 'system', 'tools'],
      icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
      description: t('categories.subcategories.mcp_servers.utilities_files.description'),
      count: 9,
      linkTo: "/products?type=server&category=utilities-and-files"
    },
    {
      name: t('categories.subcategories.mcp_servers.communication.name'),
      slug: "communication",
      keywords: ['chat', 'message', 'communication', 'slack'],
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      description: t('categories.subcategories.mcp_servers.communication.description'),
      count: 6,
      linkTo: "/products?type=server&category=communication"
    },
    {
      name: t('categories.subcategories.mcp_servers.analytics.name'),
      slug: "analytics",
      keywords: ['analytics', 'metrics', 'dashboard', 'data'],
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      description: t('categories.subcategories.mcp_servers.analytics.description'),
      count: 5,
      linkTo: "/products?type=server&category=analytics"
    },
    {
      name: t('categories.subcategories.mcp_servers.security_auth.name'),
      slug: "security-and-auth",
      keywords: ['security', 'auth', 'authentication', 'authorization'],
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      description: t('categories.subcategories.mcp_servers.security_auth.description'),
      count: 4,
      linkTo: "/products?type=server&category=security-and-auth"
    }
  ];
  
  // Navigate to category with appropriate filters - with proper product page redirects
  const navigateToCategory = (categoryType, categorySlug = null) => {
    console.log(`Navigating to type: ${categoryType}, category: ${categorySlug}`);
    
    // Determine the URL we're going to redirect to
    let targetUrl = '';
    if (categoryType === 'server') {
      targetUrl = categorySlug ? `/products?type=server&category=${categorySlug}` : '/products?type=server';
    } else if (categoryType === 'client') {
      targetUrl = categorySlug ? `/products?type=client&category=${categorySlug}` : '/products?type=client';
    } else if (categoryType === 'ai-agent' || categoryType === 'ai-tools') {
      const category = categorySlug || 'ai-tools';
      targetUrl = `/products?type=ai-agent&category=${category}`;
    } else if (categoryType === 'all' && categorySlug) {
      targetUrl = `/products?category=${categorySlug}`;
    } else if (categorySlug) {
      targetUrl = `/products?category=${categorySlug}`;
    } else {
      targetUrl = '/products';
    }
    console.log(`Will navigate to URL: ${targetUrl}`);
    
    // Call the parent's onNavigateToCategorySearch function if available
    if (onNavigateToCategorySearch && typeof onNavigateToCategorySearch === 'function') {
      console.log(`Using parent's onNavigateToCategorySearch function with categorySlug: ${categorySlug}`);
      
      if (categoryType === 'server' || categoryType === 'client' || categoryType === 'ai-agent') {
        // First parameter will be type, second will be category
        onNavigateToCategorySearch(categoryType, categorySlug);
      } else if (categorySlug) {
        // If we have a category slug but no specific type, pass the category
        onNavigateToCategorySearch('all', categorySlug);
      } else {
        // Default case - just pass the type
        onNavigateToCategorySearch(categoryType || 'all');
      }
    } else {
      console.log(`No parent navigation function available, using direct navigation to: ${targetUrl}`);
      
      // Navigate directly to the products page with appropriate filters
      window.location.href = targetUrl;
    }
  };

  // MCP Client data - updated to match real client categories
  const clientSubcategories = [
    {
      name: t('categories.subcategories.mcp_clients.desktop_applications.name'),
      slug: "desktop-applications",
      keywords: ["desktop", "electron", "application", "gui", "interface"],
      icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      description: t('categories.subcategories.mcp_clients.desktop_applications.description'),
      count: 6,
      linkTo: "/products?type=client&category=desktop-applications"
    },
    {
      name: t('categories.subcategories.mcp_clients.web_applications.name'),
      slug: "web-applications",
      keywords: ["web", "browser", "application", "online", "website"],
      icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
      description: t('categories.subcategories.mcp_clients.web_applications.description'),
      count: 3, 
      linkTo: "/products?type=client&category=web-applications"
    },
    {
      name: t('categories.subcategories.mcp_clients.code_editors.name'),
      slug: "code-editors",
      keywords: ["editor", "ide", "coding", "programming", "development"],
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      description: t('categories.subcategories.mcp_clients.code_editors.description'),
      count: 2,
      linkTo: "/products?type=client&category=code-editors"
    },
    {
      name: t('categories.subcategories.mcp_clients.cli_tools.name'),
      slug: "cli-tools",
      keywords: ["cli", "terminal", "command", "shell", "console"],
      icon: "M6 9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6zm0 2h12v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7z",
      description: t('categories.subcategories.mcp_clients.cli_tools.description'),
      count: 2,
      linkTo: "/products?type=client&category=cli-tools"
    },
    {
      name: t('categories.subcategories.mcp_clients.libraries.name'),
      slug: "libraries",
      keywords: ["library", "sdk", "framework", "api", "development"],
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      description: t('categories.subcategories.mcp_clients.libraries.description'),
      count: 2,
      linkTo: "/products?type=client&category=libraries"
    },
    {
      name: t('categories.subcategories.mcp_clients.ide_extensions.name'),
      slug: "ide-extensions",
      keywords: ["extension", "plugin", "addon", "ide", "vs-code"],
      icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      description: t('categories.subcategories.mcp_clients.ide_extensions.description'),
      count: 1,
      linkTo: "/products?type=client&category=ide-extensions"
    },
    {
      name: t('categories.subcategories.mcp_clients.browser_extensions.name'),
      slug: "browser-extensions",
      keywords: ["browser", "extension", "addon", "chrome", "firefox"],
      icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
      description: t('categories.subcategories.mcp_clients.browser_extensions.description'),
      count: 1,
      linkTo: "/products?type=client&category=browser-extensions"
    },
    {
      name: t('categories.subcategories.mcp_clients.messaging_integrations.name'),
      slug: "messaging-integrations",
      keywords: ["messaging", "chat", "whatsapp", "telegram", "slack"],
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      description: t('categories.subcategories.mcp_clients.messaging_integrations.description'),
      count: 1,
      linkTo: "/products?type=client&category=messaging-integrations"
    },
    {
      name: t('categories.subcategories.mcp_clients.ai_workflow_tools.name'),
      slug: "ai-workflow-tools",
      keywords: ["workflow", "automation", "no-code", "orchestration", "agents"],
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      description: t('categories.subcategories.mcp_clients.ai_workflow_tools.description'),
      count: 1,
      linkTo: "/products?type=client&category=ai-workflow-tools"
    }
  ];

  // AI Agent data based on actual categories
  const aiAgentSubcategories = [
    {
      name: t('categories.subcategories.ai_agents.coding_assistants.name'),
      slug: "coding-assistant",
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      description: t('categories.subcategories.ai_agents.coding_assistants.description'),
      count: 6,
      linkTo: "/products?type=ai-agent&category=Coding Assistant"
    },
    {
      name: t('categories.subcategories.ai_agents.autonomous_agents.name'),
      slug: "autonomous-agents",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      description: t('categories.subcategories.ai_agents.autonomous_agents.description'),
      count: 4,
      linkTo: "/products?type=ai-agent&category=Autonomous Agents"
    },
    {
      name: t('categories.subcategories.ai_agents.multi_agent_systems.name'),
      slug: "multi-agent",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      description: t('categories.subcategories.ai_agents.multi_agent_systems.description'),
      count: 3,
      linkTo: "/products?type=ai-agent&category=Multi-agent"
    },
    {
      name: t('categories.subcategories.ai_agents.research_assistants.name'),
      slug: "research-assistant",
      icon: "M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z",
      description: t('categories.subcategories.ai_agents.research_assistants.description'),
      count: 1,
      linkTo: "/products?type=ai-agent&category=Research Assistant"
    },
    {
      name: t('categories.subcategories.ai_agents.agent_building.name'),
      slug: "agent-building",
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
      description: t('categories.subcategories.ai_agents.agent_building.description'),
      count: 2,
      linkTo: "/products?type=ai-agent&category=Agent Building"
    },
    {
      name: t('categories.subcategories.ai_agents.creative_studio.name'),
      slug: "creative-studio",
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
      description: t('categories.subcategories.ai_agents.creative_studio.description'),
      count: 1,
      linkTo: "/products?type=ai-agent&category=Creative Studio"
    },
    {
      name: t('categories.subcategories.ai_agents.data_processing.name'),
      slug: "data-processing",
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      description: t('categories.subcategories.ai_agents.data_processing.description'),
      count: 1,
      linkTo: "/products?type=ai-agent&category=Data Processing"
    },
    {
      name: t('categories.subcategories.ai_agents.task_management.name'),
      slug: "task-management",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
      description: t('categories.subcategories.ai_agents.task_management.description'),
      count: 1,
      linkTo: "/products?type=ai-agent&category=Task Management"
    },
    {
      name: t('categories.subcategories.ai_agents.cognitive_architecture.name'),
      slug: "cognitive-architecture",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      description: t('categories.subcategories.ai_agents.cognitive_architecture.description'),
      count: 1,
      linkTo: "/products?type=ai-agent&category=Cognitive Architecture"
    }
  ];

  return (
    <div className="container mx-auto p-4 min-h-screen">
      {/* Page header with premium styling */}
      <ScrollReveal direction="down" threshold={0.1} once={true} duration="normal">
        <div className="my-8 relative overflow-hidden">
          {/* Background gradient effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent rounded-3xl opacity-30"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/5 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/5 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 px-4 py-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              {t('categories.page_title')}
            </h1>
            <p className="text-lg text-gray-300 mb-6 max-w-3xl">
              {t('categories.page_description')}
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Main category cards - animated with parallax effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {/* Ready to Use Section as First Tile */}
        <ScrollReveal direction="up" threshold={0.1} delay={50} once={true}>
          <CategoryHeroCard
            title={t('categories.ready_to_use.title')}
            description={t('categories.ready_to_use.description')}
            iconPath="M13 10V3L4 14h7v7l9-11h-7z"
            color="pink"
            count="4"
            linkTo="/ready-to-use"
            onClick={() => {
              console.log("Ready to Use tile clicked - navigating to /ready-to-use");
              window.location.href = "/ready-to-use";
            }}
          />
        </ScrollReveal>

        <ScrollReveal direction="up" threshold={0.1} delay={100} once={true}>
          <CategoryHeroCard
            title={t('categories.mcp_servers.title')}
            description={t('categories.mcp_servers.description')}
            iconPath="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 8h.01"
            color="purple"
            count="100"
            linkTo="/products?type=server"
            onClick={() => navigateToCategory('server')}
          />
        </ScrollReveal>

        <ScrollReveal direction="up" threshold={0.1} delay={150} once={true}>
          <CategoryHeroCard
            title={t('categories.mcp_clients.title')}
            description={t('categories.mcp_clients.description')}
            iconPath="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            color="blue"
            count="15+"
            linkTo="/products?type=client"
            onClick={() => navigateToCategory('client')}
          />
        </ScrollReveal>

        <ScrollReveal direction="up" threshold={0.1} delay={200} once={true}>
          <CategoryHeroCard
            title={t('categories.ai_agents.title')}
            description={t('categories.ai_agents.description')}
            iconPath="M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707m-12.728 12l-.707-.707m12.728 0l-.707.707"
            color="amber"
            count="40"
            linkTo="/products?type=ai-agent"
            onClick={() => {
              console.log("AI Agents main tile clicked - navigating to products with AI agents");
              navigateToCategory('ai-agent');
            }}
          />
        </ScrollReveal>
      </div>
      
      {/* Ready to Use Solutions Section */}
      <ScrollReveal direction="up" threshold={0.1} once={true}>
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center">
              <span className="inline-block w-3 h-3 rounded-full bg-pink-500 mr-3"></span>
              {t('categories.ready_to_use.section_title')}
            </h2>
            <p className="text-gray-300 max-w-4xl mb-3">
              {t('categories.ready_to_use.section_description')}
            </p>
            <Link 
              to="/ready-to-use" 
              onClick={(e) => {
                e.preventDefault();
                console.log("Ready to Use view all clicked");
                window.location.href = "/ready-to-use";
              }}
              className="inline-flex items-center text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors duration-200"
            >
              {t('categories.ready_to_use.view_all')}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ScrollReveal direction="up" threshold={0.1} delay={50} once={true}>
              <SubcategoryCard
                name="Relevance AI"
                icon="M13 10V3L4 14h7v7l9-11h-7z"
                description={t('categories.product_benefits.relevance_ai')}
                count={1}
                color="indigo"
                linkTo="/ready-to-use"
                onClick={() => {
                  window.location.href = "/ready-to-use";
                }}
              />
            </ScrollReveal>
            
            <ScrollReveal direction="up" threshold={0.1} delay={100} once={true}>
              <SubcategoryCard
                name="CustomGPT.ai"
                icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                description={t('categories.product_benefits.customgpt')}
                count={1}
                color="blue"
                linkTo="/ready-to-use"
                onClick={() => {
                  window.location.href = "/ready-to-use";
                }}
              />
            </ScrollReveal>
            
            <ScrollReveal direction="up" threshold={0.1} delay={150} once={true}>
              <SubcategoryCard
                name="AI Studios"
                icon="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                description={t('categories.product_benefits.aistudios')}
                count={1}
                color="emerald"
                linkTo="/ready-to-use"
                onClick={() => {
                  window.location.href = "/ready-to-use";
                }}
              />
            </ScrollReveal>
            
            <ScrollReveal direction="up" threshold={0.1} delay={200} once={true}>
              <SubcategoryCard
                name="Rytr"
                icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                description={t('categories.product_benefits.rytr')}
                count={1}
                color="orange"
                linkTo="/ready-to-use"
                onClick={() => {
                  window.location.href = "/ready-to-use";
                }}
              />
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>

      {/* Server Categories Section */}
      <ScrollReveal direction="up" threshold={0.1} once={true}>
        <CategorySection
          title={t('categories.mcp_servers.title')}
          description={t('categories.mcp_servers.section_description')}
          color="purple"
          icon="server"
          subcategories={serverSubcategories}
          linkTo="/products?type=server"
          categoryType="server"
          onNavigateToCategory={navigateToCategory}
        />
      </ScrollReveal>

      {/* Client Categories Section */}
      <ScrollReveal direction="up" threshold={0.1} once={true}>
        <CategorySection
          title={t('categories.mcp_clients.title')}
          description={t('categories.mcp_clients.section_description')}
          color="blue"
          icon="desktop"
          subcategories={clientSubcategories}
          linkTo="/products?type=client"
          categoryType="client"
          onNavigateToCategory={navigateToCategory}
        />
      </ScrollReveal>

      {/* AI Agent Categories Section */}
      <ScrollReveal direction="up" threshold={0.1} once={true}>
        <CategorySection
          title={t('categories.ai_agents.title')}
          description={t('categories.ai_agents.section_description')}
          color="amber"
          icon="lightbulb"
          subcategories={aiAgentSubcategories}
          linkTo="/products?type=ai-agent"
          categoryType="ai-agent"
          onNavigateToCategory={(type, category) => {
            console.log(`AI Agents section header clicked, navigating to type=${type}, category=${category || 'all'}`);
            navigateToCategory(type, category);
          }}
        />
      </ScrollReveal>

      {/* What are MCP Categories Section with premium design */}
      <ScrollReveal direction="up" threshold={0.1} once={true} delay={200} duration="normal">
        <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-900/90 backdrop-blur-sm rounded-lg border border-zinc-800 hover:border-purple-500/20 p-8 mt-12 shadow-lg transition-all duration-500 relative overflow-hidden group">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYyem0wLTEydi0yaC0ydjRoNHYtMmgtMnptMCAxOGgtMnY0aDJ2LTR6bTItMTh2LTRoNHYyaC0ydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          
          {/* Subtle gradient background animation */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-600/5 to-transparent blur-3xl transform translate-y-[-50%] translate-x-[-50%] group-hover:translate-y-[-45%] group-hover:translate-x-[-48%] transition-transform duration-5000 ease-in-out"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-600/5 to-transparent blur-3xl transform translate-y-[50%] translate-x-[50%] group-hover:translate-y-[48%] group-hover:translate-x-[45%] transition-transform duration-5000 ease-in-out"></div>
          </div>
          
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden transition-opacity duration-500">
            <div className="absolute -inset-[100%] top-0 h-[50%] w-[200%] opacity-10 bg-gradient-to-r from-transparent via-purple-200 to-transparent transform -rotate-45 translate-x-0 group-hover:translate-x-full transition-transform duration-3000 ease-in-out"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 mr-3 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white group-hover:from-white group-hover:via-purple-100 group-hover:to-white transition-colors duration-500">
                {t('categories.info.title')}
              </span>
            </h2>
            
            <div className="space-y-4 pl-4 border-l border-purple-500/20 group-hover:border-purple-500/30 transition-colors duration-500">
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                {t('categories.info.description1')}
              </p>
              
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {t('categories.info.description2')}
              </p>
              
              <div className="flex items-center pt-2 text-sm text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
                </svg>
                {t('categories.info.description3')}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default NewCategoriesPage;