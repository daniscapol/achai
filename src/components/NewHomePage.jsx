import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { validateArticle, getExampleArticles } from '../utils/newsUtilities';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import FeaturedCarousel from './FeaturedCarousel';

// Try to import GSAP if available, for more advanced animations
let gsap;
try {
  gsap = require('gsap');
} catch (e) {
  // GSAP is optional, will fallback to framer-motion
  console.warn('GSAP not available, using framer-motion for all animations');
}

// Simple performance utilities
const debounce = (fn, wait = 100) => {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
};

const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const shouldReduceAnimations = () => {
  return prefersReducedMotion();
};

const deferOperation = (fn, delay = 500) => {
  if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
      setTimeout(fn, delay);
    } else {
      window.addEventListener('load', () => setTimeout(fn, delay));
    }
  }
};

import { 
  ScrollReveal, 
  ParallaxEffect, 
  EnhancedButton,
  TypeWriter,
  SkeletonLoader,
  DynamicHeroSection,
  FeaturedSection,
  NewsSection,
  TutorialsSection,
  AnimatedCounter,
  PremiumWordCycler,
  GradientText,
  SlideInStagger,
  ShimmerEffect,
  ParticleOverlay,
  MeshGradient,
  HoverSpotlight,
  TextReveal
} from './animations';

// Helper function to get category gradient
const getCategoryGradient = (category) => {
  switch(category) {
    case 'Model Releases':
      return 'from-purple-600 to-indigo-600';
    case 'Research Papers':
      return 'from-blue-600 to-cyan-600';
    case 'Business':
      return 'from-amber-500 to-orange-600';
    case 'Ethics & Safety':
      return 'from-green-600 to-emerald-600';
    case 'Applications':
      return 'from-indigo-600 to-blue-600';
    case 'Generative AI':
      return 'from-pink-500 to-rose-600';
    case 'Open Source':
      return 'from-purple-600 to-fuchsia-600';
    case 'Developer Tools':
      return 'from-amber-500 to-orange-600';
    case 'Web Integration':
      return 'from-blue-500 to-sky-600';
    case 'Document Processing':
      return 'from-emerald-500 to-green-600';
    case 'Workflow Automation':
      return 'from-indigo-500 to-purple-600';
    case 'AI Development':
      return 'from-violet-600 to-purple-600';
    case 'AI Applications':
      return 'from-rose-600 to-pink-600';
    case 'Research & Knowledge':
      return 'from-blue-600 to-indigo-600';
    default:
      return 'from-slate-600 to-gray-600';
  }
};

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
    // Add more icons as needed
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.25 3.25h6.5a2 2 0 012 2v13.5a2 2 0 01-2 2h-6.5a2 2 0 01-2-2V5.25a2 2 0 012-2z" />
        </svg>
      );
  }
};

// Premium feature card with hover effects
const PremiumFeatureCard = ({ title, description, icon, gradient = 'from-purple-600 to-indigo-500', onClick }) => {
  const cardRef = useRef(null);
  
  // Create 3D hover effect
  const handleMouseMove = (e) => {
    if (!cardRef.current || prefersReducedMotion()) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };
  
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    cardRef.current.style.transition = 'transform 0.5s ease';
  };
  
  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl overflow-hidden backdrop-blur-sm bg-white/[0.03] border border-white/10 shadow-xl group"
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Gradient border glow effect */}
      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} blur-lg`}></div>
      </div>
      
      <div className="p-6 h-full flex flex-col">
        <div className={`w-12 h-12 mb-5 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          {renderIcon(icon, 'medium')}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-300 transition-all duration-300">{title}</h3>
        <p className="text-zinc-400 text-sm mb-6">{description}</p>
        
        <div className="mt-auto flex items-center text-sm font-medium text-indigo-300 group-hover:text-indigo-200 transition-colors duration-300">
          <span>Explore</span>
          <svg 
            className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </div>
      </div>
      
      {/* Decorative dot grid pattern */}
      <div className="absolute top-0 right-0 h-24 w-24 opacity-10">
        <div className="grid grid-cols-6 grid-rows-6 gap-1">
          {[...Array(36)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-white"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// News card component with modern design
const NewsCard = ({ article }) => {
  if (!article) return null;
  
  const validatedArticle = validateArticle(article);
  const { title, summary, date, source, image_icon, image_color, category, full_article_url } = validatedArticle;
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div className="group relative rounded-2xl overflow-hidden backdrop-blur-sm bg-white/[0.03] border border-white/10 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Card header with gradient background */}
      <div className={`h-32 ${image_color || 'bg-gradient-to-br from-purple-600 to-indigo-700'} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
        </div>
        <div className="text-white transform group-hover:scale-110 transition-transform duration-500">
          {renderIcon(image_icon || getCategoryIcon(category), 'large')}
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Category badge */}
        {category && (
          <div className="mb-3">
            <span className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-full font-medium">
              {category}
            </span>
          </div>
        )}
        
        {/* Article title */}
        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-300 transition-all duration-300">{title}</h3>
        
        {/* Article summary */}
        <p className="text-zinc-400 text-sm mb-6 line-clamp-3">{summary}</p>
        
        {/* Card footer */}
        <div className="mt-auto flex justify-between items-center text-xs text-zinc-500">
          <span>{source}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
      
      {/* Read more button */}
      <div className="px-6 py-4">
        <a 
          href={full_article_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full py-2 text-center bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors duration-300 border border-white/10 group-hover:border-purple-500/30"
        >
          Read more
        </a>
      </div>
    </div>
  );
};

// Tutorial card component with modern design
const TutorialCard = ({ tutorial, onNavigate }) => {
  return (
    <div className="group relative rounded-2xl overflow-hidden backdrop-blur-sm bg-white/[0.03] border border-white/10 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Tutorial header/image section */}
      <div className="relative h-40 overflow-hidden">
        {tutorial.image_url ? (
          <img 
            src={tutorial.image_url} 
            alt={tutorial.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{tutorial.title.charAt(0)}</span>
          </div>
        )}
        
        {/* Provider badge */}
        <div className="absolute top-4 right-4">
          <div className="px-2.5 py-1 bg-black/40 rounded-full text-xs font-medium backdrop-blur-sm text-white">
            {tutorial.provider || 'AchaAI'}
          </div>
        </div>
      </div>
      
      {/* Metadata badges */}
      <div className="flex px-6 pt-6 gap-2">
        <span className="px-2.5 py-1 bg-purple-500/10 rounded-full text-xs text-purple-300 font-medium">
          {tutorial.level || 'Beginner'}
        </span>
        <span className="px-2.5 py-1 bg-indigo-500/10 rounded-full text-xs text-indigo-300 font-medium">
          {tutorial.duration || '30 min'}
        </span>
      </div>
      
      {/* Tutorial content */}
      <div className="px-6 pt-3 pb-6 flex-grow">
        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-300 transition-all duration-300">{tutorial.title}</h3>
        <p className="text-zinc-400 text-sm">{tutorial.description}</p>
      </div>
      
      {/* Tutorial footer */}
      <div className="px-6 py-4 mt-auto">
        <button 
          onClick={onNavigate}
          className="block w-full py-2 text-center bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors duration-300 border border-white/10 group-hover:border-purple-500/30"
        >
          <span className="flex items-center justify-center">
            View Tutorial
            <svg 
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

// Category card for marketplace
const CategoryCard = ({ title, icon, description, gradient = 'from-purple-600 to-indigo-500', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden backdrop-blur-sm bg-white/[0.03] border border-white/10 shadow-md hover:shadow-xl transition-all duration-300 h-full cursor-pointer"
    >
      <div className="p-6 h-full flex flex-col">
        <div className={`w-12 h-12 mb-5 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          {renderIcon(icon, 'medium')}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-300 transition-all duration-300">{title}</h3>
        <p className="text-zinc-400 text-sm mb-6">{description}</p>
        
        <div className="mt-auto flex items-center text-sm font-medium text-indigo-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span>View Servers</span>
          <svg 
            className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </div>
      </div>
      
      {/* Gradient background on hover */}
      <div className="absolute inset-0 -z-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      </div>
    </div>
  );
};

// Enhanced animated stat counter component with improved animation
const StatCounter = ({ value, label, gradient = 'from-purple-400 to-indigo-300', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const counterRef = useRef(null);
  
  // Reset counter on page refresh
  useEffect(() => {
    setDisplayValue(0);
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          setTimeout(() => {
            // Start the animation from 0
            setDisplayValue(0);
            
            // Animate with easing for more premium feel
            const startTime = performance.now();
            const duration = 2500; // Slightly longer for dramatic effect
            
            // Create an easeOutExpo function for smoother counting
            const easeOutExpo = (t) => {
              return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            };
            
            const step = (timestamp) => {
              const elapsed = timestamp - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Apply easing for more natural counting acceleration
              const easedProgress = easeOutExpo(progress);
              setDisplayValue(Math.floor(easedProgress * value));
              
              if (progress < 1) {
                window.requestAnimationFrame(step);
              }
            };
            
            window.requestAnimationFrame(step);
          }, delay);
          
          // Only trigger once
          observer.unobserve(counterRef.current);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );
    
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    
    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [value, delay, hasStarted]);
  
  return (
    <div ref={counterRef} className="flex flex-col group text-center relative">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/10 group-hover:to-indigo-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700"></div>
      
      {/* Counter value with gradient text */}
      <span className={`text-4xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r ${gradient} relative z-10`}>
        {displayValue}+
      </span>
      
      {/* Label with subtle hover effect */}
      <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300 relative z-10">{label}</span>
      
      {/* Animated underline on hover */}
      <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-purple-500/50 to-indigo-500/50 mx-auto mt-2 transition-all duration-500 rounded-full relative z-10"></div>
    </div>
  );
};

// Main component
const NewHomePage = ({ 
  featuredProducts, 
  onNavigateToList, 
  onNavigateToDetail, 
  onNavigateToCategories,
  onNavigateToConnectToClaude,
  onNavigateToWhatIsMcp,
  onNavigateTutorials,
  onNavigateNews 
}) => {
  const [latestNews, setLatestNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  
  // Track scroll position for parallax effects - use debounced handler for performance
  useEffect(() => {
    const handleScroll = debounce(() => {
      setScrollY(window.scrollY);
    }, 10); // Small debounce for smoother performance
    
    window.addEventListener('scroll', handleScroll, { passive: true }); // passive listener for better scrolling performance
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fetch latest news articles - defer non-critical data loading
  useEffect(() => {
    // Defer news loading until after main content renders
    deferOperation(() => {
      const fetchNews = async () => {
        try {
          setIsLoading(true);
          const articles = getExampleArticles();
          setLatestNews(articles.slice(0, 3));
        } catch (error) {
          console.error('Error fetching news:', error);
          setLatestNews([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchNews();
    }, 300); // Short delay to prioritize main content rendering
  }, []);
  
  // Sample tutorials data - memoized to prevent unnecessary re-renders
  const tutorialsData = useMemo(() => [
    {
      id: 'getting-started-mcp',
      title: 'Getting Started with MCP Servers',
      description: 'Learn how to set up your first MCP server and connect it to Claude for enhanced capabilities.',
      level: 'Beginner',
      duration: '15 min',
      gradient: 'from-purple-500 to-indigo-600',
      icon: 'brain'
    },
    {
      id: 'building-custom-mcp',
      title: 'Building a Custom MCP Server',
      description: 'Create your own MCP server from scratch to integrate specific tools or data sources with Claude.',
      level: 'Advanced',
      duration: '45 min',
      gradient: 'from-blue-500 to-cyan-600',
      icon: 'code'
    },
    {
      id: 'mcp-security-best-practices',
      title: 'MCP Security Best Practices',
      description: 'Learn how to secure your MCP servers and protect sensitive data when using external tools.',
      level: 'Intermediate',
      duration: '30 min',
      gradient: 'from-green-500 to-emerald-600',
      icon: 'shield-check'
    }
  ], []);
  
  // Marketplace categories - memoized to prevent unnecessary re-renders
  const categories = useMemo(() => [
    {
      title: 'AI Development',
      icon: 'brain',
      description: 'Tools for building and training AI models with Claude',
      gradient: 'from-purple-600 to-indigo-600'
    },
    {
      title: 'Developer Tools',
      icon: 'code',
      description: 'Coding assistants and development environments for AI',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Research Tools',
      icon: 'flask-vial',
      description: 'Data analysis and academic research assistance',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Generative AI',
      icon: 'image',
      description: 'Image, audio, and video generation tools',
      gradient: 'from-pink-500 to-rose-600'
    }
  ], []);
  
  return (
    <div className="relative bg-slate-950 text-white">
      {/* Dynamic Hero Section with vibrant animations */}
      <DynamicHeroSection 
        onExplore={onNavigateToList}
        onLearnMore={onNavigateToWhatIsMcp}
      />
      
      {/* Featured Products Section with dynamic animations */}
      <FeaturedSection
        title="Featured Servers"
        description="Discover the most popular MCP servers to extend Claude's capabilities"
        featuredProducts={featuredProducts.slice(0, 6).map(product => ({
          ...product,
          icon: getCategoryIcon(product.category, 'medium'),
          gradient: getCategoryGradient(product.category),
          tags: [product.category, ...(product.tags || [])]
        }))}
        onViewAll={onNavigateToList}
        onProductSelect={(product) => onNavigateToDetail(product.id)}
      />
      {/* Latest News Section with animations */}
      <NewsSection
        title="Latest News"
        description="Stay updated with the latest developments in AI and LLMs"
        newsArticles={latestNews}
        onViewAll={onNavigateNews}
        onArticleSelect={(article) => {
          // Handle article selection
          console.log("Selected article:", article);
          // Navigate to article detail page if needed
        }}
      />
          
          {/* Add subtle animated accent */}
          {!shouldReduceAnimations() && (
            <>
              <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-600/5 blur-3xl animate-pulse-glow" style={{animationDuration: '15s'}}></div>
              <div className="absolute bottom-0 right-10 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-3xl animate-pulse-glow" style={{animationDuration: '20s', animationDelay: '2s'}}></div>
            </>
          )}
          
          {/* Decorative grid overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-4">
            <ScrollReveal>
              <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-3">
                Marketplace
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Featured Servers
                </span>
              </h2>
              <p className="text-zinc-400 mt-2 max-w-md">
                Discover the most popular MCP servers to extend Claude's capabilities
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <EnhancedButton 
                onClick={onNavigateToList} 
                variant="ghost" 
                size="sm"
                className="px-6 py-2.5 border border-white/10 hover:border-white/20 transition-all duration-300 rounded-lg group"
              >
                <span className="flex items-center">
                  View All
                  <svg 
                    className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
              </EnhancedButton>
            </ScrollReveal>
          </div>
          
          {featuredProducts && featuredProducts.length > 0 && (
            <ScrollReveal>
              <FeaturedCarousel 
                products={featuredProducts} 
                onProductClick={onNavigateToDetail}
              />
            </ScrollReveal>
          )}
        </div>
      </section>
      
      {/* Main Marketplace Categories */}
      <section className="relative py-20 bg-gradient-to-b from-slate-950 to-slate-950/95">
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm font-medium mb-4">
                Explore by Category
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  MCP Server Categories
                </span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Find the perfect MCP servers to extend Claude's capabilities across different domains and use cases.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <ScrollReveal key={category.title} delay={100 * index}>
                <CategoryCard 
                  title={category.title}
                  icon={category.icon}
                  description={category.description}
                  gradient={category.gradient}
                  onClick={() => onNavigateToList(category.title)}
                />
              </ScrollReveal>
            ))}
          </div>
          
          <ScrollReveal delay={500}>
            <div className="mt-12 text-center">
              <EnhancedButton 
                onClick={onNavigateToCategories} 
                variant="secondary" 
                size="lg"
              >
                View All Categories
              </EnhancedButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* How It Works Section with Visual Diagram */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950 to-slate-950/95"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm font-medium mb-4">
                How MCP Works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Supercharge Claude with MCP
                </span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                MCP (Model Context Protocol) servers provide a standardized way for Claude to communicate with external tools and data sources.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="relative max-w-5xl mx-auto rounded-2xl backdrop-blur-sm bg-white/[0.03] border border-white/10 p-8 overflow-hidden hover:border-purple-500/20 transition-all duration-500 group">
            {/* Interactive diagram showing MCP architecture */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-12 py-12">
              {/* Claude */}
              <div className="flex flex-col items-center transition-all duration-500 transform group-hover:scale-105">
                <div className="w-28 h-28 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-purple-600/10 transition-all duration-500 group-hover:shadow-purple-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Claude</span>
                <span className="text-sm text-zinc-400 mt-1">AI Assistant</span>
              </div>
              
              {/* Animated connection arrows */}
              <div className="hidden md:flex flex-col items-center">
                <div className="relative">
                  <motion.svg 
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-24 text-purple-500"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500/50 animate-ping-slow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="relative mt-3">
                  <motion.svg 
                    animate={{ x: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-24 text-indigo-500"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </motion.svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/50 animate-ping-slow opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDelay: '0.5s'}}></div>
                </div>
              </div>
              
              {/* Mobile view arrows */}
              <div className="flex md:hidden gap-4">
                <motion.svg 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-24 w-6 text-purple-500 rotate-90"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
                <motion.svg 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-24 w-6 text-indigo-500 rotate-90"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </motion.svg>
              </div>
              
              {/* MCP Server */}
              <div className="flex flex-col items-center transition-all duration-500 transform group-hover:scale-105">
                <div className="w-28 h-28 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-600/10 transition-all duration-500 group-hover:shadow-indigo-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">MCP Server</span>
                <span className="text-sm text-zinc-400 mt-1">Connector</span>
              </div>
              
              {/* Animated connection arrows */}
              <div className="hidden md:flex flex-col items-center">
                <div className="relative">
                  <motion.svg 
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.25 }}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-24 text-blue-500"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500/50 animate-ping-slow opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDelay: '0.75s'}}></div>
                </div>
                <div className="relative mt-3">
                  <motion.svg 
                    animate={{ x: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.75 }}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-24 text-cyan-500"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </motion.svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500/50 animate-ping-slow opacity-0 group-hover:opacity-100 transition-opacity" style={{animationDelay: '1.25s'}}></div>
                </div>
              </div>
              
              {/* Mobile view arrows */}
              <div className="flex md:hidden gap-4">
                <motion.svg 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.25 }}
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-24 w-6 text-blue-500 rotate-90"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
                <motion.svg 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.75 }}
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-24 w-6 text-cyan-500 rotate-90"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </motion.svg>
              </div>
              
              {/* External Systems */}
              <div className="flex flex-col items-center transition-all duration-500 transform group-hover:scale-105">
                <div className="w-28 h-28 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-cyan-600/10 transition-all duration-500 group-hover:shadow-cyan-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">External Systems</span>
                <span className="text-sm text-zinc-400 mt-1">Database, API, Files...</span>
              </div>
            </div>
            
            {/* Information cards describing the process */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="rounded-xl p-5 bg-white/5 border border-white/10">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 mr-3">1</div>
                  <h4 className="font-bold text-white">Connect to Claude</h4>
                </div>
                <p className="text-sm text-zinc-400">
                  Install and configure MCP servers with Claude Code for seamless integration with your AI workflows.
                </p>
              </div>
              
              <div className="rounded-xl p-5 bg-white/5 border border-white/10">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 mr-3">2</div>
                  <h4 className="font-bold text-white">Access External Data</h4>
                </div>
                <p className="text-sm text-zinc-400">
                  MCP servers allow Claude to securely access databases, APIs, and file systems without exposing sensitive data.
                </p>
              </div>
              
              <div className="rounded-xl p-5 bg-white/5 border border-white/10">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 mr-3">3</div>
                  <h4 className="font-bold text-white">Enhance AI Capabilities</h4>
                </div>
                <p className="text-sm text-zinc-400">
                  Create more powerful applications by combining Claude's intelligence with specialized external tools and services.
                </p>
              </div>
            </div>
            
            {/* Interactive background elements */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-600/5 to-transparent"></div>
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            </div>
          </div>
          
          <ScrollReveal delay={300}>
            <div className="mt-12 text-center">
              <EnhancedButton 
                onClick={onNavigateToWhatIsMcp} 
                variant="ghost" 
                size="lg"
              >
                Learn More About MCP
                <svg 
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </EnhancedButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Latest News Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950 to-slate-950/95"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Latest News
                </span>
              </h2>
              
              <EnhancedButton 
                onClick={onNavigateNews} 
                variant="ghost" 
                size="sm"
              >
                View All News
                <svg 
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </EnhancedButton>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((article, index) => (
              <ScrollReveal key={article.id || index} delay={100 * index}>
                <NewsCard article={article} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      
      {/* Tutorials Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950 to-slate-950/95"></div>
          <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Learn with Tutorials
                </span>
              </h2>
              
              <EnhancedButton 
                onClick={onNavigateTutorials} 
                variant="ghost" 
                size="sm"
              >
                View All Tutorials
                <svg 
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </EnhancedButton>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tutorialsData.map((tutorial, index) => (
              <ScrollReveal key={tutorial.id} delay={100 * index}>
                <TutorialCard 
                  tutorial={tutorial} 
                  onNavigate={() => onNavigateTutorials(tutorial.id)}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      
      {/* Quick Access Feature Cards */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950 to-slate-950/95"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm font-medium mb-4">
                Quick Access
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Get Started Quickly
                </span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Everything you need to extend your AI capabilities with MCP servers.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={100}>
              <PremiumFeatureCard 
                icon="document"
                title="Documentation"
                description="Learn about MCP, from basic concepts to advanced usage patterns and security best practices."
                gradient="from-purple-600 to-indigo-600"
                onClick={onNavigateToWhatIsMcp}
              />
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <PremiumFeatureCard 
                icon="code"
                title="Connect to Claude"
                description="Step-by-step guide to connecting your chosen MCP servers to Claude in minutes."
                gradient="from-indigo-600 to-blue-600"
                onClick={onNavigateToConnectToClaude}
              />
            </ScrollReveal>
            
            <ScrollReveal delay={300}>
              <PremiumFeatureCard 
                icon="flask-vial"
                title="Submit Your Server"
                description="Share your MCP server with the community and help others enhance their AI capabilities."
                gradient="from-blue-600 to-cyan-600"
                onClick={() => window.location.href = "#/submit"}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>
      
      {/* Call to Action with premium 3D effect */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 to-slate-950"></div>
          
          {/* Enhanced radial gradient for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,40,200,0.15),transparent_70%)]"></div>
          
          {/* Subtle particle effect for premium look */}
          {!shouldReduceAnimations() && (
            <>
              <div className="absolute top-20 left-[20%] w-2 h-2 rounded-full bg-purple-400/30 animate-ping-slow" style={{animationDuration: '3s'}}></div>
              <div className="absolute bottom-40 right-[30%] w-2 h-2 rounded-full bg-indigo-400/30 animate-ping-slow" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 left-[80%] w-1.5 h-1.5 rounded-full bg-blue-400/30 animate-ping-slow" style={{animationDuration: '3.5s', animationDelay: '0.5s'}}></div>
              
              {/* Large glowing orbs in background */}
              <div className="absolute -top-40 left-[50%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-3xl animate-pulse-glow" style={{animationDuration: '10s'}}></div>
              <div className="absolute -bottom-60 left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl animate-pulse-glow" style={{animationDuration: '15s', animationDelay: '2s'}}></div>
            </>
          )}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="relative">
            {/* Decorative elements */}
            {!shouldReduceAnimations() && (
              <>
                <div className="absolute -top-10 left-[10%] w-20 h-20 border border-white/10 rounded-lg rotate-12 opacity-20"></div>
                <div className="absolute -bottom-5 right-[15%] w-16 h-16 border border-white/10 rounded-lg -rotate-6 opacity-20"></div>
                <div className="absolute top-10 right-[20%] w-5 h-5 bg-white/5 rounded-full blur-sm"></div>
              </>
            )}
            
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-300 text-sm font-medium mb-6">
                  Get Started Today - TEST CHANGE
                </span>
                
                {/* Simple CSS animation test that doesn't rely on framer-motion */}
                <div className="animate-bounce bg-purple-500 p-4 w-64 mx-auto mb-4 rounded-lg text-white font-bold">
                  This should bounce with CSS animation!
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 animate-text-gradient">
                    Ready to {" "}
                    {!shouldReduceAnimations() ? (
                      <TypeWriter 
                        texts={[
                          "supercharge",
                          "transform",
                          "elevate",
                          "revolutionize",
                          "enhance"
                        ]}
                        typingSpeed={50}
                        deletingSpeed={30}
                        delayAfterType={1500} 
                        delayAfterDelete={300}
                      />
                    ) : (
                      "supercharge"
                    )} 
                    {" "}your AI experience?
                  </span>
                </h2>
                
                <p className="text-lg text-zinc-400 mb-10">
                  Join thousands of AI professionals and enthusiasts who are building 
                  the future with MCP servers.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <EnhancedButton 
                    onClick={onNavigateToList} 
                    variant="primary" 
                    size="xl"
                    className="relative px-8 min-w-[200px] group overflow-hidden"
                  >
                    {/* Animated glow effect on hover */}
                    {!shouldReduceAnimations() && (
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600/0 to-indigo-600/0 group-hover:from-purple-600/20 group-hover:to-indigo-600/20 transition-all duration-700"></span>
                    )}
                    
                    <span className="relative z-10 flex items-center">
                      Browse Solutions
                      <svg 
                        className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </span>
                  </EnhancedButton>
                  
                  <EnhancedButton 
                    onClick={onNavigateToConnectToClaude} 
                    variant="secondary" 
                    size="xl"
                    className="relative px-8 min-w-[200px] group overflow-hidden border border-purple-500/30"
                  >
                    {/* Shine effect on hover */}
                    {!shouldReduceAnimations() && (
                      <span className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-all duration-1000 ease-in-out"></span>
                    )}
                    
                    <span className="relative z-10">Connect to Claude</span>
                  </EnhancedButton>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewHomePage;