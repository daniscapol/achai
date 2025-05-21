import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import Pagination from './Pagination';
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
import { Edit, Trash2, Plus, Search, X, FileUp, FileDown, Database, Upload, GithubIcon, Star, TagIcon, Server, Laptop, Bot, Sparkles } from 'lucide-react';

// Form validation schema 
const productSchema = z.object({
  name: z.string().min(2, { message: "Product name is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  github_url: z.string().url({ message: "Please enter a valid GitHub URL" }).optional().or(z.literal('')),
  category: z.string().min(1, { message: "Category is required" }),
  tags: z.string().optional(), // Will be parsed into array
  product_type: z.enum(['mcp_server', 'mcp_client', 'ai_agent', 'ready_to_use'], {
    message: "Please select a valid product type"
  }),
  stars_numeric: z.coerce.number().int().nonnegative().default(0),
  
  // Optional fields that will be auto-populated based on product type when possible
  icon_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  categories: z.string().optional(), // Will be parsed into array
  docs_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  demo_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  language: z.string().optional(),
  license: z.string().optional(),
  creator: z.string().optional(),
  version: z.string().optional(),
  installation_command: z.string().optional(),
  official: z.boolean().default(false),
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

// No sample products - we'll only use data from the AWS database

const TechHubProductManagementDemo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkData, setBulkData] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);  // Increased from 10 to 20
  const [totalProducts, setTotalProducts] = useState(0);
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

  // Load products from the PostgreSQL database via API with pagination
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch products from API with pagination
        const response = await fetch(`http://localhost:3001/api/products?page=${currentPage}&limit=${itemsPerPage}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          setTotalProducts(data.pagination?.total || data.products.length);
          console.log(`Loaded ${data.products.length} products from database (page ${currentPage} of ${data.pagination?.totalPages || 1})`);
        } else {
          console.error('No products returned from API');
          toast({
            title: 'Error',
            description: 'Failed to load products from database. No products found.',
            variant: 'destructive'
          });
          setProducts([]);
          setTotalProducts(0);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products from AWS database.',
          variant: 'destructive'
        });
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [currentPage, itemsPerPage, toast]);

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

  // Handle add product - save to PostgreSQL database via API
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
      
      console.log('Adding product:', processedData);
      
      // Save to database via API
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData ? errorData.message || errorData.error : 'Unknown error occurred';
        throw new Error(`HTTP error! Status: ${response.status}. ${errorMsg}`);
      }
      
      const newProduct = await response.json();
      
      // Add to local state
      const updatedProducts = [newProduct, ...products];
      setProducts(updatedProducts);
      
      // Reset UI
      setIsAddDialogOpen(false);
      addForm.reset();
      
      toast({
        title: 'Success',
        description: 'Product added successfully to database!',
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

  // Handle edit product - update in PostgreSQL database via API
  const handleEditProduct = async (data) => {
    try {
      // Generate slug from name if not provided
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Convert comma-separated strings to arrays
      const categories = stringToArray(data.categories);
      const tags = stringToArray(data.tags);
      
      // Prepare data for update
      const processedData = {
        ...data,
        slug,
        categories,
        tags,
        stars_numeric: data.stars_numeric || 0
      };
      
      console.log('Updating product:', processedData);
      
      // Update in database via API
      const response = await fetch(`http://localhost:3001/api/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData ? errorData.message || errorData.error : 'Unknown error occurred';
        throw new Error(`HTTP error! Status: ${response.status}. ${errorMsg}`);
      }
      
      const updatedProduct = await response.json();
      
      // Update local state
      const updatedProducts = products.map(product => 
        product.id === currentProduct.id ? updatedProduct : product
      );
      setProducts(updatedProducts);
      
      // Reset UI
      setIsEditDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Product updated successfully in database!',
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

  // Handle delete product - remove from PostgreSQL database via API
  const handleDeleteProduct = async () => {
    try {
      // Delete from database via API
      const response = await fetch(`http://localhost:3001/api/products/${currentProduct.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Update local state
      const updatedProducts = products.filter(product => product.id !== currentProduct.id);
      setProducts(updatedProducts);
      
      // Reset UI
      setIsDeleteDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully from database!',
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

  // Handle bulk import - save to PostgreSQL database via API
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
      
      console.log(`Importing ${productsData.length} products to database...`);
      
      // Use the bulk create API endpoint
      const response = await fetch('http://localhost:3001/api/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products: productsData })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData ? errorData.message || errorData.error : 'Unknown error occurred';
        throw new Error(`HTTP error! Status: ${response.status}. ${errorMsg}`);
      }
      
      const createdProducts = await response.json();
      
      // Refresh products from the database to ensure we have the latest data
      const refreshResponse = await fetch('http://localhost:3001/api/products');
      const refreshData = await refreshResponse.json();
      setProducts(refreshData.products);
      
      // Reset UI
      setIsBulkDialogOpen(false);
      setBulkData('');
      
      toast({
        title: 'Success',
        description: `Successfully imported ${productsData.length} products to database!`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error with bulk import:', error);
      toast({
        title: 'Error',
        description: `Bulk import failed: ${error.message || 'Please check your data and try again.'}`,
        variant: 'destructive'
      });
    }
  };

  // Handle bulk export - get latest from PostgreSQL database via API
  const handleBulkExport = async () => {
    try {
      // Fetch the latest products from the database first
      const response = await fetch('http://localhost:3001/api/products?limit=1000');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const productsToExport = data.products || [];
      
      // Prepare data for export (format array for readability)
      const exportData = JSON.stringify(productsToExport, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_products_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: `Exported ${productsToExport.length} products from database successfully!`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error exporting products:', error);
      toast({
        title: 'Error',
        description: 'Failed to export products from database. Please try again.',
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
    
    // Auto-populate default values based on product type
    let defaultValues = {
      name: product.name,
      description: product.description,
      image_url: product.image_url || '',
      github_url: product.github_url || '',
      category: product.category,
      tags: tagsStr,
      product_type: product.product_type || 'mcp_server',
      stars_numeric: product.stars_numeric || 0,
      
      // Optional fields that may be auto-populated
      icon_url: product.icon_url || '',
      categories: categoriesStr,
      docs_url: product.docs_url || '',
      demo_url: product.demo_url || '',
      language: product.language || '',
      license: product.license || '',
      creator: product.creator || '',
      version: product.version || '',
      installation_command: product.installation_command || '',
      official: product.official || false,
      is_featured: product.is_featured || false,
      is_active: product.is_active || false,
      slug: product.slug || ''
    };
    
    // Fill in default values based on product type if missing
    if (product.product_type === 'mcp_server' && !product.language) {
      defaultValues.language = 'TypeScript';
    }
    
    if (!product.license) {
      defaultValues.license = product.product_type === 'ready_to_use' ? 'Proprietary' : 'MIT';
    }
    
    editForm.reset(defaultValues);
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

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // State for filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  
  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(products.map(product => product.category))].filter(Boolean);

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...products];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.product_type?.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    return filtered;
  };
  
  // Get filtered products
  const filteredProducts = applyFilters();
  
  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Calculate total pages based on filtered products and items per page
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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
                  <Server className="h-4 w-4 text-gray-400" />
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
                <SelectItem value="all" className="text-white hover:bg-zinc-700">All Categories</SelectItem>
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                    {searchTerm ? 'No products match your search criteria' : 'No products found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Items per page and pagination */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
            {/* Items per page selector */}
            <div className="mb-4 md:mb-0 flex items-center space-x-2">
              <span className="text-sm text-gray-400">Items per page:</span>
              <div className="bg-zinc-800 rounded-lg p-1 inline-flex space-x-1">
                {[10, 20, 50].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleItemsPerPageChange(value)}
                    className={`px-2 py-1 text-sm rounded-md transition-colors duration-200 ${
                      itemsPerPage === value 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      )}

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
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            
                            // Auto-populate fields based on product type
                            if (value === 'mcp_server') {
                              addForm.setValue('category', 'MCP Server');
                              addForm.setValue('categories', 'Server, Integration, Tool');
                              addForm.setValue('license', 'MIT');
                              addForm.setValue('language', 'TypeScript');
                              
                              // Default tags for MCP servers
                              addForm.setValue('tags', 'mcp, server, claude, tool');
                              
                              // Auto-generate installation command template
                              addForm.setValue('installation_command', 'npm install -g @mcp/server-template');
                            } 
                            else if (value === 'mcp_client') {
                              addForm.setValue('category', 'MCP Client');
                              addForm.setValue('categories', 'Client, UI, Interface');
                              addForm.setValue('license', 'MIT');
                              
                              // Default tags for MCP clients
                              addForm.setValue('tags', 'mcp, client, claude, interface');
                            }
                            else if (value === 'ai_agent') {
                              addForm.setValue('category', 'AI Agent');
                              addForm.setValue('categories', 'Agent, Framework, AI');
                              addForm.setValue('license', 'MIT');
                              
                              // Default tags for AI agents
                              addForm.setValue('tags', 'agent, framework, ai, llm');
                            }
                            else if (value === 'ready_to_use') {
                              addForm.setValue('category', 'Ready-to-Use Solution');
                              addForm.setValue('categories', 'Solution, Application, AI');
                              addForm.setValue('license', 'Proprietary');
                              
                              // Default tags for ready-to-use solutions
                              addForm.setValue('tags', 'solution, application, ai, ready');
                            }
                          }} 
                          defaultValue={field.value}
                        >
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
                        <FormDescription className="form-description text-sm text-zinc-400 mt-1">
                          Selecting a product type will auto-populate several fields with default values.
                        </FormDescription>
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
                          <FormDescription className="form-description text-sm text-zinc-400 mt-1">
                            The full name of the product or tool
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                        <FormDescription className="form-description text-sm text-zinc-400 mt-1">
                          A comprehensive description that will be displayed on the product page
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Category and GitHub Stars */}
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
                          <FormDescription className="form-description text-sm text-zinc-400 mt-1">
                            Auto-populated based on product type, can be customized
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* GitHub Stars */}
                    <FormField
                      control={addForm.control}
                      name="stars_numeric"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub Stars</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(isNaN(value) ? 0 : value);
                              }}
                            />
                          </FormControl>
                          <FormDescription className="form-description text-sm text-zinc-400 mt-1">
                            Number of GitHub stars (for popularity ranking)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Image URL */}
                  <FormField
                    control={addForm.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription className="form-description text-sm text-zinc-400 mt-1">
                          URL to the main product image (logo or screenshot)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                        <FormDescription className="form-description text-sm text-zinc-400 mt-1">
                          Comma-separated list of tags for search (auto-populated based on type)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="technical" className="space-y-4">
                  <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-6">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Technical Details
                    </h3>
                    <p className="text-gray-300">
                      These fields are auto-populated based on the product type you selected.
                      You can modify them if needed, but the product detail page will automatically
                      generate rich, contextual content based on the product type.
                    </p>
                  </div>
                  
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
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              {licenseOptions.map(option => (
                                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700 focus:bg-zinc-700">
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
                        <FormDescription className="form-description">
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
                        <FormDescription className="form-description">
                          Number of stars on GitHub repository (if applicable)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="meta" className="space-y-4">
                  {/* Featured and Active Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                      {/* Official */}
                      <FormField
                        control={addForm.control}
                        name="official"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Official
                              </FormLabel>
                              <FormDescription className="form-description">
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Featured
                              </FormLabel>
                              <FormDescription className="form-description">
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Active
                              </FormLabel>
                              <FormDescription className="form-description">
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
                        <FormDescription className="form-description">
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
                          <FormDescription className="form-description">
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
                        <FormDescription className="form-description">
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
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              {licenseOptions.map(option => (
                                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-zinc-700 focus:bg-zinc-700">
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
                        <FormDescription className="form-description">
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
                        <FormDescription className="form-description">
                          Number of stars on GitHub repository (if applicable)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="meta" className="space-y-4">
                  {/* Featured and Active Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                      {/* Official */}
                      <FormField
                        control={editForm.control}
                        name="official"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Official
                              </FormLabel>
                              <FormDescription className="form-description">
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Featured
                              </FormLabel>
                              <FormDescription className="form-description">
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Active
                              </FormLabel>
                              <FormDescription className="form-description">
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
                        <FormDescription className="form-description">
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

export default TechHubProductManagementDemo;