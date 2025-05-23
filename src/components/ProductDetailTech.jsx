import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import SkeletonLoader from './animations/SkeletonLoader';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from '../hooks/use-toast';
// Navigation fix no longer needed with path-based routing
import { 
  ArrowLeft, Star, ExternalLink, Github, Package, FileCode, 
  Bookmark, Server, Laptop, Code, Sparkles, ChevronLeft, ChevronRight, TagIcon, Bot
} from 'lucide-react';

const ProductDetailTech = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('about');
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  // Translation function for MCP data
  const translateProductData = (productData) => {
    if (!productData || currentLanguage !== 'pt') return productData;
    
    const translations = {
      // Names
      'Visual Studio Code': 'Visual Studio Code',
      'Cursor': 'Cursor',
      'FileStash': 'FileStash',
      'Sourcegraph Cody': 'Sourcegraph Cody',
      'Claude Code': 'Claude Code',
      'Claude CLI': 'Claude CLI',
      'GitHub': 'GitHub',
      'PostgreSQL MCP Server': 'Servidor MCP PostgreSQL',
      'MCP CLI Client': 'Cliente MCP CLI',
      'Claude Desktop': 'Claude Desktop',
      'VSCode MCP Extension': 'Extensão MCP VSCode',
      
      // Descriptions
      'Popular code editor with MCP integration for AI-powered development assistance.': 'Editor de código popular com integração MCP para assistência de desenvolvimento com IA.',
      'AI-powered code editor with MCP integration for advanced code completion and editing.': 'Editor de código alimentado por IA com integração MCP para autocompletar e edição avançada.',
      'Remote Storage Access service that supports SFTP, S3, FTP, SMB, NFS, WebDAV, GIT, FTPS, gcloud, azure blob, sharepoint, and more through a unified MCP interface.': 'Serviço de acesso a armazenamento remoto que suporta SFTP, S3, FTP, SMB, NFS, WebDAV, GIT, FTPS, gcloud, azure blob, sharepoint e mais através de uma interface MCP unificada.',
      'AI coding assistant with MCP integration for advanced code analysis, generation, and documentation.': 'Assistente de codificação IA com integração MCP para análise, geração e documentação avançada de código.',
      'Official CLI tool for writing and refactoring code with Claude. Integrates seamlessly with your development workflow.': 'Ferramenta CLI oficial para escrever e refatorar código com Claude. Integra-se perfeitamente ao seu fluxo de trabalho de desenvolvimento.',
      'Command-line interface for Anthropic Claude with MCP support. Access Claude and all your MCP servers through a simple command line tool.': 'Interface de linha de comando para Anthropic Claude com suporte MCP. Acesse Claude e todos os seus servidores MCP através de uma ferramenta simples de linha de comando.',
      'GitHub API integration for repository management, PRs, issues, and more. Enables AI to interact with and manage GitHub repositories and workflows.': 'Integração da API GitHub para gerenciamento de repositórios, PRs, issues e mais. Permite à IA interagir e gerenciar repositórios e fluxos de trabalho do GitHub.',
      
      // Categories
      'Code Editor': 'Editor de Código',
      'Development Tool': 'Ferramenta de Desenvolvimento',
      'File Systems': 'Sistemas de Arquivos',
      'Remote Storage': 'Armazenamento Remoto',
      'Coding Assistant': 'Assistente de Codificação',
      'CLI Tool': 'Ferramenta CLI',
      'Terminal': 'Terminal',
      'Version Control': 'Controle de Versão',
      'CLI': 'CLI',
      'Desktop Applications': 'Aplicações Desktop',
      'IDE Extensions': 'Extensões IDE'
    };
    
    return {
      ...productData,
      name: translations[productData.name] || productData.name,
      description: translations[productData.description] || productData.description,
      shortDescription: translations[productData.shortDescription] || translations[productData.description] || productData.shortDescription,
      longDescription: translations[productData.longDescription] || translations[productData.description] || productData.longDescription,
      category: translations[productData.category] || productData.category,
      categories: productData.categories?.map(cat => translations[cat] || cat) || productData.categories
    };
  };

  // No need for navigation fix with path-based routing

  // Load cached product data from localStorage on initial render
  useEffect(() => {
    if (id) {
      // Check if we should bypass API on first load to prevent flash of error state
      const bypassApi = localStorage.getItem('bypassProductApi') === 'true';
      
      if (bypassApi) {
        console.log('Bypassing API on first load due to previous errors');
        setRefreshAttempted(true);
      }
      
      try {
        // First try direct product storage
        const localStorageKey = `product_${id}`;
        const localProduct = localStorage.getItem(localStorageKey);
        if (localProduct) {
          console.log('Preloaded product from localStorage');
          const parsedProduct = JSON.parse(localProduct);
          // Mark any localStorage loaded data so we know it wasn't freshly fetched
          parsedProduct.fromLocalStorage = true;
          setProduct(translateProductData(parsedProduct));
          setLoading(false);
          return;
        }
        
        // If that fails, try to find in global data
        if (window.mcpServersDirectData) {
          const mcpProduct = window.mcpServersDirectData.find(p => String(p.id) === String(id));
          if (mcpProduct) {
            console.log('Found product in preloaded global MCP data on initial render');
            console.log('GitHub URL in global MCP data:', mcpProduct.github_url || mcpProduct.githubUrl || 'No GitHub URL found');
            console.log('Docs URL in global MCP data:', mcpProduct.docs_url || mcpProduct.docsUrl || 'No Docs URL found');
            mcpProduct.fromLocalStorage = true;
            setProduct(translateProductData(mcpProduct));
            setLoading(false);
            
            // Save to localStorage for future use
            localStorage.setItem(localStorageKey, JSON.stringify(mcpProduct));
            return;
          }
        }
        
        // Try checking sessionStorage too
        const cachedProducts = sessionStorage.getItem('cached_custom_products');
        if (cachedProducts) {
          const parsedProducts = JSON.parse(cachedProducts);
          const cachedProduct = parsedProducts.find(p => String(p.id) === String(id));
          
          if (cachedProduct) {
            console.log(`Found product in sessionStorage cache on initial render`);
            cachedProduct.fromLocalStorage = true;
            setProduct(translateProductData(cachedProduct));
            setLoading(false);
            
            // Also save to localStorage
            localStorage.setItem(localStorageKey, JSON.stringify(cachedProduct));
            return;
          }
        }
      } catch (err) {
        console.warn('Error loading from initial caches:', err);
      }
    }
  }, [id]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null); // Reset error state on each fetch attempt
      
      // Set a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        console.log(`Fetching product details for ID: ${id}`);
        
        // Check if we're retrying after a refresh
        if (refreshAttempted) {
          console.log('This is a refresh attempt, prioritizing cached data');
          // Try localStorage first on refresh attempts
          try {
            const localStorageKey = `product_${id}`;
            const localProduct = localStorage.getItem(localStorageKey);
            if (localProduct) {
              console.log('Found product in localStorage on refresh');
              const parsedProduct = JSON.parse(localProduct);
              setProduct(translateProductData(parsedProduct));
              setError(null);
              setLoading(false);
              fetchRelatedProducts(parsedProduct.category);
              return;
            }
          } catch (localErr) {
            console.warn('Error accessing localStorage fallback:', localErr);
          }
        }
        
        // First check: if we're in the search interface or have global MCP data, try to find the product there
        if (window.mcpServersDirectData) {
          // Try to find the product in the loaded MCP data
          const mcpProduct = window.mcpServersDirectData.find(p => String(p.id) === String(id));
          if (mcpProduct) {
            console.log('Found product in global MCP data:', mcpProduct);
            setProduct(translateProductData(mcpProduct));
            // Still fetch related products if needed
            fetchRelatedProducts(mcpProduct.category);
            clearTimeout(timeoutId);
            setLoading(false);
            return;
          }
        }
        
        // Second check: try to use sessionStorage cache
        try {
          const cachedProducts = sessionStorage.getItem('cached_custom_products');
          if (cachedProducts) {
            const parsedProducts = JSON.parse(cachedProducts);
            const cachedProduct = parsedProducts.find(p => String(p.id) === String(id));
            
            if (cachedProduct) {
              console.log(`Found product in sessionStorage cache: ${cachedProduct.name}`);
              setProduct(translateProductData(cachedProduct));
              fetchRelatedProducts(cachedProduct.category);
              clearTimeout(timeoutId);
              setLoading(false);
              return;
            }
          }
        } catch (cacheErr) {
          console.warn('Error accessing sessionStorage cache:', cacheErr);
        }
        
        // Final attempt: fetch from API with timeout protection
        console.log(`Fetching product ${id} from API`);
        try {
          const langParam = currentLanguage === 'pt' ? 'pt' : 'en';
          const response = await fetch(`http://localhost:3001/api/products/${id}?language=${langParam}`, {
            signal: controller.signal,
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API product data:', data);
          console.log('GitHub URL in data:', data.github_url || data.githubUrl || 'No GitHub URL found');
          console.log('Docs URL in data:', data.docs_url || data.docsUrl || 'No Docs URL found');
          setProduct(translateProductData(data));
          
          // Store in sessionStorage for resilience on refresh
          try {
            const cachedProducts = JSON.parse(sessionStorage.getItem('cached_custom_products') || '[]');
            const existingIndex = cachedProducts.findIndex(p => String(p.id) === String(id));
            
            if (existingIndex >= 0) {
              cachedProducts[existingIndex] = data;
            } else {
              cachedProducts.push(data);
            }
            
            sessionStorage.setItem('cached_custom_products', JSON.stringify(cachedProducts));
            
            // Also store in localStorage for persistent backup
            const localStorageKey = `product_${id}`;
            localStorage.setItem(localStorageKey, JSON.stringify(data));
            
            console.log('Cached product in sessionStorage and localStorage');
          } catch (cacheErr) {
            console.warn('Failed to cache product in storage:', cacheErr);
          }
          
          fetchRelatedProducts(data.category);
        } catch (apiError) {
          // Check if it was an abort error
          if (apiError.name === 'AbortError') {
            console.warn('API request timed out');
            setError('Request timed out. Please try again later.');
          } else {
            console.error('API error:', apiError);
            setError('Failed to load product details. Please try again later.');
          }
          clearTimeout(timeoutId);
          
          // No longer re-throwing to allow for retries and fallbacks
          // Mark that we've attempted a refresh if this isn't already a refresh attempt
          if (!refreshAttempted) {
            console.log('Setting refreshAttempted flag');
            setRefreshAttempted(true);
          }
          
          // Mark that the API is failing so future page loads can bypass it immediately
          localStorage.setItem('bypassProductApi', 'true');
          
          // Additional fallback for the refresh case - try to load from localStorage
          try {
            const localStorageKey = `product_${id}`;
            const localProduct = localStorage.getItem(localStorageKey);
            if (localProduct) {
              console.log('Found product in localStorage');
              const parsedProduct = JSON.parse(localProduct);
              setProduct(translateProductData(parsedProduct));
              setError(null);
              fetchRelatedProducts(parsedProduct.category);
              return;
            }
          } catch (localErr) {
            console.warn('Error accessing localStorage fallback:', localErr);
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (!error) { // Only set error if not already set
          setError('Failed to load product details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, currentLanguage]);

  const fetchRelatedProducts = async (category) => {
    if (!category) return;
    
    // Set a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      console.log(`Fetching related products for category: ${category}`);
      
      // Try to find related products in MCP data if available
      if (window.mcpServersDirectData && category) {
        const relatedFromMcp = window.mcpServersDirectData
          .filter(p => 
            p.category === category || 
            (p.categories && p.categories.includes(category))
          )
          .filter(p => String(p.id) !== String(id))
          .slice(0, 4);
          
        if (relatedFromMcp.length > 0) {
          console.log(`Found ${relatedFromMcp.length} related products in MCP data for category ${category}`);
          setRelatedProducts(relatedFromMcp);
          clearTimeout(timeoutId);
          return;
        }
      }
      
      // Try to get related products from sessionStorage cache
      try {
        const cachedProducts = sessionStorage.getItem('cached_custom_products');
        if (cachedProducts) {
          const parsedProducts = JSON.parse(cachedProducts);
          const relatedFromCache = parsedProducts
            .filter(p => p.category === category)
            .filter(p => String(p.id) !== String(id))
            .slice(0, 4);
            
          if (relatedFromCache.length > 0) {
            console.log(`Found ${relatedFromCache.length} related products in cache for category ${category}`);
            const translatedRelated = relatedFromCache.map(translateProductData);
            setRelatedProducts(translatedRelated);
            clearTimeout(timeoutId);
            return;
          }
        }
      } catch (cacheErr) {
        console.warn('Error accessing sessionStorage cache for related products:', cacheErr);
      }
      
      // If not found or we're in the regular interface, fetch from API with timeout protection
      try {
        const langParam = currentLanguage === 'pt' ? 'pt' : 'en';
        const response = await fetch(`http://localhost:3001/api/products/category/${category}?limit=4&language=${langParam}`, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.products?.length || 0} related products from API`);
        
        // Filter out the current product and apply translations
        const filtered = data.products?.filter(p => String(p.id) !== String(id)) || [];
        const translatedRelated = filtered.map(translateProductData);
        setRelatedProducts(translatedRelated.slice(0, 4)); // Show at most 4 related products
      } catch (apiError) {
        clearTimeout(timeoutId);
        
        // Check if it was an abort error
        if (apiError.name === 'AbortError') {
          console.warn('Related products API request timed out');
          // Just log the timeout but don't show error to user for related products
        } else {
          console.error('Error fetching related products from API:', apiError);
        }
        
        // Fallback: Create some generic related products
        const fallbackProducts = [
          {
            id: 'fallback-1',
            name: 'Related Product 1',
            description: 'Fallback related product',
            category,
            type: 'custom-product',
            price: 79.99,
            image_url: '/assets/news-images/fallback.jpg'
          },
          {
            id: 'fallback-2',
            name: 'Related Product 2',
            description: 'Another related product',
            category,
            type: 'custom-product',
            price: 89.99,
            image_url: '/assets/news-images/fallback.jpg'
          }
        ];
        
        // Only set fallback if we have no other related products
        if (relatedProducts.length === 0) {
          console.log('Using fallback related products');
          setRelatedProducts(fallbackProducts);
        }
      }
    } catch (err) {
      console.error('Error in fetchRelatedProducts:', err);
      clearTimeout(timeoutId);
    }
  };

  // Helper function for product images
  const getProductImage = (product) => {
    if (!product) return '/assets/news-images/fallback.jpg';
    
    return product.local_image_path || 
           product.image_url || 
           '/assets/news-images/fallback.jpg';
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-zinc-800/70 rounded-xl border border-zinc-700/60">
              <div className="p-6 flex items-center gap-6">
                <SkeletonLoader variant="rect" className="w-32 h-32 rounded-xl" />
                <div className="flex-grow">
                  <SkeletonLoader variant="text" height={32} className="w-3/4 mb-4" />
                  <SkeletonLoader variant="text" height={20} className="w-1/2 mb-2" />
                  <SkeletonLoader variant="text" height={16} className="w-1/3" />
                </div>
              </div>
              <div className="border-t border-zinc-700/40 p-6">
                <SkeletonLoader variant="text" height={24} className="w-full mb-3" />
                <SkeletonLoader variant="text" height={16} className="w-full mb-2" />
                <SkeletonLoader variant="text" height={16} className="w-full mb-2" />
                <SkeletonLoader variant="text" height={16} className="w-3/4" />
              </div>
            </div>
          </div>
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-zinc-800/70 rounded-xl border border-zinc-700/60 p-6">
              <SkeletonLoader variant="text" height={24} className="w-1/2 mb-4" />
              <div className="space-y-3">
                <SkeletonLoader variant="rect" height={46} className="w-full" />
                <SkeletonLoader variant="rect" height={46} className="w-full" />
                <SkeletonLoader variant="rect" height={46} className="w-full" />
              </div>
            </div>
            <div className="bg-zinc-800/70 rounded-xl border border-zinc-700/60 p-6">
              <SkeletonLoader variant="text" height={24} className="w-1/2 mb-4" />
              <div className="flex flex-wrap gap-2">
                <SkeletonLoader variant="pill" className="w-20 h-8" />
                <SkeletonLoader variant="pill" className="w-24 h-8" />
                <SkeletonLoader variant="pill" className="w-16 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-900/20 border border-red-700/30 text-red-200 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            // Navigate based on URL structure
            if (window.location.hash.startsWith('#/')) {
              window.location.hash = '#/search'; // Use hash navigation
            } else {
              navigate('/products'); // Use React Router
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="bg-amber-900/20 border border-amber-700/30 text-amber-200 px-4 py-3 rounded-xl mb-6">
          Product not found
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            // Navigate based on URL structure
            if (window.location.hash.startsWith('#/')) {
              window.location.hash = '#/search'; // Use hash navigation
            } else {
              navigate('/products'); // Use React Router
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <div className="flex items-center mb-6 text-sm">
        <Link to={window.location.hash.startsWith('#/') ? '#/' : '/'} className="text-gray-300 hover:text-purple-400">
          Home
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link 
          to="/products" 
          className="text-gray-300 hover:text-purple-400"
          onClick={(e) => {
            // For custom products using hash-based URL
            if (product?.type === 'custom-product' && window.location.hash.startsWith('#/')) {
              e.preventDefault();
              navigate('/products'); // Use React Router for custom products
            }
          }}
        >
          Products
        </Link>
        {product.category && (
          <>
            <span className="mx-2 text-gray-500">/</span>
            <Link 
              to={window.location.hash.startsWith('#/') ? 
                `#/search?category=${encodeURIComponent(product.category)}` : 
                `/products?category=${encodeURIComponent(product.category)}`
              } 
              className="text-gray-300 hover:text-purple-400"
            >
              {product.category}
            </Link>
          </>
        )}
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-white font-medium">{product.name}</span>
      </div>
      
      {/* Hero Section with Premium Banner */}
      <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-zinc-900/20 border border-purple-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,50,255,0.1),transparent_60%)]"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-500/5 to-transparent"></div>
        
        <div className="relative px-8 py-12 flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          {/* Product image with glow effect */}
          <div className="relative w-40 h-40 flex-shrink-0 rounded-2xl bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 p-5 flex items-center justify-center shadow-xl border border-zinc-700/30">
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-sm"></div>
            <div className="absolute inset-0 rounded-2xl bg-zinc-900/80 backdrop-blur-sm"></div>
            <img 
              src={getProductImage(product)} 
              alt={product.name}
              className="relative w-full h-full object-contain z-10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/news-images/fallback.jpg';
              }}
            />
          </div>
          
          {/* Product hero info */}
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
              {/* Type badge */}
              {product.type === 'custom-product' && (
                <>
                  <Badge variant="secondary" className="px-3 py-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 backdrop-blur-sm">
                    {product.product_type || 'Custom Product'}
                  </Badge>
                  {product.price && (
                    <Badge variant="secondary" className="px-3 py-1 ml-2 bg-green-500/20 text-green-300 hover:bg-green-500/30 backdrop-blur-sm">
                      ${product.price.toFixed(2)}
                    </Badge>
                  )}
                </>
              )}
              {product.type === 'server' && (
                <Badge variant="secondary" className="px-3 py-1 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 backdrop-blur-sm">
                  MCP Server
                </Badge>
              )}
              {product.type === 'client' && (
                <Badge variant="secondary" className="px-3 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 backdrop-blur-sm">
                  MCP Client
                </Badge>
              )}
              {product.type === 'ai-agent' && (
                <Badge variant="secondary" className="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 backdrop-blur-sm">
                  AI Agent
                </Badge>
              )}
              
              {/* Official badge if applicable */}
              {product.official && (
                <Badge variant="secondary" className="px-3 py-1 bg-green-500/20 text-green-300 hover:bg-green-500/30 backdrop-blur-sm">
                  Official
                </Badge>
              )}
              
              {/* Version badge if available */}
              {product.version && (
                <Badge variant="secondary" className="px-3 py-1 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 backdrop-blur-sm">
                  v{product.version}
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              {/* Creator */}
              <div className="flex items-center">
                <span className="text-gray-400">By </span>
                <span className="text-white font-medium ml-1">
                  {product.createdBy || product.creator || product.company || 'Unknown Creator'}
                </span>
              </div>
              
              {/* Stars display */}
              {(product.stars_numeric || product.stars) && (
                <div className="flex items-center text-gray-300">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-medium">
                    {product.stars_numeric?.toLocaleString() || product.stars?.toLocaleString() || '0'} stars
                  </span>
                </div>
              )}
              
              {/* License display */}
              {product.license && (
                <div className="flex items-center text-gray-300">
                  <TagIcon className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{product.license}</span>
                </div>
              )}
              
              {/* Show indicator if data is from cache */}
              {product.fromLocalStorage && (
                <div className="flex items-center text-amber-300/70 text-sm border border-amber-500/30 px-2 py-0.5 rounded-md bg-amber-500/10">
                  <span>Cached data</span>
                </div>
              )}
            </div>
            
            {/* Quick description */}
            <p className="text-lg text-gray-300 max-w-3xl mb-8">
              {product.shortDescription || product.description?.substring(0, 160) || 'No description available'}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {(product.githubUrl || product.github_url) && (
                <a 
                  href={product.githubUrl || product.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800/70 hover:bg-zinc-800 text-white rounded-lg border border-zinc-700/50 transition-all duration-200 shadow-md hover:shadow-purple-900/20"
                >
                  <Github className="h-5 w-5" />
                  <span>{t('product_detail.common.github_repository')}</span>
                </a>
              )}
              
              {/* Download button with GitHub link */}
              {(product.githubUrl || product.github_url) ? (
                <a 
                  href={product.githubUrl || product.github_url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800/70 hover:bg-zinc-800 text-white rounded-lg border border-zinc-700/50 transition-all duration-200 shadow-md hover:shadow-purple-900/20"
                >
                  <Github className="h-5 w-5" />
                  <span>{t('product_detail.common.download')}</span>
                </a>
              ) : (
                <button 
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800/70 hover:bg-zinc-800 text-white rounded-lg border border-zinc-700/50 transition-all duration-200 shadow-md hover:shadow-purple-900/20"
                  onClick={() => {
                    toast({
                      title: "Download Link",
                      description: "No download link available for this product.",
                      variant: "default",
                    });
                  }}
                >
                  <Github className="h-5 w-5" />
                  <span>Download</span>
                </button>
              )}
              
              {product.installation_command && (
                <Button
                  variant="outline" 
                  className="gap-2 px-5 py-2.5 bg-purple-900/30 hover:bg-purple-800/40 text-white border-purple-700/40 hover:border-purple-600/50"
                  onClick={() => {
                    navigator.clipboard.writeText(product.installation_command);
                    toast({
                      title: "Installation Command Copied",
                      description: "The command has been copied to your clipboard.",
                      variant: "success",
                    });
                  }}
                >
                  <Code className="h-5 w-5" />
                  <span>{t('product_detail.common.copy_install_command')}</span>
                </Button>
              )}
              
              {(product.docsUrl || product.docs_url) && (
                <a 
                  href={product.docsUrl || product.docs_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800/70 hover:bg-zinc-800 text-white rounded-lg border border-zinc-700/50 transition-all duration-200 shadow-md hover:shadow-purple-900/20"
                >
                  <FileCode className="h-5 w-5" />
                  <span>{t('product_detail.common.documentation')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Section - 2/3 width on desktop */}
        <div className="lg:w-2/3">
          {/* Main content tabs */}
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-700/60 shadow-xl mb-8 overflow-hidden">
            <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-zinc-700/40">
                <TabsList className="bg-gradient-to-r from-zinc-900/80 via-zinc-900/90 to-zinc-900/80 w-full justify-start rounded-none h-14 p-0 border-0">
                  <TabsTrigger 
                    value="about" 
                    className="text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-300 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none h-full px-6"
                  >
                    {t('product_detail.common.about')}
                  </TabsTrigger>
                  {product.keyFeatures && product.keyFeatures.length > 0 && (
                    <TabsTrigger 
                      value="features" 
                      className="text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-300 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none h-full px-6"
                    >
                      {t('product_detail.common.features')}
                    </TabsTrigger>
                  )}
                  {product.useCases && product.useCases.length > 0 && (
                    <TabsTrigger 
                      value="usecases" 
                      className="text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-300 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none h-full px-6"
                    >
                      {t('product_detail.common.use_cases')}
                    </TabsTrigger>
                  )}
                  {product.installation_command && (
                    <TabsTrigger 
                      value="installation" 
                      className="text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-300 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none h-full px-6"
                    >
                      {t('product_detail.common.installation')}
                    </TabsTrigger>
                  )}
                  <TabsTrigger 
                    value="reviews" 
                    className="text-zinc-400 hover:text-zinc-200 data-[state=active]:bg-purple-600/10 data-[state=active]:text-purple-300 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none h-full px-6"
                  >
                    {t('product_detail.common.reviews')}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="about" className="p-8">
                <div className="prose prose-invert prose-purple max-w-none">
                  <div className="flex flex-col gap-8">
                    {/* Main description section */}
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
                      <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40">
                        <p className="text-gray-300 leading-relaxed">
                          {product.longDescription || product.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Language and technical info card if available */}
                    {(product.language || product.creator || product.license) && (
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-4">{t('product_detail.common.technical_details')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {product.language && (
                            <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40">
                              <h3 className="text-lg font-medium text-white mb-2">{t('product_detail.common.language')}</h3>
                              <p className="text-gray-300">{product.language}</p>
                            </div>
                          )}
                          
                          {(product.createdBy || product.creator) && (
                            <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40">
                              <h3 className="text-lg font-medium text-white mb-2">{t('product_detail.common.creator')}</h3>
                              <p className="text-gray-300">{product.createdBy || product.creator}</p>
                            </div>
                          )}
                          
                          {product.license && (
                            <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40">
                              <h3 className="text-lg font-medium text-white mb-2">{t('product_detail.common.license')}</h3>
                              <p className="text-gray-300">{product.license}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Technical specifications if available */}
                    {product.specifications && (
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Specifications</h2>
                        <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-2 border-b border-zinc-700/30">
                                <span className="text-gray-400 font-medium">{key}</span>
                                <span className="text-white">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="p-8">
                <div className="prose prose-invert prose-purple max-w-none">
                  <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
                  
                  {product.keyFeatures && product.keyFeatures.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.keyFeatures.map((feature, index) => (
                        <div key={index} className="bg-gradient-to-br from-zinc-800/40 to-zinc-800/20 rounded-xl p-6 border border-zinc-700/40 relative overflow-hidden group hover:from-purple-900/10 hover:to-indigo-900/10 hover:border-purple-700/30 transition-all duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="flex gap-4">
                            <div className="mt-1">
                              <div className="bg-purple-900/30 p-2 rounded-lg">
                                <Sparkles className="h-5 w-5 text-purple-300" />
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-200 leading-relaxed">{feature}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40 text-center">
                      <p className="text-gray-500">No feature information available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="usecases" className="p-8">
                <div className="prose prose-invert prose-purple max-w-none">
                  <h2 className="text-2xl font-bold text-white mb-6">Use Cases</h2>
                  
                  {product.useCases && product.useCases.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {product.useCases.map((useCase, index) => (
                        <div key={index} className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40 flex items-start gap-4">
                          <div className="mt-1">
                            <div className="bg-indigo-900/30 p-2 rounded-lg">
                              <Code className="h-5 w-5 text-indigo-300" />
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-300">{useCase}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40 text-center">
                      <p className="text-gray-500">No use case information available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="installation" className="p-8">
                <div className="prose prose-invert prose-purple max-w-none">
                  <h2 className="text-2xl font-bold text-white mb-6">Installation</h2>
                  
                  {product.installation_command ? (
                    <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40">
                      <div className="mb-4">
                        <p className="text-gray-300 mb-4">Use the following command to install {product.name}:</p>
                        <div className="relative">
                          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-gray-300 overflow-x-auto">
                            {product.installation_command}
                          </div>
                          <button 
                            className="absolute top-3 right-3 p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-md transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(product.installation_command);
                              toast({
                                title: "Command Copied",
                                description: "Installation command has been copied to clipboard",
                                variant: "success",
                              });
                            }}
                          >
                            <svg className="w-4 h-4 text-purple-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 7V5C8 4.44772 8.44772 4 9 4H19C19.5523 4 20 4.44772 20 5V15C20 15.5523 19.5523 16 19 16H17M5 9C5 8.44772 5.44772 8 6 8H16C16.5523 8 17 8.44772 17 9V19C17 19.5523 16.5523 20 16 20H6C5.44772 20 5 19.5523 5 19V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {product.githubUrl && (
                        <div className="mt-6">
                          <p className="text-gray-300 mb-2">For more detailed installation instructions, check the project repository:</p>
                          <a 
                            href={product.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
                          >
                            <Github className="h-4 w-4" />
                            <span>GitHub Repository</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40 text-center">
                      <p className="text-gray-500">No installation information available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="p-8">
                <div className="prose prose-invert prose-purple max-w-none">
                  <div className="flex flex-col items-center bg-gradient-to-br from-purple-900/10 to-indigo-900/5 p-8 rounded-xl mb-8 border border-purple-700/20">
                    <h2 className="text-2xl font-bold text-white mb-4">{t('product_detail.common.customer_reviews')}</h2>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={28}
                            className={`${
                              star <= (product.stars_numeric || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xl text-white font-medium">
                        {product.stars_numeric || 0} out of 5
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-center max-w-md mb-6">
                      Share your experience with this product to help other users.
                    </p>
                    
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg border-0">
                      Write a Review
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.map((review, index) => (
                        <div key={index} className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/40 mb-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-white font-medium text-lg">{review.author || t('product_detail.common.anonymous')}</h4>
                              <div className="flex items-center mt-1">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      size={16}
                                      className={`${
                                        star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-400">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-300">{review.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="bg-zinc-800/30 rounded-xl p-8 border border-zinc-700/40 text-center">
                        <p className="text-gray-500">{t('product_detail.common.no_reviews')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Contextual Product Section - Automatically adapts based on product type */}
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-700/60 shadow-xl p-8 mb-8">
            {product.type === 'server' || product.product_type === 'mcp_server' ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="bg-indigo-900/30 p-1.5 rounded-lg mr-3">
                    <Server className="h-5 w-5 text-indigo-300" />
                  </span>
                  {t('product_detail.mcp_server.title')}
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Server quick setup */}
                  <div className="bg-gradient-to-br from-zinc-800/30 to-zinc-800/10 rounded-xl p-6 border border-zinc-700/40">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.mcp_server.quick_setup')}</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
                        <h4 className="text-lg font-medium text-white mb-2">{t('product_detail.mcp_server.using_claude_desktop')}</h4>
                        <p className="text-gray-300 mb-4">{t('product_detail.mcp_server.claude_desktop_config')}</p>
                        
                        <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-2 relative group">
{`{
  "mcpServers": {
    "${product.name.toLowerCase().replace(/\s+/g, '-')}": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-${product.name.toLowerCase().replace(/\s+/g, '-')}"${product.installation_command ? `,\n        "${product.installation_command}"` : ''}
      ]
    }
  }
}`}
                          <button 
                            className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-blue-700/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              navigator.clipboard.writeText(`{
  "mcpServers": {
    "${product.name.toLowerCase().replace(/\s+/g, '-')}": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-${product.name.toLowerCase().replace(/\s+/g, '-')}"${product.installation_command ? `,\n        "${product.installation_command}"` : ''}
      ]
    }
  }
}`);
                              toast({
                                title: "Copied!",
                                description: "Configuration copied to clipboard",
                              });
                            }}
                          >
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm">{t('product_detail.mcp_server.replace_parameters')}</p>
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
                        <h4 className="text-lg font-medium text-white mb-2">{t('product_detail.mcp_server.using_vs_code')}</h4>
                        <p className="text-gray-300 mb-4">{t('product_detail.mcp_server.vs_code_config')}</p>
                        
                        <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-2 relative group">
{`{
  "servers": {
    "${product.name.toLowerCase().replace(/\s+/g, '-')}": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-${product.name.toLowerCase().replace(/\s+/g, '-')}"${product.installation_command ? `,\n        "${product.installation_command}"` : ''}
      ]
    }
  }
}`}
                          <button 
                            className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-blue-700/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              navigator.clipboard.writeText(`{
  "servers": {
    "${product.name.toLowerCase().replace(/\s+/g, '-')}": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-${product.name.toLowerCase().replace(/\s+/g, '-')}"${product.installation_command ? `,\n        "${product.installation_command}"` : ''}
      ]
    }
  }
}`);
                              toast({
                                title: "Copied!",
                                description: "VS Code configuration copied to clipboard",
                              });
                            }}
                          >
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Security considerations */}
                  <div className="bg-gradient-to-br from-zinc-800/30 to-zinc-800/10 rounded-xl p-6 border border-zinc-700/40">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.mcp_server.security_considerations')}</h3>
                    <div className="flex gap-4">
                      <div className="mt-1 flex-shrink-0">
                        <div className="bg-amber-900/30 p-2 rounded-lg">
                          <svg className="h-5 w-5 text-amber-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 15H12.01M12 12V9M4.98207 19H19.0179C20.5615 19 21.5233 17.3256 20.7455 16.0145L13.7276 3.76238C12.9558 2.46269 11.0442 2.46269 10.2724 3.76238L3.25452 16.0145C2.47675 17.3256 3.43849 19 4.98207 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-300 mb-3">{t('product_detail.mcp_server.security_intro')}</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-300">
                          <li>{t('product_detail.mcp_server.verify_source')}</li>
                          <li>{t('product_detail.mcp_server.check_permissions')}</li>
                          <li>{t('product_detail.mcp_server.sensitive_data')}</li>
                          <li>{t('product_detail.mcp_server.keep_updated')}</li>
                          {product.language && <li>{t('product_detail.mcp_server.environment_isolation', { language: product.language })}</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* MCP Server capabilities */}
                  <div className="bg-gradient-to-br from-zinc-800/30 to-zinc-800/10 rounded-xl p-6 border border-zinc-700/40">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.mcp_server.server_capabilities')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-900/50 rounded-lg p-4 hover:border hover:border-indigo-500/40 transition-all duration-300">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                          <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {t('product_detail.mcp_server.resources')}
                        </h4>
                        <p className="text-gray-300">{t('product_detail.mcp_server.resources_description')}</p>
                        {product.name.toLowerCase().includes('database') || 
                         product.name.toLowerCase().includes('postgres') || 
                         product.name.toLowerCase().includes('sql') ? (
                          <p className="text-indigo-300 text-sm mt-2">This server provides database records as structured resources</p>
                        ) : product.name.toLowerCase().includes('file') || 
                           product.name.toLowerCase().includes('filesystem') ? (
                          <p className="text-indigo-300 text-sm mt-2">{t('product_detail.mcp_server.resources_server_description')}</p>
                        ) : product.name.toLowerCase().includes('github') || 
                           product.name.toLowerCase().includes('git') ? (
                          <p className="text-indigo-300 text-sm mt-2">This server provides repository data as browsable resources</p>
                        ) : product.name.toLowerCase().includes('search') || 
                           product.name.toLowerCase().includes('brave') ? (
                          <p className="text-indigo-300 text-sm mt-2">This server provides search results as readable resources</p>
                        ) : (
                          <p className="text-indigo-300 text-sm mt-2">This server exposes data resources for AI consumption</p>
                        )}
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-4 hover:border hover:border-indigo-500/40 transition-all duration-300">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                          <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {t('product_detail.mcp_server.tools')}
                        </h4>
                        <p className="text-gray-300">{t('product_detail.mcp_server.tools_description')}</p>
                        {product.name.toLowerCase().includes('database') || 
                         product.name.toLowerCase().includes('postgres') || 
                         product.name.toLowerCase().includes('sql') ? (
                          <p className="text-indigo-300 text-sm mt-2">Provides tools for executing SQL queries and database operations</p>
                        ) : product.name.toLowerCase().includes('file') || 
                           product.name.toLowerCase().includes('filesystem') ? (
                          <p className="text-indigo-300 text-sm mt-2">{t('product_detail.mcp_server.tools_server_description')}</p>
                        ) : product.name.toLowerCase().includes('github') || 
                           product.name.toLowerCase().includes('git') ? (
                          <p className="text-indigo-300 text-sm mt-2">Provides tools for repo operations, PR management, and code analysis</p>
                        ) : product.name.toLowerCase().includes('search') || 
                           product.name.toLowerCase().includes('brave') ? (
                          <p className="text-indigo-300 text-sm mt-2">Provides tools for performing web searches and retrieving results</p>
                        ) : (
                          <p className="text-indigo-300 text-sm mt-2">Provides specialized tools for this server's functionality</p>
                        )}
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-4 hover:border hover:border-indigo-500/40 transition-all duration-300">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                          <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {t('product_detail.mcp_server.prompts')}
                        </h4>
                        <p className="text-gray-300">{t('product_detail.mcp_server.prompts_description')}</p>
                        <p className="text-indigo-300 text-sm mt-2">{t('product_detail.mcp_server.prompts_server_description')}</p>
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-4 hover:border hover:border-indigo-500/40 transition-all duration-300">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                          <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          {t('product_detail.mcp_server.security')}
                        </h4>
                        <p className="text-gray-300">{t('product_detail.mcp_server.security_description')}</p>
                        <p className="text-indigo-300 text-sm mt-2">{t('product_detail.mcp_server.security_server_description')}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-zinc-900/60 rounded-lg p-4 border border-zinc-700/50">
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('product_detail.mcp_server.why_use', { name: product.name })}
                      </h4>
                      {product.name.toLowerCase().includes('database') || 
                       product.name.toLowerCase().includes('postgres') || 
                       product.name.toLowerCase().includes('sql') ? (
                        <p className="text-gray-300">This MCP server enables Claude to interact directly with databases, allowing the AI to perform data analysis, generate reports, and execute queries based on natural language instructions - all while maintaining appropriate security boundaries.</p>
                      ) : product.name.toLowerCase().includes('file') || 
                         product.name.toLowerCase().includes('filesystem') ? (
                        <p className="text-gray-300">This MCP server gives Claude secure access to your file system, enabling document analysis, code understanding, and file management through natural language. Perfect for working with local files without exposing your entire system.</p>
                      ) : product.name.toLowerCase().includes('github') || 
                         product.name.toLowerCase().includes('git') ? (
                        <p className="text-gray-300">This MCP server connects Claude directly to your GitHub repositories, enabling code analysis, PR reviews, issue management, and more - all through natural language interaction with your codebase.</p>
                      ) : product.name.toLowerCase().includes('search') || 
                         product.name.toLowerCase().includes('brave') ? (
                        <p className="text-gray-300">This MCP server gives Claude the ability to search the web for current information, enriching its responses with up-to-date data while maintaining privacy and control over search operations.</p>
                      ) : (
                        <p className="text-gray-300">This specialized MCP server extends Claude's capabilities, allowing the AI to interact with external systems and data sources seamlessly while maintaining security and control over permissions.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Resources for Developers */}
                  <div className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 rounded-xl p-6 border border-indigo-700/30">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.mcp_server.developer_resources')}</h3>
                    
                    <div className="space-y-3">
                      <a 
                        href="https://modelcontextprotocol.io/introduction"
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                      >
                        <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{t('product_detail.common.mcp_documentation')}</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                      
                      <a 
                        href="https://github.com/modelcontextprotocol/servers"
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                      >
                        <Github className="h-5 w-5 text-indigo-300" />
                        <span>{t('product_detail.common.mcp_servers_repository')}</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                      
                      <a 
                        href="https://docs.anthropic.com/en/docs/agents-and-tools/mcp"
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                      >
                        <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>{t('product_detail.common.anthropic_mcp_guide')}</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    </div>
                  </div>
                </div>
              </>
            ) : product.type === 'client' || product.product_type === 'mcp_client' ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="bg-blue-900/30 p-1.5 rounded-lg mr-3">
                    <Laptop className="h-5 w-5 text-blue-300" />
                  </span>
                  {t('product_detail.mcp_client.title')}
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Client overview */}
                  <div className="bg-gradient-to-br from-zinc-800/30 to-zinc-800/10 rounded-xl p-6 border border-zinc-700/40">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.mcp_client.client_overview')}</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-zinc-900/50 rounded-lg p-5 border border-zinc-700/30">
                        <h4 className="text-lg font-medium text-white mb-3">{t('product_detail.mcp_client.what_clients_do')}</h4>
                        <p className="text-gray-300 mb-4">{t('product_detail.mcp_client.what_clients_do_description')}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-blue-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">{t('product_detail.mcp_client.enhanced_ai_capabilities')}</h5>
                              <p className="text-gray-400 text-sm">{t('product_detail.mcp_client.enhanced_ai_capabilities_description')}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-blue-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">{t('product_detail.mcp_client.security_control')}</h5>
                              <p className="text-gray-400 text-sm">{t('product_detail.mcp_client.security_control_description')}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-blue-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">{t('product_detail.mcp_client.standardized_integration')}</h5>
                              <p className="text-gray-400 text-sm">{t('product_detail.mcp_client.standardized_integration_description')}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-blue-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">{t('product_detail.mcp_client.developer_experience')}</h5>
                              <p className="text-gray-400 text-sm">{t('product_detail.mcp_client.developer_experience_description')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Client setup */}
                  <div className="bg-gradient-to-br from-zinc-800/30 to-zinc-800/10 rounded-xl p-6 border border-zinc-700/40">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.mcp_client.getting_started', { name: product.name })}</h3>
                    
                    <div className="space-y-5">
                      <div className="bg-zinc-900/50 rounded-lg p-5 border border-zinc-700/30">
                        <h4 className="text-lg font-medium text-white mb-3">{t('product_detail.mcp_client.installation')}</h4>
                        
                        {product.installation_command ? (
                          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto relative group">
                            {product.installation_command}
                            <button 
                              className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-blue-700/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                navigator.clipboard.writeText(product.installation_command);
                                toast({
                                  title: "Copied!",
                                  description: "Installation command copied to clipboard",
                                });
                              }}
                            >
                              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-300">{t('product_detail.mcp_client.installation_description')}</p>
                        )}
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-5 border border-zinc-700/30">
                        <h4 className="text-lg font-medium text-white mb-3">{t('product_detail.mcp_client.basic_usage')}</h4>
                        <p className="text-gray-300 mb-4">{t('product_detail.mcp_client.basic_usage_description', { name: product.name })}</p>
                        
                        <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                          <li>Install {product.name} following the instructions above</li>
                          <li>Configure your MCP servers in the client settings</li>
                          <li>Start the client and connect to your preferred LLM (Claude)</li>
                          <li>Begin using the enhanced capabilities through Claude's interface</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  {/* Compatible MCP Servers */}
                  <div className="bg-gradient-to-br from-blue-900/10 to-indigo-900/10 rounded-xl p-6 border border-blue-700/30">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.mcp_client.compatible_servers')}</h3>
                    <p className="text-gray-300 mb-5">{t('product_detail.mcp_client.compatible_servers_description', { name: product.name })}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/40 hover:border-blue-500/30 transition-colors">
                        <h4 className="font-medium text-white mb-1">GitHub</h4>
                        <p className="text-gray-400 text-sm">Connect to GitHub repositories</p>
                      </div>
                      
                      <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/40 hover:border-blue-500/30 transition-colors">
                        <h4 className="font-medium text-white mb-1">Filesystem</h4>
                        <p className="text-gray-400 text-sm">Access local files securely</p>
                      </div>
                      
                      <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/40 hover:border-blue-500/30 transition-colors">
                        <h4 className="font-medium text-white mb-1">PostgreSQL</h4>
                        <p className="text-gray-400 text-sm">Query PostgreSQL databases</p>
                      </div>
                      
                      <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/40 hover:border-blue-500/30 transition-colors">
                        <h4 className="font-medium text-white mb-1">Brave Search</h4>
                        <p className="text-gray-400 text-sm">Perform web searches</p>
                      </div>
                      
                      <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/40 hover:border-blue-500/30 transition-colors">
                        <h4 className="font-medium text-white mb-1">Google Drive</h4>
                        <p className="text-gray-400 text-sm">Access Google Drive files</p>
                      </div>
                      
                      <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/40 hover:border-blue-500/30 transition-colors">
                        <h4 className="font-medium text-white mb-1">And more...</h4>
                        <p className="text-gray-400 text-sm">Many other servers available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : product.type === 'ai-agent' || product.product_type === 'ai_agent' ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="bg-amber-900/30 p-1.5 rounded-lg mr-3">
                    <Bot className="h-5 w-5 text-amber-300" />
                  </span>
                  {t('product_detail.ai_agent.title')}
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Agent overview */}
                  <div className="bg-gradient-to-br from-zinc-800/30 to-zinc-800/10 rounded-xl p-6 border border-zinc-700/40">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.ai_agent.agent_overview')}</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-zinc-900/50 rounded-lg p-5 border border-zinc-700/30">
                        <h4 className="text-lg font-medium text-white mb-3">{t('product_detail.ai_agent.agent_capabilities')}</h4>
                        <p className="text-gray-300 mb-4">{t('product_detail.ai_agent.agent_description', { name: product.name })}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div className="flex gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 hover:border-amber-600/30 transition-colors duration-300">
                            <div className="mt-1">
                              <div className="bg-amber-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">{t('product_detail.ai_agent.tool_integration')}</h5>
                              <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.tool_integration_description')}</p>
                              {product.name.toLowerCase().includes('autogen') ? (
                                <p className="text-amber-300/80 text-xs mt-1">AutoGen's tool-calling protocol supports function calling with chat models</p>
                              ) : product.name.toLowerCase().includes('crew') ? (
                                <p className="text-amber-300/80 text-xs mt-1">CrewAI's toolkit integration enables seamless access to external tools</p>
                              ) : product.name.toLowerCase().includes('langchain') ? (
                                <p className="text-amber-300/80 text-xs mt-1">LangChain's tools module provides a unified interface for external services</p>
                              ) : (
                                <p className="text-amber-300/80 text-xs mt-1">{t('product_detail.ai_agent.tool_integration_detail')}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 hover:border-amber-600/30 transition-colors duration-300">
                            <div className="mt-1">
                              <div className="bg-amber-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">{t('product_detail.ai_agent.multi_agent_collaboration')}</h5>
                              <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.multi_agent_description')}</p>
                              {product.name.toLowerCase().includes('autogen') ? (
                                <p className="text-amber-300/80 text-xs mt-1">AutoGen's multi-agent conversations enable complex problem-solving</p>
                              ) : product.name.toLowerCase().includes('crew') ? (
                                <p className="text-amber-300/80 text-xs mt-1">CrewAI's agents work as a team with assigned roles and responsibilities</p>
                              ) : product.name.toLowerCase().includes('langchain') ? (
                                <p className="text-amber-300/80 text-xs mt-1">LangChain's agent framework enables collaborative workflows</p>
                              ) : (
                                <p className="text-amber-300/80 text-xs mt-1">{t('product_detail.ai_agent.multi_agent_detail')}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 hover:border-amber-600/30 transition-colors duration-300">
                            <div className="mt-1">
                              <div className="bg-amber-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">{t('product_detail.ai_agent.memory_management')}</h5>
                              <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.memory_description')}</p>
                              {product.name.toLowerCase().includes('autogen') ? (
                                <p className="text-amber-300/80 text-xs mt-1">AutoGen uses message histories to maintain conversational state</p>
                              ) : product.name.toLowerCase().includes('crew') ? (
                                <p className="text-amber-300/80 text-xs mt-1">CrewAI's shared memory allows persistent knowledge between tasks</p>
                              ) : product.name.toLowerCase().includes('langchain') ? (
                                <p className="text-amber-300/80 text-xs mt-1">LangChain's memory systems provide flexible state management options</p>
                              ) : (
                                <p className="text-amber-300/80 text-xs mt-1">{t('product_detail.ai_agent.memory_detail')}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 hover:border-amber-600/30 transition-colors duration-300">
                            <div className="mt-1">
                              <div className="bg-amber-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">{t('product_detail.ai_agent.workflow_orchestration')}</h5>
                              <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.workflow_description')}</p>
                              {product.name.toLowerCase().includes('autogen') ? (
                                <p className="text-amber-300/80 text-xs mt-1">AutoGen organizes multi-agent conversations with customizable flow</p>
                              ) : product.name.toLowerCase().includes('crew') ? (
                                <p className="text-amber-300/80 text-xs mt-1">CrewAI's process system provides step-by-step execution guarantees</p>
                              ) : product.name.toLowerCase().includes('langchain') ? (
                                <p className="text-amber-300/80 text-xs mt-1">LangChain's chains and sequences enable complex multi-step workflows</p>
                              ) : (
                                <p className="text-amber-300/80 text-xs mt-1">{t('product_detail.ai_agent.workflow_detail')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-zinc-900/60 rounded-lg p-4 border border-zinc-700/50">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                          <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('product_detail.ai_agent.why_use_agent', { name: product.name })}
                        </h4>
                        {product.name.toLowerCase().includes('autogen') ? (
                          <p className="text-gray-300">AutoGen excels at building conversational and collaborative agents that effectively solve complex problems through structured agent-to-agent interactions. It's particularly strong for multi-agent teams where each agent has specialized roles and needs to coordinate through natural language communication.</p>
                        ) : product.name.toLowerCase().includes('crew') ? (
                          <p className="text-gray-300">CrewAI provides a human-inspired approach to AI agents by organizing them into hierarchical teams with well-defined roles, processes, and tasks. It's ideal for workflows that mimic human organizations where clear delegation and specialized expertise are needed to accomplish a larger goal.</p>
                        ) : product.name.toLowerCase().includes('langchain') ? (
                          <p className="text-gray-300">LangChain offers a comprehensive framework for building AI agents with sophisticated reasoning, memory systems, and tool integration. Its modular architecture makes it highly adaptable for diverse applications while providing strong abstractions over the underlying LLM interactions.</p>
                        ) : (
                          <p className="text-gray-300">{t('product_detail.ai_agent.why_use_description', { name: product.name })}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Use Cases */}
                  <div className="bg-gradient-to-br from-zinc-800/30 to-zinc-800/10 rounded-xl p-6 border border-zinc-700/40">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.ai_agent.common_use_cases')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
                        <h4 className="font-medium text-white mb-2">{t('product_detail.ai_agent.research_analysis')}</h4>
                        <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.research_description')}</p>
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
                        <h4 className="font-medium text-white mb-2">{t('product_detail.ai_agent.content_creation')}</h4>
                        <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.content_description')}</p>
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
                        <h4 className="font-medium text-white mb-2">{t('product_detail.ai_agent.task_automation')}</h4>
                        <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.task_automation_description')}</p>
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
                        <h4 className="font-medium text-white mb-2">{t('product_detail.ai_agent.software_development')}</h4>
                        <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.software_description')}</p>
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
                        <h4 className="font-medium text-white mb-2">{t('product_detail.ai_agent.customer_support')}</h4>
                        <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.support_description')}</p>
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700/30">
                        <h4 className="font-medium text-white mb-2">{t('product_detail.ai_agent.data_processing')}</h4>
                        <p className="text-gray-400 text-sm">{t('product_detail.ai_agent.data_description')}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sample code */}
                  <div className="bg-gradient-to-br from-amber-900/10 to-orange-900/10 rounded-xl p-6 border border-amber-700/30">
                    <h3 className="text-xl font-medium text-white mb-4">{t('product_detail.ai_agent.getting_started')}</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-zinc-900/70 rounded-lg p-5 border border-zinc-700/40">
                        <h4 className="text-lg font-medium text-white mb-3">{t('product_detail.ai_agent.installation')}</h4>
                        
                        {product.installation_command ? (
                          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto relative group">
                            {product.installation_command}
                            <button 
                              className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-amber-700/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                navigator.clipboard.writeText(product.installation_command);
                                toast({
                                  title: "Copied!",
                                  description: "Installation command copied to clipboard",
                                });
                              }}
                            >
                              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-300">{t('product_detail.ai_agent.installation_description')}</p>
                        )}
                      </div>
                      
                      <div className="bg-zinc-900/70 rounded-lg p-5 border border-zinc-700/40">
                        <h4 className="text-lg font-medium text-white mb-3">{t('product_detail.ai_agent.sample_code')}</h4>
                        
                        <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-2 relative group">
                          {product.name.toLowerCase().includes('autogen') ? (
                          `import autogen

# Initialize the assistant agent
assistant = autogen.Agent(
    name="AI_Assistant",
    llm_config={
        "model": "claude-3-opus-20240229"
    }
)

# Initialize the user proxy agent
user_proxy = autogen.Agent(
    name="User_Proxy",
    human_input_mode="ALWAYS"
)

# Create a group chat
groupchat = autogen.GroupChat(agents=[user_proxy, assistant])
manager = autogen.GroupChatManager(groupchat=groupchat)

# Start the conversation
user_proxy.initiate_chat(
    manager,
    message="Can you help me analyze this dataset?"
)`
                          ) : product.name.toLowerCase().includes('crew') ? (
                          `from crewai import Agent, Task, Crew
from langchain.tools import tool

# Define tools
@tool
def search_tool(query):
    """Search for information online"""
    # Implementation goes here
    return f"Results for: {query}"

# Create agents
researcher = Agent(
    role="Researcher",
    goal="Find accurate information",
    backstory="You're an expert at finding information",
    tools=[search_tool],
    llm="claude-3-opus-20240229"
)

writer = Agent(
    role="Writer",
    goal="Create compelling content",
    backstory="You're an expert content creator",
    llm="claude-3-opus-20240229"
)

# Define tasks
research_task = Task(
    description="Research the latest AI developments",
    agent=researcher
)

writing_task = Task(
    description="Write an article based on the research",
    agent=writer
)

# Create the crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process="sequential"
)

# Execute the crew's tasks
result = crew.kickoff()`
                          ) : product.name.toLowerCase().includes('langchain') ? (
                          `from langchain.agents import initialize_agent, AgentType
from langchain.chat_models import ChatAnthropic
from langchain.tools import DuckDuckGoSearchRun
from langchain.memory import ConversationBufferMemory

# Initialize the language model
llm = ChatAnthropic(model="claude-3-opus-20240229")

# Initialize tools
search = DuckDuckGoSearchRun()
tools = [search]

# Set up memory
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# Initialize the agent
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory,
    verbose=True
)

# Run the agent
agent.run("Research the latest developments in autonomous agents")`
                          ) : (
                          `# Basic AI agent setup example
# This is a conceptual example - adapt to your specific framework

class AIAgent:
    def __init__(self, tools, llm_model):
        self.tools = tools
        self.llm_model = llm_model
    
    def execute(self, task):
        # Process task with available tools
        return f"Processing: {task}"

# Define available tools
tools = [
    {"name": "search", "description": "Search for information"},
    {"name": "analyze", "description": "Analyze data"}
]

# Create agent instance
agent = AIAgent(
    tools=tools,
    llm_model="claude-3-opus-20240229"
)

# Execute a task
result = agent.execute("Research AI frameworks")`
                          )}
                          <button 
                            className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-amber-700/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                product.name.toLowerCase().includes('autogen') 
                                  ? `import autogen

# Initialize the assistant agent
assistant = autogen.Agent(
    name="AI_Assistant",
    llm_config={
        "model": "claude-3-opus-20240229"
    }
)

# Initialize the user proxy agent
user_proxy = autogen.Agent(
    name="User_Proxy",
    human_input_mode="ALWAYS"
)

# Create a group chat
groupchat = autogen.GroupChat(agents=[user_proxy, assistant])
manager = autogen.GroupChatManager(groupchat=groupchat)

# Start the conversation
user_proxy.initiate_chat(
    manager,
    message="Can you help me analyze this dataset?"
)`
                                  : product.name.toLowerCase().includes('crew')
                                  ? `from crewai import Agent, Task, Crew
from langchain.tools import tool

# Define tools
@tool
def search_tool(query):
    """Search for information online"""
    # Implementation goes here
    return f"Results for: {query}"

# Create agents
researcher = Agent(
    role="Researcher",
    goal="Find accurate information",
    backstory="You're an expert at finding information",
    tools=[search_tool],
    llm="claude-3-opus-20240229"
)

writer = Agent(
    role="Writer",
    goal="Create compelling content",
    backstory="You're an expert content creator",
    llm="claude-3-opus-20240229"
)

# Define tasks
research_task = Task(
    description="Research the latest AI developments",
    agent=researcher
)

writing_task = Task(
    description="Write an article based on the research",
    agent=writer
)

# Create the crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process="sequential"
)

# Execute the crew's tasks
result = crew.kickoff()`
                                  : product.name.toLowerCase().includes('langchain')
                                  ? `from langchain.agents import initialize_agent, AgentType
from langchain.chat_models import ChatAnthropic
from langchain.tools import DuckDuckGoSearchRun
from langchain.memory import ConversationBufferMemory

# Initialize the language model
llm = ChatAnthropic(model="claude-3-opus-20240229")

# Initialize tools
search = DuckDuckGoSearchRun()
tools = [search]

# Set up memory
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# Initialize the agent
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory,
    verbose=True
)

# Run the agent
agent.run("Research the latest developments in autonomous agents")`
                                  : `# Basic AI agent setup example
# This is a conceptual example - adapt to your specific framework

class AIAgent:
    def __init__(self, tools, llm_model):
        self.tools = tools
        self.llm_model = llm_model
    
    def execute(self, task):
        # Process task with available tools
        return f"Processing: {task}"

# Define available tools
tools = [
    {"name": "search", "description": "Search for information"},
    {"name": "analyze", "description": "Analyze data"}
]

# Create agent instance
agent = AIAgent(
    tools=tools,
    llm_model="claude-3-opus-20240229"
)

# Execute a task
result = agent.execute("Research AI frameworks")`
                              );
                              toast({
                                title: "Copied!",
                                description: "Sample code copied to clipboard",
                              });
                            }}
                          >
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm mt-2">{t('product_detail.ai_agent.sample_code_description', { name: product.name })}</p>
                      </div>
                      
                      <div className="bg-zinc-900/70 rounded-lg p-5 border border-zinc-700/40">
                        <h4 className="text-lg font-medium text-white mb-3">{t('product_detail.ai_agent.resources')}</h4>
                        
                        <div className="space-y-3">
                          {product.githubUrl && (
                            <a 
                              href={product.githubUrl}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-amber-900/20 hover:border-amber-700/40 transition-all duration-300"
                            >
                              <Github className="h-5 w-5 text-amber-300" />
                              <span>Official Repository</span>
                              <ExternalLink className="h-4 w-4 ml-auto" />
                            </a>
                          )}
                          
                          {product.docsUrl && (
                            <a 
                              href={product.docsUrl}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-amber-900/20 hover:border-amber-700/40 transition-all duration-300"
                            >
                              <FileCode className="h-5 w-5 text-amber-300" />
                              <span>Documentation</span>
                              <ExternalLink className="h-4 w-4 ml-auto" />
                            </a>
                          )}
                          
                          <a 
                            href="https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/"
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-amber-900/20 hover:border-amber-700/40 transition-all duration-300"
                          >
                            <svg className="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                            <span>{t('product_detail.ai_agent.learn_ai_agents')}</span>
                            <ExternalLink className="h-4 w-4 ml-auto" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : product.product_type === 'ready_to_use' ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="bg-green-900/30 p-1.5 rounded-lg mr-3">
                    <Sparkles className="h-5 w-5 text-green-300" />
                  </span>
                  Ready-to-Use Solution
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gradient-to-br from-zinc-800/30 to-zinc-800/10 rounded-xl p-6 border border-zinc-700/40">
                    <h3 className="text-xl font-medium text-white mb-4">Solution Overview</h3>
                    <p className="text-gray-300 mb-5">{product.name} is a ready-to-use solution that combines AI capabilities with practical applications for immediate deployment. These solutions are designed to address specific use cases with minimal setup and configuration.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-zinc-900/50 rounded-lg p-5 border border-zinc-700/30">
                        <h4 className="text-lg font-medium text-white mb-3">Key Benefits</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Immediate implementation without extensive development</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Pre-configured for optimal performance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Regular updates and maintenance included</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300">Customizable to specific business needs</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-zinc-900/50 rounded-lg p-5 border border-zinc-700/30">
                        <h4 className="text-lg font-medium text-white mb-3">Included Components</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-gray-300">Pre-configured AI integration</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-gray-300">User-friendly interface</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-gray-300">Documentation and support resources</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <svg className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-gray-300">Integration capabilities with existing systems</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-900/10 to-emerald-900/10 rounded-xl p-6 border border-green-700/30">
                    <h3 className="text-xl font-medium text-white mb-4">Getting Started</h3>
                    
                    <div className="space-y-4">
                      {product.installation_command ? (
                        <div className="bg-zinc-900/70 rounded-lg p-5 border border-zinc-700/40">
                          <h4 className="text-lg font-medium text-white mb-3">Installation Command</h4>
                          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto relative group">
                            {product.installation_command}
                            <button 
                              className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-green-700/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                navigator.clipboard.writeText(product.installation_command);
                                toast({
                                  title: "Copied!",
                                  description: "Installation command copied to clipboard",
                                });
                              }}
                            >
                              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : null}
                      
                      <div className="bg-zinc-900/70 rounded-lg p-5 border border-zinc-700/40">
                        <h4 className="text-lg font-medium text-white mb-3">Quick Start Steps</h4>
                        
                        <ol className="space-y-3 pl-6 list-decimal">
                          <li className="text-gray-300">
                            <span className="font-medium text-white">Installation:</span> 
                            {product.installation_command 
                              ? " Use the installation command provided above." 
                              : " Follow the installation instructions in the documentation."}
                          </li>
                          <li className="text-gray-300">
                            <span className="font-medium text-white">Configuration:</span> Set up your environment variables and connection settings
                          </li>
                          <li className="text-gray-300">
                            <span className="font-medium text-white">Initialization:</span> Run the startup command and verify the service is running
                          </li>
                          <li className="text-gray-300">
                            <span className="font-medium text-white">Testing:</span> Validate functionality with the included test scripts
                          </li>
                          <li className="text-gray-300">
                            <span className="font-medium text-white">Integration:</span> Connect with your existing systems using the API documentation
                          </li>
                        </ol>
                      </div>
                      
                      <div className="bg-zinc-900/70 rounded-lg p-5 border border-zinc-700/40">
                        <h4 className="text-lg font-medium text-white mb-3">Resources</h4>
                        
                        <div className="space-y-3">
                          {product.githubUrl && (
                            <a 
                              href={product.githubUrl}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-green-900/20 hover:border-green-700/40 transition-all duration-300"
                            >
                              <Github className="h-5 w-5 text-green-300" />
                              <span>GitHub Repository</span>
                              <ExternalLink className="h-4 w-4 ml-auto" />
                            </a>
                          )}
                          
                          {product.docsUrl && (
                            <a 
                              href={product.docsUrl}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-green-900/20 hover:border-green-700/40 transition-all duration-300"
                            >
                              <FileCode className="h-5 w-5 text-green-300" />
                              <span>Documentation</span>
                              <ExternalLink className="h-4 w-4 ml-auto" />
                            </a>
                          )}
                          
                          {product.demoUrl && (
                            <a 
                              href={product.demoUrl}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-green-900/20 hover:border-green-700/40 transition-all duration-300"
                            >
                              <Sparkles className="h-5 w-5 text-green-300" />
                              <span>Live Demo</span>
                              <ExternalLink className="h-4 w-4 ml-auto" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Framework-specific features */}
                      <div className="bg-zinc-900/70 rounded-lg p-5 border border-zinc-700/40">
                        <h4 className="text-lg font-medium text-white mb-3">Framework-Specific Features</h4>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-700">
                                <th className="py-2 px-3 text-left text-zinc-400 font-medium">Feature</th>
                                <th className="py-2 px-3 text-left text-zinc-400 font-medium">Support</th>
                                <th className="py-2 px-3 text-left text-zinc-400 font-medium">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.name.toLowerCase().includes('autogen') ? (
                                <>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Multi-agent conversations</td>
                                    <td className="py-2 px-3 text-green-400">✓ Excellent</td>
                                    <td className="py-2 px-3 text-zinc-300">Core feature with group chats</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Tool integration</td>
                                    <td className="py-2 px-3 text-green-400">✓ Excellent</td>
                                    <td className="py-2 px-3 text-zinc-300">Native function calling support</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Claude integration</td>
                                    <td className="py-2 px-3 text-green-400">✓ Supported</td>
                                    <td className="py-2 px-3 text-zinc-300">Direct integration via Anthropic API</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Agent personalities</td>
                                    <td className="py-2 px-3 text-yellow-400">◯ Basic</td>
                                    <td className="py-2 px-3 text-zinc-300">Via system messages</td>
                                  </tr>
                                </>
                              ) : product.name.toLowerCase().includes('crew') ? (
                                <>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Role-based agents</td>
                                    <td className="py-2 px-3 text-green-400">✓ Excellent</td>
                                    <td className="py-2 px-3 text-zinc-300">Core feature with backstories</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Task hierarchy</td>
                                    <td className="py-2 px-3 text-green-400">✓ Excellent</td>
                                    <td className="py-2 px-3 text-zinc-300">Process-based tasks with delegation</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Claude integration</td>
                                    <td className="py-2 px-3 text-green-400">✓ Supported</td>
                                    <td className="py-2 px-3 text-zinc-300">Via Anthropic provider</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Human-like teamwork</td>
                                    <td className="py-2 px-3 text-green-400">✓ Excellent</td>
                                    <td className="py-2 px-3 text-zinc-300">Organizational structure modeling</td>
                                  </tr>
                                </>
                              ) : product.name.toLowerCase().includes('langchain') ? (
                                <>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Component modularity</td>
                                    <td className="py-2 px-3 text-green-400">✓ Excellent</td>
                                    <td className="py-2 px-3 text-zinc-300">Mix-and-match components</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Agent types</td>
                                    <td className="py-2 px-3 text-green-400">✓ Excellent</td>
                                    <td className="py-2 px-3 text-zinc-300">Multiple agent architectures</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Claude integration</td>
                                    <td className="py-2 px-3 text-green-400">✓ Supported</td>
                                    <td className="py-2 px-3 text-zinc-300">Via ChatAnthropic class</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Memory systems</td>
                                    <td className="py-2 px-3 text-green-400">✓ Excellent</td>
                                    <td className="py-2 px-3 text-zinc-300">Diverse memory implementations</td>
                                  </tr>
                                </>
                              ) : (
                                <>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Agent capabilities</td>
                                    <td className="py-2 px-3 text-yellow-400">◯ Varies</td>
                                    <td className="py-2 px-3 text-zinc-300">Depends on configuration</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Tool integration</td>
                                    <td className="py-2 px-3 text-yellow-400">◯ Varies</td>
                                    <td className="py-2 px-3 text-zinc-300">Check documentation</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Claude integration</td>
                                    <td className="py-2 px-3 text-yellow-400">◯ Varies</td>
                                    <td className="py-2 px-3 text-zinc-300">Usually supported</td>
                                  </tr>
                                  <tr className="border-b border-zinc-800">
                                    <td className="py-2 px-3 text-white">Framework architecture</td>
                                    <td className="py-2 px-3 text-yellow-400">◯ Varies</td>
                                    <td className="py-2 px-3 text-zinc-300">See documentation for details</td>
                                  </tr>
                                </>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Default contextual info for other product types
              <>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="bg-purple-900/30 p-1.5 rounded-lg mr-3">
                    <Sparkles className="h-5 w-5 text-purple-300" />
                  </span>
                  Product Resources
                </h2>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Integration guides */}
                  <div className="bg-gradient-to-br from-zinc-800/30 to-zinc-800/10 rounded-xl p-6 border border-zinc-700/40">
                    <h3 className="text-xl font-medium text-white mb-4">Integration Guide</h3>
                    
                    <div className="space-y-4">
                      {product.installation_command ? (
                        <div className="bg-zinc-900/50 rounded-lg p-5 border border-zinc-700/30">
                          <h4 className="text-lg font-medium text-white mb-3">Installation</h4>
                          <div className="bg-zinc-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto relative group">
                            {product.installation_command}
                            <button 
                              className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-purple-700/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                navigator.clipboard.writeText(product.installation_command);
                                toast({
                                  title: "Copied!",
                                  description: "Installation command copied to clipboard",
                                });
                              }}
                            >
                              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : null}
                      
                      <div className="bg-zinc-900/50 rounded-lg p-5 border border-zinc-700/30">
                        <h4 className="text-lg font-medium text-white mb-3">Common Use Cases</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-purple-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">Seamless Integration</h5>
                              <p className="text-gray-400 text-sm">Easy integration with existing workflows and systems</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-purple-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">Enhanced Productivity</h5>
                              <p className="text-gray-400 text-sm">Streamline workflows and automate repetitive tasks</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-purple-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">Secure Implementation</h5>
                              <p className="text-gray-400 text-sm">Built with security best practices and privacy in mind</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-purple-900/30 p-2 rounded-lg">
                                <svg className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-white mb-1">Data-Driven Insights</h5>
                              <p className="text-gray-400 text-sm">Extract valuable insights from your data</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resources */}
                  <div className="bg-gradient-to-br from-purple-900/10 to-indigo-900/10 rounded-xl p-6 border border-purple-700/30">
                    <h3 className="text-xl font-medium text-white mb-4">Resources</h3>
                    
                    <div className="space-y-3">
                      {product.githubUrl && (
                        <a 
                          href={product.githubUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                        >
                          <Github className="h-5 w-5 text-purple-300" />
                          <span>GitHub Repository</span>
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      )}
                      
                      {product.docsUrl && (
                        <a 
                          href={product.docsUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                        >
                          <FileCode className="h-5 w-5 text-purple-300" />
                          <span>Documentation</span>
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      )}
                      
                      {product.demoUrl && (
                        <a 
                          href={product.demoUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                        >
                          <Sparkles className="h-5 w-5 text-purple-300" />
                          <span>Live Demo</span>
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Related products section - only show if we have actual related products */}
          {relatedProducts.length > 0 && (
            <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-700/60 shadow-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="bg-purple-900/30 p-1.5 rounded-lg mr-3">
                  <ChevronRight className="h-5 w-5 text-purple-300" />
                </span>
                Related Products
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map(relatedProduct => (
                  <div 
                    key={relatedProduct.id} 
                    className="bg-gradient-to-br from-zinc-800/50 to-zinc-800/30 rounded-xl border border-zinc-700/40 overflow-hidden cursor-pointer hover:border-purple-500/40 hover:from-zinc-800/60 hover:to-zinc-800/40 transition-all duration-300 group"
                    onClick={() => {
                      // Use React Router navigation for all product types
                      navigate(`/products/${relatedProduct.type === 'client' ? `client-${relatedProduct.id}` : relatedProduct.id}`);
                    }}
                  >
                    <div className="h-40 bg-zinc-800/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/90 z-10"></div>
                      <img 
                        src={getProductImage(relatedProduct)} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/news-images/fallback.jpg';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                          {relatedProduct.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {relatedProduct.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="bg-purple-900/10 text-purple-300 border-purple-700/30">
                          {relatedProduct.category || 'General'}
                        </Badge>
                        
                        {(relatedProduct.stars_numeric || relatedProduct.stars) && (
                          <div className="flex items-center text-yellow-400">
                            <Star className="h-3 w-3 fill-yellow-400 mr-1" />
                            <span className="text-xs">{relatedProduct.stars_numeric || relatedProduct.stars}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar - 1/3 width on desktop */}
        <div className="lg:w-1/3 space-y-6">
          {/* Get Started Card */}
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/20 backdrop-blur-md rounded-xl border border-purple-500/20 shadow-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">{t('product_detail.common.get_started')}</h3>
            
            {product.installation_command && (
              <div className="bg-zinc-900/80 rounded-lg border border-zinc-700/50 mb-4 relative group">
                <div className="p-3 font-mono text-sm text-gray-300 overflow-x-auto">
                  {product.installation_command}
                </div>
                <button 
                  className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-purple-700/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    navigator.clipboard.writeText(product.installation_command);
                    toast({
                      title: "Copied!",
                      description: "Command copied to clipboard",
                    });
                  }}
                >
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="space-y-3">
              {product.githubUrl && (
                <a 
                  href={product.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                >
                  <Github className="h-5 w-5 text-purple-300" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </a>
              )}
              
              {product.npmUrl && (
                <a 
                  href={product.npmUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                >
                  <Package className="h-5 w-5 text-purple-300" />
                  <span>NPM Package</span>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </a>
              )}
              
              {product.docsUrl && (
                <a 
                  href={product.docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                >
                  <FileCode className="h-5 w-5 text-purple-300" />
                  <span>Documentation</span>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </a>
              )}
              
              {product.demoUrl && (
                <a 
                  href={product.demoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/70 border border-zinc-700/40 text-white hover:bg-purple-900/20 hover:border-purple-700/40 transition-all duration-300"
                >
                  <Sparkles className="h-5 w-5 text-purple-300" />
                  <span>Live Demo</span>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </a>
              )}
            </div>
          </div>
          
          {/* Product info panel based on product type */}
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-700/60 shadow-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {product.type === 'server' ? (
                <Server className="h-5 w-5 text-indigo-400" />
              ) : product.type === 'client' ? (
                <Laptop className="h-5 w-5 text-blue-400" />
              ) : product.type === 'ai-agent' ? (
                <Bot className="h-5 w-5 text-amber-400" />
              ) : (
                <Bookmark className="h-5 w-5 text-purple-400" />
              )}
              <span>{t('product_detail.common.product_details')}</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-1 divide-y divide-zinc-700/40">
              <div className="py-3 flex justify-between">
                <span className="text-gray-400">{t('product_detail.common.type')}</span>
                <span className="text-white font-medium">
                  {product.type === 'server' ? 'MCP Server' : 
                   product.type === 'client' ? 'MCP Client' : 
                   product.type === 'ai-agent' ? 'AI Agent' : 
                   product.product_type || 'Product'}
                </span>
              </div>
              
              {product.language && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">{t('product_detail.common.language')}</span>
                  <span className="text-white font-medium">{product.language}</span>
                </div>
              )}
              
              {product.license && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">{t('product_detail.common.license')}</span>
                  <span className="text-white font-medium">{product.license}</span>
                </div>
              )}
              
              {product.version && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">{t('product_detail.common.version')}</span>
                  <span className="text-white font-medium">{product.version}</span>
                </div>
              )}
              
              {product.lastUpdate && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">Last Update</span>
                  <span className="text-white font-medium">{product.lastUpdate}</span>
                </div>
              )}
              
              {product.createdBy && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">{t('product_detail.common.creator')}</span>
                  <span className="text-white font-medium">{product.createdBy}</span>
                </div>
              )}
              
              {product.creator && !product.createdBy && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">{t('product_detail.common.creator')}</span>
                  <span className="text-white font-medium">{product.creator}</span>
                </div>
              )}
              
              {/* Type-specific info */}
              {product.type === 'client' && product.platform && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">Platform</span>
                  <span className="text-white font-medium">{product.platform}</span>
                </div>
              )}
              
              {product.is_active !== undefined && (
                <div className="py-3 flex justify-between">
                  <span className="text-gray-400">{t('product_detail.common.status')}</span>
                  <span className={product.is_active ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {product.is_active ? t('product_detail.common.active') : t('product_detail.common.inactive')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Categories and tags card */}
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-700/60 shadow-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">{t('product_detail.common.categories_tags')}</h3>
            <div className="flex flex-wrap gap-2">
              {product.category && (
                <Link 
                  to={window.location.hash.startsWith('#/') ? 
                    `#/search?category=${encodeURIComponent(product.category)}` : 
                    `/products?category=${encodeURIComponent(product.category)}`
                  }
                  className="px-3 py-2 rounded-full bg-purple-900/20 text-sm text-purple-300 border border-purple-700/30 hover:bg-purple-900/30 hover:border-purple-600/40 transition-colors"
                >
                  {product.category}
                </Link>
              )}
              
              {product.categories && Array.isArray(product.categories) && product.categories.map(category => (
                <Link 
                  key={category}
                  to={window.location.hash.startsWith('#/') ? 
                    `#/search?category=${encodeURIComponent(category)}` : 
                    `/products?category=${encodeURIComponent(category)}`
                  }
                  className="px-3 py-2 rounded-full bg-purple-900/10 text-sm text-purple-300 border border-purple-700/20 hover:bg-purple-900/30 hover:border-purple-600/40 transition-colors"
                >
                  {category}
                </Link>
              ))}
              
              {product.tags && Array.isArray(product.tags) && product.tags.map(tag => (
                <Link 
                  key={tag}
                  to={window.location.hash.startsWith('#/') ? 
                    `#/search?q=${encodeURIComponent(tag)}` : 
                    `/products?q=${encodeURIComponent(tag)}`
                  }
                  className="px-3 py-2 rounded-full bg-zinc-800/70 text-sm text-gray-300 border border-zinc-700/40 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
              
              {/* If product.tags is a string, try to parse it */}
              {product.tags && typeof product.tags === 'string' && product.tags.split(',').map(tag => (
                <Link 
                  key={tag.trim()}
                  to={window.location.hash.startsWith('#/') ? 
                    `#/search?q=${encodeURIComponent(tag.trim())}` : 
                    `/products?q=${encodeURIComponent(tag.trim())}`
                  }
                  className="px-3 py-2 rounded-full bg-zinc-800/70 text-sm text-gray-300 border border-zinc-700/40 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  #{tag.trim()}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Similar tools card if available */}
          {product.similarTools && product.similarTools.length > 0 && (
            <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-700/60 shadow-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Similar Tools</h3>
              <div className="space-y-3">
                {product.similarTools.map(tool => (
                  <div 
                    key={tool.id} 
                    className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/40 hover:bg-zinc-800/70 hover:border-purple-700/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      const toolId = tool.id.split('/').pop();
                      if (toolId) {
                        window.location.hash = `#/products/${toolId}`;
                      }
                    }}
                  >
                    <h4 className="font-medium text-white text-lg mb-1">{tool.name}</h4>
                    <p className="text-gray-400 text-sm">{tool.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailTech;