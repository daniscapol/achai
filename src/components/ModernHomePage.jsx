import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DynamicHeroSection,
  FeaturedSection
} from './animations';
// Import AboutUsSection separately to optimize loading
import AboutUsSection from './animations/AboutUsSection';
// Import client data
import mcpClientsData from '../mcp_clients_data.json';
// AI agents will be loaded from database API
// Product data comes from window.mcpServersDirectData (same source as ProductDetailTech)

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
  const { t, i18n } = useTranslation();
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [aiAgentsData, setAiAgentsData] = useState([]);
  
  // Debug: Component lifecycle logging
  useEffect(() => {
    console.log('🟢 ModernHomePage MOUNTED');
    return () => {
      console.log('🔴 ModernHomePage UNMOUNTED');
    };
  }, []);

  // Language monitoring disabled to reduce console noise
  // useEffect(() => {
  //   console.log('ModernHomePage: Language loaded:', i18n.language, 'Title:', t('homepage.featured.title'));
  // }, [i18n.language, t]);
  
  // Load AI agents from database
  useEffect(() => {
    const loadAiAgents = async () => {
      try {
        const response = await fetch('/api/products/type/ai_agent?limit=20');
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          setAiAgentsData(data.products);
        }
      } catch (error) {
        console.error('Failed to load AI agents:', error);
        setAiAgentsData([]); // Fallback to empty array
      }
    };
    
    loadAiAgents();
  }, []);
  
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
  
  // Use the same data source as ProductDetailTech for consistency
  const globalProducts = window.mcpServersDirectData || [];
  
  // Add client data with proper type mapping and image URLs
  const clientProducts = mcpClientsData.map(client => {
    let imageUrl = null;
    
    // Map client names to their logo images
    const imageMap = {
      'MCP CLI Client': '/assets/client-logos/mcp-cli-client.png',
      'Claude Desktop': '/assets/client-logos/claude-desktop.png',
      'VSCode MCP Extension': '/assets/client-logos/vscode.png',
      'Continue': '/assets/client-logos/continue.svg',
      'Cursor': '/assets/client-logos/cursor.png',
      'Zed': '/assets/client-logos/zed.png',
      'ChatMCP': '/assets/client-logos/chatmcp.png',
      'SeekChat': '/assets/client-logos/seekchat.png',
      'HyperChat': '/assets/client-logos/hyperchat.png',
      'MindPal': '/assets/client-logos/mindpal.png',
      'Claude CLI': '/assets/client-logos/claude-cli.png',
      'Claude SDK': '/assets/client-logos/sdk.png'
    };
    
    imageUrl = imageMap[client.name] || null;
    
    return {
      ...client,
      product_type: 'mcp_client',
      type: 'client',
      image_url: imageUrl,
      imageUrl: imageUrl
    };
  });
  
  // Add AI agents data with proper type mapping
  const agentProducts = aiAgentsData.map(agent => ({
    ...agent,
    product_type: 'ai_agent',
    type: 'agent',
    // Ensure agents have the required properties for navigation
    categoryType: 'ai-agent'
  }));

  // Combine featuredProducts with global products data, clients, and agents
  const combinedProducts = [
    ...featuredProducts,
    ...globalProducts,
    ...clientProducts,
    ...agentProducts
  ];
  
  // Add category type based on product properties with fallback rules to ensure coverage
  const categorizedProducts = combinedProducts.map((product, index) => {
    let categoryType = 'other';
    
    // If product already has a categoryType, use it
    if (product.categoryType) {
      categoryType = product.categoryType;
    }
    // Map product types from database to our category types
    else if (product.product_type === 'ready_to_use') {
      categoryType = 'ready-to-use';
    } else if (product.product_type === 'mcp_client' || product.type === 'client') {
      categoryType = 'mcp-client';
    } else if (product.product_type === 'mcp_server' || product.type === 'server') {
      categoryType = 'mcp-server';
    } else if (product.product_type === 'ai_agent' || product.type === 'agent') {
      categoryType = 'ai-agent';
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
      
      // Check for Ready to Use solutions
      if (name.includes('ready') || description.includes('ready to use') || 
          tags.includes('ready-to-use') || category.includes('saas')) {
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
      'ai-agent',
      'mcp-server',
      'mcp-client',
      'ready-to-use'
    ];
    
    // Result will hold exactly 3 products from each category
    let result = [];
    
    // Process each category
    mainCategories.forEach(category => {
      let productsForCategory = [];
      
      // Get products for this category, prioritizing higher-quality ones
      if (groupedProducts[category] && groupedProducts[category].length > 0) {
        // Sort by priority: official first, then by stars, then by name
        const sortedProducts = groupedProducts[category].sort((a, b) => {
          // Official products first
          if (a.official && !b.official) return -1;
          if (!a.official && b.official) return 1;
          
          // Then by stars/popularity
          const aStars = a.stars_numeric || a.stars || 0;
          const bStars = b.stars_numeric || b.stars || 0;
          if (aStars !== bStars) return bStars - aStars;
          
          // Finally by name alphabetically
          return (a.name || '').localeCompare(b.name || '');
        });
        
        // Take up to 3 best products for this category
        productsForCategory = sortedProducts.slice(0, 3);
      }
      
      // If we have fewer than 3 products, we won't fill with placeholders
      // This prevents showing products in wrong categories
      // Instead, we'll just show what we have
      
      // Add the products for this category to the result
      result = [...result, ...productsForCategory];
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
          title={t('homepage.featured.title')}
          description={t('homepage.featured.description')}
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
          
          {/* Background elements - animations disabled for performance */}
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-gradient-radial from-purple-600/10 to-transparent blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-gradient-radial from-indigo-600/10 to-transparent blur-3xl opacity-30"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
              {t('homepage.cta.homepage_title')}
            </span>
          </h2>
          
          <p className="text-xl text-purple-100/80 max-w-3xl mx-auto mb-10">
            {t('homepage.cta.homepage_description')}
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <button
              onClick={onNavigateToCategories}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-bold text-lg relative overflow-hidden group"
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-[45deg] -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000"></div>
              <span className="relative z-10">{t('homepage.cta.button')}</span>
            </button>
            
            <a
              href="#/about-us"
              className="px-8 py-4 bg-white/5 border border-purple-500/30 backdrop-blur-md rounded-lg text-white font-bold text-lg hover:bg-white/10 transition-colors duration-300 inline-flex items-center"
            >
              <span className="mr-2">{t('navigation.about_us')}</span>
              <span className="text-lg">🌟</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default React.memo(ModernHomePage);