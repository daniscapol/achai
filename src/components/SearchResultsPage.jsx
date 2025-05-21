import React, { useState, useEffect, useMemo } from 'react';
import UnifiedSearch from './UnifiedSearch';
import { ScrollReveal } from './animations';
import { loadUnifiedData, searchData, sortSearchResults, findClientDirectly } from '../utils/searchUtils';
import { debounce } from '../lib/utils';

// Enhanced ProductCard component with improved visual design and interaction
const ProductCard = ({ product, onNavigate }) => {
  // Function to get badge with customized styles based on product type
  const getTypeBadge = () => {
    switch (product.type) {
      case 'server':
        return (
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 z-10">
            <span className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full shadow-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
              Server
            </span>
          </div>
        );
      case 'client':
        return (
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 z-10">
            <span className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs rounded-full shadow-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Client
            </span>
          </div>
        );
      case 'ai-agent':
        return (
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 z-10">
            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs rounded-full shadow-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Agent
            </span>
          </div>
        );
      case 'ready-to-use':
        return (
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 z-10">
            <span className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs rounded-full shadow-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Ready to Use
            </span>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Enhanced function to get product thumbnail image with better fallbacks
  const getProductImageSrc = () => {
    try {
      // First check for local_image_path (added by our image downloader)
      if (product && product.local_image_path) {
        return product.local_image_path;
      }
      
      // Use image_url or image or fallback
      if (product && product.image_url) {
        // Check if the URL is relative or absolute
        if (product.image_url.startsWith('http')) {
          // For remote images, return as-is but add timestamp to prevent caching issues
          return `${product.image_url}?t=${Date.now()}`;
        } else {
          // For local images, don't prepend anything - let fixImagePath handle it
          return product.image_url;
        }
      }
      
      if (product && product.image) {
        if (product.image.startsWith('http')) {
          return `${product.image}?t=${Date.now()}`;
        } else {
          return product.image;
        }
      }
      
      if (product && product.icon) {
        if (typeof product.icon === 'string' && !product.icon.startsWith('M')) {
          return product.icon;
        }
      }
      
      // Name-based special cases for popular MCP servers and clients
      const name = product && product.name ? product.name.toLowerCase() : '';
      
      // Client images - use product-specific custom logos if available
      if (product.type === 'client') {
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
        if (name.includes('sdk') || (name.includes('anthropic') && name.includes('sdk'))) {
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
        
        // Fallback to category-based logos if we don't have a specific one
        // Check if we have a valid category and return an appropriate image
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
        
        // Default client fallback if all else fails
        return '/assets/client-images/desktop-application.png';
      }

      // AI Agent specific image handling
      if (product.type === 'ai-agent') {
        // Use the local_image_path directly if it exists
        if (product.local_image_path) {
          return product.local_image_path;
        }
        
        // Generate a slug from the name to find the image
        const slug = (product.name || '').toLowerCase().replace(/[^\w]+/g, '-');
        
        // Log AI Agent image path for debugging
        console.log(`AI Agent image path for ${product.name}: /assets/ai-agent-images/${slug}.png`);
        
        return `/assets/ai-agent-images/${slug}.png`;
      }
      
      // Ready to Use specific image handling
      if (product.type === 'ready-to-use') {
        // Use the local_image_path directly if it exists
        if (product.local_image_path) {
          return product.local_image_path;
        }
        
        // Check for specific Ready to Use product names
        const name = (product.name || '').toLowerCase();
        
        if (name.includes('relevance ai')) {
          return '/assets/affiliate-images/relevance-ai/relevance-ai.png';
        }
        if (name.includes('customgpt') || name.includes('custom gpt')) {
          return '/assets/affiliate-images/customgpt/customgpt-logo.png';
        }
        if (name.includes('ai studio') || name.includes('aistudio')) {
          return '/assets/affiliate-images/ai-studio/ai-studio-logo.png';
        }
        if (name.includes('rytr')) {
          return '/assets/affiliate-images/rytr/rytr-logo.png';
        }
        
        // Generate a slug from the name as fallback
        const slug = name.replace(/[^\w]+/g, '-');
        
        // Log Ready to Use image path for debugging
        console.log(`Ready to Use image path for ${product.name}: /assets/affiliate-images/${slug}/${slug}.png`);
        
        return `/assets/affiliate-images/${slug}/${slug}.png`;
      }
      
      // Server images
      if (name === 'clickhouse') {
        return '/assets/news-images/fallback.jpg';
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
      
      // For all others, use the generic fallback
      return '/assets/news-images/fallback.jpg';
    } catch (error) {
      console.error("Error in image handling:", error);
      return '/assets/news-images/fallback.jpg';
    }
  };

  // Function to generate a dynamic background gradient based on product type
  const getCardBackgroundClass = () => {
    switch (product.type) {
      case 'server':
        return 'from-purple-950/20 via-zinc-900/95 to-zinc-900';
      case 'client':
        return 'from-blue-950/20 via-zinc-900/95 to-zinc-900';
      case 'ai-agent':
        return 'from-amber-950/20 via-zinc-900/95 to-zinc-900';
      case 'ready-to-use':
        return 'from-red-950/20 via-zinc-900/95 to-zinc-900';
      default:
        return 'from-zinc-800/70 to-zinc-900/90';
    }
  };

  // Function to get border gradient based on product type
  const getBorderClass = () => {
    switch (product.type) {
      case 'server':
        return 'group-hover:border-purple-500/60';
      case 'client':
        return 'group-hover:border-blue-500/60';
      case 'ai-agent':
        return 'group-hover:border-amber-500/60';
      case 'ready-to-use':
        return 'group-hover:border-red-500/60';
      default:
        return 'group-hover:border-purple-500/50';
    }
  };
  
  // Fix all image paths by removing leading "/public" if it exists
  const fixImagePath = (path) => {
    if (!path) return '';
    // For remote URLs, return as-is
    if (path.startsWith('http')) return path;
    // For local paths, ensure they don't have "/public" prefix
    return path.replace(/^\/public/, '');
  };

  return (
    <div className="h-full hover:transform hover:scale-[1.02] transition-all duration-300 rounded-xl overflow-hidden relative">
      {/* Glow effect behind card (visible on hover) */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-indigo-600/0 opacity-0 group-hover:opacity-10 group-hover:from-purple-600/10 group-hover:to-indigo-600/10 rounded-xl blur-lg transition-all duration-500"></div>
      
      <div 
        className={`group relative h-full flex flex-col bg-gradient-to-br ${getCardBackgroundClass()} rounded-xl shadow-xl border border-zinc-700/60 ${getBorderClass()} transition-all duration-300 cursor-pointer`}
        onClick={() => {
          // Handle Ready to Use products differently - redirect to Ready to Use page
          if (product.type === 'ready-to-use') {
            console.log('Navigating to Ready to Use page');
            window.location.hash = '#/ready-to-use';
            return;
          }
          
          // Special case for items like ClickHouse that have name but not id
          if (!product.id && product.name) {
            // We need to handle servers that might not have IDs but do have names
            // Generate a slug from the name for these cases
            const nameSlug = product.name.toLowerCase().replace(/\s+/g, '-')
                                .replace(/[^\w-]+/g, '');
            console.log(`Product has no ID, using name-based slug: ${nameSlug}`);
            onNavigate && onNavigate(nameSlug);
          } else {
            onNavigate && onNavigate(product.id);
          }
        }}
      >
        {/* Type badge */}
        {getTypeBadge()}
        
        {/* Official badge if applicable */}
        {product.official && (
          <div className="absolute top-0 left-0 transform -translate-x-2 -translate-y-2 z-10">
            <span className="px-2.5 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs rounded-full shadow-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
              </svg>
              Official
            </span>
          </div>
        )}
        
        {/* Thumbnail image section - smaller height with improved error handling */}
        <div className="relative w-full h-28 overflow-hidden">
          {/* No background icon - we'll let the actual image handle everything */}
          
          {/* Actual image with higher z-index */}
          <div className="absolute inset-0 flex items-center justify-center z-[10]">
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={fixImagePath(getProductImageSrc())}
                alt={product && product.name ? product.name : 'MCP Resource'}
                onError={(e) => {
                  // Log the error
                  console.log(`Image failed to load for ${product.name}:`, e.target.src);
                  
                  // If this is already a fallback image, show the fallback icon
                  if (e.target.src.includes('client-images') || e.target.src.includes('fallback')) {
                    // Prevent infinite error loops
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    
                    // Show type-specific icon based on product type
                    const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon');
                    if (fallbackIcon) {
                      fallbackIcon.classList.remove('hidden');
                    }
                  } else {
                    // Try category-based fallback before showing error icon
                    const categoryImage = product && product.category && product.category.toLowerCase().includes('desktop') 
                      ? '/assets/client-images/desktop-application.png'
                      : '/assets/client-images/web-application.png';
                    
                    e.target.onerror = function(e2) {
                      // If fallback also fails, show the fallback icon
                      e2.target.onerror = null;
                      e2.target.style.display = 'none';
                      
                      const fallbackIcon = e2.target.parentNode.querySelector('.fallback-icon');
                      if (fallbackIcon) {
                        fallbackIcon.classList.remove('hidden');
                      }
                    };
                    
                    e.target.src = categoryImage;
                  }
                }}
                className="w-auto max-w-[80%] h-auto max-h-[80%] object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                loading="lazy" // Add lazy loading for better performance
              />
              
              {/* Fallback icon that's hidden by default, shown only on image error */}
              <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center">
                {product.type === 'client' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          
          {/* Gradient overlay with higher z-index */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/95 via-zinc-900/30 to-transparent z-[15]"></div>
          
          {/* Product name overlaid on image with highest z-index */}
          <div className="absolute bottom-0 left-0 right-0 p-2 z-[20]">
            <h3 className="text-base font-semibold text-white mb-0.5 line-clamp-1 drop-shadow-lg" title={product.name}>
              {product.name}
            </h3>
            
            {/* Category label - more compact */}
            {product.category && (
              <div className="flex items-center">
                <span className="text-xs text-gray-300 bg-black/50 px-1.5 py-0.5 rounded-full inline-flex items-center drop-shadow-lg">
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    product.type === 'server' ? 'bg-purple-400' : 'bg-blue-400'
                  }`}></span>
                  {product.category.length > 25 ? product.category.substring(0, 22) + '...' : product.category}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-grow p-2">
          {/* Description - more compact */}
          {product.description && (
            <p className="text-xs text-gray-400 mb-2 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
              {product.description}
            </p>
          )}
          
          {/* Tags with improved styling - more compact */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {product.tags.slice(0, 2).map(tag => (
                <span 
                  key={tag} 
                  className={`px-1.5 py-0.5 text-xs ${
                    product.type === 'server' 
                      ? 'bg-purple-900/30 text-purple-300' 
                      : 'bg-blue-900/30 text-blue-300'
                  } rounded-full border border-zinc-700/30 group-hover:border-zinc-700/50 transition-all duration-300`}
                >
                  {tag}
                </span>
              ))}
              {product.tags.length > 2 && (
                <span className="text-xs text-gray-400 pl-1">+{product.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t border-zinc-700/30 pt-1.5 mt-1 flex items-center justify-between px-2 pb-1.5">
          {/* Stars/Rating with improved visuals - more compact */}
          {(product.stars || product.stars_numeric) && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500 mr-0.5" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-xs text-gray-300 font-medium">
                {typeof product.stars_numeric === 'number' 
                  ? product.stars_numeric.toLocaleString() 
                  : product.stars}
              </span>
            </div>
          )}
          
          {/* View indicator - simple arrow */}
          <span className="w-5 h-5 rounded-full flex items-center justify-center bg-zinc-800/70 text-gray-400 group-hover:text-purple-400 group-hover:bg-purple-900/30 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

// Enhanced CategoryCard component with improved visual styling
const CategoryCard = ({ category, onNavigate }) => {
  return (
    <div className="h-full hover:transform hover:scale-[1.02] transition-all duration-300 rounded-xl overflow-hidden relative">
      {/* Glow effect behind card (visible on hover) */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-teal-600/0 opacity-0 group-hover:opacity-10 group-hover:from-green-600/10 group-hover:to-teal-600/10 rounded-xl blur-lg transition-all duration-500"></div>
      
      <div 
        className="group relative h-full flex flex-col bg-gradient-to-br from-green-950/20 via-zinc-900/95 to-zinc-900 p-6 rounded-xl shadow-xl border border-zinc-700/60 group-hover:border-green-500/40 transition-all duration-300 cursor-pointer"
        onClick={() => onNavigate && onNavigate(category.slug)}
      >
        {/* Category tag */}
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 z-10">
          <span className="px-2.5 py-1 bg-gradient-to-r from-green-600 to-teal-600 text-white text-xs rounded-full shadow-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Category
          </span>
        </div>

        {/* Icon with animated gradient background */}
        <div className="h-12 w-12 rounded-lg mb-4 bg-green-600/20 text-green-400 flex items-center justify-center relative overflow-hidden group-hover:bg-green-600/30 transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-teal-600/0 opacity-0 group-hover:opacity-30 group-hover:from-green-600/20 group-hover:to-teal-600/20 transition-opacity duration-500"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors duration-300">
            {category.name}
          </h3>
          
          {category.description && (
            <p className="text-sm text-gray-400 mb-4 line-clamp-3 group-hover:text-gray-300 transition-colors duration-300">
              {category.description}
            </p>
          )}
          
          {/* Create sample tags based on the category name to add visual interest */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[1, 2, 3].map((_, i) => (
              <span 
                key={i} 
                className="w-16 h-2 bg-green-900/30 rounded-full border border-zinc-700/30 group-hover:border-zinc-700/50 transition-all duration-300"
              ></span>
            ))}
          </div>
        </div>
        
        <div className="border-t border-zinc-700/30 pt-3 mt-2 flex items-center justify-between">
          {/* Resource count */}
          <div className="flex items-center bg-zinc-800/70 px-2.5 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm text-gray-300 font-medium">
              {category.count} {category.count === 1 ? 'resource' : 'resources'}
            </span>
          </div>
          
          {/* Visual indicator for navigation - animate on hover */}
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/50 text-green-400 group-hover:bg-green-900/30 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Search Results Page
const SearchResultsPage = () => {
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, servers, clients, categories
  const [sortOption, setSortOption] = useState('relevance');
  
  // Add debug counter to force re-renders for troubleshooting
  const [debugCounter, setDebugCounter] = useState(0);
  useEffect(() => {
    // Log data status every 2 seconds for troubleshooting
    const debugInterval = setInterval(() => {
      console.log(`[DEBUG ${new Date().toISOString()}] SearchResultsPage: allData.length=${allData.length}`);
      
      // Force re-render every 5 seconds if we don't have data
      if (allData.length === 0 && !isLoading) {
        setDebugCounter(prev => prev + 1);
        console.log("Forcing re-render due to missing data");
      }
    }, 2000);
    
    return () => clearInterval(debugInterval);
  }, [allData.length, isLoading]);
  
  // Get search parameters from URL - with enhanced debugging
  const getSearchParams = () => {
    const hash = window.location.hash;
    if (!hash.includes('?')) return {};
    
    const paramsString = hash.split('?')[1];
    const searchParams = new URLSearchParams(paramsString);
    
    // Get the parameters
    const params = {
      query: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      type: searchParams.get('type') || 'all',
      minRating: searchParams.get('minRating') ? parseInt(searchParams.get('minRating'), 10) : 0,
      official: searchParams.get('official') === 'true'
    };
    
    // Add debug logging
    console.log('Search parameters:', params);
    console.log('URL hash:', hash);
    
    // If we have a category, log additional diagnostic information
    if (params.category) {
      console.log(`Category parameter: "${params.category}"`);
      // Show how the category would be normalized in different ways
      console.log(`- As spaces: "${params.category.replace(/-/g, ' ')}"`);
      console.log(`- With & conversion: "${params.category.replace(/-/g, ' ').replace(/\sand\s/g, ' & ')}"`);
    }
    
    return params;
  };
  
  const searchParams = getSearchParams();
  
  // Load all data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("SearchResultsPage: Starting data fetch");
        
        // Helper function to deduplicate and normalize entries
        const deduplicateAndNormalize = (data) => {
          if (!data || !Array.isArray(data)) return [];
          
          // Comprehensive list of known client names for detection
          const knownClientNames = [
            'claude desktop', 'vscode mcp extension', 'cursor', 'librechat', 'zed', 
            'eechat', '5ire', 'cherry studio', 'anthropic mcp client sdk',
            'claude mcp cli', 'mcp browser extension', 'continue', 'deepchat',
            'mcp cli client', 'chainlit', 'carrotai', 'aiaw', 'mindpal',
            'whatsmcp', 'chatmcp', 'hyperchat', 'seekchat', 'vscode', 
            'extension', 'desktop app', 'ide', 'editor', 'cli tool'
          ];
          
          // List of known AI agent names for detection
          const knownAiAgentNames = [
            'autogpt', 'agent-gpt', 'agentgpt', 'babyagi', 'langchain', 'openinterpreter',
            'gpt-pilot', 'smol-developer', 'superagi', 'langsmith', 'autonomous', 
            'baby-agi', 'gpt-engineer', 'adala', 'opendevin', 'aider', 'crewai', 'xagent'
          ];
          
          // First ensure everything is properly classified
          const correctedData = data.map(item => {
            if (item.name && typeof item.name === 'string') {
              const normalizedName = item.name.toLowerCase();
              
              // Check if this is a known client by name
              const isKnownClient = knownClientNames.some(clientName => 
                normalizedName.includes(clientName) || 
                clientName.includes(normalizedName)
              );
              
              // If this is a known client but not typed as client, update its type
              if (isKnownClient && item.type !== 'client') {
                console.log(`SearchResultsPage: Correcting type for ${item.name} from ${item.type} to client`);
                return {
                  ...item,
                  type: 'client' // Fix the type
                };
              }
              
              // Check if this is a known AI agent by name
              const isKnownAiAgent = knownAiAgentNames.some(agentName => 
                normalizedName.includes(agentName) || 
                agentName.includes(normalizedName)
              );
              
              // If this is a known AI agent but not typed as ai-agent, update its type
              if (isKnownAiAgent && item.type !== 'ai-agent') {
                console.log(`SearchResultsPage: Correcting type for ${item.name} from ${item.type} to ai-agent`);
                return {
                  ...item,
                  type: 'ai-agent' // Fix the type
                };
              }
            }
            return item;
          });
          
          // Use Maps to track unique item names by type
          const clientNameMap = new Map();
          const aiAgentNameMap = new Map();
          const serverNameMap = new Map();
          const nonClassified = [];
          
          // Sort items by type and deduplicate
          for (const item of correctedData) {
            if (item.type === 'client' && item.name) {
              const normalizedName = item.name.toLowerCase();
              if (!clientNameMap.has(normalizedName)) {
                clientNameMap.set(normalizedName, item);
              }
            } else if (item.type === 'ai-agent' && item.name) {
              const normalizedName = item.name.toLowerCase();
              if (!aiAgentNameMap.has(normalizedName)) {
                aiAgentNameMap.set(normalizedName, item);
              }
            } else if (item.type === 'server' && item.name) {
              const normalizedName = item.name.toLowerCase();
              if (!serverNameMap.has(normalizedName)) {
                serverNameMap.set(normalizedName, item);
              }
            } else {
              nonClassified.push(item);
            }
          }
          
          // Combine all unique items
          const uniqueClients = Array.from(clientNameMap.values());
          const uniqueAiAgents = Array.from(aiAgentNameMap.values());
          const uniqueServers = Array.from(serverNameMap.values());
          const result = [...uniqueServers, ...uniqueClients, ...uniqueAiAgents, ...nonClassified];
          
          console.log(`SearchResultsPage: Data stats after deduplication:`);
          console.log(`- Total: ${result.length} items`);
          console.log(`- Servers: ${uniqueServers.length}`);
          console.log(`- Clients: ${uniqueClients.length}`);
          console.log(`- AI Agents: ${uniqueAiAgents.length}`);
          console.log(`- Other: ${nonClassified.length}`);
          
          return result;
        };
        
        // Try to use direct data reference from window if available
        if (window.unifiedSearchData && Array.isArray(window.unifiedSearchData) && window.unifiedSearchData.length > 0) {
          console.log(`SearchResultsPage: Using direct window reference with ${window.unifiedSearchData.length} items`);
          // Deduplicate and normalize the data before setting it
          const normalizedData = deduplicateAndNormalize(window.unifiedSearchData);
          setAllData(normalizedData);
          setIsLoading(false);
          return;
        }
        
        // Load AI agents data
        let aiAgentsData = [];
        try {
          // Try to get AI agents from window reference first
          if (window.lastResortAiAgentsData && Array.isArray(window.lastResortAiAgentsData)) {
            console.log(`Using direct window reference with ${window.lastResortAiAgentsData.length} AI agents`);
            aiAgentsData = window.lastResortAiAgentsData;
          } else {
            // Otherwise try to import from file
            try {
              const aiAgentsModule = await import('../ai_agents_data.json');
              if (aiAgentsModule.default && Array.isArray(aiAgentsModule.default)) {
                console.log(`Loaded ${aiAgentsModule.default.length} AI agents from file`);
                aiAgentsData = aiAgentsModule.default;
              }
            } catch (aiAgentErr) {
              console.warn("Failed to load AI agents data:", aiAgentErr);
            }
          }
          
          // Set AI agent type
          aiAgentsData = aiAgentsData.map(agent => ({
            ...agent,
            type: 'ai-agent'
          }));
          
          console.log(`Processed ${aiAgentsData.length} AI agents`);
        } catch (error) {
          console.error("Error loading AI agents data:", error);
        }
        
        // Otherwise load through the normal flow
        const data = await loadUnifiedData();
        
        if (data && Array.isArray(data) && data.length > 0) {
          console.log(`SearchResultsPage: Loaded ${data.length} items from loadUnifiedData`);
          
          // Combine with AI agents data
          const combinedData = [...data, ...aiAgentsData];
          console.log(`Combined ${data.length} regular items with ${aiAgentsData.length} AI agents`);
          
          // Deduplicate and normalize the data before setting it
          const normalizedData = deduplicateAndNormalize(combinedData);
          setAllData(normalizedData);
        } else {
          console.error("SearchResultsPage: No data returned from loadUnifiedData");
          
          // As a last resort, try to directly import the MCP servers data
          try {
            console.log("SearchResultsPage: Attempting to directly import MCP servers data");
            const serverModule = await import('../mcp_servers_data.json');
            
            if (serverModule.default && Array.isArray(serverModule.default) && serverModule.default.length > 0) {
              const servers = serverModule.default.map(server => ({
                ...server,
                type: 'server'
              }));
              
              console.log(`SearchResultsPage: Directly loaded ${servers.length} servers from import`);
              
              // Combine with AI agents data
              const combinedData = [...servers, ...aiAgentsData];
              
              // Deduplicate and normalize
              const normalizedData = deduplicateAndNormalize(combinedData);
              setAllData(normalizedData);
            } else {
              console.error("SearchResultsPage: Failed to load data from direct import");
              // If we at least have AI agents, use those
              if (aiAgentsData.length > 0) {
                console.log(`SearchResultsPage: Using only AI agents data (${aiAgentsData.length} items)`);
                setAllData(aiAgentsData);
              } else {
                setAllData([]);
              }
            }
          } catch (importErr) {
            console.error("SearchResultsPage: Failed to directly import data:", importErr);
            
            // Try the very last resort - use the mcpServersData imported at the top of App.jsx
            if (window.lastResortMcpServersData && Array.isArray(window.lastResortMcpServersData) && window.lastResortMcpServersData.length > 0) {
              console.log(`SearchResultsPage: Using LAST RESORT data with ${window.lastResortMcpServersData.length} servers`);
              
              const servers = window.lastResortMcpServersData.map(server => ({
                ...server,
                type: 'server'
              }));
              
              // Combine with AI agents data
              const combinedData = [...servers, ...aiAgentsData];
              
              // Deduplicate and normalize
              const normalizedData = deduplicateAndNormalize(combinedData);
              setAllData(normalizedData);
            } else if (aiAgentsData.length > 0) {
              // If we at least have AI agents, use those
              console.log(`SearchResultsPage: Using only AI agents data (${aiAgentsData.length} items) as last resort`);
              setAllData(aiAgentsData);
            } else {
              console.error("SearchResultsPage: All data loading methods failed");
              setAllData([]);
            }
          }
        }
      } catch (err) {
        console.error("SearchResultsPage: Error loading search data:", err);
        setAllData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Set active tab based on type filter from URL
  useEffect(() => {
    const { type } = getSearchParams();
    if (type && ['all', 'server', 'client', 'category'].includes(type)) {
      setActiveTab(type);
    }
  }, [window.location.hash]);
  
  // Filter and sort results based on search parameters
  const searchResults = useMemo(() => {
    if (!allData.length) return [];
    
    try {
      const { query, category, minRating, official, type: typeParam } = searchParams;
      
      // Enhanced type mapping with better ai-agent handling
      let type;
      
      // For URL parameter, use it directly with special handling for ai-agent
      if (typeParam) {
        if (typeParam === 'all') {
          type = 'all';
        } else if (typeParam === 'ai-agent' || typeParam === 'ai-agents') {
          type = 'ai-agent';
        } else if (typeParam === 'server' || typeParam === 'servers') {
          type = 'server';
        } else if (typeParam === 'client' || typeParam === 'clients') {
          type = 'client';
        } else if (typeParam === 'category' || typeParam === 'categories') {
          type = 'category';
        } else {
          // Direct pass-through for any other value
          type = typeParam;
        }
      } else {
        // If no URL parameter, use activeTab with proper mapping
        // Note: 'category' case has been removed as the tab no longer exists
        type = activeTab === 'server' ? 'server' : 
               activeTab === 'client' ? 'client' : 
               activeTab === 'ai-agent' ? 'ai-agent' : 'all';
      }
      
      console.log(`Filtering with type: ${type} (from URL param: ${typeParam}, activeTab: ${activeTab})`);
      
      // Special case: if we're searching for a client by name and there's a query
      // First try direct client lookup using our new function
      if ((type === 'client' || type === 'all') && query && query.trim().length > 0) {
        console.log(`Trying direct client lookup for: ${query}`);
        const directClient = findClientDirectly(query);
        
        if (directClient) {
          console.log(`Found client directly: ${directClient.name}`);
          
          // Add this client to allData if it's not there already
          const clientExists = allData.some(item => 
            item.id === directClient.id && item.type === 'client'
          );
          
          if (!clientExists) {
            console.log(`Adding client to allData: ${directClient.name}`);
            // Mutate allData to include this client
            allData.push(directClient);
            
            // Also add to global data reference
            if (window.mcpServersDirectData && Array.isArray(window.mcpServersDirectData)) {
              const globalExists = window.mcpServersDirectData.some(item => 
                item.id === directClient.id && item.type === 'client'
              );
              
              if (!globalExists) {
                window.mcpServersDirectData.push(directClient);
                console.log(`Added client to global data: ${directClient.name}`);
              }
            }
          }
          
          // Just return this client if we're specifically searching for it
          if (query.toLowerCase() === directClient.name.toLowerCase() || 
              query.toLowerCase() === directClient.id.toLowerCase().replace(/^client-/, '')) {
            console.log(`Exact match for client, returning only: ${directClient.name}`);
            return [directClient];
          }
        }
      }
      
      // Filter the data
      const categories = category ? [category] : [];
      const filtered = searchData(allData, query, { 
        type,
        categories,
        minRating,
        official
      });
      
      console.log(`Filtered results: ${filtered.length} items - Category: ${category}, Type: ${type}`);
      
      // Sort the filtered results
      return sortSearchResults(filtered, sortOption);
    } catch (error) {
      console.error("Error filtering data:", error);
      return allData.slice(0, 50); // Return first 50 items as fallback
    }
  }, [allData, searchParams, activeTab, sortOption]);
  
  // Set active tab based on URL parameter - moved outside to prevent nesting useEffect
  useEffect(() => {
    const { type: typeParam } = searchParams;
    console.log("URL type parameter:", typeParam);
    
    if (typeParam) {
      // Handle different format variants for consistency
      let newActiveTab;
      
      if (typeParam === 'servers' || typeParam === 'server') {
        newActiveTab = 'server';
      } else if (typeParam === 'clients' || typeParam === 'client') {
        newActiveTab = 'client';
      } else if (typeParam === 'ai-agent' || typeParam === 'ai-agents') {
        newActiveTab = 'ai-agent';
      } else if (typeParam === 'category' || typeParam === 'categories') {
        // Categories tab has been removed, don't activate it, just keep the current one
        console.log('Categories tab requested but has been removed from UI, setting to "all" instead');
        newActiveTab = 'all';
      } else {
        // Default to the parameter value if it's something else
        newActiveTab = typeParam;
      }
      
      console.log(`Setting active tab to: ${newActiveTab} based on URL parameter: ${typeParam}`);
      setActiveTab(newActiveTab);
    } else {
      // If no type parameter, set to "all"
      if (activeTab !== 'all') {
        console.log("No type parameter in URL, setting tab to 'all'");
        setActiveTab('all');
      }
    }
  }, [searchParams]);
  
  // Enhanced navigation to product detail with better client handling
  const handleNavigateToDetail = (id) => {
    console.log(`Navigating to product detail for ${id}`);
    
    // Try to find client directly if it's a client ID or name
    if (typeof id === 'string' && 
        (id.startsWith('client-') || id.includes('client'))) {
      
      console.log(`Looks like a client ID, trying direct lookup: ${id}`);
      const directClient = findClientDirectly(id);
      
      if (directClient) {
        console.log(`Found client directly: ${directClient.name}`);
        
        // Store in sessionStorage for the detail page
        try {
          sessionStorage.setItem('current_client_data', JSON.stringify(directClient));
          console.log(`Saved client to sessionStorage: ${directClient.name}`);
          
          // Also dispatch event to notify components
          window.dispatchEvent(new CustomEvent('client_data_updated_from_test', {
            detail: { clientId: directClient.id }
          }));
        } catch (e) {
          console.error('Error saving to sessionStorage:', e);
        }
        
        // Use correct ID format in URL
        const clientId = directClient.id.startsWith('client-') ? 
          directClient.id : `client-${directClient.id}`;
        
        console.log(`Navigating to client detail: ${clientId}`);
        window.location.hash = `#/products/${clientId}`;
        return;
      }
    }
    
    // Before we do anything, show the full product that was clicked
    const clickedIndex = searchResults.findIndex(item => 
      item.id === id || 
      String(item.id) === String(id)
    );
    
    if (clickedIndex !== -1) {
      console.log(`FULL PRODUCT DATA for ${id}:`, JSON.stringify(searchResults[clickedIndex], null, 2));
      
      // If this is a client, save to sessionStorage
      const product = searchResults[clickedIndex];
      if (product.type === 'client') {
        try {
          sessionStorage.setItem('current_client_data', JSON.stringify(product));
          console.log(`Saved client to sessionStorage from search results: ${product.name}`);
          
          // Also dispatch event to notify components
          window.dispatchEvent(new CustomEvent('client_data_updated_from_test', {
            detail: { clientId: product.id }
          }));
        } catch (e) {
          console.error('Error saving to sessionStorage:', e);
        }
      }
    } else {
      console.log(`WARNING: Product with ID ${id} NOT FOUND in search results!`);
      console.log(`Search results items:`, searchResults.map(p => ({id: p.id, name: p.name, type: p.type})));
    }
    
    // SPECIAL CASE: Handle ClickHouse and any other known problematic servers
    if (id === "clickhouse" || 
        (typeof id === 'string' && id.toLowerCase() === "clickhouse")) {
      console.log("SPECIAL CASE: Handling ClickHouse server directly");
      window.location.hash = "#/products/clickhouse";
      return;
    }
    
    // List of known client names for type verification
    const knownClientNames = [
      'claude desktop', 'vscode mcp extension', 'cursor', 'librechat', 'zed', 
      'eechat', '5ire', 'cherry studio', 'anthropic mcp client sdk',
      'claude mcp cli', 'mcp browser extension', 'continue', 'deepchat',
      'mcp cli client', 'chainlit', 'carrotai', 'aiaw', 'mindpal',
      'whatsmcp', 'chatmcp', 'hyperchat', 'seekchat'
    ];
    
    // Check if this is a client or server from the results
    let product = searchResults.find(item => 
      item.id === id || 
      String(item.id) === String(id)
    );
    
    if (product) {
      // Verify the type is correct based on the known client names
      if (product.name && typeof product.name === 'string') {
        const normalizedName = product.name.toLowerCase();
        const isKnownClient = knownClientNames.some(clientName => 
          normalizedName.includes(clientName) || 
          clientName.includes(normalizedName)
        );
        
        // Override the type if this is actually a client but labeled as server
        if (isKnownClient && product.type !== 'client') {
          console.log(`TYPE FIX: Correcting product type from ${product.type} to client for: ${product.name}`);
          product = {
            ...product,
            type: 'client'
          };
        }
      }
      
      console.log(`Found product in searchResults:`, {
        id: product.id,
        name: product.name,
        type: product.type
      });
      
      // Add extra debug logging to diagnose what's happening
      console.log(`Product detail lookup - Product:`, {
        id: product.id, 
        name: product.name, 
        type: product.type,
        url: window.location.hash.substring(1),
        view: activeTab
      });
      
      // SPECIAL CASE: Handle specific servers by name
      if (product.name && typeof product.name === 'string') {
        if (product.name.toLowerCase() === 'clickhouse') {
          console.log("SPECIAL CASE: Handling ClickHouse server by name");
          window.location.hash = "#/products/clickhouse";
          return;
        }
      }
      
      // Special case handling for clients
      if (product.type === 'client') {
        // Always use name-based slugs for clients instead of numeric IDs
        const nameSlug = product.name.toLowerCase().replace(/\s+/g, '-')
                          .replace(/[^\w-]+/g, ''); // Remove any special characters
        
        console.log(`Using name-based slug for client: ${nameSlug}`);
        
        // Check if the slug already has a client- prefix to avoid double prefixing
        if (nameSlug.startsWith('client-')) {
          window.location.hash = `#/products/${nameSlug}`;
        } else {
          window.location.hash = `#/products/client-${nameSlug}`;
        }
        return;
      }
      
      // For servers, use their existing ID value directly - this preserves the
      // original behavior for MCP servers that relies on their actual ID values
      if (product.type === 'server' || product.type === undefined) {
        // Check if the product has an id, if so use it, otherwise use the id parameter
        // which could be the original intact ID passed to this function
        const serverId = product.id || id;
        console.log(`Using original ID for server: ${serverId}`);
        
        // Check if this is actually a server ID with a client- prefix (incorrect labeling)
        if (typeof serverId === 'string' && serverId.startsWith('client-')) {
          console.log(`WARNING: Server has client- prefix in ID (${serverId}), fixing type and redirecting to client page`);
          window.location.hash = `#/products/${serverId}`;
          return;
        }
        
        // Double check the ID isn't numeric - if it is, that's likely an array index
        // and not a real ID - use the name instead
        if (!isNaN(parseInt(serverId)) && String(parseInt(serverId)) === String(serverId)) {
          console.log(`WARNING: Server ID looks numeric (${serverId}), using name-based slug instead`);
          const nameSlug = product.name.toLowerCase().replace(/\s+/g, '-')
                            .replace(/[^\w-]+/g, '');
          window.location.hash = `#/products/${nameSlug}`;
          return;
        }
        
        window.location.hash = `#/products/${serverId}`;
        return;
      }
      
      // Use a slug version of the name if we don't have an ID
      let productId = product.id || (product.name ? product.name.toLowerCase().replace(/\s+/g, '-') : id);
      
      // Check if the ID already has a client- prefix
      const hasClientPrefix = productId.toString().startsWith('client-');
      
      // Apply a prefix for clients to differentiate them in the URL, but only if it doesn't already have one
      const urlId = (product.type === 'client' && !hasClientPrefix) ? `client-${productId}` : productId;
      
      console.log(`Setting URL hash to: #/products/${urlId}`);
      window.location.hash = `#/products/${urlId}`;
    } else {
      // If we can't find the product, check the active tab and ID to determine how to handle it
      console.log(`Product not found in search results. ID: ${id}, activeTab: ${activeTab}`);
      
      const idStr = id.toString();
      
      // CASE 1: ID already starts with client- prefix
      if (idStr.startsWith('client-')) {
        // Already has prefix, use as is
        console.warn(`Product with ID ${id} not found in searchResults, using raw ID with existing prefix`);
        window.location.hash = `#/products/${id}`;
        return;
      } 
      // CASE 2: We're in the client tab, so this must be a client
      else if (activeTab === 'client') {
        // No prefix but we're in client tab, add it and use a name-based slug if possible
        console.warn(`Product with ID ${id} not found in searchResults, treating as client`);
        window.location.hash = `#/products/client-${id}`;
        return;
      }
      // CASE 3: We're in the server tab, so this must be a server
      else if (activeTab === 'server') {
        // Use ID directly for servers
        console.warn(`Product with ID ${id} not found in searchResults, treating as server`);
        window.location.hash = `#/products/${id}`;
        return;
      }
      // CASE 4: We're in 'all' or any other tab, try to infer type from ID format
      else {
        // If the ID looks like a number, it might be an index rather than an actual ID
        if (!isNaN(parseInt(id)) && String(parseInt(id)) === id) {
          console.warn(`Product with numeric ID ${id} not found in searchResults, URL may be incorrect`);
          // Just go to search page as fallback
          window.location.hash = '#/search';
          return;
        }
        
        // Default case, use as is - assume server ID
        console.warn(`Product with ID ${id} not found in searchResults, using raw ID as server`);
        window.location.hash = `#/products/${id}`;
        return;
      }
    }
  };
  
  // Handle navigation to category search
  const handleNavigateToCategory = (slug) => {
    window.location.hash = `#/search?category=${slug}`;
  };
  
  // Handle tab change with improved logging and URL updates
  const handleTabChange = (tab) => {
    console.log(`Tab change from ${activeTab} to ${tab}`);
    
    // Skip if category is attempted - it has been removed from the UI
    if (tab === 'category') {
      console.log('Categories tab has been removed from the UI');
      return;
    }
    
    setActiveTab(tab);
    
    // Update URL
    const params = getSearchParams();
    const newParams = new URLSearchParams();
    
    // Keep existing parameters except type
    if (params.query) newParams.set('q', params.query);
    if (params.category) newParams.set('category', params.category);
    if (params.minRating > 0) newParams.set('minRating', params.minRating.toString());
    if (params.official) newParams.set('official', 'true');
    
    // IMPORTANT: Use type=ai-agent explicitly instead of relying on the tab name
    // This ensures we maintain consistency with how our search works
    if (tab === 'all') {
      // For "all", don't set a type parameter
      newParams.delete('type');
    } else if (tab === 'ai-agent') {
      // Make sure we use the exact string "ai-agent" for consistency
      newParams.set('type', 'ai-agent');
    } else {
      // For server and client, use the tab name directly
      newParams.set('type', tab);
    }
    
    // Update URL without reloading page
    const baseUrl = window.location.hash.split('?')[0];
    const queryString = newParams.toString();
    const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    console.log(`Updating URL to: ${newUrl}`);
    window.location.hash = newUrl;
    
    // Force a page reload after URL update to ensure the filters are applied
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };
  
  // Render title based on search parameters
  const renderTitle = () => {
    const { query, category } = searchParams;
    
    if (category) {
      // Find the category name if we have a slug
      const categoryObj = allData.find(
        item => item.type === 'category' && item.slug === category
      );
      
      if (category === 'official') {
        return 'Official MCP Servers & Clients';
      }
      
      return categoryObj ? `${categoryObj.name} MCP Resources` : 'Category Results';
    }
    
    if (query) {
      return `Search Results for "${query}"`;
    }
    
    return 'Browse All MCP Resources';
  };
  
  // Debug information for troubleshooting
  console.log(`SearchResultsPage render: allData.length=${allData.length}, searchResults.length=${searchResults.length}, debugCounter=${debugCounter}`);
  console.log("SearchParams:", searchParams);
  console.log("First 3 allData items:", allData.slice(0, 3));
  
  // If no data loaded, show a retry button
  if (!isLoading && allData.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12 bg-zinc-800/30 rounded-lg border border-zinc-700">
          <svg className="w-20 h-20 text-purple-500/70 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Data Loading Issue</h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            We couldn't load the MCP server data. This might be a temporary issue.
          </p>
          <button 
            onClick={() => {
              setIsLoading(true);
              console.log("Manual retry initiated");
              
              // Collect data from all available sources
              const collectData = async () => {
                let combinedData = [];
                
                // Try to get servers data
                if (window.lastResortMcpServersData && Array.isArray(window.lastResortMcpServersData)) {
                  console.log(`Retry: Using last resort server data with ${window.lastResortMcpServersData.length} servers`);
                  
                  const servers = window.lastResortMcpServersData.map(server => ({
                    ...server,
                    type: 'server'
                  }));
                  
                  combinedData = [...combinedData, ...servers];
                }
                
                // Try to get AI agents data
                let aiAgentsData = [];
                try {
                  if (window.lastResortAiAgentsData && Array.isArray(window.lastResortAiAgentsData)) {
                    console.log(`Retry: Using direct reference with ${window.lastResortAiAgentsData.length} AI agents`);
                    aiAgentsData = window.lastResortAiAgentsData;
                  } else {
                    try {
                      const aiAgentsModule = await import('../ai_agents_data.json');
                      if (aiAgentsModule.default && Array.isArray(aiAgentsModule.default)) {
                        console.log(`Retry: Loaded ${aiAgentsModule.default.length} AI agents from file`);
                        aiAgentsData = aiAgentsModule.default;
                      }
                    } catch (aiAgentErr) {
                      console.warn("Retry: Failed to load AI agents data:", aiAgentErr);
                    }
                  }
                  
                  // Set AI agent type
                  aiAgentsData = aiAgentsData.map(agent => ({
                    ...agent,
                    type: 'ai-agent'
                  }));
                  
                  combinedData = [...combinedData, ...aiAgentsData];
                  console.log(`Retry: Added ${aiAgentsData.length} AI agents`);
                } catch (error) {
                  console.error("Retry: Error loading AI agents data:", error);
                }
                
                // Try loadUnifiedData as a fallback
                if (combinedData.length === 0) {
                  try {
                    const unifiedData = await loadUnifiedData();
                    if (unifiedData && Array.isArray(unifiedData) && unifiedData.length > 0) {
                      combinedData = [...combinedData, ...unifiedData];
                      console.log(`Retry: Added ${unifiedData.length} items from loadUnifiedData`);
                    }
                  } catch (err) {
                    console.error("Retry: Failed to load unified data:", err);
                  }
                }
                
                // Process and return the data
                if (combinedData.length > 0) {
                  console.log(`Retry: Total of ${combinedData.length} items collected`);
                  return deduplicateAndNormalize(combinedData);
                } else {
                  console.error("Retry: Failed to collect any data");
                  return [];
                }
              };
              
              // Run the data collection
              setTimeout(() => {
                collectData().then(processedData => {
                  setAllData(processedData);
                  setIsLoading(false);
                  console.log(`Retry complete: ${processedData.length} items ready`);
                });
              }, 500);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors duration-300 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Retry Loading Data</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 pb-20">
      {/* Modern search header styled like the main site header */}
      <ScrollReveal direction="down" threshold={0.1} once={true} duration="normal">
        <div className="rounded-xl bg-zinc-900/80 backdrop-blur-md shadow-lg border border-purple-500/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Left side - Title and search stats */}
            <div className="w-full md:w-auto">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300 mb-2">
                {renderTitle()}
              </h1>
              
              {searchParams.query && (
                <p className="text-gray-300 text-sm">
                  Showing results for "<span className="font-medium text-purple-400">{searchParams.query}</span>"
                  {searchParams.category && (
                    <> in <span className="font-medium text-purple-400">{searchParams.category.replace(/-/g, ' ')}</span></>
                  )}
                </p>
              )}
            </div>
            
            {/* Right side - Search input */}
            <div className="w-full md:w-1/2 lg:w-2/5">
              <UnifiedSearch 
                initialSearchTerm={searchParams.query || ''} 
                allData={allData} 
                position="inline"
                placeholder="Refine your search..."
              />
            </div>
          </div>
        </div>
      </ScrollReveal>
      
      {/* Results section */}
      <div className="mb-12 max-w-7xl mx-auto">
        {/* Enhanced filters and result count */}
        <ScrollReveal direction="up" threshold={0.1} once={true} duration="fast">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 shadow-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center lg:flex-1">
              {/* Result stats with visual enhancements */}
              <div className="text-sm text-gray-400 mb-4 lg:mb-0 flex items-center">
                <div className="bg-purple-600/20 text-purple-400 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                
                <div className="flex items-center flex-wrap">
                  <span className="font-medium text-white text-base">{searchResults.length}</span> 
                  <span className="ml-1 mr-3">{searchResults.length === 1 ? 'result' : 'results'} found</span>
                  
                  {/* Applied Filters Pills (moved here) */}
                  {searchParams.category && (
                    <div className="flex items-center mx-2 my-1 bg-zinc-800/70 px-3 py-1 rounded-full text-sm">
                      <span className="mr-1">Category:</span>
                      <span className="text-purple-400 font-medium">{searchParams.category.replace(/-/g, ' ')}</span>
                      <button 
                        className="ml-2 text-gray-400 hover:text-white"
                        onClick={() => {
                          const newParams = new URLSearchParams();
                          if (searchParams.query) newParams.set('q', searchParams.query);
                          if (searchParams.type !== 'all') newParams.set('type', searchParams.type);
                          window.location.hash = `#/search?${newParams.toString()}`;
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {searchParams.query && (
                    <div className="flex items-center mx-2 my-1 bg-zinc-800/70 px-3 py-1 rounded-full text-sm">
                      <span className="mr-1">Search:</span>
                      <span className="text-purple-400 font-medium">{searchParams.query}</span>
                      <button 
                        className="ml-2 text-gray-400 hover:text-white"
                        onClick={() => {
                          const newParams = new URLSearchParams();
                          if (searchParams.category) newParams.set('category', searchParams.category);
                          if (searchParams.type !== 'all') newParams.set('type', searchParams.type);
                          window.location.hash = `#/search?${newParams.toString()}`;
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Clear All button */}
                  {(searchParams.category || searchParams.query) && (
                    <button 
                      className="ml-2 text-purple-400 hover:text-purple-300 text-sm flex items-center"
                      onClick={() => {
                        window.location.hash = '#/search';
                      }}
                    >
                      <span>Clear all</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:mt-0 mt-4">
              {/* Resource type tabs with icons */}
              <div className="bg-zinc-800/80 rounded-xl p-1.5 inline-flex shadow-inner">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-1 flex items-center justify-center gap-1.5 ${
                    activeTab === 'all' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                      : 'text-gray-300 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span>All</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('server')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-1 flex items-center justify-center gap-1.5 ${
                    activeTab === 'server' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                      : 'text-gray-300 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                  <span>Servers</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('client')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-1 flex items-center justify-center gap-1.5 ${
                    activeTab === 'client' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' 
                      : 'text-gray-300 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Clients</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('ai-agent')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-1 flex items-center justify-center gap-1.5 ${
                    activeTab === 'ai-agent' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md' 
                      : 'text-gray-300 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>AI Agents</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('ready-to-use')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-1 flex items-center justify-center gap-1.5 ${
                    activeTab === 'ready-to-use' 
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md' 
                      : 'text-gray-300 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Ready to Use</span>
                </button>
                
                {/* Categories tab removed as requested */}
              </div>
              
              {/* Enhanced sort dropdown with better styling */}
              <div className="relative group min-w-[180px]">
                {/* Label above the select for better clarity */}
                <label className="block text-xs text-gray-400 mb-1 ml-1">Sort results by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full appearance-none bg-zinc-800/80 border border-zinc-700/80 group-hover:border-purple-500/50 rounded-lg text-gray-300 py-2.5 pl-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/70 transition-all duration-300 shadow-inner cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="popularity">Popularity</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="newest">Newest</option>
                </select>
                
                {/* Dropdown arrow in a more visible position */}
                <div className="absolute right-3 top-[60%] -translate-y-1/2 pointer-events-none text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
        
        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-zinc-800/70 rounded-lg h-48 animate-pulse">
                <div className="w-full h-24 bg-zinc-700/50 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-zinc-700/50 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-zinc-700/50 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Results organized by sections */}
            {searchResults.length > 0 ? (
              <>
                {/* Process results to separate categories from products and group products by type */}
                {(() => {
                  // First separate categories from products
                  const categories = searchResults.filter(item => item.type === 'category');
                  const products = searchResults.filter(item => item.type !== 'category');
                  
                  // Group products by category if we're not already filtering by category
                  let groupedProducts = [];
                  
                  if (!searchParams.category) {
                    // Create product groupings by category
                    const productsByCategory = {};
                    
                    // Group servers by category
                    products.forEach(product => {
                      const category = product.category || 'Uncategorized';
                      if (!productsByCategory[category]) {
                        productsByCategory[category] = [];
                      }
                      productsByCategory[category].push(product);
                    });
                    
                    // Convert to array of group objects
                    groupedProducts = Object.entries(productsByCategory)
                      .map(([category, items]) => ({ 
                        category, 
                        items,
                        // Get the first item's type to determine styling
                        type: items[0]?.type || 'server'
                      }))
                      .sort((a, b) => b.items.length - a.items.length); // Sort by number of items
                  }
                  
                  return (
                    <>
                      
                      {/* If we're not filtering by category, show products grouped by category */}
                      {!searchParams.category && groupedProducts.length > 0 ? (
                        // Show products grouped by category
                        groupedProducts.map((group, groupIndex) => (
                          <div key={`group-${group.category}`} className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-2xl font-bold text-white flex items-center">
                                <span className={`w-3 h-3 rounded-full mr-2 ${
                                  group.type === 'server' ? 'bg-purple-500' : 'bg-blue-500'
                                }`}></span>
                                {group.category}
                              </h2>
                              <a 
                                href={`#/search?type=all&category=${encodeURIComponent(group.category.toLowerCase().replace(/\s+/g, '-'))}`}
                                className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // Use the category slug for filtering
                                  const categorySlug = group.category.toLowerCase().replace(/\s+/g, '-');
                                  window.location.hash = `#/search?type=all&category=${encodeURIComponent(categorySlug)}`;
                                }}
                              >
                                View all
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </a>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                              {group.items.slice(0, 12).map((product, index) => (
                                <ScrollReveal 
                                  key={`product-${product.id || product.name}`} 
                                  direction="up" 
                                  threshold={0.1}
                                  delay={50 + (index % 12) * 25} 
                                  once={true}
                                >
                                  <ProductCard 
                                    product={product} 
                                    onNavigate={handleNavigateToDetail}
                                    key={product.id || Math.random()}
                                  />
                                </ScrollReveal>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Show flat list of products when filtering by category
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                          {products.map((product, index) => (
                            <ScrollReveal 
                              key={`product-${product.id || product.name}`} 
                              direction="up" 
                              threshold={0.1}
                              delay={50 + (index % 12) * 25} 
                              once={true}
                            >
                              <ProductCard 
                                product={product} 
                                onNavigate={handleNavigateToDetail}
                                key={product.id || Math.random()}
                              />
                            </ScrollReveal>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            ) : (
              // No results
              <div className="mb-6">
                <div className="text-center py-10 bg-zinc-800/30 rounded-lg border border-zinc-700 mb-8">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400 text-xl mb-4">No exact matches found for your criteria.</p>
                  
                  {/* Show the current search parameters for debugging */}
                  {searchParams.category && (
                    <p className="text-sm text-gray-500 mb-3">
                      Category filter: <span className="text-purple-400">{searchParams.category}</span>
                    </p>
                  )}
                  
                  <button 
                    onClick={() => window.location.hash = '#/search'}
                    className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-300 inline-block"
                  >
                    Clear filters and view all resources
                  </button>
                </div>
                
                {/* EMERGENCY FALLBACK - Always show some relevant servers for categories */}
                {searchParams.category && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Suggested resources for {searchParams.category.replace(/-/g, ' ')}
                    </h2>
                    
                    {/* Grid with 3-6 relevant items based on category */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {/* Database fallbacks */}
                      {searchParams.category === 'databases-and-storage' && (
                        <>
                          <ScrollReveal direction="up" threshold={0.1} delay={50} once={true}>
                            <ProductCard 
                              product={{
                                name: "ClickHouse",
                                description: "Fast open-source column-oriented database management system",
                                type: "server",
                                category: "Databases",
                                stars_numeric: 31256
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                          <ScrollReveal direction="up" threshold={0.1} delay={100} once={true}>
                            <ProductCard 
                              product={{
                                name: "Postgres MCP",
                                description: "PostgreSQL database connector for MCP protocol",
                                type: "server",
                                category: "Database",
                                stars_numeric: 15893
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                          <ScrollReveal direction="up" threshold={0.1} delay={150} once={true}>
                            <ProductCard 
                              product={{
                                name: "Redis MCP",
                                description: "In-memory database connector for MCP",
                                type: "server",
                                category: "In-Memory DB",
                                stars_numeric: 22478
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                        </>
                      )}
                      
                      {/* Web & Search fallbacks */}
                      {searchParams.category === 'web-and-search' && (
                        <>
                          <ScrollReveal direction="up" threshold={0.1} delay={50} once={true}>
                            <ProductCard 
                              product={{
                                name: "Web Fetcher",
                                description: "Fast MCP server for web content retrieval",
                                type: "server",
                                category: "Web",
                                stars_numeric: 18723
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                          <ScrollReveal direction="up" threshold={0.1} delay={100} once={true}>
                            <ProductCard 
                              product={{
                                name: "Search API",
                                description: "Connect to search engines via MCP",
                                type: "server",
                                category: "Search",
                                stars_numeric: 14256
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                        </>
                      )}
                      
                      {/* Desktop Applications fallbacks */}
                      {searchParams.category === 'desktop-applications' && (
                        <>
                          <ScrollReveal direction="up" threshold={0.1} delay={50} once={true}>
                            <ProductCard 
                              product={{
                                name: "Claude Desktop",
                                description: "Official desktop application for Claude with MCP server integration",
                                type: "client",
                                category: "Desktop Applications",
                                stars_numeric: 8750,
                                official: true
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                          <ScrollReveal direction="up" threshold={0.1} delay={100} once={true}>
                            <ProductCard 
                              product={{
                                name: "5ire",
                                description: "Cross-platform desktop AI assistant compatible with major service providers",
                                type: "client",
                                category: "Desktop Applications",
                                stars_numeric: 2825
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                          <ScrollReveal direction="up" threshold={0.1} delay={150} once={true}>
                            <ProductCard 
                              product={{
                                name: "eechat",
                                description: "Open-source desktop application with full MCP support",
                                type: "client",
                                category: "Desktop Applications",
                                stars_numeric: 3250
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                        </>
                      )}
                      
                      {/* Code Editors fallbacks */}
                      {searchParams.category === 'code-editors' && (
                        <>
                          <ScrollReveal direction="up" threshold={0.1} delay={50} once={true}>
                            <ProductCard 
                              product={{
                                name: "Cursor",
                                description: "AI-first code editor fork of VS Code with built-in chat and MCP support",
                                type: "client",
                                category: "Code Editors",
                                stars_numeric: 19850
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                          <ScrollReveal direction="up" threshold={0.1} delay={100} once={true}>
                            <ProductCard 
                              product={{
                                name: "Zed",
                                description: "High-performance, multiplayer code editor with MCP integration",
                                type: "client",
                                category: "Code Editors",
                                stars_numeric: 28760
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                        </>
                      )}
                      
                      {/* Default fallbacks for other categories */}
                      {!['databases-and-storage', 'web-and-search', 'desktop-applications', 'code-editors', 
                         'cli-tools', 'ide-extensions', 'browser-extensions', 'messaging-integrations', 
                         'ai-workflow-tools', 'web-applications', 'libraries'].includes(searchParams.category) && (
                        <>
                          <ScrollReveal direction="up" threshold={0.1} delay={50} once={true}>
                            <ProductCard 
                              product={{
                                name: `${searchParams.category.split('-')[0]} MCP ${searchParams.type === 'client' ? 'Client' : 'Server'}`,
                                description: `${searchParams.type === 'client' ? 'Client' : 'Server'} for ${searchParams.category.replace(/-/g, ' ')}`,
                                type: searchParams.type || "server",
                                category: searchParams.category.replace(/-/g, ' '),
                                stars_numeric: 12345
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                          <ScrollReveal direction="up" threshold={0.1} delay={100} once={true}>
                            <ProductCard 
                              product={{
                                name: `${searchParams.category.split('-')[0]} ${searchParams.type === 'client' ? 'Integration' : 'Connector'}`,
                                description: `Connect to ${searchParams.category.replace(/-/g, ' ')} services`,
                                type: searchParams.type || "server",
                                category: searchParams.category.replace(/-/g, ' '),
                                stars_numeric: 8765
                              }} 
                              onNavigate={() => {}}
                            />
                          </ScrollReveal>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Related searches section */}
      {searchResults.length > 0 && searchParams.query && (
        <ScrollReveal direction="up" threshold={0.1} once={true} delay={200} duration="normal">
          <div className="mb-16 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Related Searches</h2>
            <div className="flex flex-wrap gap-3">
              {/* Generate some related search terms based on the current search */}
              {[
                `${searchParams.query} tutorial`,
                `official ${searchParams.query}`,
                `${searchParams.query} alternative`,
                `best ${searchParams.query}`,
                `${searchParams.query} integration`,
                `${searchParams.query} examples`
              ].map(term => (
                <a 
                  key={term}
                  href={`#/search?q=${encodeURIComponent(term)}`}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-gray-300 hover:text-white transition-colors duration-200 text-sm border border-zinc-700 hover:border-purple-500/30"
                >
                  {term}
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
      
      {/* Quick tips section */}
      <ScrollReveal direction="up" threshold={0.1} once={true} delay={300} duration="normal">
        <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-6 mt-8 max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Search Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800/70 rounded p-3 border border-zinc-700">
              <h3 className="font-medium text-purple-400 mb-1">Use Categories</h3>
              <p className="text-sm text-gray-400">Browse resources by category to find similar tools quickly.</p>
            </div>
            <div className="bg-zinc-800/70 rounded p-3 border border-zinc-700">
              <h3 className="font-medium text-purple-400 mb-1">Keyword Search</h3>
              <p className="text-sm text-gray-400">Try specific and general terms to find the perfect MCP resource.</p>
            </div>
            <div className="bg-zinc-800/70 rounded p-3 border border-zinc-700">
              <h3 className="font-medium text-purple-400 mb-1">Compare Resources</h3>
              <p className="text-sm text-gray-400">Use the comparison feature to evaluate multiple MCP servers or clients.</p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default SearchResultsPage;