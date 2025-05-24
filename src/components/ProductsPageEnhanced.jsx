import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import useProducts from '../hooks/useProducts';
import Pagination from './Pagination';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import SkeletonLoader from './animations/SkeletonLoader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import PremiumFilter from './ui/premium-filter';
import { Search, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const ProductsPageEnhanced = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse URL query parameters
  const parseUrlParams = () => {
    const searchParams = new URLSearchParams(location.search || window.location.search);
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    
    // Use either direct URL params or hash params
    const query = searchParams.get('q') || params.get('q') || '';
    const category = searchParams.get('category') || params.get('category') || '';
    const sort = searchParams.get('sort') || params.get('sort') || 'featured';
    
    // Parse more detailed filters
    const types = (searchParams.get('types') || params.get('types') || '').split(',').filter(Boolean);
    const categories = (searchParams.get('categories') || params.get('categories') || '').split(',').filter(Boolean);
    const ratings = (searchParams.get('ratings') || params.get('ratings') || '').split(',').filter(Boolean).map(Number);
    const priceMin = Number(searchParams.get('priceMin') || params.get('priceMin') || 0);
    const priceMax = Number(searchParams.get('priceMax') || params.get('priceMax') || 1000);
    
    return {
      searchQuery: query,
      categoryFilter: category,
      sortOption: sort,
      selectedFilters: {
        types,
        categories,
        ratings,
        priceRange: { min: priceMin, max: priceMax }
      }
    };
  };
  
  // Get initial state from URL
  const initialState = parseUrlParams();
  
  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialState.categoryFilter);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [sortOption, setSortOption] = useState(initialState.sortOption);
  const [selectedFilters, setSelectedFilters] = useState(initialState.selectedFilters);
  const [maxPrice, setMaxPrice] = useState(1000);
  
  // Initialize with database products
  const {
    products: dbProducts,
    loading: dbLoading,
    error: dbError,
    pagination,
    changePage,
    changeLimit,
    searchProducts: searchDbProducts,
    filterByCategory: filterDbByCategory
  } = useProducts();

  // Update URL with current filters
  const updateUrl = () => {
    const params = new URLSearchParams();
    
    // Only add parameters that aren't default
    if (searchQuery) params.set('q', searchQuery);
    if (categoryFilter) params.set('category', categoryFilter);
    if (sortOption !== 'featured') params.set('sort', sortOption);
    
    // Add filter parameters if they have values
    if (selectedFilters.types.length > 0) params.set('types', selectedFilters.types.join(','));
    if (selectedFilters.categories.length > 0) params.set('categories', selectedFilters.categories.join(','));
    if (selectedFilters.ratings.length > 0) params.set('ratings', selectedFilters.ratings.join(','));
    if (selectedFilters.priceRange.min > 0) params.set('priceMin', selectedFilters.priceRange.min.toString());
    if (selectedFilters.priceRange.max < maxPrice) params.set('priceMax', selectedFilters.priceRange.max.toString());
    
    // Determine if we're using direct path or hash
    const isDirectPath = window.location.pathname.includes('/products');
    const searchParamsString = params.toString();
    
    if (isDirectPath) {
      // Update URL with React Router
      navigate({
        pathname: '/products',
        search: searchParamsString ? `?${searchParamsString}` : ''
      }, { replace: true });
    } else {
      // For hash-based URLs
      window.location.hash = `#/products${searchParamsString ? `?${searchParamsString}` : ''}`;
    }
  };

  // Translation mapping for MCP data ONLY (not database products)
  const translateMcpData = (mcpItems) => {
    if (currentLanguage !== 'pt') return mcpItems;
    
    // Only translate MCP data, not database products
    // Database products already come translated from the API
    const translations = {
      // Names for MCP-only products
      'Visual Studio Code': 'Visual Studio Code',
      'Cursor': 'Cursor',
      'FileStash': 'ArquivoStash',
      'Sourcegraph Cody': 'Sourcegraph Cody',
      'Claude Code': 'Claude Code',
      'Claude CLI': 'Claude CLI',
      'GitHub': 'GitHub',
      'PostgreSQL MCP Server': 'Servidor MCP PostgreSQL',
      'MCP CLI Client': 'Cliente MCP CLI',
      'Claude Desktop': 'Claude Desktop',
      'VSCode MCP Extension': 'Extensão MCP VSCode',
      
      // Descriptions for MCP-only products
      'Popular code editor with MCP integration for AI-powered development assistance.': 'Editor de código popular com integração MCP para assistência de desenvolvimento com IA.',
      'AI-powered code editor with MCP integration for advanced code completion and editing.': 'Editor de código alimentado por IA com integração MCP para autocompletar e edição avançada.',
      'Remote Storage Access service that supports SFTP, S3, FTP, SMB, NFS, WebDAV, GIT, FTPS, gcloud, azure blob, sharepoint, and more through a unified MCP interface.': 'Serviço de acesso a armazenamento remoto que suporta SFTP, S3, FTP, SMB, NFS, WebDAV, GIT, FTPS, gcloud, azure blob, sharepoint e mais através de uma interface MCP unificada.',
      'AI coding assistant with MCP integration for advanced code analysis, generation, and documentation.': 'Assistente de codificação IA com integração MCP para análise, geração e documentação avançada de código.',
      'Official CLI tool for writing and refactoring code with Claude. Integrates seamlessly with your development workflow.': 'Ferramenta CLI oficial para escrever e refatorar código com Claude. Integra-se perfeitamente ao seu fluxo de trabalho de desenvolvimento.',
      'Command-line interface for Anthropic Claude with MCP support. Access Claude and all your MCP servers through a simple command line tool.': 'Interface de linha de comando para Anthropic Claude com suporte MCP. Acesse Claude e todos os seus servidores MCP através de uma ferramenta simples de linha de comando.',
      'GitHub API integration for repository management, PRs, issues, and more. Enables AI to interact with and manage GitHub repositories and workflows.': 'Integração da API GitHub para gerenciamento de repositórios, PRs, issues e mais. Permite à IA interagir e gerenciar repositórios e fluxos de trabalho do GitHub.',
      
      // Categories for MCP-only products
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
    
    // Only apply translations to MCP items (not database products)
    return mcpItems.map(item => {
      // Skip translation for database products - they come pre-translated from API
      if (item.type === 'custom-product' || item.product_type) {
        return item;
      }
      
      return {
        ...item,
        name: translations[item.name] || item.name,
        description: translations[item.description] || item.description,
        shortDescription: translations[item.shortDescription] || translations[item.description] || item.shortDescription,
        category: translations[item.category] || item.category,
        categories: item.categories?.map(cat => translations[cat] || cat) || item.categories
      };
    });
  };

  // Function to fetch MCP unified data for integration
  const fetchMcpData = async () => {
    try {
      let mcpData = [];
      
      // Check if window.mcpServersDirectData is available
      if (window.mcpServersDirectData && Array.isArray(window.mcpServersDirectData)) {
        mcpData = window.mcpServersDirectData;
      }
      // As a fallback, try loading unified data
      else if (window.unifiedSearchData && Array.isArray(window.unifiedSearchData)) {
        mcpData = window.unifiedSearchData;
      }
      // If we don't have MCP data, just use our DB products
      else {
        mcpData = [];
      }
      
      // Apply translations if in Portuguese
      return translateMcpData(mcpData);
    } catch (error) {
      console.error("Error fetching MCP data:", error);
      return [];
    }
  };

  // Function to combine database products with MCP data
  const combineProductData = async () => {
    setIsLoading(true);
    
    try {
      // Get MCP data with a timeout to prevent long-running operations
      const fetchMcpDataWithTimeout = async () => {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("MCP data fetch timeout")), 3000);
        });
        
        try {
          return await Promise.race([fetchMcpData(), timeoutPromise]);
        } catch (error) {
          console.warn("Timed out or error fetching MCP data:", error);
          // Return an empty array as fallback
          return [];
        }
      };
      
      const mcpData = await fetchMcpDataWithTimeout();
      console.log(`Fetched ${mcpData.length} MCP data items`);
      
      let formattedDbProducts = [];
      
      // Only process dbProducts if they exist and aren't loading
      if (!dbLoading && dbProducts && dbProducts.length > 0) {
        // Format database products to match MCP data format
        formattedDbProducts = dbProducts.map(product => {
          // Check if Portuguese description is a placeholder
          const isPlaceholderPt = product.description_pt && (
            product.description_pt.includes('Este servidor MCP foi desenvolvido para integração com Claude AI') ||
            product.description_pt.includes('Este cliente MCP foi desenvolvido para integração com Claude AI') ||
            product.description_pt.includes('Este servidor MCP oferece funcionalidades avançadas para integração com sistemas Claude')
          );
          
          // Use English description if Portuguese is a placeholder
          const displayDescription = isPlaceholderPt 
            ? (product.description_en || product.description)
            : (product.description || product.description_en);
          
          return {
            ...product,
            id: String(product.id),
            type: 'custom-product',
            stars: product.stars_numeric || 0,
            shortDescription: displayDescription 
              ? displayDescription.substring(0, 150) + (displayDescription.length > 150 ? '...' : '') 
              : 'No description available.',
            longDescription: displayDescription || 'No detailed description available.',
            categories: product.category ? [product.category] : ['Products'],
            name: product.name || 'Unnamed Product',
            image_url: product.image_url || '/assets/news-images/fallback.jpg',
            local_image_path: product.image_url || '/assets/news-images/fallback.jpg',
            price: product.price || 0,
            keyFeatures: [],
            useCases: []
          };
        });
        console.log(`Processed ${formattedDbProducts.length} database products`);
      } else if (dbLoading) {
        console.log("Database products still loading, will refresh when ready");
      } else {
        console.log("No database products available");
      }
      
      // Combine the data sources
      const combinedProducts = [...formattedDbProducts, ...mcpData];
      console.log(`Combined ${combinedProducts.length} total products`);
      
      // Extract unique categories from all products
      const allCategories = new Set();
      const allTypes = new Set();
      let highestPrice = 0;
      
      combinedProducts.forEach(product => {
        if (product.category) {
          allCategories.add(product.category);
        }
        if (product.categories && Array.isArray(product.categories)) {
          product.categories.forEach(cat => allCategories.add(cat));
        }
        if (product.type) {
          allTypes.add(product.type);
        }
        if (product.price && Number(product.price) > highestPrice) {
          highestPrice = Number(product.price);
        }
      });
      
      setCategories(Array.from(allCategories).sort());
      setProductTypes(Array.from(allTypes));
      setMaxPrice(Math.max(1000, Math.ceil(highestPrice / 100) * 100)); // Round up to nearest 100
      
      // Apply filters to the combined products
      let filteredResults = combinedProducts;
      
      // Apply type filter based on tab
      if (activeTab && activeTab !== 'all') {
        filteredResults = filteredResults.filter(p => p.type === activeTab);
      }
      
      // Apply filter for types
      if (selectedFilters.types.length > 0) {
        filteredResults = filteredResults.filter(p => 
          selectedFilters.types.includes(p.type)
        );
      }
      
      // Apply filter for categories
      if (selectedFilters.categories.length > 0) {
        filteredResults = filteredResults.filter(p => {
          // Check in both category and categories array
          const productCategories = [];
          if (p.category) productCategories.push(p.category);
          if (p.categories && Array.isArray(p.categories)) {
            productCategories.push(...p.categories);
          }
          
          return productCategories.some(cat => 
            selectedFilters.categories.includes(cat)
          );
        });
      } else if (categoryFilter && categoryFilter !== 'all') {
        // Legacy category filter
        filteredResults = filteredResults.filter(p => 
          p.category === categoryFilter || 
          (p.categories && p.categories.includes(categoryFilter))
        );
      }
      
      // Apply filter for ratings
      if (selectedFilters.ratings.length > 0) {
        filteredResults = filteredResults.filter(p => {
          const productRating = Math.floor(p.stars || p.stars_numeric || 0);
          return selectedFilters.ratings.includes(productRating);
        });
      }
      
      // Apply filter for price range
      if (selectedFilters.priceRange.min > 0 || selectedFilters.priceRange.max < maxPrice) {
        filteredResults = filteredResults.filter(p => {
          // Skip products without price
          if (!p.price) return true;
          
          const price = Number(p.price);
          return price >= selectedFilters.priceRange.min && price <= selectedFilters.priceRange.max;
        });
      }
      
      // Apply search filter if set
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredResults = filteredResults.filter(p => 
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(query)) ||
          (p.longDescription && p.longDescription.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query))
        );
      }
      
      // Apply sorting
      filteredResults = sortProducts(filteredResults);
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error combining product data:", error);
      // Set search results to an empty array in case of error
      setSearchResults([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };
  
  // Sort products based on sort option
  const sortProducts = (products) => {
    const productsToSort = [...products];
    
    switch (sortOption) {
      case 'featured':
        return productsToSort.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      case 'name_asc':
        return productsToSort.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name_desc':
        return productsToSort.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'rating_desc':
        return productsToSort.sort((a, b) => (b.stars || b.stars_numeric || 0) - (a.stars || a.stars_numeric || 0));
      case 'price_asc':
        return productsToSort.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return productsToSort.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'newest':
        // Using id as a proxy for "newest"
        return productsToSort.sort((a, b) => String(b.id).localeCompare(String(a.id)));
      default:
        return productsToSort;
    }
  };

  // Load combined data when products change or filters change
  useEffect(() => {
    combineProductData();
  }, [dbProducts, activeTab, categoryFilter, searchQuery, sortOption, selectedFilters, currentLanguage]);
  
  // Update URL when state changes
  useEffect(() => {
    // Skip the initial render
    if (!isLoading && searchResults.length > 0) {
      updateUrl();
    }
  }, [activeTab, categoryFilter, sortOption, searchQuery, selectedFilters]);
  
  // Function to determine the product type badge
  const getTypeBadge = (product) => {
    switch (product.type) {
      case 'server':
        return (
          <Badge className="absolute top-2 right-2" variant="secondary">
            {t('products.enhanced.type_badges.server')}
          </Badge>
        );
      case 'client':
        return (
          <Badge className="absolute top-2 right-2" variant="default">
            {t('products.enhanced.type_badges.client')}
          </Badge>
        );
      case 'custom-product':
        return (
          <Badge className="absolute top-2 right-2" variant="outline">
            {t('products.enhanced.type_badges.product')}
          </Badge>
        );
      case 'ai-agent':
        return (
          <Badge className="absolute top-2 right-2" variant="destructive">
            {t('products.enhanced.type_badges.ai_agent')}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    // The search will be applied in the useEffect hook
  };

  // Handle search query change
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      // Clear search immediately
      setTimeout(updateUrl, 0);
    }
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    const newCategories = [...selectedFilters.categories];
    const index = newCategories.indexOf(category);
    
    if (index >= 0) {
      newCategories.splice(index, 1);
    } else {
      newCategories.push(category);
    }
    
    setSelectedFilters({
      ...selectedFilters,
      categories: newCategories
    });
  };
  
  // Handle type filter
  const handleTypeChange = (type) => {
    const newTypes = [...selectedFilters.types];
    const index = newTypes.indexOf(type);
    
    if (index >= 0) {
      newTypes.splice(index, 1);
    } else {
      newTypes.push(type);
    }
    
    setSelectedFilters({
      ...selectedFilters,
      types: newTypes
    });
  };
  
  // Handle rating filter
  const handleRatingChange = (rating) => {
    const newRatings = [...selectedFilters.ratings];
    const index = newRatings.indexOf(rating);
    
    if (index >= 0) {
      newRatings.splice(index, 1);
    } else {
      newRatings.push(rating);
    }
    
    setSelectedFilters({
      ...selectedFilters,
      ratings: newRatings
    });
  };
  
  // Handle price range filter
  const handlePriceRangeChange = (range) => {
    setSelectedFilters({
      ...selectedFilters,
      priceRange: range
    });
  };
  
  // Handle sort change
  const handleSortChange = (value) => {
    setSortOption(value);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSelectedFilters({
      types: [],
      categories: [],
      ratings: [],
      priceRange: { min: 0, max: maxPrice }
    });
    setCategoryFilter('');
    setSortOption('featured');
  };

  // Handle navigation to product detail
  const handleNavigateToDetail = (product) => {
    console.log(`Navigating to product detail for: ${product.name} (${product.type})`);
    
    // Save the product data to sessionStorage for faster loading
    try {
      // Store in different keys based on product type
      if (product.type === 'custom-product') {
        // For custom products, either update the cached_custom_products array or create a new one
        const existingCache = sessionStorage.getItem('cached_custom_products');
        if (existingCache) {
          const parsedCache = JSON.parse(existingCache);
          // Check if this product already exists in cache
          const existingIndex = parsedCache.findIndex(p => String(p.id) === String(product.id));
          
          if (existingIndex >= 0) {
            // Update existing product
            parsedCache[existingIndex] = {...product};
          } else {
            // Add new product
            parsedCache.push({...product});
          }
          
          sessionStorage.setItem('cached_custom_products', JSON.stringify(parsedCache));
        } else {
          // Create new cache with this product
          sessionStorage.setItem('cached_custom_products', JSON.stringify([{...product}]));
        }
      } else {
        // For MCP products, store individually
        sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
      }
    } catch (err) {
      console.warn("Could not cache product data:", err);
    }
    
    // Determine the appropriate URL based on product type
    if (product.type === 'custom-product') {
      // Always use React Router path for custom products
      navigate(`/products/${product.id}`);
    } else if (product.type === 'client') {
      // Use hash-based routing for clients
      window.location.hash = `#/products/client-${product.id}`;
    } else {
      // Use hash-based routing for servers
      window.location.hash = `#/products/${product.id}`;
    }
  };

  // Split components into batches for staggered animation
  const batchedResults = useMemo(() => {
    if (!searchResults.length) return [];
    
    const batchSize = 8;
    const batches = [];
    
    for (let i = 0; i < searchResults.length; i += batchSize) {
      batches.push(searchResults.slice(i, i + batchSize));
    }
    
    return batches;
  }, [searchResults]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Modern search header */}
      <div className="rounded-xl bg-zinc-900/80 backdrop-blur-md shadow-lg border border-purple-500/20 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left side - Title and search stats */}
          <div className="w-full md:w-auto">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300 mb-2">
              {searchQuery ? t('products.enhanced.search_results_for', { query: searchQuery }) : t('products.enhanced.all_products')}
            </h1>
            
            {!searchQuery && (
              <p className="text-gray-300 text-lg mb-2">
                {t('products.enhanced.all_products_description')}
              </p>
            )}
            
            {searchResults.length > 0 && (
              <p className="text-gray-300 text-sm">
                {t('products.enhanced.showing_results', { count: searchResults.length })}
                {categoryFilter && categoryFilter !== 'all' && (
                  <> {t('products.enhanced.in_category', { category: categoryFilter })}</>
                )}
              </p>
            )}
          </div>
          
          {/* Right side - Search input */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <form onSubmit={handleSearch} className="flex gap-2 relative">
              <Input
                type="text"
                placeholder={t('products.enhanced.search_placeholder')}
                value={searchQuery}
                onChange={handleSearchQueryChange}
                className="flex-1 pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-[4.5rem] top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              <Button type="submit" disabled={isSearching} variant="secondary">
                {isSearching ? t('products.enhanced.searching') : t('products.enhanced.search')}
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Resource type tabs with icons */}
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-zinc-800/80 rounded-xl p-1 shadow-inner">
          <TabsTrigger 
            value="all"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>{t('products.enhanced.tabs.all')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="custom-product"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span>{t('products.enhanced.tabs.products')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="server"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
            <span>{t('products.enhanced.tabs.servers')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="client"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{t('products.enhanced.tabs.clients')}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Premium filters */}
      <PremiumFilter 
        categories={categories}
        types={productTypes}
        onCategoryChange={handleCategoryChange}
        onTypeChange={handleTypeChange}
        onPriceRangeChange={handlePriceRangeChange}
        onRatingChange={handleRatingChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        activeFilters={selectedFilters}
        sortOption={sortOption}
        totalResults={searchResults.length}
        maxPrice={maxPrice}
      />
      
      {/* Error message */}
      {dbError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {dbError}
        </div>
      )}
      
      {/* Products grid with staggered animations */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-full animate-pulse rounded-xl overflow-hidden relative">
                <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 rounded-xl shadow-xl border border-zinc-700/60 h-[280px] flex flex-col">
                  {/* Badge placeholder */}
                  <div className="absolute top-2 right-2 w-16 h-5 bg-zinc-700/50 rounded-full"></div>
                  
                  {/* Image placeholder */}
                  <div className="w-full h-40 bg-zinc-700/30 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-zinc-900/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full p-2">
                      <div className="h-4 bg-zinc-700/70 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-zinc-700/70 rounded-full w-1/3"></div>
                    </div>
                  </div>
                  
                  {/* Content placeholders */}
                  <div className="flex-grow p-4">
                    <div className="h-4 bg-zinc-700/50 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-zinc-700/50 rounded w-full mb-1"></div>
                    <div className="h-3 bg-zinc-700/50 rounded w-2/3"></div>
                  </div>
                  
                  {/* Footer placeholder */}
                  <div className="border-t border-zinc-700/30 mt-auto p-2 flex justify-between">
                    <div className="h-3 bg-zinc-700/50 rounded w-1/4"></div>
                    <div className="h-5 w-5 bg-zinc-700/50 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {batchedResults.map((batch, batchIndex) => (
                  <React.Fragment key={`batch-${batchIndex}`}>
                    {batch.map((product, productIndex) => (
                      <motion.div
                        key={`${product.type || 'unknown'}-${product.id || productIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.05 * (batchIndex + (productIndex / batch.length)), 
                          ease: "easeOut" 
                        }}
                        whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                        className="h-full rounded-xl overflow-hidden relative cursor-pointer group"
                        onClick={() => handleNavigateToDetail(product)}
                      >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-indigo-600/0 opacity-0 group-hover:opacity-10 group-hover:from-purple-600/20 group-hover:to-indigo-600/20 rounded-xl blur-xl transition-all duration-500"></div>
                        
                        <div className="relative h-full flex flex-col bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 rounded-xl shadow-xl border border-zinc-700/60 group-hover:border-purple-500/50 transition-all duration-300">
                          {/* Type badge */}
                          {getTypeBadge(product)}
                          
                          {/* Featured badge if applicable */}
                          {product.is_featured && (
                            <Badge className="absolute top-2 left-2" variant="secondary">
                              {t('products.enhanced.featured')}
                            </Badge>
                          )}
                          
                          {/* Thumbnail image section */}
                          <div className="relative w-full h-40 overflow-hidden">
                            {product.image_url || product.local_image_path ? (
                              <img
                                src={product.local_image_path || product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/news-images/fallback.jpg';
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-zinc-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/95 via-zinc-900/70 to-transparent"></div>
                            
                            {/* Product name overlaid on image */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className="text-lg font-semibold text-white mb-0.5 line-clamp-1 drop-shadow-lg" title={product.name}>
                                {product.name}
                              </h3>
                              
                              {/* Category label */}
                              {product.category && (
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-300 bg-black/50 px-1.5 py-0.5 rounded-full inline-flex items-center drop-shadow-lg">
                                    <span className="w-1.5 h-1.5 rounded-full mr-1 bg-purple-400"></span>
                                    {product.category.length > 25 ? product.category.substring(0, 22) + '...' : product.category}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-grow p-4">
                            {/* Price if available */}
                            {product.price > 0 && (
                              <p className="text-lg font-bold text-white mb-1">{t('common.currency_symbol')}{Number(product.price).toFixed(2)}</p>
                            )}
                            
                            {/* Description */}
                            {product.shortDescription || product.description ? (
                              <p className="text-sm text-gray-400 mb-3 line-clamp-3 group-hover:text-gray-300 transition-colors duration-300">
                                {product.shortDescription || product.description}
                              </p>
                            ) : null}
                            
                            {/* Tags/Keywords if available */}
                            {product.keywords && product.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {product.keywords.slice(0, 3).map((keyword, index) => (
                                  <span key={index} className="text-xs bg-zinc-800 text-gray-400 px-2 py-0.5 rounded-full">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="border-t border-zinc-700/30 p-3 flex items-center justify-between">
                            {/* Stars/Rating */}
                            {(product.stars || product.stars_numeric) ? (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                                <span className="text-sm text-gray-300 font-medium">
                                  {typeof product.stars_numeric === 'number' 
                                    ? product.stars_numeric.toLocaleString() 
                                    : product.stars}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">{t('products.enhanced.no_rating')}</span>
                            )}
                            
                            {/* View button */}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 transition-colors duration-300"
                            >
                              {t('products.enhanced.view_details')}
                            </Button>
                          </div>
                          
                          {/* Hover overlay - visible on hover */}
                          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/0 to-zinc-900/80 opacity-0 group-hover:opacity-100 flex items-end justify-center transition-all duration-300 p-4">
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                              {t('products.enhanced.view_details_hover')}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-8 bg-zinc-900/40 rounded-xl border border-zinc-800/60 max-w-2xl mx-auto mt-8">
                <div className="text-gray-400 w-20 h-20 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">{t('products.empty_state.title')}</h2>
                <p className="text-gray-400 text-center mb-6 max-w-md">
                  {searchQuery ? 
                    t('products.enhanced.no_products_message', { query: searchQuery }) :
                    t('products.enhanced.no_products_filters')
                  }
                </p>
                <Button 
                  onClick={handleClearFilters}
                  className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {t('products.enhanced.clear_filters')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Pagination */}
      {!isLoading && searchResults.length > 0 && pagination.totalPages > 1 && activeTab === 'custom-product' && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={changePage}
          />
        </div>
      )}
      
      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
};

export default ProductsPageEnhanced;