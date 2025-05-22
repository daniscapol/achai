import React, { useState, useEffect } from 'react';

// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
import { useNavigate } from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SkeletonLoader from './animations/SkeletonLoader';
import { Edit, Trash2, Plus, Search, X, SlidersHorizontal, ChevronDown, Server, Laptop, Bot, Sparkles, Filter, Tag, Database } from 'lucide-react';
import Pagination from './Pagination';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(2, { message: "Product name is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be greater than 0" }),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  category: z.string().min(1, { message: "Category is required" }),
  sku: z.string().min(1, { message: "SKU is required" }),
  inventory_count: z.coerce.number().int().nonnegative({ message: "Inventory must be 0 or greater" }),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  product_type: z.string().default("regular"), // Add product_type field with default
  slug: z.string().optional(), // Slug will be generated from name if not provided
  stars_numeric: z.number().default(0) // Default star rating
});

// Define product type options for filters and badges
const productTypeOptions = [
  { value: 'mcp_server', label: 'MCP Server', icon: <Server className="h-4 w-4" /> },
  { value: 'mcp_client', label: 'MCP Client', icon: <Laptop className="h-4 w-4" /> },
  { value: 'ai_agent', label: 'AI Agent', icon: <Bot className="h-4 w-4" /> },
  { value: 'ready_to_use', label: 'Ready to Use', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'regular', label: 'Regular Product', icon: <Tag className="h-4 w-4" /> }
];

const ProductManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Increased default to 20
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize forms
  const addForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      sku: '',
      inventory_count: 0,
      is_featured: false,
      is_active: true,
      product_type: 'regular', // Add default product_type
      slug: '', // Slug will be auto-generated
      stars_numeric: 0 // Default star rating
    }
  });

  const editForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: '',
      sku: '',
      inventory_count: 0,
      is_featured: false,
      is_active: true,
      product_type: 'regular', // Add default product_type
      slug: '', // Slug will be auto-generated
      stars_numeric: 0 // Default star rating
    }
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Update filtered products when filters change
  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, categoryFilter, statusFilter, productTypeFilter]);

  // Fetch all products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...products];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(product => product.is_active);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(product => !product.is_active);
      } else if (statusFilter === 'featured') {
        filtered = filtered.filter(product => product.is_featured);
      } else if (statusFilter === 'official') {
        filtered = filtered.filter(product => product.official);
      }
    }
    
    // Apply product type filter
    if (productTypeFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.product_type === productTypeFilter
      );
    }
    
    setFilteredProducts(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Handle add product
  const handleAddProduct = async (data) => {
    try {
      // Generate slug from name if not provided
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Ensure price and inventory_count are numbers
      const processedData = {
        ...data,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        inventory_count: typeof data.inventory_count === 'string' ? 
          parseInt(data.inventory_count) : data.inventory_count,
        slug: slug, // Add generated slug
        stars_numeric: data.stars_numeric || 0 // Ensure stars_numeric is present
      };
      
      // Log the data we're sending to help debug
      console.log('Sending product data:', processedData);
      
      // Make sure SKU is present
      if (!processedData.sku) {
        processedData.sku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedData)
      });

      // Check for errors and try to get detailed error information
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData ? errorData.message || errorData.error : 'Unknown error occurred';
        console.error('Server returned error:', errorMsg, errorData);
        throw new Error(`HTTP error! Status: ${response.status}. ${errorMsg}`);
      }

      const newProduct = await response.json();
      setProducts([newProduct, ...products]);
      setIsAddDialogOpen(false);
      addForm.reset();
      
      toast({
        title: 'Success',
        description: 'Product added successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: `Failed to add product: ${error.message || 'Please try again.'}`,
        variant: 'destructive'
      });
    }
  };

  // Handle edit product
  const handleEditProduct = async (data) => {
    try {
      // Generate slug from name if not provided
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Ensure price and inventory_count are numbers
      const processedData = {
        ...data,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        inventory_count: typeof data.inventory_count === 'string' ? 
          parseInt(data.inventory_count) : data.inventory_count,
        slug: slug, // Add generated slug
        stars_numeric: data.stars_numeric || 0 // Ensure stars_numeric is present
      };
      
      console.log('Sending updated product data:', processedData);
      
      const response = await fetch(`${API_BASE_URL}/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedData)
      });

      // Check for errors and try to get detailed error information
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData ? errorData.message || errorData.error : 'Unknown error occurred';
        console.error('Server returned error:', errorMsg, errorData);
        throw new Error(`HTTP error! Status: ${response.status}. ${errorMsg}`);
      }

      const updatedProduct = await response.json();
      setProducts(products.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      ));
      setIsEditDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Product updated successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: `Failed to update product: ${error.message || 'Please try again.'}`,
        variant: 'destructive'
      });
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${currentProduct.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setProducts(products.filter(product => product.id !== currentProduct.id));
      setIsDeleteDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Open edit dialog and populate form
  const openEditDialog = (product) => {
    setCurrentProduct(product);
    editForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url || '',
      category: product.category,
      sku: product.sku,
      inventory_count: product.inventory_count,
      is_featured: product.is_featured,
      is_active: product.is_active,
      product_type: product.product_type || 'regular', // Include product_type
      slug: product.slug || '', // Include slug
      stars_numeric: product.stars_numeric || 0 // Include stars
    });
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(products.map(product => product.category))].filter(Boolean);
  
  // Helper function to get product type badge
  const getProductTypeBadge = (productType) => {
    switch (productType) {
      case 'mcp_server':
        return (
          <Badge variant="outline" className="bg-indigo-900/60 hover:bg-indigo-800/70 border-indigo-700/50 text-indigo-300 flex items-center gap-1">
            <Server className="h-3 w-3" />
            MCP Server
          </Badge>
        );
      case 'mcp_client':
        return (
          <Badge variant="outline" className="bg-blue-900/60 hover:bg-blue-800/70 border-blue-700/50 text-blue-300 flex items-center gap-1">
            <Laptop className="h-3 w-3" />
            MCP Client
          </Badge>
        );
      case 'ai_agent':
        return (
          <Badge variant="outline" className="bg-amber-900/60 hover:bg-amber-800/70 border-amber-700/50 text-amber-300 flex items-center gap-1">
            <Bot className="h-3 w-3" />
            AI Agent
          </Badge>
        );
      case 'ready_to_use':
        return (
          <Badge variant="outline" className="bg-purple-900/60 hover:bg-purple-800/70 border-purple-700/50 text-purple-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Ready to Use
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {productType || 'Regular'}
          </Badge>
        );
    }
  };

  // Find all unique product types in the data
  const uniqueProductTypes = [...new Set(products.map(product => product.product_type))].filter(Boolean);
  
  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tech Hub Management</h1>
          <p className="text-gray-400 mt-1">Manage MCP servers, clients, AI agents, and ready-to-use solutions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {}} className="border-zinc-700 text-gray-200 hover:bg-zinc-800">
            <Database className="mr-2 h-4 w-4" />
            Bulk Operations
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls - Always Visible */}
      <div className="bg-zinc-900 rounded-lg shadow-md p-4 mb-6 border border-zinc-800">
        {/* Search and main filters row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products by name, description, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Product Type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Product Type</label>
            <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="All Types" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value="all" className="text-white hover:bg-zinc-700">
                  <div className="flex items-center gap-2">
                    <span>All Types</span>
                  </div>
                </SelectItem>
                {productTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value="all" className="text-white hover:bg-zinc-700">All Statuses</SelectItem>
                <SelectItem value="active" className="text-white hover:bg-zinc-700">Active</SelectItem>
                <SelectItem value="inactive" className="text-white hover:bg-zinc-700">Inactive</SelectItem>
                <SelectItem value="featured" className="text-white hover:bg-zinc-700">Featured</SelectItem>
                <SelectItem value="official" className="text-white hover:bg-zinc-700">Official</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Second row of filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Category filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-[200px] overflow-y-auto">
                <SelectItem value="" className="text-white hover:bg-zinc-700">All Categories</SelectItem>
                {uniqueCategories.map((category, index) => (
                  <SelectItem key={index} value={category} className="text-white hover:bg-zinc-700">{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Items per page selector */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Items per page</label>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value="10" className="text-white hover:bg-zinc-700">10</SelectItem>
                <SelectItem value="20" className="text-white hover:bg-zinc-700">20</SelectItem>
                <SelectItem value="50" className="text-white hover:bg-zinc-700">50</SelectItem>
                <SelectItem value="100" className="text-white hover:bg-zinc-700">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Clear filters */}
          <div className="md:col-span-2 flex items-end justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setStatusFilter('all');
                setProductTypeFilter('all');
              }}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        </div>
        
        {/* Pagination and results info */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-zinc-800">
          <div className="text-sm text-gray-400 mb-3 md:mb-0">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      </div>

      {/* Products table */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader variant="rect" height={50} className="w-full bg-zinc-800/50" />
          <SkeletonLoader variant="rect" height={50} className="w-full bg-zinc-800/50" />
          <SkeletonLoader variant="rect" height={50} className="w-full bg-zinc-800/50" />
          <SkeletonLoader variant="rect" height={50} className="w-full bg-zinc-800/50" />
        </div>
      ) : (
        <div className="rounded-md border border-zinc-700 overflow-hidden bg-zinc-800/30">
          <Table>
            <TableHeader className="bg-zinc-800">
              <TableRow className="border-zinc-700 hover:bg-zinc-800">
                <TableHead className="w-[80px] text-zinc-300">ID</TableHead>
                <TableHead className="min-w-[200px] text-zinc-300">Product</TableHead>
                <TableHead className="hidden md:table-cell text-zinc-300">Type</TableHead>
                <TableHead className="hidden md:table-cell text-zinc-300">Category</TableHead>
                <TableHead className="text-right text-zinc-300">Price</TableHead>
                <TableHead className="hidden md:table-cell text-zinc-300">Status</TableHead>
                <TableHead className="w-[100px] text-right text-zinc-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-zinc-900/70">
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <TableRow key={product.id} className="border-zinc-700/50 hover:bg-zinc-800/50">
                    <TableCell className="text-gray-400">{product.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="h-10 w-10 rounded object-contain bg-zinc-800 p-1 border border-zinc-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/assets/news-images/fallback.jpg';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            {product.product_type === 'mcp_server' && <Server className="h-5 w-5 text-indigo-400" />}
                            {product.product_type === 'mcp_client' && <Laptop className="h-5 w-5 text-blue-400" />}
                            {product.product_type === 'ai_agent' && <Bot className="h-5 w-5 text-amber-400" />}
                            {product.product_type === 'ready_to_use' && <Sparkles className="h-5 w-5 text-purple-400" />}
                            {(!product.product_type || product.product_type === 'regular') && <Tag className="h-5 w-5 text-gray-400" />}
                          </div>
                        )}
                        <div>
                          <div 
                            className="hover:text-purple-400 cursor-pointer font-semibold text-white"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            SKU: {product.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getProductTypeBadge(product.product_type)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {product.category && (
                          <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(product.price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        {product.is_active ? (
                          <Badge variant="outline" className="bg-green-900/50 border-green-700/50 text-green-300">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-400">
                            Inactive
                          </Badge>
                        )}
                        {product.is_featured && (
                          <Badge variant="outline" className="bg-purple-900/50 border-purple-700/50 text-purple-300">
                            Featured
                          </Badge>
                        )}
                        {product.official && (
                          <Badge variant="outline" className="bg-blue-900/50 border-blue-700/50 text-blue-300">
                            Official
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => openEditDialog(product)}
                          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => openDeleteDialog(product)}
                          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-zinc-700/50">
                  <TableCell colSpan={7} className="text-center py-8 text-zinc-400">
                    {searchTerm || categoryFilter || statusFilter !== 'all' || productTypeFilter !== 'all' ? 
                      'No products match your search criteria' : 'No products found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bottom pagination */}
      {filteredProducts.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <div className="text-sm text-gray-400">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the details for your new product.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddProduct)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed product description" 
                        rows={4} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Stock Keeping Unit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="inventory_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Count</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={addForm.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Featured Product</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Active</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Hidden fields for required database columns */}
                <FormField
                  control={addForm.control}
                  name="product_type"
                  render={({ field }) => (
                    <input type="hidden" {...field} />
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="slug"
                  render={({ field }) => (
                    <input type="hidden" {...field} />
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="stars_numeric"
                  render={({ field }) => (
                    <input type="hidden" {...field} value={0} />
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for "{currentProduct?.name}".
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditProduct)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed product description" 
                        rows={4} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Stock Keeping Unit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="inventory_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventory Count</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={editForm.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Featured Product</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Active</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Hidden fields for required database columns */}
                <FormField
                  control={editForm.control}
                  name="product_type"
                  render={({ field }) => (
                    <input type="hidden" {...field} />
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <input type="hidden" {...field} />
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="stars_numeric"
                  render={({ field }) => (
                    <input type="hidden" {...field} value={field.value || 0} />
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit">Update Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product "{currentProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;