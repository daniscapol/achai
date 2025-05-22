import React from 'react';
import { ParallaxEffect } from './index';

/**
 * EnhancedCard component - a styled card with optional hover effects
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {boolean} props.interactive - Whether the card should have hover effects
 * @param {string} props.className - Additional CSS classes
 */
const EnhancedCard = ({
  children,
  interactive = true,
  className = '',
  ...props
}) => {
  // Render with parallax effect if interactive
  if (interactive) {
    return (
      <ParallaxEffect 
        depth={2} 
        glare={true}
        className={`bg-zinc-800 rounded-lg border border-zinc-700 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/10 overflow-hidden transition-all duration-300 ${className}`}
        {...props}
      >
        {children}
      </ParallaxEffect>
    );
  }
  
  // Static version without interactivity
  return (
    <div 
      className={`bg-zinc-800 rounded-lg border border-zinc-700 shadow-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * EnhancedProductCard - A specialized card for product listings
 * 
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.interactive - Whether the card should have hover effects
 * @param {string} props.className - Additional CSS classes
 */
export const EnhancedProductCard = ({
  product,
  onClick,
  interactive = true,
  className = '',
  featured = false,
  ...props
}) => {
  if (!product) return null;
  
  const { 
    name, 
    description, 
    image_url, 
    category, 
    stars, 
    official, 
    product_type 
  } = product;
  
  // Get badge data based on product_type
  const getBadgeInfo = () => {
    switch (product_type) {
      case 'mcp_server':
      case 'server':
        return { color: 'bg-purple-500', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', label: 'MCP Server' };
      case 'mcp_client':
      case 'client':
        return { color: 'bg-blue-500', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'MCP Client' };
      case 'ai_agent':
      case 'ai-agent':
        return { color: 'bg-green-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'AI Agent' };
      case 'ready_to_use':
      case 'ready-to-use':
        return { color: 'bg-amber-500', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', label: 'Ready to Use' };
      default:
        return { color: 'bg-gray-500', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'MCP' };
    }
  };
  
  const badge = getBadgeInfo();
  
  // Netflix-style card content
  const cardContent = (
    <>
      {/* Product image with gradient overlay */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10"></div>
        
        {/* Featured top banner */}
        {featured && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-purple-600 to-blue-600 text-xs font-bold text-white py-1 px-3 shadow-lg">
            Featured
          </div>
        )}
        
        {/* Product type badge */}
        <div className="absolute top-3 right-3 z-20">
          <div className={`${badge.color} flex items-center rounded-full px-1.5 py-0.5 text-white text-xs font-medium`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
            </svg>
            <span>{badge.label}</span>
          </div>
        </div>
        
        {/* Official badge if applicable */}
        {official && (
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-green-600 rounded-full px-1.5 py-0.5 text-white text-xs font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04C2.131 12.332 2 13.15 2 14c0 4.562 2.722 8.45 7.06 10.514C10.927 25.504 12 24.508 12 23.382c0 1.126 1.073 2.122 2.94 1.132C19.278 22.45 22 18.562 22 14c0-.85-.13-1.668-.382-3.016z" />
              </svg>
              <span>Official</span>
            </div>
          </div>
        )}
        
        <div className="h-48 bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center overflow-hidden">
          {image_url ? (
            <div className="w-full h-full">
              <img 
                src={image_url} 
                alt={name} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          ) : (
            <div className="text-purple-400 transform group-hover:scale-110 transition-transform duration-300">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-20 w-20" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d={badge.icon}
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Product content */}
      <div className="p-4 relative z-20">
        {/* Category badge */}
        {category && (
          <div className="inline-flex text-xs font-medium bg-purple-800/50 text-purple-300 px-2 py-0.5 rounded-md mb-2">
            {category}
          </div>
        )}
        
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors duration-300">
          {name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {description || 'No description available.'}
        </p>
        
        {/* Metadata */}
        <div className="flex items-center justify-between text-sm mt-auto">
          {/* Star count */}
          <div className="flex items-center text-yellow-500 font-medium">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="font-semibold">{stars ? stars.toLocaleString() : '–'}</span>
          </div>
          
          {/* Detail link button - Netflix-style */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-flex items-center justify-center text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-full transition-colors duration-300">
              View details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </>
  );
  
  // Wrap in a container for better animation control
  return (
    <div className="transform transition-all duration-300 hover:scale-[1.03] hover:z-10 relative group">
      <EnhancedCard 
        interactive={interactive}
        className={`cursor-pointer h-full relative overflow-hidden ${className}`}
        onClick={onClick}
        {...props}
      >
        {cardContent}
      </EnhancedCard>
    </div>
  );
};

export default EnhancedCard;