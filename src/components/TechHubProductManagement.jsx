import React, { useState, useEffect } from 'react';

// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SkeletonLoader from './animations/SkeletonLoader';
import Pagination from './Pagination';
import { Edit, Trash2, Plus, Search, X, FileUp, FileDown, Database, Upload, GithubIcon, Star, TagIcon, Server, Laptop, Bot, Sparkles, Filter, ChevronDown } from 'lucide-react';

// Form validation schema 
const productSchema = z.object({
  name: z.string().min(2, { message: "Product name is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  icon_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  category: z.string().min(1, { message: "Category is required" }),
  categories: z.string().optional(), // Will be parsed into array
  product_type: z.enum(['mcp_server', 'mcp_client', 'ai_agent', 'ready_to_use'], {
    message: "Please select a valid product type"
  }),
  github_url: z.string().url({ message: "Please enter a valid GitHub URL" }).optional().or(z.literal('')),
  docs_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  demo_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  language: z.string().optional(),
  license: z.string().optional(),
  creator: z.string().optional(),
  version: z.string().optional(),
  installation_command: z.string().optional(),
  tags: z.string().optional(), // Will be parsed into array
  official: z.boolean().default(false),
  stars_numeric: z.coerce.number().int().nonnegative().default(0),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  slug: z.string().optional(), // Will be generated from name if not provided
});

// Define product type options
const productTypeOptions = [
  { value: 'mcp_server', label: 'MCP Server', icon: <Server className="h-4 w-4" /> },
  { value: 'mcp_client', label: 'MCP Client', icon: <Laptop className="h-4 w-4" /> },
  { value: 'ai_agent', label: 'AI Agent', icon: <Bot className="h-4 w-4" /> },
  { value: 'ready_to_use', label: 'Ready to Use', icon: <Sparkles className="h-4 w-4" /> }
];

// Define common license options
const licenseOptions = [
  { value: 'MIT', label: 'MIT License' },
  { value: 'Apache-2.0', label: 'Apache License 2.0' },
  { value: 'GPL-3.0', label: 'GNU GPL v3' },
  { value: 'BSD-3-Clause', label: 'BSD 3-Clause' },
  { value: 'Proprietary', label: 'Proprietary' },
  { value: 'Other', label: 'Other' }
];

const TechHubProductManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkData, setBulkData] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize forms
  const addForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      image_url: '',
      icon_url: '',
      category: '',
      categories: '',
      product_type: 'mcp_server',
      github_url: '',
      docs_url: '',
      demo_url: '',
      language: '',
      license: 'MIT',
      creator: '',
      version: '',
      installation_command: '',
      tags: '',
      official: false,
      stars_numeric: 0,
      is_featured: false,
      is_active: true,
      slug: ''
    }
  });

  const editForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      image_url: '',
      icon_url: '',
      category: '',
      categories: '',
      product_type: 'mcp_server',
      github_url: '',
      docs_url: '',
      demo_url: '',
      language: '',
      license: '',
      creator: '',
      version: '',
      installation_command: '',
      tags: '',
      official: false,
      stars_numeric: 0,
      is_featured: false,
      is_active: true,
      slug: ''
    }
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Apply filters whenever products, search term, or product type filter changes
  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, productTypeFilter]);
  
  // Apply filtering logic
  const applyFilters = () => {
    // First apply text search
    let result = products.filter(product => 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Then apply product type filter
    if (productTypeFilter !== 'all') {
      result = result.filter(product => product.product_type === productTypeFilter);
    }
    
    // Update filtered products
    setFilteredProducts(result);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Fetch all products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Try to cache the results in sessionStorage for faster access
      try {
        sessionStorage.setItem('cached_custom_products', JSON.stringify(data.products));
      } catch (cacheErr) {
        console.warn('Error caching products in sessionStorage:', cacheErr);
      }
      
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

  // Helper to convert comma-separated string to array
  const stringToArray = (str) => {
    if (!str) return [];
    return str.split(',').map(item => item.trim()).filter(item => item !== '');
  };

  // Helper to convert array to comma-separated string
  const arrayToString = (arr) => {
    if (!arr || !Array.isArray(arr)) return '';
    return arr.join(', ');
  };

  // Handle add product
  const handleAddProduct = async (data) => {
    try {
      // Generate slug from name if not provided
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Convert comma-separated strings to arrays
      const categories = stringToArray(data.categories);
      const tags = stringToArray(data.tags);
      
      // Prepare data for submission
      const processedData = {
        ...data,
        slug,
        categories,
        tags,
        stars_numeric: data.stars_numeric || 0
      };
      
      // Log the data we're sending
      console.log('Sending product data:', processedData);
      
      // Generate an ID if needed
      if (!processedData.id) {
        processedData.id = `${processedData.product_type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedData)
      });

      // Check for errors
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
      
      // Refresh the list to get updated data
      fetchProducts();
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
      
      // Convert comma-separated strings to arrays
      const categories = stringToArray(data.categories);
      const tags = stringToArray(data.tags);
      
      // Prepare data for submission
      const processedData = {
        ...data,
        price: data.price ? parseFloat(data.price) : 0,
        slug,
        categories,
        tags,
        stars_numeric: data.stars_numeric || 0
      };
      
      console.log('Sending updated product data:', processedData);
      
      const response = await fetch(`${API_BASE_URL}/product?id=${currentProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedData)
      });

      // Check for errors
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
      
      // Refresh the list to get updated data
      fetchProducts();
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
      const response = await fetch(`${API_BASE_URL}/product?id=${currentProduct.id}`, {
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

  // Handle bulk import
  const handleBulkImport = async () => {
    try {
      // Parse JSON data
      let productsData;
      try {
        productsData = JSON.parse(bulkData);
      } catch (parseError) {
        throw new Error('Invalid JSON format. Please check your data and try again.');
      }
      
      // Validate that we have an array of products
      if (!Array.isArray(productsData)) {
        productsData = [productsData]; // Convert single object to array
      }
      
      // Validate that there's at least one product
      if (productsData.length === 0) {
        throw new Error('No products found in the provided data.');
      }
      
      console.log(`Importing ${productsData.length} products...`);
      
      // Send bulk create request
      const response = await fetch(`${API_BASE_URL}/products/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products: productsData })
      });

      // Check for errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData ? errorData.message || errorData.error : 'Unknown error occurred';
        console.error('Server returned error:', errorMsg, errorData);
        throw new Error(`HTTP error! Status: ${response.status}. ${errorMsg}`);
      }

      const createdProducts = await response.json();
      setIsBulkDialogOpen(false);
      setBulkData('');
      
      toast({
        title: 'Success',
        description: `Successfully imported ${createdProducts.length} products!`,
        variant: 'default'
      });
      
      // Refresh the list
      fetchProducts();
    } catch (error) {
      console.error('Error with bulk import:', error);
      toast({
        title: 'Error',
        description: `Bulk import failed: ${error.message || 'Please check your data and try again.'}`,
        variant: 'destructive'
      });
    }
  };

  // Handle bulk export
  const handleBulkExport = () => {
    try {
      // Prepare data for export (format array for readability)
      const exportData = JSON.stringify(products, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `tech_hub_products_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: `Exported ${products.length} products successfully!`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error exporting products:', error);
      toast({
        title: 'Error',
        description: 'Failed to export products. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Open edit dialog and populate form
  const openEditDialog = (product) => {
    setCurrentProduct(product);
    
    // Convert arrays to comma-separated strings for form
    const categoriesStr = arrayToString(product.categories);
    const tagsStr = arrayToString(product.tags);
    
    editForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url || '',
      icon_url: product.icon_url || '',
      category: product.category,
      categories: categoriesStr,
      sku: product.sku,
      product_type: product.product_type || 'mcp_server',
      github_url: product.github_url || '',
      docs_url: product.docs_url || '',
      demo_url: product.demo_url || '',
      language: product.language || '',
      license: product.license || '',
      creator: product.creator || '',
      version: product.version || '',
      installation_command: product.installation_command || '',
      tags: tagsStr,
      official: product.official || false,
      stars_numeric: product.stars_numeric || 0,
      inventory_count: product.inventory_count || 0,
      is_featured: product.is_featured || false,
      is_active: product.is_active || false,
      slug: product.slug || ''
    });
    
    setIsEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Helper function to get product type badge
  const getProductTypeBadge = (productType) => {
    switch (productType) {
      case 'mcp_server':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/60 border border-indigo-700/50 text-indigo-300">
            <Server className="h-3 w-3 mr-1" />
            MCP Server
          </div>
        );
      case 'mcp_client':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/60 border border-blue-700/50 text-blue-300">
            <Laptop className="h-3 w-3 mr-1" />
            MCP Client
          </div>
        );
      case 'ai_agent':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/60 border border-amber-700/50 text-amber-300">
            <Bot className="h-3 w-3 mr-1" />
            AI Agent
          </div>
        );
      case 'ready_to_use':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/60 border border-purple-700/50 text-purple-300">
            <Sparkles className="h-3 w-3 mr-1" />
            Ready to Use
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
            Unknown
          </div>
        );
    }
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Items per page options
  const itemsPerPageOptions = [10, 15, 25, 50, 100];
  
  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-zinc-900 text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Tech Hub Management</h1>
          <p className="text-gray-400 mt-1">
            Manage MCP servers, clients, AI agents, and ready-to-use solutions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)} className="border-zinc-700 text-gray-200 hover:bg-zinc-800">
            <Database className="mr-2 h-4 w-4" />
            Bulk Operations
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="mb-6 space-y-4 bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products by name, description, category, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-zinc-800 border-zinc-700 text-gray-200 placeholder:text-gray-500 w-full"
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
          
          {/* Product Type Filter */}
          <div className="md:w-52">
            <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
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
          
          {/* More Filters Button */}
          <Button 
            variant="outline" 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className="bg-zinc-800 border-zinc-700 text-gray-200 hover:bg-zinc-700"
          >
            <Filter className="mr-2 h-4 w-4" />
            More Filters
            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        {/* Expanded Filter Panel */}
        {isFilterPanelOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-700">
            {/* Additional filters could go here */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Status</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-zinc-800 border-zinc-700 text-gray-200 hover:bg-zinc-700">
                  Active
                </Button>
                <Button size="sm" variant="outline" className="bg-zinc-800 border-zinc-700 text-gray-200 hover:bg-zinc-700">
                  Featured
                </Button>
                <Button size="sm" variant="outline" className="bg-zinc-800 border-zinc-700 text-gray-200 hover:bg-zinc-700">
                  Official
                </Button>
              </div>
            </div>
            <div>
              {/* Placeholder for more filter options */}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" className="bg-zinc-800 border-zinc-700 text-gray-200 hover:bg-zinc-700">
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Pagination Controls - Top */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="flex items-center mb-4 md:mb-0">
          <span className="text-sm text-gray-400 mr-2">Show:</span>
          <select 
            value={itemsPerPage} 
            onChange={handleItemsPerPageChange}
            className="bg-zinc-800 border border-zinc-700 rounded text-white px-2 py-1 text-sm"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400 ml-2">per page</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-4">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
          </span>
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
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
                <TableHead className="w-[300px] text-zinc-300">Product</TableHead>
                <TableHead className="hidden md:table-cell text-zinc-300">Type</TableHead>
                <TableHead className="hidden md:table-cell text-zinc-300">Category</TableHead>
                <TableHead className="hidden md:table-cell text-zinc-300">GitHub</TableHead>
                <TableHead className="hidden md:table-cell text-zinc-300">Status</TableHead>
                <TableHead className="w-[100px] text-right text-zinc-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-zinc-900/70">
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <TableRow key={product.id} className="border-zinc-700/50 hover:bg-zinc-800/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {(product.icon_url || product.image_url) ? (
                          <img 
                            src={product.icon_url || product.image_url} 
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
                            {product.id}
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                            {product.category}
                          </span>
                        )}
                        {product.categories && product.categories.length > 0 && 
                          product.categories
                            .filter(cat => cat !== product.category)
                            .slice(0, 2)
                            .map((category, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                                {category}
                              </span>
                            ))
                        }
                        {product.categories && product.categories.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                            +{product.categories.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.github_url ? (
                        <a 
                          href={product.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <GithubIcon className="h-4 w-4" />
                          <span className="text-sm">Repository</span>
                          {product.stars_numeric > 0 && (
                            <span className="inline-flex items-center gap-1 ml-1 text-xs text-zinc-400">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {product.stars_numeric.toLocaleString()}
                            </span>
                          )}
                        </a>
                      ) : (
                        <span className="text-zinc-500 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        {product.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 border border-green-700/50 text-green-300">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-400">
                            Inactive
                          </span>
                        )}
                        {product.official && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 border border-blue-700/50 text-blue-300">
                            Official
                          </span>
                        )}
                        {product.is_featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 border border-purple-700/50 text-purple-300">
                            Featured
                          </span>
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
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-400">
                    {searchTerm || productTypeFilter !== 'all' ? 'No products match your search criteria' : 'No products found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Pagination Controls - Bottom */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6">
        <div className="flex items-center mb-4 md:mb-0">
          <span className="text-sm text-gray-400 mr-2">Show:</span>
          <select 
            value={itemsPerPage} 
            onChange={handleItemsPerPageChange}
            className="bg-zinc-800 border border-zinc-700 rounded text-white px-2 py-1 text-sm"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <span className="text-sm text-gray-400 ml-2">per page</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-4">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
          </span>
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Tech Hub Product</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Enter the details for your new product in the tech hub.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddProduct)} className="space-y-4 tech-form">
              <style dangerouslySetInnerHTML={{
                __html: `
                  .tech-form .text-white { color: white; }
                  .tech-form input, 
                  .tech-form textarea, 
                  .tech-form select,
                  .tech-form [role="combobox"] { 
                    background-color: rgb(39, 39, 42) !important;
                    border-color: rgb(63, 63, 70) !important;
                    color: white !important;
                  }
                  .tech-form input::placeholder,
                  .tech-form textarea::placeholder {
                    color: rgb(113, 113, 122) !important;
                  }
                  .tech-form label {
                    color: rgb(212, 212, 216);
                  }
                  .tech-form .form-description {
                    color: rgb(161, 161, 170);
                  }
                  .tech-form .form-message {
                    color: rgb(248, 113, 113);
                  }
                `
              }} />
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-4 bg-zinc-800 border border-zinc-700">
                  <TabsTrigger value="basic" className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white">Basic Info</TabsTrigger>
                  <TabsTrigger value="technical" className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white">Technical Details</TabsTrigger>
                  <TabsTrigger value="meta" className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white">Metadata</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  {/* Product Type */}
                  <FormField
                    control={addForm.control}
                    name="product_type"
                    render={({ field }) => (
                      <FormItem className="text-white">
                        <FormLabel className="text-white">Product Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                              <SelectValue placeholder="Select a product type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {productTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700 focus:bg-zinc-700">
                                <div className="flex items-center gap-2">
                                  {option.icon}
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  {/* Main info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
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
                    
                    {/* SKU */}
                    <FormField
                      control={addForm.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Stock Keeping Unit" {...field} />
                          </FormControl>
                          <FormDescription>
                            A unique identifier for this product
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Description */}
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
                  
                  {/* Category info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Main Category */}
                    <FormField
                      control={addForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Main category" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Additional Categories */}
                    <FormField
                      control={addForm.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Categories</FormLabel>
                          <FormControl>
                            <Input placeholder="Category1, Category2, Category3" {...field} />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of additional categories
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Image URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Main Image URL */}
                    <FormField
                      control={addForm.control}
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Icon URL */}
                    <FormField
                      control={addForm.control}
                      name="icon_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/icon.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Tags */}
                  <FormField
                    control={addForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="tag1, tag2, tag3" {...field} />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of tags for search
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="technical" className="space-y-4">
                  {/* GitHub URL */}
                  <FormField
                    control={addForm.control}
                    name="github_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Repository URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username/repo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Documentation and Demo URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Docs URL */}
                    <FormField
                      control={addForm.control}
                      name="docs_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Documentation URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://docs.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Demo URL */}
                    <FormField
                      control={addForm.control}
                      name="demo_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Demo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://demo.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Technical Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Programming Language */}
                    <FormField
                      control={addForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Programming Language</FormLabel>
                          <FormControl>
                            <Input placeholder="TypeScript, Python, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* License */}
                    <FormField
                      control={addForm.control}
                      name="license"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select license" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {licenseOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Creator and Version */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Creator */}
                    <FormField
                      control={addForm.control}
                      name="creator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creator/Author</FormLabel>
                          <FormControl>
                            <Input placeholder="Company or individual name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Version */}
                    <FormField
                      control={addForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 1.0.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Installation Command */}
                  <FormField
                    control={addForm.control}
                    name="installation_command"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Installation Command</FormLabel>
                        <FormControl>
                          <Input placeholder="npm install package-name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Command used to install or set up this product
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Stars */}
                  <FormField
                    control={addForm.control}
                    name="stars_numeric"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Stars</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of stars on GitHub repository (if applicable)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="meta" className="space-y-4">
                  {/* Price and Inventory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price */}
                    <FormField
                      control={addForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (if applicable)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave at 0 for free/open source products
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Inventory Count */}
                    <FormField
                      control={addForm.control}
                      name="inventory_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inventory Count</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            For digital products, this can represent licenses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Featured and Active Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                      {/* Official */}
                      <FormField
                        control={addForm.control}
                        name="official"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Official
                              </FormLabel>
                              <FormDescription>
                                Mark as an official product
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Featured */}
                      <FormField
                        control={addForm.control}
                        name="is_featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Featured
                              </FormLabel>
                              <FormDescription>
                                Show in featured sections
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {/* Is Active */}
                      <FormField
                        control={addForm.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Active
                              </FormLabel>
                              <FormDescription>
                                Enable or disable this product
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Custom URL Slug */}
                  <FormField
                    control={addForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="product-name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to auto-generate from name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Add Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Product</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update the details for "{currentProduct?.name}".
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditProduct)} className="space-y-4 tech-form">
              <style dangerouslySetInnerHTML={{
                __html: `
                  .tech-form .text-white { color: white; }
                  .tech-form input, 
                  .tech-form textarea, 
                  .tech-form select,
                  .tech-form [role="combobox"] { 
                    background-color: rgb(39, 39, 42) !important;
                    border-color: rgb(63, 63, 70) !important;
                    color: white !important;
                  }
                  .tech-form input::placeholder,
                  .tech-form textarea::placeholder {
                    color: rgb(113, 113, 122) !important;
                  }
                  .tech-form label {
                    color: rgb(212, 212, 216);
                  }
                  .tech-form .form-description {
                    color: rgb(161, 161, 170);
                  }
                  .tech-form .form-message {
                    color: rgb(248, 113, 113);
                  }
                `
              }} />
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-4 bg-zinc-800 border border-zinc-700">
                  <TabsTrigger value="basic" className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white">Basic Info</TabsTrigger>
                  <TabsTrigger value="technical" className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white">Technical Details</TabsTrigger>
                  <TabsTrigger value="meta" className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-white">Metadata</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  {/* Product Type */}
                  <FormField
                    control={editForm.control}
                    name="product_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {productTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  {option.icon}
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Main info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
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
                    
                    {/* SKU */}
                    <FormField
                      control={editForm.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Stock Keeping Unit" {...field} />
                          </FormControl>
                          <FormDescription>
                            A unique identifier for this product
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Description */}
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
                  
                  {/* Category info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Main Category */}
                    <FormField
                      control={editForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Main category" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Additional Categories */}
                    <FormField
                      control={editForm.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Categories</FormLabel>
                          <FormControl>
                            <Input placeholder="Category1, Category2, Category3" {...field} />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of additional categories
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Image URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Main Image URL */}
                    <FormField
                      control={editForm.control}
                      name="image_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Icon URL */}
                    <FormField
                      control={editForm.control}
                      name="icon_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/icon.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Tags */}
                  <FormField
                    control={editForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="tag1, tag2, tag3" {...field} />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of tags for search
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="technical" className="space-y-4">
                  {/* GitHub URL */}
                  <FormField
                    control={editForm.control}
                    name="github_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Repository URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username/repo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Documentation and Demo URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Docs URL */}
                    <FormField
                      control={editForm.control}
                      name="docs_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Documentation URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://docs.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Demo URL */}
                    <FormField
                      control={editForm.control}
                      name="demo_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Demo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://demo.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Technical Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Programming Language */}
                    <FormField
                      control={editForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Programming Language</FormLabel>
                          <FormControl>
                            <Input placeholder="TypeScript, Python, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* License */}
                    <FormField
                      control={editForm.control}
                      name="license"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "MIT"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select license" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {licenseOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Creator and Version */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Creator */}
                    <FormField
                      control={editForm.control}
                      name="creator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creator/Author</FormLabel>
                          <FormControl>
                            <Input placeholder="Company or individual name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Version */}
                    <FormField
                      control={editForm.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Version</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 1.0.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Installation Command */}
                  <FormField
                    control={editForm.control}
                    name="installation_command"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Installation Command</FormLabel>
                        <FormControl>
                          <Input placeholder="npm install package-name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Command used to install or set up this product
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Stars */}
                  <FormField
                    control={editForm.control}
                    name="stars_numeric"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Stars</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>
                          Number of stars on GitHub repository (if applicable)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="meta" className="space-y-4">
                  {/* Price and Inventory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price */}
                    <FormField
                      control={editForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (if applicable)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>
                            Leave at 0 for free/open source products
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Inventory Count */}
                    <FormField
                      control={editForm.control}
                      name="inventory_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inventory Count</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            For digital products, this can represent licenses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Featured and Active Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                      {/* Official */}
                      <FormField
                        control={editForm.control}
                        name="official"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Official
                              </FormLabel>
                              <FormDescription>
                                Mark as an official product
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Featured */}
                      <FormField
                        control={editForm.control}
                        name="is_featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Featured
                              </FormLabel>
                              <FormDescription>
                                Show in featured sections
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {/* Is Active */}
                      <FormField
                        control={editForm.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Active
                              </FormLabel>
                              <FormDescription>
                                Enable or disable this product
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Custom URL Slug */}
                  <FormField
                    control={editForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="product-name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to auto-generate from name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Update Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete the product "{currentProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Operations Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-zinc-900 border border-zinc-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Bulk Operations</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Import or export multiple products at once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="md:w-1/2 p-4 border rounded-md border-zinc-700 bg-zinc-800/30">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2 text-white">
                <FileUp className="h-5 w-5 text-purple-400" />
                Import Products
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Paste JSON data containing products to import multiple at once.
              </p>
              <Textarea 
                placeholder="Paste JSON data here..."
                rows={12}
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                className="font-mono text-sm bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
              />
              <Button 
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleBulkImport}
                disabled={!bulkData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Products
              </Button>
            </div>
            
            <div className="md:w-1/2 p-4 border rounded-md border-zinc-700 bg-zinc-800/30">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2 text-white">
                <FileDown className="h-5 w-5 text-purple-400" />
                Export Products
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Export all products as JSON for backup or bulk editing.
              </p>
              <div className="border rounded-md border-zinc-700 bg-zinc-800/50 p-4 h-[300px] overflow-auto">
                <pre className="text-xs text-zinc-300">
                  {JSON.stringify(products.slice(0, 3), null, 2)}
                  {products.length > 3 && "\n...and " + (products.length - 3) + " more products"}
                </pre>
              </div>
              <Button 
                className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                variant="outline"
                onClick={handleBulkExport}
                disabled={products.length === 0}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export All Products
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechHubProductManagement;