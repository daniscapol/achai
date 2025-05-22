import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import SkeletonLoader from './animations/SkeletonLoader';
import { 
  SlideInStagger, 
  GradientText, 
  FloatingElement, 
  GlowingBorder,
  ShimmerEffect,
  HoverSpotlight 
} from './animations/PremiumAnimations';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star, 
  TrendingUp, 
  Sparkles,
  Package,
  Server,
  Laptop,
  Bot,
  Zap
} from 'lucide-react';

const ProductsPageAnimated = () => {
  const {
    products,
    loading,
    error,
    pagination,
    changePage,
    changeLimit,
    searchProducts,
    filterByCategory
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Extract unique categories from products
  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product.category))];
      setCategories(uniqueCategories);
    }
  }, [products]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchProducts(searchQuery);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    filterByCategory(value);
  };

  const handleLimitChange = (value) => {
    changeLimit(parseInt(value));
  };

  // Get product type icon and color
  const getProductTypeInfo = (type) => {
    switch (type) {
      case 'mcp_server':
      case 'server':
        return { icon: Server, color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'MCP Server' };
      case 'mcp_client':
      case 'client':
        return { icon: Laptop, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'MCP Client' };
      case 'ai_agent':
      case 'ai-agent':
        return { icon: Bot, color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'AI Agent' };
      case 'ready_to_use':
      case 'ready-to-use':
        return { icon: Zap, color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'Ready to Use' };
      default:
        return { icon: Package, color: 'text-gray-400', bgColor: 'bg-gray-500/20', label: 'Product' };
    }
  };

  // Enhanced product card component
  const ProductCard = ({ product, index }) => {
    const typeInfo = getProductTypeInfo(product.product_type);
    const TypeIcon = typeInfo.icon;

    return (
      <div className="group relative">
        <GlowingBorder 
          color="from-purple-500/50 to-indigo-500/50" 
          intensity={0.3}
          containerClassName="h-full"
        >
          <Card className="overflow-hidden h-full flex flex-col bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-purple-500/10">
            {/* Image Section with Hover Effects */}
            <div className="relative pb-[56.25%] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FloatingElement delay={index * 0.1}>
                    <TypeIcon className={`w-12 h-12 ${typeInfo.color} opacity-50`} />
                  </FloatingElement>
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={`${typeInfo.bgColor} ${typeInfo.color} border-0 text-xs font-medium`}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {typeInfo.label}
                </Badge>
                {product.is_featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs font-medium">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Price overlay */}
              {product.price > 0 && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm">
                    ${Number(product.price).toFixed(2)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Section */}
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-2 text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                {product.name}
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                {product.category}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow pb-3">
              <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed">
                {product.description}
              </p>
              
              {/* Stats */}
              {product.stars_numeric > 0 && (
                <div className="flex items-center mt-3 text-xs text-gray-400">
                  <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
                  <span>{product.stars_numeric}</span>
                  {product.language && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{product.language}</span>
                    </>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-gray-700/50 pt-4">
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/25"
              >
                <Link to={window.location.pathname.includes('products') ? 
                  `/products/${product.id}` : 
                  `#/products/${product.id}`}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </GlowingBorder>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <FloatingElement distance={15} duration={6}>
            <h1 className="text-5xl font-bold mb-4">
              <GradientText 
                text="Discover Amazing Products" 
                colors="from-purple-400 via-indigo-400 to-purple-400"
                className="text-5xl font-bold"
              />
            </h1>
          </FloatingElement>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our curated collection of MCP servers, clients, and AI agents
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isSearchFocused ? 'text-purple-400' : 'text-gray-400'}`} />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="pl-12 pr-4 py-3 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 rounded-lg px-4 py-2"
                  >
                    Search
                  </Button>
                </div>
              </form>
              
              {/* Filters */}
              <div className="flex gap-4">
                <Select onValueChange={handleCategoryChange} defaultValue="all">
                  <SelectTrigger className="w-[200px] bg-gray-900/50 border-gray-600 text-white rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select onValueChange={handleLimitChange} defaultValue={pagination.limit?.toString() || "20"}>
                  <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-600 text-white rounded-xl">
                    <List className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Per page" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-8 backdrop-blur-sm">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: pagination.limit || 20 }).map((_, index) => (
              <Card key={index} className="overflow-hidden bg-gray-800/50 border-gray-700/50">
                <div className="relative pb-[56.25%]">
                  <Skeleton className="absolute inset-0 bg-gray-700/50" />
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2 bg-gray-700/50" />
                  <Skeleton className="h-4 w-1/2 bg-gray-700/50" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-gray-700/50" />
                  <Skeleton className="h-4 w-3/4 bg-gray-700/50" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full bg-gray-700/50" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <SlideInStagger 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            delay={0.1}
            staggerDelay={0.05}
          >
            {products && products.length > 0 ? (
              products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <FloatingElement>
                  <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                </FloatingElement>
                <p className="text-xl text-gray-400 mb-2">No products found</p>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </SlideInStagger>
        )}

        {/* Pagination */}
        {!loading && products && products.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-2">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={changePage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPageAnimated;