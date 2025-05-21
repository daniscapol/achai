import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { 
  DynamicHeroSection,
  FeaturedSection
} from './animations';
// Import AboutUsSection separately to optimize loading
import AboutUsSection from './animations/AboutUsSection';
// Import product data files
import { readyToUseProducts, excludeFromReadyToUse } from '../utils/readyToUseData';
import { mcpClientProducts } from '../utils/mcpClientsData';
import { aiAgentProducts } from '../utils/aiAgentsData';

/**
 * ModernHomePage - A completely revamped homepage with premium animations
 * Incorporates consistent styling throughout all sections
 */
const ModernHomePage = ({ 
  featuredProducts, 
  onNavigateToList, 
  onNavigateToDetail, 
  onNavigateToCategories,
  onNavigateToConnectToClaude,
  onNavigateToWhatIsMcp
}) => {
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  
  // Initialization effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppInitialized(true);
    }, 300); // Delay app initialization by 300ms
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  // Helper function to get theme icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Model Releases':
        return '🧠';
      case 'Research Papers':
        return '🔬';
      case 'Business':
        return '💼';
      case 'Ethics & Safety':
        return '🛡️';
      case 'Applications':
        return '📱';
      case 'Generative AI':
        return '🎨';
      case 'Open Source':
        return '📂';
      case 'Developer Tools':
        return '🔧';
      case 'Web Integration':
        return '🌐';
      case 'Document Processing':
        return '📄';
      case 'Workflow Automation':
        return '⚙️';
      case 'AI Development':
        return '💻';
      case 'AI Applications':
        return '🤖';
      case 'Research & Knowledge':
        return '📚';
      default:
        return '📦';
    }
  };
  
  // Combine featuredProducts with our specific products from each category
  const combinedProducts = [
    ...featuredProducts,
    ...readyToUseProducts,
    ...mcpClientProducts,
    ...aiAgentProducts
  ];
  
  // Add category type based on product properties with fallback rules to ensure coverage
  const categorizedProducts = combinedProducts.map((product, index) => {
    let categoryType = 'other';
    
    // If product already has a categoryType, use it
    if (product.categoryType) {
      categoryType = product.categoryType;
    }
    // If product has a type that matches our categories, use it
    else if (product.type === 'ready-to-use' || product.type === 'mcp-client' || 
             product.type === 'mcp-server' || product.type === 'ai-agent') {
      categoryType = product.type;
    }
    // Otherwise determine category type based on properties
    else if (product.isReadyToUse) {
      categoryType = 'ready-to-use';
    } else if (product.isMcpClient) {
      categoryType = 'mcp-client';
    } else if (product.isMcpServer) {
      categoryType = 'mcp-server';
    } else if (product.isAiAgent) {
      categoryType = 'ai-agent';
    } else {
      // Fallback categorization - if we don't have specific flags, use name, category, and description
      // to make educated guesses
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const tags = (product.tags || []).map(t => t.toLowerCase());
      
      // Check for Ready to Use solutions, but exclude specific products like Ollama
      const isExcluded = excludeFromReadyToUse.some(exclude => 
        name.includes(exclude.toLowerCase())
      );
      
      if (!isExcluded && (
          name.includes('ready') || description.includes('ready to use') || 
          tags.includes('ready-to-use') || category.includes('saas')
         )) {
        categoryType = 'ready-to-use';
      }
      // Check for MCP clients
      else if (name.includes('client') || name.includes('cli') || 
               description.includes('client') || tags.includes('client') ||
               name.includes('app') || name.includes('plugin') || 
               name.includes('extension') || name.includes('desktop')) {
        categoryType = 'mcp-client';
      }
      // Check for MCP servers
      else if (name.includes('server') || name.includes('api') ||
               description.includes('server') || tags.includes('server') ||
               category.includes('database') || category.includes('processing')) {
        categoryType = 'mcp-server';
      }
      // Check for AI agents
      else if (name.includes('agent') || name.includes('bot') ||
               description.includes('agent') || tags.includes('agent') ||
               description.includes('autonomous') || category.includes('agent')) {
        categoryType = 'ai-agent';
      }
      // Force some balance based on index if still categorized as 'other'
      else if (categoryType === 'other') {
        // Distribute remaining products evenly across categories to ensure balance
        const forcedCategories = ['ready-to-use', 'mcp-client', 'mcp-server', 'ai-agent'];
        categoryType = forcedCategories[index % 4];
      }
    }
    
    return {
      ...product,
      categoryType,
      icon: getCategoryIcon(product.category),
      gradient: getCategoryGradient(product.category),
      tags: [product.category, ...(product.tags || [])]
    };
  });
  
  // Function to get exactly 3 products per category, with specific priorities
  const getExactProductMix = () => {
    // Group by category type
    const groupedProducts = categorizedProducts.reduce((acc, product) => {
      const type = product.categoryType || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(product);
      return acc;
    }, {});
    
    // The exact categories we want to display, in order
    const mainCategories = [
      'ready-to-use',
      'mcp-client',
      'mcp-server', 
      'ai-agent'
    ];
    
    // Result will hold exactly 3 products from each category
    let result = [];
    
    // Process each category
    mainCategories.forEach(category => {
      let productsForCategory = [];
      
      // Special handling for specific categories
      if (category === 'mcp-client') {
        // Ensure Claude Desktop is first
        const claudeDesktop = categorizedProducts.find(p => 
          p.id === 'claude-desktop' || (p.name && p.name.includes('Claude Desktop'))
        );
        
        if (claudeDesktop) {
          productsForCategory.push(claudeDesktop);
        }
        
        // Add other client products if available
        if (groupedProducts['mcp-client'] && groupedProducts['mcp-client'].length > 0) {
          const otherClients = groupedProducts['mcp-client'].filter(p => 
            p.id !== 'claude-desktop' && (!p.name || !p.name.includes('Claude Desktop'))
          );
          
          // Add up to 2 more clients
          productsForCategory = [...productsForCategory, ...otherClients.slice(0, 3 - productsForCategory.length)];
        }
      } 
      else if (category === 'ai-agent') {
        // Ensure CrewAI is first
        const crewAI = categorizedProducts.find(p => 
          p.id === 'crewai' || (p.name && p.name.includes('CrewAI'))
        );
        
        if (crewAI) {
          productsForCategory.push(crewAI);
        }
        
        // Add other AI Agent products if available
        if (groupedProducts['ai-agent'] && groupedProducts['ai-agent'].length > 0) {
          const otherAgents = groupedProducts['ai-agent'].filter(p => 
            p.id !== 'crewai' && (!p.name || !p.name.includes('CrewAI'))
          );
          
          // Add up to 2 more agents
          productsForCategory = [...productsForCategory, ...otherAgents.slice(0, 3 - productsForCategory.length)];
        }
      }
      // Handle other categories normally
      else if (groupedProducts[category] && groupedProducts[category].length > 0) {
        // Take up to 3 products for other categories
        productsForCategory = groupedProducts[category].slice(0, 3);
      }
      
      // If we have fewer than 3 products, fill with placeholders
      while (productsForCategory.length < 3) {
        // Find a product to convert to this category
        const placeholderSource = categorizedProducts.find(p => 
          !result.includes(p) && !productsForCategory.includes(p)
        ) || categorizedProducts[0];
        
        if (placeholderSource) {
          const placeholder = {
            ...placeholderSource,
            categoryType: category,
            // Add a note to the name to indicate it's been recategorized
            name: `${placeholderSource.name} (${category.replace(/-/g, ' ')})`
          };
          
          productsForCategory.push(placeholder);
        }
      }
      
      // Ensure we take exactly 3 products
      result = [...result, ...productsForCategory.slice(0, 3)];
    });
    
    return result;
  };
  
  return (
    <div className="relative bg-slate-950 text-white">
      {/* Hero Section with dynamic animations */}
      <DynamicHeroSection 
        onExplore={onNavigateToCategories}
        onLearnMore={onNavigateToWhatIsMcp}
      />
      
      {/* About Us Section */}
      <AboutUsSection onExploreCategories={onNavigateToCategories} />
      
      {/* Featured Products Section - Only render when app is initialized */}
      {isAppInitialized && (
        <FeaturedSection
          title="Explore All AI Solution Types"
          description="From ready-to-use tools to MCP servers, clients, and autonomous AI agents - find the perfect solution for your needs"
          featuredProducts={getExactProductMix()}
          onViewAll={onNavigateToList}
          onProductSelect={(product) => onNavigateToDetail(product.id)}
        />
      )}
      
      {/* Final Call-to-Action Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-purple-900/20"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-gradient-radial from-purple-600/10 to-transparent blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-gradient-radial from-indigo-600/10 to-transparent blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
              Ready to supercharge your AI workflows?
            </span>
          </h2>
          
          <p className="text-xl text-purple-100/80 max-w-3xl mx-auto mb-10">
            Discover AchAI solutions and unlock the full potential of your Claude experience.
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <button
              onClick={onNavigateToCategories}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-bold text-lg relative overflow-hidden group animate-bounce-button"
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-[45deg] -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000"></div>
              <span className="relative z-10">Get Started Today</span>
            </button>
            
            <a
              href="#/about"
              className="px-8 py-4 bg-white/5 border border-purple-500/30 backdrop-blur-md rounded-lg text-white font-bold text-lg hover:bg-white/10 transition-colors duration-300 inline-flex items-center"
            >
              <span className="mr-2">About AchAI</span>
              <span className="text-lg">🌟</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernHomePage;