import React, { useState, useEffect } from 'react';
import { validateArticle, getExampleArticles } from '../utils/newsUtilities';
import FeaturedCarousel from './FeaturedCarousel';
import { 
  ScrollReveal, 
  ParallaxEffect, 
  EnhancedButton,
  prefersReducedMotion,
  TypeWriter
} from './animations';

// This is an example implementation showing the TypeWriter component
// integrated into the HomePage component. You can use this as a reference
// for how to implement TypeWriter in the real HomePage.

// ...existing imports and helper functions remain unchanged...

// Helper function to get theme icon based on category
const getCategoryIcon = (category) => {
  // ... existing code ...
};

// Helper to render various icon types
const renderIcon = (name, size = 'small') => {
  // ... existing code ...
};

// Featured card for the documentation section
const FeatureCard = ({ icon, title, description, href, color }) => {
  // ... existing code ...
};

// News card component for latest articles
const NewsCard = ({ article }) => {
  // ... existing code ...
};

// Testimonial card component
const TestimonialCard = ({ name, role, quote, image, rating = 5 }) => {
  // ... existing code ...
};

const HomePageWithTypeWriter = ({ 
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
  
  // Sample tutorials data (replace with actual data in a real implementation)
  const tutorialsData = [
    // ... existing code ...
  ];
  
  // Fetch latest news articles on component mount
  useEffect(() => {
    // ... existing code ...
  }, []);
  
  // Group products by categories for category sections
  const getProductsByCategory = () => {
    // ... existing code ...
  };
  
  const productsByCategory = getProductsByCategory();
  const topCategories = Object.keys(productsByCategory).slice(0, 3);
  
  // Tutorial card component
  const TutorialCard = ({ tutorial }) => {
    // ... existing code ...
  };
  
  return (
    <div className="container mx-auto p-4">
      {/* Hero Section with enhanced colors and animations */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        {/* Enhanced animated mesh gradient background with more dynamic elements */}
        <div className="absolute inset-0 -z-10 bg-zinc-900 overflow-hidden">
          {/* ... existing background elements ... */}
        </div>
        
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <ScrollReveal direction="down" once={true}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tighter">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                MCP Marketplace
              </span>
            </h1>
            
            {/* TypeWriter component replaces static paragraph */}
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
          
          {/* Animated stats with highlights */}
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
      
      {/* Featured Carousel */}
      {/* ... existing code ... */}
      
      {/* Documentation & Connect Section */}
      {/* ... existing code ... */}
      
      {/* Popular Categories Section */}
      <section className="py-10">
        <ScrollReveal direction="up" once={true} delay={200}>
          <div className="mb-8 flex justify-between items-center">
            {/* TypeWriter integration for category headings */}
            <h2 className="text-3xl font-bold text-white min-w-[220px]">
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
          
          {/* ... remaining code unchanged ... */}
        </ScrollReveal>
      </section>
      
      {/* ... remaining sections unchanged ... */}
    </div>
  );
};

export default HomePageWithTypeWriter;