import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SkeletonLoader from './animations/SkeletonLoader';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  ArrowLeft, Star, ExternalLink, Github, Package, FileCode, 
  Bookmark, Server, Laptop, Code, Sparkles, ChevronLeft, ChevronRight,
  Download, Code2
} from 'lucide-react';

const ProductDetailPageNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('about');
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [githubStats, setGithubStats] = useState({
    stars: 2400,
    forks: 560,
    lastUpdated: '2 weeks ago'
  });

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
        
        // First check: if we're in the search interface or have global MCP data, try to find the product there
        if (window.mcpServersDirectData) {
          // Try to find the product in the loaded MCP data
          const mcpProduct = window.mcpServersDirectData.find(p => String(p.id) === String(id));
          if (mcpProduct) {
            console.log('Found product in global MCP data:', mcpProduct);
            setProduct(mcpProduct);
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
              setProduct(cachedProduct);
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
          const response = await fetch(`http://localhost:3001/api/products/${id}`, {
            signal: controller.signal,
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('API product data:', data);
          setProduct(data);
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
          throw apiError; // Re-throw to be caught by the outer catch
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
  }, [id]);

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
            setRelatedProducts(relatedFromCache);
            clearTimeout(timeoutId);
            return;
          }
        }
      } catch (cacheErr) {
        console.warn('Error accessing sessionStorage cache for related products:', cacheErr);
      }
      
      // If not found or we're in the regular interface, fetch from API with timeout protection
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${apiBaseUrl}/api/products/category/${category}?limit=4`, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.products?.length || 0} related products from API`);
        
        // Filter out the current product
        const filtered = data.products?.filter(p => String(p.id) !== String(id)) || [];
        setRelatedProducts(filtered.slice(0, 4)); // Show at most 4 related products
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

  const incrementQuantity = () => {
    if (product && quantity < product.inventory_count) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  // Mock product images array for demonstration
  const getProductImages = (product) => {
    if (!product) return [];
    
    // Main image
    const images = [product.image_url || '/assets/news-images/fallback.jpg'];
    
    // Add additional mock images for demonstration
    if (product.image_url) {
      // Add 3 more variations if we have a main image
      for (let i = 0; i < 3; i++) {
        images.push(product.image_url);
      }
    }
    
    return images;
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-3/5">
            <div className="bg-zinc-100 rounded-lg">
              <SkeletonLoader variant="rect" className="w-full aspect-[4/3]" />
            </div>
            <div className="flex mt-4 gap-2">
              {[1, 2, 3, 4].map((_, index) => (
                <SkeletonLoader key={index} variant="rect" className="w-24 h-24 rounded-md" />
              ))}
            </div>
          </div>
          
          <div className="lg:w-2/5">
            <SkeletonLoader variant="text" height={36} className="w-3/4 mb-4" />
            <SkeletonLoader variant="text" height={24} className="w-1/2 mb-6" />
            <SkeletonLoader variant="text" height={28} className="w-1/4 mb-6" />
            
            <SkeletonLoader variant="text" height={16} className="w-full mb-2" />
            <SkeletonLoader variant="text" height={16} className="w-full mb-2" />
            <SkeletonLoader variant="text" height={16} className="w-3/4 mb-8" />
            
            <div className="flex flex-col space-y-4 mb-6">
              <SkeletonLoader variant="rect" height={48} className="w-full" />
              <SkeletonLoader variant="rect" height={48} className="w-full" />
            </div>
            
            <SkeletonLoader variant="rect" height={24} className="w-full mb-4" />
            <SkeletonLoader variant="rect" height={24} className="w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
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
        <div className="bg-amber-100 border border-amber-400 text-amber-700 px-4 py-3 rounded mb-6">
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

  const productImages = getProductImages(product);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 text-gray-200">
      {/* Breadcrumb navigation */}
      <div className="flex items-center mb-6 text-sm">
        <Link to={window.location.hash.startsWith('#/') ? '#/' : '/'} className="text-gray-400 hover:text-purple-400">
          Home
        </Link>
        <span className="mx-2 text-gray-600">/</span>
        <Link 
          to={window.location.hash.startsWith('#/') ? '#/search' : '/products'} 
          className="text-gray-400 hover:text-purple-400"
          onClick={(e) => {
            // For custom products using hash-based URL
            if (product?.type === 'custom-product' && window.location.hash.startsWith('#/')) {
              e.preventDefault();
              navigate('/products'); // Use React Router for custom products
            }
          }}
        >
          Technology
        </Link>
        {product.category && (
          <>
            <span className="mx-2 text-gray-600">/</span>
            <Link 
              to={window.location.hash.startsWith('#/') ? 
                `#/search?category=${encodeURIComponent(product.category)}` : 
                `/products?category=${encodeURIComponent(product.category)}`
              } 
              className="text-gray-400 hover:text-purple-400"
            >
              {product.category}
            </Link>
          </>
        )}
        <span className="mx-2 text-gray-600">/</span>
        <span className="text-gray-300 font-medium">{product.name}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area - 2/3 width */}
        <div className="md:col-span-2">
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700 transition-all hover:shadow-xl hover:border-zinc-600">
            <div className="flex items-center mb-6">
              <div className="relative w-20 h-20 rounded-lg mr-4 flex-shrink-0 bg-zinc-900/80 flex items-center justify-center overflow-hidden">
                <img 
                  src={productImages[activeImage]} 
                  alt={`${product.name} logo`}
                  className="w-auto max-w-[80%] h-auto max-h-[80%] object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-100">{product.name}</h1>
                <p className="text-sm text-gray-400">
                  {product.createdBy || 'Developed by AI Community'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {/* Type badge */}
              <span className="inline-flex items-center bg-purple-600/80 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                <Server className="h-3 w-3 mr-1" />
                MCP Server
              </span>
              
              {/* Category badges */}
              {product.category && (
                <span className="inline-flex items-center bg-zinc-700 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {product.category}
                </span>
              )}
              
              {/* Status badge */}
              <span className="inline-flex items-center bg-green-600/80 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300 mr-1"></span>
                Active
              </span>
            </div>

            <p className="text-gray-300 mb-6">{product.description}</p>
            
            {/* Tabs for content sections */}
            <div className="mb-6 border-b border-zinc-700">
              <Tabs defaultValue="about" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="about" className="data-[state=active]:bg-zinc-700">About</TabsTrigger>
                  <TabsTrigger value="features" className="data-[state=active]:bg-zinc-700">Features</TabsTrigger>
                  <TabsTrigger value="usecases" className="data-[state=active]:bg-zinc-700">Use Cases</TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-zinc-700">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="py-4">
                  <h2 className="text-2xl font-semibold text-gray-100 mb-4">About {product.name}</h2>
                  <p className="text-gray-300 mb-6 whitespace-pre-line">
                    {product.longDescription || product.description}
                  </p>
                  
                  {/* Installation section */}
                  <h3 className="text-xl font-semibold text-gray-100 mt-8 mb-4">Installation</h3>
                  <div className="bg-zinc-900 rounded-md p-4 mb-6">
                    <code className="text-sm text-gray-300 block">
                      <span className="text-purple-400">claude</span> mcp add {product.name.toLowerCase().replace(/\s+/g, "-")} /path/to/server
                    </code>
                  </div>
                  
                  {/* Documentation link */}
                  <div className="flex items-center text-gray-300 mb-6">
                    <FileCode className="h-5 w-5 mr-2 text-purple-400" />
                    <a href="#" className="hover:text-purple-400 transition-colors">View Documentation</a>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="py-4">
                  <h2 className="text-2xl font-semibold text-gray-100 mb-4">Key Features</h2>
                  
                  <div className="space-y-4">
                    {product.features ? (
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Sparkles className="h-5 w-5 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Sparkles className="h-5 w-5 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>Implements the MCP (Model Context Protocol) for enhanced AI capabilities</span>
                        </li>
                        <li className="flex items-start">
                          <Sparkles className="h-5 w-5 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>Fast and reliable performance for production use</span>
                        </li>
                        <li className="flex items-start">
                          <Sparkles className="h-5 w-5 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>Well-documented API with consistent response formats</span>
                        </li>
                        <li className="flex items-start">
                          <Sparkles className="h-5 w-5 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>Simple integration with Claude and other AI models</span>
                        </li>
                        <li className="flex items-start">
                          <Sparkles className="h-5 w-5 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span>Comprehensive error handling and logging</span>
                        </li>
                      </ul>
                    )}
                  </div>
                  
                  {/* Technical specifications */}
                  {product.specifications && (
                    <>
                      <h3 className="text-xl font-semibold text-gray-100 mt-8 mb-4">Technical Specifications</h3>
                      <div className="bg-zinc-900 rounded-md overflow-hidden">
                        <table className="w-full text-left">
                          <tbody>
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <tr key={key} className="border-b border-zinc-800">
                                <td className="py-3 px-4 font-medium text-purple-400">{key}</td>
                                <td className="py-3 px-4 text-gray-300">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="usecases" className="py-4">
                  <h2 className="text-2xl font-semibold text-gray-100 mb-4">Use Cases</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First use case card */}
                    <div className="bg-zinc-900/80 p-5 rounded-lg border border-zinc-700">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Data Retrieval</h3>
                      <p className="text-gray-300 mb-3">Enable AI models to access and query structured data from various sources.</p>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Code className="h-4 w-4 mr-1" />
                        <span>Ideal for database integration</span>
                      </div>
                    </div>
                    
                    {/* Second use case card */}
                    <div className="bg-zinc-900/80 p-5 rounded-lg border border-zinc-700">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">API Access</h3>
                      <p className="text-gray-300 mb-3">Connect Claude to external services and APIs through secure abstraction layers.</p>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Server className="h-4 w-4 mr-1" />
                        <span>Secure enterprise connectivity</span>
                      </div>
                    </div>
                    
                    {/* Third use case card */}
                    <div className="bg-zinc-900/80 p-5 rounded-lg border border-zinc-700">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Content Processing</h3>
                      <p className="text-gray-300 mb-3">Process, transform, and analyze content before presenting it to AI models.</p>
                      <div className="flex items-center text-gray-400 text-sm">
                        <FileCode className="h-4 w-4 mr-1" />
                        <span>Document parsing & extraction</span>
                      </div>
                    </div>
                    
                    {/* Fourth use case card */}
                    <div className="bg-zinc-900/80 p-5 rounded-lg border border-zinc-700">
                      <h3 className="text-lg font-semibold text-purple-400 mb-2">Workflow Automation</h3>
                      <p className="text-gray-300 mb-3">Trigger actions and automate processes based on AI interactions.</p>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Laptop className="h-4 w-4 mr-1" />
                        <span>Systems integration & orchestration</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Example use case scenario */}
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-100 mb-4">Example Implementation</h3>
                    <div className="bg-zinc-900 rounded-md p-4">
                      <code className="text-sm text-gray-300 block">
                        <span className="text-green-400">// Configure Claude Code to use this MCP server</span><br/>
                        $ claude mcp add {product.name.toLowerCase().replace(/\s+/g, "-")} ./servers/{product.name.toLowerCase().replace(/\s+/g, "-")}<br/><br/>
                        <span className="text-green-400">// Now you can use it in your Claude sessions</span><br/>
                        <span className="text-blue-400">User:</span> Use the {product.name} server to retrieve customer data<br/>
                        <span className="text-purple-400">Claude:</span> I'll help you retrieve that data using the {product.name} MCP server...
                      </code>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="py-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-100">User Reviews</h2>
                    <Button variant="outline" size="sm" className="text-purple-400 border-purple-400 hover:bg-purple-400/10">
                      Write a Review
                    </Button>
                  </div>
                  
                  {/* Rating overview */}
                  <div className="flex items-center mb-8">
                    <div className="mr-6">
                      <div className="text-5xl font-bold text-gray-100">4.5</div>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : star <= 5 ? 'text-yellow-400 fill-yellow-400/50' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">24 reviews</div>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      {/* Rating bars */}
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400 w-6">5★</span>
                        <div className="flex-1 h-2 bg-zinc-700 rounded-full mx-2">
                          <div className="h-2 bg-yellow-400 rounded-full" style={{width: '70%'}}></div>
                        </div>
                        <span className="text-xs text-gray-400 w-8">70%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400 w-6">4★</span>
                        <div className="flex-1 h-2 bg-zinc-700 rounded-full mx-2">
                          <div className="h-2 bg-yellow-400 rounded-full" style={{width: '20%'}}></div>
                        </div>
                        <span className="text-xs text-gray-400 w-8">20%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400 w-6">3★</span>
                        <div className="flex-1 h-2 bg-zinc-700 rounded-full mx-2">
                          <div className="h-2 bg-yellow-400 rounded-full" style={{width: '5%'}}></div>
                        </div>
                        <span className="text-xs text-gray-400 w-8">5%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400 w-6">2★</span>
                        <div className="flex-1 h-2 bg-zinc-700 rounded-full mx-2">
                          <div className="h-2 bg-yellow-400 rounded-full" style={{width: '3%'}}></div>
                        </div>
                        <span className="text-xs text-gray-400 w-8">3%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400 w-6">1★</span>
                        <div className="flex-1 h-2 bg-zinc-700 rounded-full mx-2">
                          <div className="h-2 bg-yellow-400 rounded-full" style={{width: '2%'}}></div>
                        </div>
                        <span className="text-xs text-gray-400 w-8">2%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sample reviews */}
                  <div className="space-y-6">
                    <div className="border-b border-zinc-700 pb-6">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-gray-200">Developer123</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">Posted 2 weeks ago</div>
                      <p className="text-gray-300">
                        Excellent MCP server that has dramatically improved our AI application's capabilities.
                        The integration was straightforward, and the performance has been rock-solid.
                      </p>
                    </div>
                    
                    <div className="border-b border-zinc-700 pb-6">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-gray-200">AIEnthusiast</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">Posted 1 month ago</div>
                      <p className="text-gray-300">
                        Great functionality but the documentation could be improved. Once I figured out the configuration,
                        it worked very well with Claude. Would recommend for anyone looking to extend their AI capabilities.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Sidebar - 1/3 width */}
        <div className="md:col-span-1 space-y-6">
          {/* GitHub / Project Links Card */}
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-purple-700/30 transition-all hover:shadow-xl hover:border-purple-600/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Project Links</h3>
              <div className="text-yellow-400 flex items-center">
                <Star className="w-4 h-4 mr-1 fill-yellow-400" />
                <span>{githubStats.stars.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Download/Source Code button */}
            <Button 
              onClick={() => window.open(product.githubUrl || product.github_url || 'https://github.com', '_blank')}
              variant="outline"
              className="w-full mb-3 hover:bg-emerald-700 border-emerald-500 text-emerald-400 hover:text-emerald-300"
            >
              <span className="flex items-center justify-center">
                <Code2 className="w-4 h-4 mr-2" />
                View Source Code
              </span>
            </Button>
            
            {/* Documentation button */}
            <Button 
              onClick={() => window.open(product.docsUrl || '#', '_blank')}
              variant="outline"
              className="w-full mb-3 hover:bg-zinc-700"
            >
              <span className="flex items-center justify-center">
                <FileCode className="w-4 h-4 mr-2" />
                Documentation
              </span>
            </Button>
            
            {/* NPM Package button */}
            <Button 
              onClick={() => window.open(product.npmUrl || '#', '_blank')}
              variant="outline"
              className="w-full hover:bg-zinc-700"
            >
              <span className="flex items-center justify-center">
                <Package className="w-4 h-4 mr-2" />
                NPM Package
              </span>
            </Button>
            
            {/* GitHub stats */}
            <div className="mt-4 pt-4 border-t border-zinc-700 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-gray-400 text-xs mb-1">Stars</div>
                <div className="font-semibold text-gray-200">{githubStats.stars.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Forks</div>
                <div className="font-semibold text-gray-200">{githubStats.forks.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Updated</div>
                <div className="font-semibold text-gray-200">{githubStats.lastUpdated}</div>
              </div>
            </div>
          </div>
          
          {/* Tech Categories */}
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-purple-700/30 transition-all hover:shadow-xl hover:border-purple-600/40">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-purple-300 bg-purple-800/70 px-2 py-1 rounded-full transition-all hover:bg-purple-700 cursor-pointer">
                MCP Servers
              </span>
              <span className="text-xs text-purple-300 bg-purple-800/70 px-2 py-1 rounded-full transition-all hover:bg-purple-700 cursor-pointer">
                Data Processing
              </span>
              <span className="text-xs text-purple-300 bg-purple-800/70 px-2 py-1 rounded-full transition-all hover:bg-purple-700 cursor-pointer">
                API Integration
              </span>
              <span className="text-xs text-purple-300 bg-purple-800/70 px-2 py-1 rounded-full transition-all hover:bg-purple-700 cursor-pointer">
                {product.category || 'AI Tools'}
              </span>
              
              {/* Tags section */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-700 w-full">
                <h4 className="text-xs font-semibold text-gray-400 w-full mb-2">Tags:</h4>
                {product.tags ? product.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="text-xs text-gray-300 bg-zinc-700/70 px-2 py-1 rounded-full transition-all hover:bg-zinc-600"
                  >
                    {tag}
                  </span>
                )) : (
                  <>
                    <span className="text-xs text-gray-300 bg-zinc-700/70 px-2 py-1 rounded-full transition-all hover:bg-zinc-600">
                      Model Context Protocol
                    </span>
                    <span className="text-xs text-gray-300 bg-zinc-700/70 px-2 py-1 rounded-full transition-all hover:bg-zinc-600">
                      Claude Code
                    </span>
                    <span className="text-xs text-gray-300 bg-zinc-700/70 px-2 py-1 rounded-full transition-all hover:bg-zinc-600">
                      AI Tools
                    </span>
                  </>
                )}
              </div>
              
              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-700 w-full">
                <h4 className="text-xs font-semibold text-gray-400 w-full mb-2">Tech Stack:</h4>
                <span className="text-xs text-emerald-300 bg-emerald-900/40 px-2 py-1 rounded-full">
                  TypeScript
                </span>
                <span className="text-xs text-emerald-300 bg-emerald-900/40 px-2 py-1 rounded-full">
                  Node.js
                </span>
                <span className="text-xs text-emerald-300 bg-emerald-900/40 px-2 py-1 rounded-full">
                  Docker
                </span>
              </div>
              
              {/* License */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-700 w-full">
                <h4 className="text-xs font-semibold text-gray-400 w-full mb-2">License:</h4>
                <span className="text-xs text-amber-300 bg-amber-900/40 px-2 py-1 rounded-full">
                  {product.license || 'MIT License'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Similar Tech */}
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-purple-700/30 transition-all hover:shadow-xl hover:border-purple-600/40">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Similar Tech</h3>
            <div className="space-y-4">
              {relatedProducts && relatedProducts.length > 0 ? relatedProducts.slice(0, 3).map(related => (
                <div key={related.id}>
                  <Link 
                    to={window.location.hash.startsWith('#/') ? 
                      `#/products/${related.id}` : 
                      `/products/${related.id}`
                    } 
                    className="text-purple-400 hover:underline font-semibold transition-colors"
                  >
                    {related.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-1">{related.description.substring(0, 80)}...</p>
                </div>
              )) : (
                <>
                  <div>
                    <Link to="#" className="text-purple-400 hover:underline font-semibold transition-colors">
                      PostgreSQL MCP Server
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">Connect Claude to PostgreSQL databases for direct querying and data retrieval.</p>
                  </div>
                  <div>
                    <Link to="#" className="text-purple-400 hover:underline font-semibold transition-colors">
                      GitHub MCP Server
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">Provide Claude with access to GitHub repositories, issues, and pull requests.</p>
                  </div>
                  <div>
                    <Link to="#" className="text-purple-400 hover:underline font-semibold transition-colors">
                      Everything MCP Server
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">Fast file search across your entire filesystem with MCP integration.</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Quick Install Guide */}
          <div className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-purple-700/30 transition-all hover:shadow-xl hover:border-purple-600/40">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Install</h3>
            <div className="bg-zinc-900/80 p-3 rounded-md mb-4">
              <code className="text-xs text-gray-300 block">
                # Clone the repository<br/>
                git clone {product.githubUrl || `https://github.com/mcp-servers/${product.name.toLowerCase().replace(/\s+/g, "-")}`}<br/><br/>
                # Install dependencies<br/>
                cd {product.name.toLowerCase().replace(/\s+/g, "-")}<br/>
                npm install<br/><br/>
                # Add to Claude Code<br/>
                claude mcp add {product.name.toLowerCase().replace(/\s+/g, "-")} .
              </code>
            </div>
            <Button 
              variant="default" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => window.open(`https://modelcontextprotocol.io/`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              MCP Documentation
            </Button>
          </div>
        </div>
      </div>
      
      {/* Related Technology */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">Related Technology</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <Link 
                key={product.id} 
                to={window.location.hash.startsWith('#/') ? 
                  `#/products/${product.id}` : 
                  `/products/${product.id}`
                } 
                className="group"
              >
                <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden transition-all hover:border-purple-600/40 hover:shadow-lg">
                  <div className="aspect-video bg-zinc-900 relative p-4 flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="max-h-16 max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-purple-800/30 flex items-center justify-center text-purple-300">
                        <Server className="h-8 w-8" />
                      </div>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-200 group-hover:text-purple-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {product.description || "An MCP server providing extended functionality for Claude and other AI models."}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs bg-zinc-700 text-gray-300 px-2 py-0.5 rounded-full">
                        {product.category || "MCP Server"}
                      </span>
                      <div className="flex items-center text-yellow-400 text-xs ml-auto">
                        <Star className="h-3 w-3 mr-0.5 fill-yellow-400" />
                        <span>{Math.floor(Math.random() * 1000) + 100}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPageNew;