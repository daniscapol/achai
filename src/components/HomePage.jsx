import React, { useState, useEffect, useRef } from 'react';
import FeaturedCarousel from './FeaturedCarousel';
import { 
  ScrollReveal, 
  ParallaxEffect, 
  EnhancedButton,
  prefersReducedMotion,
  TypeWriter
} from './animations';

// Helper function to get theme icon based on category
const getCategoryIcon = (category) => {
  switch(category) {
    case 'Model Releases':
      return 'brain';
    case 'Research Papers':
      return 'flask-vial';
    case 'Business':
      return 'briefcase';
    case 'Ethics & Safety':
      return 'shield-check';
    case 'Applications':
      return 'app-window';
    case 'Generative AI':
      return 'image';
    case 'Open Source':
      return 'code-branch';
    case 'Developer Tools':
      return 'code';
    case 'Web Integration':
      return 'globe';
    case 'Document Processing':
      return 'file-lines';
    case 'Workflow Automation':
      return 'gears';
    case 'AI Development':
      return 'microchip';
    case 'AI Applications':
      return 'robot';
    case 'Research & Knowledge':
      return 'book';
    case 'Web Scraping & Data Collection':
      return 'spider-web';
    default:
      return 'circle-nodes';
  }
};

// Helper to render various icon types
const renderIcon = (name, size = 'small') => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const iconClass = sizeClasses[size] || sizeClasses.small;
  
  // Common icons used throughout the site
  switch(name) {
    case 'brain':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'code':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case 'flask-vial':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      );
    case 'document':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case 'globe':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    case 'code-branch':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 22v-4a4.8 4.8 0 00-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 004 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    case 'thumbs-up':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
        </svg>
      );
    case 'image':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.25 3.25h6.5a2 2 0 012 2v13.5a2 2 0 01-2 2h-6.5a2 2 0 01-2-2V5.25a2 2 0 012-2z" />
        </svg>
      );
  }
};

// 3D rotating card component with animation
const RotatingCard = ({ title, description, icon, color = 'from-purple-600 to-indigo-700', onClick }) => {
  const cardRef = useRef(null);
  
  // Mouse move handler for 3D effect
  const handleMouseMove = (e) => {
    if (!cardRef.current || prefersReducedMotion()) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.transition = 'none';
  };
  
  // Reset rotation on mouse leave
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    cardRef.current.style.transition = 'transform 0.5s ease';
  };
  
  return (
    <div 
      ref={cardRef}
      className="relative h-full bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 shadow-lg transition-all duration-300 cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Gradient top bar */}
      <div className={`h-2 w-full bg-gradient-to-r ${color}`}></div>
      
      {/* Content */}
      <div className="p-6">
        <div className={`w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}>
          {renderIcon(icon, 'medium')}
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm">{description}</p>
        
        {/* Interactive hover effect */}
        <div className="mt-6 text-purple-400 flex items-center font-medium">
          Explore
          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        
        {/* Floating glow effect */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
      </div>
      
      {/* Interactive hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

// Featured card for the documentation section with interactive elements
const FeatureCard = ({ icon, title, description, href, color }) => {
  return (
    <a 
      href={href} 
      className="group block h-full transition-all duration-500 hover:scale-105"
    >
      <div className={`${color} rounded-xl p-px h-full shadow-xl hover:shadow-2xl transition-all duration-300`}>
        <div className="bg-zinc-900 rounded-xl p-6 h-full flex flex-col relative overflow-hidden">
          {/* Icon with animation */}
          <div className="text-white mb-4 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            {renderIcon(icon, 'medium')}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 relative z-10">{title}</h3>
          <p className="text-zinc-400 flex-grow mb-4 relative z-10">{description}</p>
          
          {/* Animated button effect */}
          <div className="text-purple-400 flex items-center mt-auto font-medium relative z-10 group-hover:text-purple-300 transition-colors duration-300">
            <span className="relative">
              Learn more
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
            </span>
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          {/* Background glow effect */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </a>
  );
};

// News card component for latest articles
const NewsCard = ({ article }) => {
  if (!article) return null;
  
  // Process article data to ensure valid URLs
  const validatedArticle = validateArticle(article);
  const { title, summary, date, source, image_icon, image_color, category, full_article_url } = validatedArticle;
  
  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div className="bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-700 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col shadow-md hover:shadow-xl">
      {/* Card header with gradient background */}
      <div className={`h-28 ${image_color || 'bg-gradient-to-br from-purple-600 to-indigo-700'} flex items-center justify-center`}>
        <div className="text-white transform hover:scale-110 transition-transform duration-300">
          {renderIcon(image_icon || getCategoryIcon(category), 'large')}
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category badge */}
        {category && (
          <div className="mb-2">
            <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full">
              {category}
            </span>
          </div>
        )}
        
        {/* Article title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{title}</h3>
        
        {/* Article summary */}
        <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{summary}</p>
        
        {/* Card footer */}
        <div className="mt-auto flex justify-between items-center text-xs text-zinc-500">
          <span>{source}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
      
      {/* Read more button */}
      <div className="p-4 pt-0">
        <a 
          href={full_article_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full py-2 text-center bg-zinc-700 hover:bg-purple-600 text-white rounded-lg transition-colors duration-300"
        >
          Read more
        </a>
      </div>
    </div>
  );
};

// Testimonial card component with enhanced interactivity
const TestimonialCard = ({ name, role, quote, image, rating = 5 }) => {
  const cardRef = useRef(null);
  
  return (
    <div 
      ref={cardRef}
      className="group bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 transform group-hover:scale-110 transition-transform duration-300">
          {image || name.charAt(0) + (name.split(' ')[1]?.charAt(0) || '')}
        </div>
        <div>
          <h4 className="text-white font-medium">{name}</h4>
          <p className="text-gray-400 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-gray-300 italic relative z-10">{quote}</p>
      
      <div className="flex mt-4 relative z-10">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-zinc-600'} transition-colors duration-300 hover:text-yellow-300`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      
      {/* Animated background glow */}
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

// Interactive Category Card
const CategoryCard = ({ title, icon, description, color, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group rounded-lg overflow-hidden border border-zinc-700 hover:border-purple-500/50 transition-all duration-300 h-full relative cursor-pointer bg-zinc-900"
    >
      <div className={`h-2 w-full bg-gradient-to-r ${color}`}></div>
      <div className="p-6">
        <div className={`text-${color.split('-')[1].split(' ')[0]} mb-4 transform group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3`}>
          {renderIcon(icon, 'medium')}
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
        <div className="mt-4 text-purple-400 opacity-0 group-hover:opacity-100 flex items-center font-medium transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          View Servers
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

const HomePage = ({ 
  featuredProducts, 
  onNavigateToList, 
  onNavigateToDetail, 
  onNavigateToCategories,
  onNavigateToConnectToClaude,
  onNavigateToWhatIsMcp,
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  
  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  
  // Group products by categories for category sections
  const getProductsByCategory = () => {
    if (!featuredProducts || featuredProducts.length === 0) return {};
    
    const categories = {};
    featuredProducts.forEach(product => {
      const category = product.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(product);
    });
    
    return categories;
  };
  
  const productsByCategory = getProductsByCategory();
  const topCategories = Object.keys(productsByCategory).slice(0, 3);
  
  
  // Categories for interactive section
  const categories = [
    {
      title: 'AI Development',
      icon: 'brain',
      description: 'Tools for building and training AI models with Claude',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Developer Tools',
      icon: 'code',
      description: 'Coding assistants and development environments for AI',
      color: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Research Tools',
      icon: 'flask-vial',
      description: 'Data analysis and academic research assistance',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Generative AI',
      icon: 'image',
      description: 'Image, audio, and video generation tools',
      color: 'from-pink-500 to-rose-600'
    }
  ];
  
  return (
    <div className="container mx-auto p-4">
      {/* Hero Section with enhanced animations and interactivity */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        {/* Enhanced animated mesh gradient background with dynamic elements */}
        <div className="absolute inset-0 -z-10 bg-zinc-900 overflow-hidden">
          {/* Base gradient layers with parallax effect */}
          <div 
            className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(120,40,200,0.15),transparent_50%)] animate-pulse-glow" 
            style={{
              animationDuration: '10s',
              transform: `translateY(${scrollY * 0.05}px)`
            }}
          ></div>
          <div 
            className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(70,100,245,0.2),transparent_50%)] animate-pulse-glow" 
            style={{
              animationDuration: '15s', 
              animationDelay: '2s',
              transform: `translateY(${scrollY * -0.03}px)`
            }}
          ></div>
          <div 
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.1),transparent_60%)] animate-pulse-glow" 
            style={{
              animationDuration: '12s', 
              animationDelay: '1s',
              transform: `translateY(${scrollY * 0.02}px)`
            }}
          ></div>
          
          {/* Background grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5"></div>
          
          {/* Animated particles */}
          <div className="absolute top-10 left-[10%] w-2 h-2 rounded-full bg-purple-400/70 animate-ping" style={{animationDuration: '3s', animationDelay: '0.2s'}}></div>
          <div className="absolute top-1/4 left-[80%] w-3 h-3 rounded-full bg-blue-400/70 animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
          <div className="absolute top-3/4 left-[20%] w-2 h-2 rounded-full bg-indigo-400/70 animate-ping" style={{animationDuration: '5s', animationDelay: '0.5s'}}></div>
          <div className="absolute top-1/3 left-[50%] w-1.5 h-1.5 rounded-full bg-pink-400/70 animate-ping" style={{animationDuration: '2.5s', animationDelay: '1.5s'}}></div>
          <div className="absolute top-2/3 left-[90%] w-2 h-2 rounded-full bg-teal-400/70 animate-ping" style={{animationDuration: '4.5s', animationDelay: '0.7s'}}></div>
          <div className="absolute top-1/2 left-[30%] w-2.5 h-2.5 rounded-full bg-indigo-300/70 animate-ping" style={{animationDuration: '6s', animationDelay: '3s'}}></div>
          <div className="absolute top-1/5 left-[65%] w-1.5 h-1.5 rounded-full bg-blue-300/70 animate-ping" style={{animationDuration: '3.5s', animationDelay: '1.2s'}}></div>
          
          {/* Floating particle trails - using pseudo-elements for trailing effect */}
          <div className="absolute top-[15%] left-[25%] w-3 h-3">
            <div className="absolute w-full h-full rounded-full bg-purple-500/30 animate-float" style={{animationDuration: '8s'}}>
              <div className="absolute inset-0 rounded-full bg-purple-400/20 blur-md transform scale-[1.6] animate-pulse-glow" style={{animationDuration: '3s'}}></div>
            </div>
          </div>
          <div className="absolute top-[65%] left-[75%] w-3 h-3">
            <div className="absolute w-full h-full rounded-full bg-blue-500/30 animate-float" style={{animationDuration: '10s', animationDelay: '2s'}}>
              <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-md transform scale-[1.6] animate-pulse-glow" style={{animationDuration: '4s'}}></div>
            </div>
          </div>
          
          {/* Glowing orbs with enhanced animations */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl animate-pulse-glow" style={{animationDuration: '7s'}}></div>
          <div className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] rounded-full bg-indigo-600/10 blur-3xl animate-pulse-glow" style={{animationDuration: '8s', animationDelay: '2s'}}></div>
          <div className="absolute top-2/3 left-2/3 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse-glow" style={{animationDuration: '9s', animationDelay: '1s'}}></div>
          
          {/* Morphing animated shape - gives an organic, flowing feel */}
          <div className="absolute top-[10%] left-[15%] w-64 h-64 opacity-10 animate-morph" 
               style={{
                 background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.3), rgba(67, 56, 202, 0.1) 50%, transparent 70%)',
                 borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%',
               }}>
          </div>
          
          {/* Gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <ScrollReveal direction="down" once={true}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tighter">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                MCP Marketplace
              </span>
            </h1>
            
            {/* TypeWriter component for interactive text */}
            <div className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 min-h-[80px] flex items-center justify-center">
              <TypeWriter 
                texts={[
                  "Find the perfect MCP servers to enhance Claude's capabilities.",
                  "Extend your AI workflows with powerful tools and data sources.",
                  "Connect Claude to databases, APIs, and specialized services.",
                  "Discover new capabilities for your AI applications."
                ]}
                typingSpeed={70}
                deletingSpeed={30}
                delayAfterType={2000} 
                delayAfterDelete={500}
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <EnhancedButton 
                onClick={onNavigateToList} 
                variant="primary" 
                size="lg"
                className="min-w-[180px]"
              >
                Browse Solutions
              </EnhancedButton>
              <EnhancedButton 
                onClick={onNavigateToWhatIsMcp} 
                variant="secondary" 
                size="lg"
                className="min-w-[180px]"
              >
                Learn About MCP
              </EnhancedButton>
            </div>
          </ScrollReveal>
          
          {/* Animated stats with enhanced hover effects */}
          <ScrollReveal direction="up" delay={600} once={true}>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-center">
              <ParallaxEffect depth={1}>
                <div className="flex flex-col group">
                  <span className="text-3xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors duration-300">30+</span>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">MCP Servers</span>
                  <div className="h-1 w-0 group-hover:w-full bg-purple-500/50 mx-auto mt-1 transition-all duration-300 rounded-full"></div>
                </div>
              </ParallaxEffect>
              <ParallaxEffect depth={1}>
                <div className="flex flex-col group">
                  <span className="text-3xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors duration-300">20+</span>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Tutorials</span>
                  <div className="h-1 w-0 group-hover:w-full bg-indigo-500/50 mx-auto mt-1 transition-all duration-300 rounded-full"></div>
                </div>
              </ParallaxEffect>
              <ParallaxEffect depth={1}>
                <div className="flex flex-col group">
                  <span className="text-3xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors duration-300">10+</span>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Categories</span>
                  <div className="h-1 w-0 group-hover:w-full bg-blue-500/50 mx-auto mt-1 transition-all duration-300 rounded-full"></div>
                </div>
              </ParallaxEffect>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Featured Carousel with enhanced animation */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-10">
          <ScrollReveal direction="up" once={true}>
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">Featured Servers</h2>
              <EnhancedButton 
                onClick={onNavigateToList} 
                variant="ghost" 
                size="sm"
              >
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </EnhancedButton>
            </div>
            <FeaturedCarousel 
              products={featuredProducts} 
              onProductClick={onNavigateToDetail}
            />
          </ScrollReveal>
        </section>
      )}
      
      {/* Documentation & Connect Section with enhanced cards */}
      <section className="py-10">
        <ScrollReveal direction="up" once={true} delay={200}>
          <h2 className="text-3xl font-bold text-white mb-8">Get Started Quickly</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon="document"
              title="Documentation"
              description="Learn everything about MCP, from basic concepts to advanced usage patterns and security best practices."
              href="#/what-is-an-mcp-server"
              color="bg-gradient-to-br from-purple-600 to-purple-700"
            />
            <FeatureCard 
              icon="brain"
              title="Connect to Claude"
              description="Step-by-step guide to connecting your chosen MCP servers to Claude in just a few minutes."
              href="#/connect-to-claude"
              color="bg-gradient-to-br from-indigo-600 to-indigo-700"
            />
          </div>
        </ScrollReveal>
      </section>
      
      {/* Popular Categories Section with TypeWriter */}
      <section className="py-10">
        <ScrollReveal direction="up" once={true} delay={200}>
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white min-w-[220px] flex items-center">
              <TypeWriter 
                texts={[
                  "Popular Categories",
                  "Trending Tools",
                  "Discover Servers",
                  "AI Extensions"
                ]}
                typingSpeed={70}
                deletingSpeed={40}
                delayAfterType={3000}
                delayAfterDelete={700}
              />
            </h2>
            <EnhancedButton 
              onClick={onNavigateToCategories} 
              variant="ghost" 
              size="sm"
            >
              View All Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </EnhancedButton>
          </div>
          
          {/* Interactive category cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <ScrollReveal key={category.title} direction="up" delay={200 + (index * 50)} once={true}>
                <CategoryCard 
                  title={category.title}
                  icon={category.icon}
                  description={category.description}
                  color={category.color}
                  onClick={() => onNavigateToList(category.title)}
                />
              </ScrollReveal>
            ))}
          </div>
          
          {/* Server Category Sections with interactive cards */}
          {topCategories.length > 0 && (
            <div className="mt-20">
              {topCategories.map((category, index) => (
                <ScrollReveal key={category} direction="up" delay={300 + (index * 100)} once={true}>
                  <div className="mb-16">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-white">{category}</h2>
                      <EnhancedButton 
                        onClick={() => onNavigateToList(category)} 
                        variant="ghost" 
                        size="sm"
                      >
                        View All in {category}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </EnhancedButton>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {productsByCategory[category].slice(0, 3).map(product => (
                        <ScrollReveal key={product.id} direction="up" delay={300} once={true}>
                          <RotatingCard
                            title={product.name}
                            description={product.shortDescription || product.description}
                            icon={getCategoryIcon(product.category)}
                            onClick={() => onNavigateToDetail(product.id)}
                          />
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </ScrollReveal>
      </section>
      
      
      {/* Technical Diagram with interactive elements */}
      <section className="py-10">
        <ScrollReveal direction="up" once={true} delay={200}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">How MCP Servers Work</h2>
            <p className="text-lg text-gray-400 mb-8">MCP servers provide a standardized interface for Claude to communicate with external tools and data sources</p>
          </div>
          
          <div className="relative rounded-xl bg-zinc-800/50 border border-zinc-700 p-8 overflow-hidden hover:border-purple-500/30 transition-all duration-300 group">
            {/* Simple diagram showing MCP architecture with animations */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-8 py-8">
              {/* Claude */}
              <div className="flex flex-col items-center transition-all duration-500 transform group-hover:scale-105">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-600/10 transition-all duration-500 group-hover:shadow-purple-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">Claude</span>
              </div>
              
              {/* Animated arrows with pulse effect */}
              <div className="hidden md:flex flex-col items-center">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-16 text-purple-500 animate-pulse-glow" style={{animationDuration: '4s'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500/50 animate-ping-slow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="relative mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-16 text-indigo-500 animate-pulse-glow" style={{animationDuration: '4s', animationDelay: '1s'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/50 animate-ping-slow opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDelay: '0.5s'}}></div>
                </div>
              </div>
              
              {/* Mobile arrows */}
              <div className="flex md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-6 text-purple-500 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-6 text-indigo-500 ml-2 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              </div>
              
              {/* MCP Server */}
              <div className="flex flex-col items-center transition-all duration-500 transform group-hover:scale-105">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/10 transition-all duration-500 group-hover:shadow-indigo-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">MCP Server</span>
              </div>
              
              {/* Animated arrows with pulse effect */}
              <div className="hidden md:flex flex-col items-center">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-16 text-blue-500 animate-pulse-glow" style={{animationDuration: '4s', animationDelay: '0.5s'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500/50 animate-ping-slow opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDelay: '1s'}}></div>
                </div>
                <div className="relative mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-16 text-cyan-500 animate-pulse-glow" style={{animationDuration: '4s', animationDelay: '1.5s'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/50 animate-ping-slow opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDelay: '1.5s'}}></div>
                </div>
              </div>
              
              {/* Mobile arrows */}
              <div className="flex md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-6 text-blue-500 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-6 text-cyan-500 ml-2 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              </div>
              
              {/* External Tools */}
              <div className="flex flex-col items-center transition-all duration-500 transform group-hover:scale-105">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-600/10 transition-all duration-500 group-hover:shadow-cyan-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">External Tools</span>
              </div>
            </div>
            
            {/* Connection lines with animation */}
            <svg className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#6366F1" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse-glow" style={{animationDuration: '5s'}} />
              <rect x="10" y="110" width="80" height="80" fill="none" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse-glow" style={{animationDuration: '6s', animationDelay: '0.5s'}} />
              <rect x="10" y="210" width="80" height="80" fill="none" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse-glow" style={{animationDuration: '7s', animationDelay: '1s'}} />
              <line x1="50" y1="10" x2="50" y2="290" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse-glow" style={{animationDuration: '8s', animationDelay: '1.5s'}} />
            </svg>
            
            {/* Interactive hover elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-indigo-500/0 hover:from-purple-500/5 hover:to-indigo-500/5 transition-colors duration-500"></div>
          </div>
        </ScrollReveal>
      </section>
      
      {/* Call to Action */}
      <section className="py-10">
        <ScrollReveal direction="up" once={true} delay={200}>
          <div className="text-center pb-12 border-t border-zinc-800 pt-12">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to supercharge your AI experience?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of AI professionals and enthusiasts who are building the future with AchaAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#/connect-to-claude" className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-md text-lg font-semibold shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center justify-center relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Connect to Claude
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <span className="absolute bottom-0 left-0 h-1 bg-white/20 w-0 group-hover:w-full transition-all duration-700"></span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600/0 to-indigo-600/0 group-hover:from-purple-600/10 group-hover:to-indigo-600/10 transition-colors duration-300"></span>
              </a>
              <a href="#/submit" className="group px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-lg font-semibold shadow-lg border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 relative overflow-hidden">
                <span className="relative z-10">Submit Your MCP Server</span>
                <span className="absolute inset-0 w-0 h-full bg-gradient-to-r from-purple-600/10 to-indigo-600/10 group-hover:w-full transition-all duration-500"></span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default HomePage;