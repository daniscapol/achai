import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import DataStatusAlert from './components/DataStatusAlert';
// Use the modernized premium homepage with consistent animations
import HomePage from './components/ModernHomePage';
import ProductListPage from './components/ProductListPage';
// Using ProductsPageEnhanced as OriginalProductsPage for compatibility
import OriginalProductsPage from './components/ProductsPageEnhanced';
import PremiumProductsPage from './components/PremiumProductsPage';
import ProductDetailTech from './components/ProductDetailTech';
import TechHubProductManagementDemo from './components/TechHubProductManagementDemo';
import NewCategoriesPage from './components/NewCategoriesPage';
import WhatIsAnMcpServerPage from './components/WhatIsAnMcpServerPage';
import ConnectToClaudePage from './components/ConnectToClaudePage';
import SubmitServerPage from './components/SubmitServerPage';
import SecureAdminPage from './components/SecureAdminPage';
// CompareServersPage removed as requested
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ProfilePage from './components/auth/ProfilePage';
import SearchResultsPage from './components/SearchResultsPage';
import SearchResultsLayout from './components/SearchResultsLayout';
import GlobalSearchBar from './components/GlobalSearchBar';
import AuthRequired from './components/auth/AuthRequired';
import ReadyToUsePage from './components/ReadyToUsePage';
import AboutUsPage from './components/AboutUsPage';
import AgentRunner from './components/agents/AgentRunner';
import ApiKeyManager from './components/agents/ApiKeyManager';
// News and Courses components
import NewsPage from './components/news/NewsPage';
import NewsArticlePage from './components/news/NewsArticlePage';
import NewsCategoryPage from './components/news/NewsCategoryPage';
import CoursesPage from './components/courses/CoursesPage';
import CoursePage from './components/courses/CoursePage';
import CourseCategoryPage from './components/courses/CourseCategoryPage';
import { AnimatePresence, prefersReducedMotion } from './components/animations';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Wrapper components for routes that need params
import solutionsData from './achai_solutions.json';
import mcpServersData from './mcp_servers_data.json';
import aiAgentsData from './ai_agents_data.json';
// Make data available globally as a last-resort fallback
window.lastResortMcpServersData = mcpServersData;
window.lastResortAiAgentsData = aiAgentsData;

// Log debug info
console.log(`App.jsx: mcpServersData loaded with ${mcpServersData.length} items`);
import { loadUnifiedData } from './utils/searchUtils';
// No longer needed with path-based routing
// import { initNavigationFix } from './utils/navigationFix';

// Helper function to get GitHub URL based on product name
const getGithubUrl = (name) => {
  if (!name) return '#';
  
  // Normalize product name for case-insensitive comparison
  const normalizedName = name.trim().toLowerCase();
  
  const githubMap = {
    'ollama': 'https://github.com/ollama/ollama',
    'dify': 'https://github.com/langgenius/dify',
    'n8n': 'https://github.com/n8n-io/n8n',
    'browser use': 'https://github.com/anthropics/anthropic-cookbook/tree/main/browser_use',
    'zed': 'https://github.com/zed-industries/zed',
    'markitdown': 'https://github.com/markitdown-md/markitdown',
    'firecrawl': 'https://github.com/mendableai/firecrawl',
    // Add more mappings for additional products
    'gpt researcher': 'https://github.com/assafelovic/gpt-researcher',
    'claude context': 'https://github.com/anthropics/anthropic-cookbook',
    'cursor': 'https://github.com/getcursor/cursor',
    'langchain': 'https://github.com/langchain-ai/langchain',
    'langsmith': 'https://github.com/langchain-ai/langsmith',
    'llama index': 'https://github.com/run-llama/llama_index',
    'llamaindex': 'https://github.com/run-llama/llama_index'
  };
  
  return githubMap[normalizedName] || '#';
};

// Helper function to get NPM URL based on product name
const getNpmUrl = (name) => {
  if (!name) return '#';
  
  // Normalize product name for case-insensitive comparison
  const normalizedName = name.trim().toLowerCase();
  
  const npmMap = {
    'ollama': 'https://www.npmjs.com/package/ollama',
    'n8n': 'https://www.npmjs.com/package/n8n',
    'firecrawl': 'https://www.npmjs.com/package/firecrawl',
    'browser use': 'https://www.npmjs.com/package/@anthropic-ai/browser-use',
    'markitdown': 'https://www.npmjs.com/package/markitdown',
    'langchain': 'https://www.npmjs.com/package/langchain',
    'langsmith': 'https://www.npmjs.com/package/langsmith',
    'llama index': 'https://www.npmjs.com/package/llamaindex',
    'llamaindex': 'https://www.npmjs.com/package/llamaindex',
    'dify': 'https://www.npmjs.com/package/dify-client'
  };
  
  return npmMap[normalizedName] || '#';
};

// Helper function to get creator name
const getCreator = (name) => {
  if (!name) return 'Unknown Creator';
  
  // Normalize product name for case-insensitive comparison
  const normalizedName = name.trim().toLowerCase();
  
  const creatorMap = {
    'ollama': 'Ollama Team',
    'dify': 'LangGenius',
    'n8n': 'n8n.io',
    'browser use': 'Anthropic',
    'zed': 'Zed Industries',
    'markitdown': 'Markitdown Team',
    'firecrawl': 'Mendable AI',
    'gpt researcher': 'Assaf Elovic',
    'cursor': 'Cursor Team',
    'langchain': 'LangChain AI'
  };
  
  return creatorMap[normalizedName] || 'Unknown Creator';
};

// Helper function to get category
const getCategory = (name) => {
  if (!name) return 'General';
  
  // Normalize product name for case-insensitive comparison
  const normalizedName = name.trim().toLowerCase();
  
  const categoryMap = {
    'ollama': 'AI Development',
    'dify': 'AI Applications',
    'n8n': 'Workflow Automation',
    'browser use': 'Web Integration',
    'zed': 'Developer Tools',
    'markitdown': 'Document Processing',
    'firecrawl': 'Web Scraping & Data Collection',
    'gpt researcher': 'Research & Knowledge',
    'cursor': 'Developer Tools',
    'langchain': 'AI Development'
  };
  
  return categoryMap[normalizedName] || 'General';
};

// Helper function to get detailed descriptions
const getLongDescription = (name) => {
  if (!name) return null;
  
  // Normalize product name for case-insensitive comparison
  const normalizedName = name.trim().toLowerCase();
  
  const descriptionMap = {
    'ollama': 'Ollama allows you to run, customize and build open-source large language models (LLMs) locally. Run powerful models like Llama 3, Mistral, and more on your own computer or server, without relying on cloud services. Ollama features an easy-to-use CLI, REST API, and desktop application, making it simple to integrate powerful AI into your projects and workflows.',
    'dify': 'Dify is a comprehensive LLM application development platform that allows developers and businesses to create AI-powered applications with minimal effort. It offers a visual workflow builder, RAG (Retrieval Augmented Generation) pipeline, agent capabilities, model management, observability features, and extensive API support. Dify aims to simplify the process of building production-ready AI applications.',
    'n8n': 'n8n is a fair-code licensed workflow automation platform that enables you to connect different services and automate tasks through a visual builder interface or custom code. With native AI capabilities and support for over 350 integrations, n8n helps teams create efficient workflows for customer support, marketing, sales, and more. Its flexible deployment options allow for cloud hosting or self-hosting.',
    'browser use': 'Browser Use is an MCP server that enables AI assistants to interact with and control web browsers programmatically. It allows Claude and other AI models to navigate websites, fill forms, click buttons, and extract information from web pages. This tool is especially useful for automating repetitive web tasks, data collection, and creating workflows that involve web applications.',
    'zed': 'Zed is a high-performance, multiplayer code editor designed for speed and collaboration. Built with Rust, it offers exceptional responsiveness and efficiency. Zed includes AI-assisted coding features and real-time multiplayer capabilities that allow developers to work together on code simultaneously. Its clean, distraction-free interface and powerful editing capabilities make it a modern alternative to traditional code editors.',
    'markitdown': 'Markitdown is a specialized tool that converts various document formats (PDF, DOCX, PPT, etc.) to clean, structured Markdown. This makes it ideal for feeding content into LLMs, which typically work best with plain text formats. Markitdown preserves document structure, extracts text accurately, and produces high-quality Markdown output that maintains the original document\'s meaning and organization. Perfect for knowledge base creation, content migration, and AI text analysis workflows.',
    'firecrawl': 'Firecrawl is a powerful web scraping and crawling tool designed specifically for integration with Large Language Models. It enables LLMs to access real-time web content through features like web scraping with JavaScript rendering, web search with content extraction, comprehensive logging, URL discovery, and efficient batch processing with built-in rate limiting. Firecrawl can be used in both cloud and self-hosted environments, making it flexible for various deployment scenarios.',
    'gpt researcher': 'GPT Researcher is an autonomous agent designed for web research tasks. It can search the internet, extract relevant information, and compile comprehensive reports on virtually any topic. The tool uses advanced AI techniques to navigate search results, analyze content, and synthesize findings into well-structured documents with proper citations. It\'s particularly useful for researchers, content creators, and anyone needing quick, thorough information gathering.',
    'cursor': 'Cursor is an AI-first code editor designed to enhance developer productivity. It integrates powerful AI assistance directly into the coding workflow, offering features like code generation, explanation, refactoring, and bug fixing. Built on top of VSCode, Cursor maintains a familiar environment while adding AI capabilities that help developers write better code faster. It supports most programming languages and integrates with popular development tools.',
    'langchain': 'LangChain is a framework designed to simplify the development of applications using large language models (LLMs). It provides a standardized interface for chains, integrations with other tools, and end-to-end chains for common applications. LangChain makes it easier to work with multiple models, connect them with various data sources, and build more sophisticated applications that leverage the power of LLMs.'
  };
  
  return descriptionMap[normalizedName] || null;
};

// Helper function to get key features
const getKeyFeatures = (name) => {
  if (!name) return null;
  
  // Normalize product name for case-insensitive comparison
  const normalizedName = name.trim().toLowerCase();
  
  const featuresMap = {
    'ollama': [
      'Run LLMs locally on your device',
      'Support for Llama 3, Mistral, and other open-source models',
      'Create custom model variations with Modelfiles',
      'Simple REST API for integration',
      'Cross-platform support (macOS, Windows, Linux)'
    ],
    'dify': [
      'Visual AI workflow builder',
      'RAG (Retrieval Augmented Generation) pipeline',
      'Agent capabilities for autonomous tasks',
      'Comprehensive model management',
      'Built-in observability and analytics'
    ],
    'n8n': [
      'Visual workflow builder',
      '350+ integrations with popular services',
      'Native AI capabilities',
      'Custom code execution',
      'Flexible deployment options (cloud or self-hosted)'
    ],
    'browser use': [
      'Programmatic web browser control',
      'Page navigation and interaction',
      'Form filling and submission',
      'Content extraction and processing',
      'Multi-step workflow automation'
    ],
    'zed': [
      'High-performance text editing',
      'Real-time collaboration features',
      'Built with Rust for exceptional speed',
      'AI-assisted coding capabilities',
      'Clean, distraction-free interface'
    ],
    'markitdown': [
      'Convert various document formats to Markdown',
      'Preserve document structure and formatting',
      'Accurate text extraction',
      'Support for PDF, DOCX, PPT, and other formats',
      'Optimized output for LLM processing'
    ],
    'firecrawl': [
      'Web scraping with JavaScript rendering',
      'Web search with content extraction',
      'Comprehensive logging system',
      'URL discovery and crawling',
      'Efficient batch processing with built-in rate limiting'
    ],
    'gpt researcher': [
      'Autonomous web research capabilities',
      'Comprehensive report generation',
      'Proper citation of sources',
      'Multi-step reasoning for deep analysis',
      'Support for diverse research topics'
    ],
    'cursor': [
      'AI-powered code generation',
      'Context-aware code explanations',
      'Intelligent code completion',
      'Built on VSCode for familiarity',
      'Multi-language support'
    ],
    'langchain': [
      'Standardized interface for LLM interactions',
      'Extensive toolkit of components',
      'Seamless integration with various data sources',
      'Built-in memory capabilities',
      'Support for agent creation and orchestration'
    ]
  };
  
  return featuresMap[normalizedName] || null;
};

// Helper function to get use cases
const getUseCases = (name) => {
  if (!name) return null;
  
  // Normalize product name for case-insensitive comparison
  const normalizedName = name.trim().toLowerCase();
  
  const useCasesMap = {
    'ollama': [
      'Local development of AI applications',
      'Offline AI capabilities for privacy-sensitive applications',
      'Education and learning about LLMs',
      'Cost-effective AI deployment',
      'Integration with custom applications'
    ],
    'dify': [
      'Building customer service chatbots',
      'Creating knowledge base applications',
      'Developing AI-powered content generation tools',
      'Implementing intelligent search systems',
      'Building agent-based automation solutions'
    ],
    'n8n': [
      'Customer data synchronization across platforms',
      'Marketing campaign automation',
      'Sales process optimization',
      'Support ticket routing and handling',
      'Data processing and transformation workflows'
    ],
    'browser use': [
      'Automated web testing and monitoring',
      'Data collection from web sources',
      'Form automation for repetitive tasks',
      'AI-driven web research',
      'Web application integration'
    ],
    'zed': [
      'Collaborative software development',
      'Remote pair programming',
      'High-performance code editing',
      'AI-assisted code generation',
      'Efficient text manipulation and editing'
    ],
    'markitdown': [
      'Converting documentation for AI processing',
      'Creating knowledge bases from existing documents',
      'Content migration to markdown-based systems',
      'Preparing training data for AI models',
      'Document standardization for analysis'
    ],
    'firecrawl': [
      'Enhance LLM context with real-time web data',
      'Automate data collection from multiple websites',
      'Extract structured information from web pages',
      'Web research automation',
      'Content monitoring and analysis'
    ],
    'gpt researcher': [
      'Academic research and literature reviews',
      'Market research and competitive analysis',
      'Product research and comparison',
      'News summarization and trend analysis',
      'Creating comprehensive reports on any topic'
    ],
    'cursor': [
      'Rapid prototyping of applications',
      'Learning new programming languages',
      'Code refactoring and optimization',
      'Bug identification and fixing',
      'Technical documentation generation'
    ],
    'langchain': [
      'Creating conversational AI applications',
      'Building RAG (Retrieval Augmented Generation) systems',
      'Developing AI agents for task automation',
      'Implementing complex AI workflows',
      'Managing document-based interactions with LLMs'
    ]
  };
  
  return useCasesMap[normalizedName] || null;
};

// Helper function to get similar tools
const getSimilarTools = (name) => {
  if (!name) return null;
  
  // Only include tools with valid GitHub or npm links
  const validTools = [
    'Ollama', 'Dify', 'n8n', 'Browser Use', 'Zed', 'Markitdown', 'Firecrawl',
    'LangChain', 'Cursor', 'GPT Researcher'
  ];
  
  // Map of product names to their similar tools
  const similarToolsMap = {
    'Ollama': [
      { id: 'https://mcpmarket.com/server/dify-5', name: 'Dify', description: 'LLM application development platform with workflow builder and RAG pipeline.' },
      { id: 'https://mcpmarket.com/server/langchain-10', name: 'LangChain', description: 'Framework for developing applications powered by language models.' }
    ],
    'Dify': [
      { id: 'https://mcpmarket.com/server/ollama-4', name: 'Ollama', description: 'Run and manage large language models locally on your machine.' },
      { id: 'https://mcpmarket.com/server/langchain-10', name: 'LangChain', description: 'Framework for developing applications powered by language models.' }
    ],
    'n8n': [
      { id: 'https://mcpmarket.com/server/dify-5', name: 'Dify', description: 'LLM application development platform with workflow builder and RAG pipeline.' },
      { id: 'https://mcpmarket.com/server/browser-use-10', name: 'Browser Use', description: 'Enables AI agents to interact with and control web browsers for automated tasks.' }
    ],
    'Browser Use': [
      { id: 'https://mcpmarket.com/server/n8n-3', name: 'n8n', description: 'Automates workflows with a fair-code platform that combines visual building with custom code.' },
      { id: 'https://mcpmarket.com/server/firecrawl-1', name: 'Firecrawl', description: 'Web scraping and crawling tool for LLMs to access real-time web content.' }
    ],
    'Zed': [
      { id: 'https://mcpmarket.com/server/cursor-13', name: 'Cursor', description: 'AI-first code editor with advanced code assistance and generation capabilities.' },
      { id: 'https://mcpmarket.com/server/ollama-4', name: 'Ollama', description: 'Run and manage large language models locally on your machine.' }
    ],
    'Markitdown': [
      { id: 'https://mcpmarket.com/server/firecrawl-1', name: 'Firecrawl', description: 'Web scraping and crawling tool for LLMs to access real-time web content.' },
      { id: 'https://mcpmarket.com/server/browser-use-10', name: 'Browser Use', description: 'Enables AI agents to interact with and control web browsers for automated tasks.' }
    ],
    'Firecrawl': [
      { id: 'https://mcpmarket.com/server/browser-use-10', name: 'Browser Use', description: 'Enables AI agents to interact with and control web browsers for automated tasks.' },
      { id: 'https://mcpmarket.com/server/gpt-researcher-8', name: 'GPT Researcher', description: 'Conducts in-depth web research on any topic, generating comprehensive reports with citations.' },
      { id: 'https://mcpmarket.com/server/markitdown-1', name: 'Markitdown', description: 'Converts files and office documents to Markdown format for use with LLMs.' }
    ]
  };
  
  // Try to find similar tools by case-insensitive name
  const tools = similarToolsMap[name] || 
              similarToolsMap[Object.keys(similarToolsMap).find(key => 
                key.toLowerCase() === name.toLowerCase())] || 
              null;
  
  // Filter out tools that don't have valid GitHub or npm links
  if (tools) {
    return tools.filter(tool => {
      const toolName = tool.name;
      return validTools.some(valid => valid.toLowerCase() === toolName.toLowerCase());
    });
  }
  
  return null;
};

// Function to determine the appropriate transition animation based on the current view
const getPageTransitionAnimation = (view) => {
  // Check if user prefers reduced motion, if so, use a simple fade
  if (prefersReducedMotion()) {
    return 'fade';
  }
  
  // Different animations for different page types
  switch (view) {
    case 'home':
      return 'fade';
    case 'detail':
      return 'slide-up';
    case 'list':
      return 'slide-up';
    case 'categories':
      return 'slide-left';
    case 'categories-new':
      return 'slide-up';
    case 'what-is-mcp':
      return 'slide-right';
    case 'connect-claude':
      return 'slide-right';
    case 'submit':
      return 'slide-left';
    case 'login':
    case 'register':
    case 'profile':
      return 'scale';
    case 'compare':
      return 'slide-up';
    case 'ready-to-use':
      return 'slide-up';
    case 'about-us':
      return 'fade';
    case 'search':
      return 'slide-up';
    default:
      return 'fade';
  }
};

// Process solutions data
const solutionsProcessed = solutionsData.reduce((acc, product, index) => {
  const productId = product.id || product.url || (index + 1);
  
  // Skip products without valid GitHub or npm links
  const githubUrl = product.githubUrl || getGithubUrl(product.name);
  const npmUrl = product.npmUrl || getNpmUrl(product.name);
  
  if (githubUrl === '#' && npmUrl === '#') {
    return acc; // Skip this product
  }
  
  acc[productId] = {
    ...product,
    id: productId,
    stars: product.stars_numeric !== undefined ? product.stars_numeric : (product.stars_str ? parseInt(product.stars_str.replace(/,/g, ''), 10) : 0),
    category: product.tag_on_card || product.category || getCategory(product.name) || 'General',
    shortDescription: product.description ? product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '') : 'No description available.',
    longDescription: getLongDescription(product.name) || product.description || 'No detailed description available.',
    createdBy: product.createdBy || getCreator(product.name) || 'Unknown Creator',
    keywords: product.keywords || (product.name ? product.name.toLowerCase().split(' ') : []),
    official: product.official !== undefined ? product.official : false,
    githubUrl: githubUrl,
    npmUrl: npmUrl,
    categories: product.categories || (product.category ? [product.category] : (product.tag_on_card ? [product.tag_on_card] : [getCategory(product.name) || 'General'])),
    keyFeatures: product.keyFeatures || getKeyFeatures(product.name) || [],
    useCases: product.useCases || getUseCases(product.name) || [],
    faq: product.faq || [],
    similarTools: product.similarTools || getSimilarTools(product.name) || [],
    type: 'server' // Add type field for unified search
  };
  return acc;
}, {});

// Create a list of names from solutions to avoid duplicates
const existingNames = Object.values(solutionsProcessed).map(product => 
  product.name.toLowerCase()
);

// Filter out duplicate entries from MCP servers data
const filteredMcpServers = mcpServersData.filter(product => 
  !existingNames.includes(product.name.toLowerCase())
);

// Combine with MCP servers data (no duplicates)
const allProductsData = filteredMcpServers.reduce((acc, product) => {
  // Create consistent product IDs that match our URL structure
  const productId = product.id || product.name.toLowerCase().replace(/\s+/g, '-');
  
  // Ensure all required fields are present
  acc[productId] = {
    ...product,
    id: productId,
    // Make sure default fields are set correctly for consistent rendering
    stars: product.stars_numeric || product.stars || 0,
    category: product.category || 'General',
    shortDescription: product.description ? product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '') : 'No description available.',
    longDescription: product.description || 'No detailed description available.',
    keyFeatures: product.keyFeatures || [],
    useCases: product.useCases || [],
    official: product.official !== undefined ? product.official : false,
    categories: product.categories || (product.category ? [product.category] : ['General']),
    similarTools: product.similarTools || [],
    type: 'server' // Add type field for unified search
  };
  return acc;
}, solutionsProcessed);

// Fetch our custom products from PostgreSQL database
const fetchCustomProducts = async () => {
  try {
    // Set a timeout to prevent long-running requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/products`, {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      clearTimeout(timeoutId); // Clear the timeout
      
      if (!response.ok) {
        throw new Error(`Failed to fetch custom products: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the custom products to match the MCP data format
      const formattedProducts = data.products.map(product => ({
        ...product,
        id: String(product.id),  // Ensure ID is a string for consistency
        type: 'custom-product',  // Add a distinct type for our custom products
        stars: product.stars_numeric || 0,
        shortDescription: product.description 
          ? product.description.substring(0, 150) + (product.description.length > 150 ? '...' : '') 
          : 'No description available.',
        longDescription: product.description || 'No detailed description available.',
        categories: product.category ? [product.category] : ['Products'],
        // Ensure it has all required fields for search and display
        name: product.name || 'Unnamed Product',
        image_url: product.image_url || '/assets/news-images/fallback.jpg',
        local_image_path: product.image_url || '/assets/news-images/fallback.jpg',
        price: product.price || 0,
        keyFeatures: [],
        useCases: []
      }));
      
      console.log(`Fetched ${formattedProducts.length} custom products from PostgreSQL database`);
      
      // Store in sessionStorage as a backup
      try {
        sessionStorage.setItem('cached_custom_products', JSON.stringify(formattedProducts));
      } catch (err) {
        console.warn("Could not cache products in sessionStorage:", err);
      }
      
      return formattedProducts;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error("Error fetching custom products:", error);
    
    // Try to get cached products from sessionStorage
    try {
      const cachedProducts = sessionStorage.getItem('cached_custom_products');
      if (cachedProducts) {
        const parsedProducts = JSON.parse(cachedProducts);
        console.log(`Using ${parsedProducts.length} cached custom products from sessionStorage`);
        return parsedProducts;
      }
    } catch (cacheError) {
      console.warn("Could not retrieve cached products:", cacheError);
    }
    
    // Fallback: Return a few example PostgreSQL products for demo purposes
    console.log("API failed - Using fallback PostgreSQL demo products");
    return [
      {
        id: "pg-demo-1",
        name: "PostgreSQL Product Example",
        description: "This is a fallback PostgreSQL product example when the API is unavailable",
        category: "Database",
        type: "custom-product",
        stars_numeric: 5,
        price: 129.99,
        image_url: "/assets/news-images/fallback.jpg",
        local_image_path: "/assets/news-images/fallback.jpg",
        shortDescription: "This is a fallback PostgreSQL product when the API is unavailable",
        longDescription: "This is a fallback PostgreSQL product example when the API is unavailable. The actual database endpoint might be down or experiencing issues.",
        categories: ["Database", "PostgreSQL"],
        keyFeatures: ["Built with PostgreSQL", "Fast database access", "Scalable architecture", "Secure data storage"],
        useCases: ["Data management", "Inventory tracking", "User authentication", "Content management"]
      },
      {
        id: "pg-demo-2",
        name: "PostgreSQL Enterprise Solution", 
        description: "Enterprise-grade PostgreSQL solution for high-performance applications",
        category: "Enterprise",
        type: "custom-product",
        stars_numeric: 4.8,
        price: 299.99,
        image_url: "/assets/news-images/fallback.jpg",
        local_image_path: "/assets/news-images/fallback.jpg",
        shortDescription: "Enterprise-grade PostgreSQL solution for high-performance applications",
        longDescription: "Our flagship PostgreSQL-powered enterprise solution provides unmatched performance for mission-critical applications. Perfect for organizations with demanding workloads and high availability requirements.",
        categories: ["Enterprise", "PostgreSQL", "Database"],
        keyFeatures: ["High availability", "Load balancing", "Automated backups", "Advanced monitoring", "24/7 support"],
        useCases: ["Financial services", "Healthcare data", "E-commerce platforms", "Government systems"]
      }
    ];
  }
};

// FIX: Get initial data directly from allProductsData array plus client data and custom products
const getInitialData = async () => {
  try {
    // Set a timeout to prevent long-running requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      // Fetch products from our AWS PostgreSQL API
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/products?limit=50`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout
      
      const data = await response.json();
      
      console.log(`getInitialData: Fetched ${data.products?.length || 0} products from AWS PostgreSQL`);
      
      // Check if we got products from the AWS database
      if (!data.products || data.products.length === 0) {
        throw new Error('No products found in AWS PostgreSQL database');
      }
      
      // Only use products from AWS PostgreSQL
      const finalCombinedProducts = [...data.products];
      
      // Make this data available globally for other components
      window.mcpServersDirectData = finalCombinedProducts;
      window.usingFallbackData = false;
      
      console.log(`getInitialData returning ${finalCombinedProducts.length} products from AWS PostgreSQL`);
      return finalCombinedProducts;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error("AWS PostgreSQL data fetch failed:", error);
    console.warn("Falling back to local JSON data");
    
    // FALLBACK: Combine data from local JSON files
    try {
      // Create formatted server products from mcpServersData
      const serverProducts = mcpServersData.map(server => ({
        id: parseInt(server.id?.replace(/\D/g, '')) || Math.floor(Math.random() * 1000) + 1,
        name: server.name,
        description: server.description || '',
        price: server.price || 0,
        image_url: server.image_url || '',
        category: server.category || 'Uncategorized',
        categories: server.categories || [server.category || 'Uncategorized'],
        product_type: 'server',
        github_url: server.github_url || '',
        official: server.official || false,
        docs_url: server.docs_url || '',
        stars_numeric: server.stars_numeric || 0,
        tags: server.tags || [],
        is_featured: server.is_featured || false,
        is_active: true,
        slug: server.id?.replace(/[^a-z0-9]+/g, '-').toLowerCase() || `server-${Math.floor(Math.random() * 10000)}`
      }));
      
      // Set the flag to indicate we're using fallback data
      window.usingFallbackData = true;
      
      // Make the fallback data available globally
      window.mcpServersDirectData = serverProducts;
      
      console.log(`Using ${serverProducts.length} products from local JSON files as fallback`);
      return serverProducts;
    } catch (fallbackError) {
      console.error("Failed to load fallback data:", fallbackError);
      return [];
    }
  }
};

function App() {
  const [currentView, setCurrentView] = useState('home'); // Set home as default view instead of list
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [appIsInitialized, setAppIsInitialized] = useState(false);
  // Store initial data in a ref to avoid reloading it unnecessarily
  const initialDataRef = useRef([]);
  
  // FIX: Initialize with the combined data directly to ensure consistent count
  // Initialize mcpData with empty array first, then update when data is loaded
  const [mcpData, setMcpData] = useState([]);
  
  // Memoize featured products to prevent unnecessary re-renders
  const featuredProducts = useMemo(() => mcpData.slice(0, 10), [mcpData]);
  
  // Add initialization timer to prevent flashes
  useEffect(() => {
    // Small delay before considering the app initialized
    const timer = setTimeout(() => {
      setAppIsInitialized(true);
      
      // No need for navigation fix with BrowserRouter
      if (window.location.pathname.includes('/products/')) {
        console.log("Product detail page detected - using standard routing");
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Initialize localStorage with combined MCP data and add a refresh handler
  useEffect(() => {
    // FIX: Load data asynchronously
    const initializeData = async () => {
      try {
        // Load the combined data (servers + clients)
        const combinedData = await getInitialData();
        
        // Store in ref for future use
        initialDataRef.current = combinedData;
        
        // Update the state with loaded data
        setMcpData(combinedData);
        
        // Debug: Check if we have data
        console.log("INITIALIZATION DEBUG - Combined data sample:", 
          combinedData.slice(0, 3).map(item => ({ name: item.name, type: item.type, id: item.id })));
        console.log(`INITIALIZATION DEBUG - Total MCP items: ${combinedData.length}`);
        console.log(`INITIALIZATION DEBUG - Clients: ${combinedData.filter(item => item.type === 'client').length}`);
        console.log(`INITIALIZATION DEBUG - Servers: ${combinedData.filter(item => item.type === 'server').length}`);
        
        // We don't override localStorage here anymore since it might contain newer data
        console.log(`Using ${combinedData.length} MCP items`);
        
        // Force direct data initialization instead of relying on localStorage
        window.mcpServersDirectData = combinedData;
        
        // Initialize unified data for search
        loadUnifiedData().then((unifiedData) => {
          console.log(`Unified search data initialized with ${unifiedData.length} items`);
          
          // Store direct reference to unified data
          window.unifiedSearchData = unifiedData;
        });
      } catch (err) {
        console.error("Error initializing data:", err);
      }
    };
    
    // Execute the async initialization
    initializeData();
    
    // Add a storage event listener to detect changes from admin panel
    // Use debounce to prevent multiple rapid refreshes
    let storageChangeTimeout = null;
    const handleStorageChange = (e) => {
      console.log("Storage change detected:", e.key);
      // If any of our data sources change, refresh the data
      if (e.key === 'mcp_unified_data' || 
          e.key === 'mcp_servers_data' || 
          e.key === 'mcp_clients_data' ||
          e.key === 'ai_agents_data') {
        
        // Clear any existing timeout
        if (storageChangeTimeout) {
          clearTimeout(storageChangeTimeout);
        }
        
        // Set a new timeout to debounce the refresh
        storageChangeTimeout = setTimeout(() => {
          console.log("Refreshing data after storage change");
          initializeData();
          storageChangeTimeout = null;
        }, 500); // Debounce for 500ms
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (storageChangeTimeout) {
        clearTimeout(storageChangeTimeout);
      }
    };
  }, []);

  // DISABLED: Manual route handling conflicts with React Router
  /*
  useEffect(() => {
    const handleRouteChange = () => {
      // Always scroll to top when path changes
      window.scrollTo(0, 0);
      
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Process product detail page
      if (path.startsWith('/product/')) {
        // Redirect to new product URL format
        const productIdStr = path.substring('/product/'.length);
        console.log(`Redirecting from old product URL format to new format: ${productIdStr}`);
        
        // Update URL to new format
        window.location.href = `/products/${productIdStr}`;
        return; // Stop processing - let the popstate event handle the new URL
        
        // Add debug information to help diagnose product lookup issues
        console.log("Navigating to product with ID:", productIdStr);
        
        // Check if we need to refresh data (coming from another part of the app)
        const wasProgrammaticNavigation = sessionStorage.getItem('programmatic_navigation') === 'true';
        
        // Always clear the flag, regardless of how we got here
        sessionStorage.removeItem('programmatic_navigation');
        
        // Keep using the data we already have loaded - no need to reload
        try {
          // Get the data from our ref which should have been populated at initialization
          if (initialDataRef.current.length === 0) {
            console.log("Warning: initialDataRef is empty, loading data again");
            // Try to load data again
            getInitialData().then(data => {
              initialDataRef.current = data;
              setMcpData(data);
            });
          } else {
            console.log(`Navigation: Using ${initialDataRef.current.length} items from initialDataRef`);
          }
        } catch (err) {
          console.error("Error refreshing MCP data during navigation:", err);
        }
        
        // Check if this is a client product (has client- prefix)
        const isClient = productIdStr.startsWith('client-');
        const rawId = isClient ? productIdStr.substring('client-'.length) : productIdStr;
        
        console.log(`Product is ${isClient ? 'a client' : 'a server'} with raw ID: ${rawId}`);
        console.log(`DEBUG: mcpData contains ${mcpData.length} items, including ${mcpData.filter(p => p.type === 'client').length} clients`);
        
        // SPECIAL CASE: Handle ClickHouse directly to ensure backward compatibility
        if (!isClient && productIdStr === 'clickhouse') {
          console.log("SPECIAL CASE: Direct lookup for ClickHouse by URL");
          // No need to further process - we'll handle this directly in the server section below
        }
        
        // Debug: Print all available clients for debugging
        if (isClient) {
          const clients = mcpData.filter(p => p.type === 'client');
          console.log(`Available clients: ${clients.map(c => c.name).join(', ')}`);
          console.log(`Looking for client with raw ID: "${rawId}"`);
          console.log(`Clients with matching names: ${clients.filter(c => c.name.toLowerCase().includes(rawId.toLowerCase())).map(c => c.name).join(', ')}`);
        }
        
        // First check mcpData by exact ID match
        let product = mcpData.find(p => {
          // For clients, we need to match both ID and type
          if (isClient && p.type === 'client') {
            return String(p.id) === rawId;
          } 
          // For servers, just match the ID
          else if (!isClient && p.type !== 'client') {
            return String(p.id) === productIdStr;
          }
          return false;
        });
        
        // If not found, try matching by name for clients
        if (!product && isClient) {
          // Try exact name match first in clients
          product = mcpData.find(p => 
            p.type === 'client' && 
            p.name && 
            p.name.toLowerCase() === rawId.toLowerCase().replace(/-/g, ' ')
          );
          
          // If still not found, try more flexible name matching
          if (!product) {
            const simpleRawId = rawId.toLowerCase().replace(/-/g, '');
            product = mcpData.find(p => 
              p.type === 'client' && 
              p.name && 
              p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === simpleRawId
            );
          }
          
          // If still not found, try with starts with in client list
          if (!product) {
            const parts = rawId.split('-');
            if (parts.length > 0) {
              const firstPart = parts[0];
              if (firstPart.length > 2) {
                console.log(`Trying to match client starting with: ${firstPart}`);
                product = mcpData.find(p => 
                  p.type === 'client' && 
                  p.name && 
                  p.name.toLowerCase().startsWith(firstPart.toLowerCase())
                );
              }
            }
          }
          
          // If still not found, check for servers that should be clients
          if (!product) {
            console.log("Checking for misclassified clients in server list...");
            
            // Prepare normalized client ID for search
            const rawIdNormalized = rawId.toLowerCase().replace(/-/g, ' ');
            
            // Try exact name match first in potential misclassified clients
            product = mcpData.find(p => 
              p.type !== 'client' && 
              p.name && 
              p.name.toLowerCase() === rawIdNormalized
            );
            
            // If found, correct its type
            if (product) {
              console.log(`Found client ${product.name} incorrectly classified as server`);
              product = {
                ...product,
                type: 'client'  // Correct the type
              };
            }
          }
        }
        
        // For servers, try additional matching approaches
        if (!product && !isClient) {
          // SPECIAL CASE: Hard-coded server lookup for specific servers like ClickHouse
          if (productIdStr === 'clickhouse') {
            console.log("HARD-CODED LOOKUP: Found special case for ClickHouse");
            product = mcpData.find(p => 
              p.type !== 'client' && 
              p.name && 
              p.name.toLowerCase() === 'clickhouse'
            );
            
            // If we still can't find it in our data, create a minimal placeholder
            if (!product) {
              console.log("Creating placeholder for ClickHouse");
              product = {
                id: 'clickhouse',
                name: 'ClickHouse',
                description: 'Query your ClickHouse database server.',
                category: 'Database Management',
                type: 'server',
                // Use a placeholder image
                local_image_path: '/assets/news-images/fallback.jpg'
              };
              
              // Add to mcpData so it can be found
              mcpData.push(product);
            }
          }
          
          // Try by normalized name
          if (!product) {
            product = mcpData.find(p => {
              const normalizedName = p.name && p.name.toLowerCase().replace(/\s+/g, '-');
              return p.type !== 'client' && normalizedName === productIdStr;
            });
          }
          
          // Try by case-insensitive name
          if (!product) {
            product = mcpData.find(p => {
              return p.type !== 'client' && p.name && p.name.toLowerCase() === productIdStr.toLowerCase();
            });
          }
        }
        
        // HARD-CODED CLIENT LOOKUP FOR CRITICAL CASES
        if (!product && isClient) {
          console.log("Using hard-coded lookup for critical client cases");
          
          // HARDCODED CLIENT MAPPING - Map URL slug to client name for consistent lookups
          const clientNameMapping = {
            'claude-desktop': 'Claude Desktop',
            'vscode-mcp-extension': 'VSCode MCP Extension',
            'cursor': 'Cursor',
            'librechat': 'LibreChat',
            'zed': 'Zed',
            'eechat': 'eechat',
            '5ire': '5ire',
            'cherry-studio': 'Cherry Studio'
          };
          
          if (clientNameMapping[rawId]) {
            // Try to find by exact name match first
            const exactName = clientNameMapping[rawId];
            product = mcpData.find(p => 
              p.type === 'client' && 
              p.name && 
              p.name === exactName
            );
            
            // If still not found, try with case-insensitive match
            if (!product) {
              product = mcpData.find(p => 
                p.type === 'client' && 
                p.name && 
                p.name.toLowerCase() === exactName.toLowerCase()
              );
            }
            
            // If still not found, try with includes
            if (!product) {
              product = mcpData.find(p => 
                p.type === 'client' && 
                p.name && 
                p.name.toLowerCase().includes(exactName.toLowerCase())
              );
            }
            
            if (product) {
              console.log(`Found client product via name mapping: "${rawId}" → "${product.name}"`);
            }
          }
          // Fallback to searching by rawId parts
          else {
            // Handle some known clients explicitly
            if (rawId === 'claude-desktop') {
              product = mcpData.find(p => 
                p.type === 'client' && 
                p.name && 
                (p.name === 'Claude Desktop' || p.name.toLowerCase().includes('claude') && p.name.toLowerCase().includes('desktop'))
              );
            }
            else if (rawId === 'vscode-mcp-extension') {
              product = mcpData.find(p => 
                p.type === 'client' && 
                p.name && 
                (p.name === 'VSCode MCP Extension' || p.name.toLowerCase().includes('vscode'))
              );
            }
            else if (rawId === 'cursor') {
              product = mcpData.find(p => 
                p.type === 'client' && 
                p.name && 
                p.name.toLowerCase() === 'cursor'
              );
            }
            else if (rawId === 'librechat') {
              product = mcpData.find(p => 
                p.type === 'client' && 
                p.name && 
                p.name.toLowerCase() === 'librechat'
              );
            }
          }
          
          // If we found something through hard-coding, log it
          if (product) {
            console.log(`Found client product via hard-coded lookup: ${product.name}`);
          }
        }
        
        // Last resort - try to find any client with a name containing the raw ID
        if (!product && isClient) {
          console.log("Last resort: Finding any client containing the name parts");
          
          // Get all clients
          const allClients = mcpData.filter(p => p.type === 'client');
          
          // Try each part of the name
          const wordParts = rawId.split('-');
          if (wordParts.length > 0) {
            for (const part of wordParts) {
              if (part.length < 3) continue; // Skip short parts
              
              const matchingClients = allClients.filter(c => 
                c.name && c.name.toLowerCase().includes(part.toLowerCase())
              );
              
              if (matchingClients.length === 1) {
                console.log(`Found unique client match using part "${part}":`, matchingClients[0].name);
                product = matchingClients[0];
                break;
              } else if (matchingClients.length > 0) {
                // Just take the first one if we have multiple matches
                console.log(`Found ${matchingClients.length} client matches, using first: ${matchingClients[0].name}`);
                product = matchingClients[0];
                break;
              }
            }
          }
        }
        
        // If product is found
        if (product) {
          // Make sure the product has a valid ID - use the URL ID if needed
          if (!product.id || (typeof product.id === 'number' && !isNaN(product.id))) {
            console.log(`Product found but has numeric or missing ID. Setting ID to: ${productIdStr}`);
            product.id = productIdStr;
          }
          
          // Set state for product detail view
          setSelectedProductId(product.id);
          setCurrentView('detail');
          
          // We're removing the forced reload check to prevent infinite refresh loops
          // Instead, we'll trust React's component lifecycle to handle proper rendering
          if (!wasProgrammaticNavigation) {
            console.log("Direct URL access to product detail page");
            // No forced reload - let component handle the rendering
          }
          
          // Add some debug output about what we found
          console.log("Product details for display:", {
            id: product.id,
            name: product.name,
            type: product.type,
            category: product.category
          });
        } else {
          // Client product not found, check if it's one of our known mappings
          if (isClient) {
            console.warn(`Client product with ID ${rawId} not found`);
            
            // If it's a known client like Claude Desktop, create an example with more details
            const clientNameMapping = {
              'claude-desktop': 'Claude Desktop',
              'vscode-mcp-extension': 'VSCode MCP Extension', 
              'cursor': 'Cursor',
              'librechat': 'LibreChat',
              'zed': 'Zed',
              'eechat': 'eechat',
              '5ire': '5ire',
              'cherry-studio': 'Cherry Studio'
            };
            
            let fallbackProduct;
            
            if (clientNameMapping[rawId]) {
              // Create a more detailed fallback for known clients
              const clientName = clientNameMapping[rawId];
              
              fallbackProduct = {
                id: rawId,
                name: clientName,
                description: `Official MCP client for ${clientName}.`,
                type: 'client',
                category: 'MCP Clients',
                error: false, // Not a true error since we know about this client
                local_image_path: '/assets/client-images/desktop-application.png',
                stars_numeric: 1000,
                official: true,
                // Use the right image based on type
                local_image_path: clientName.toLowerCase().includes('code') ? 
                  '/assets/client-images/code-editor.png' : 
                  '/assets/client-images/desktop-application.png',
              };
              
              console.log(`Created detailed fallback for known client: ${clientName}`);
            } else {
              // Create a generic fallback for unknown clients
              fallbackProduct = {
                id: rawId,
                name: rawId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                description: `Information about this MCP client is currently unavailable.`,
                type: 'client',
                category: 'MCP Clients',
                error: true, // Mark this as an error case
                local_image_path: '/assets/client-images/desktop-application.png',
              };
              
              console.log(`Created fallback product for unknown client: ${fallbackProduct.name}`);
            }
            
            // Set the fallback product to show an error page instead of redirecting
            setSelectedProductId(fallbackProduct.id);
            mcpData.push(fallbackProduct); // Add to mcpData so it can be found
            setCurrentView('detail');
          } else {
            // Special case for ClickHouse
            if (productIdStr === 'clickhouse') {
              console.log("Creating detailed fallback for ClickHouse");
              
              const fallbackProduct = {
                id: 'clickhouse',
                name: 'ClickHouse',
                description: 'Query your ClickHouse database server. ClickHouse is an open-source, high performance columnar OLAP database management system for real-time analytics.',
                type: 'server',
                category: 'Database Management',
                error: false, // Not a true error since we know what ClickHouse is
                local_image_path: '/assets/news-images/fallback.jpg',
                stars_numeric: 9000,
                official: true,
                keyFeatures: [
                  "Fast SQL queries",
                  "Real-time analytics",
                  "Columnar storage",
                  "Linear scalability",
                  "Fault tolerance"
                ]
              };
              
              // Set the fallback product to show an error page instead of redirecting
              setSelectedProductId(fallbackProduct.id);
              mcpData.push(fallbackProduct); // Add to mcpData so it can be found
              setCurrentView('detail');
              
              console.log(`Created detailed fallback for ClickHouse`);
            } else {
              // For other servers, create a generic fallback
              console.warn(`Server product with ID ${productIdStr} not found, creating fallback`);
              
              // Create a fallback product for servers we can't find
              const fallbackProduct = {
                id: productIdStr,
                name: productIdStr.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                description: `Information about this MCP server is currently unavailable.`,
                type: 'server',
                category: 'MCP Servers',
                error: true, // Mark this as an error case
                local_image_path: '/assets/news-images/fallback.jpg',
              };
              
              // Set the fallback product to show an error page instead of redirecting
              setSelectedProductId(fallbackProduct.id);
              mcpData.push(fallbackProduct); // Add to mcpData so it can be found
              setCurrentView('detail');
              
              console.log(`Created fallback product for server: ${fallbackProduct.name}`);
            }
          }
        }
      } 
      // Categories page - both paths work and use the new component
      else if (path === '/browse-categories') {
        setCurrentView('categories-new');
        setSelectedProductId(null);
        setCurrentCategory(null);
      } 
      // What is MCP page 
      else if (path === '/what-is-an-mcp-server') {
        setCurrentView('what-is-mcp');
        setSelectedProductId(null);
        setCurrentCategory(null);
      } 
      // Connect to Claude page
      else if (path === '/connect-to-claude') {
        setCurrentView('connect-claude');
        setSelectedProductId(null);
        setCurrentCategory(null);
      } 
      // Login page
      else if (path === '/login') {
        setCurrentView('login');
        setSelectedProductId(null);
        setCurrentCategory(null);
      }
      // Register page
      else if (path === '/register') {
        setCurrentView('register');
        setSelectedProductId(null);
        setCurrentCategory(null);
      }
      // Profile page
      else if (path === '/profile') {
        setCurrentView('profile');
        setSelectedProductId(null);
        setCurrentCategory(null);
      }
      // Submit page
      else if (path === '/submit') {
        setCurrentView('submit');
        setSelectedProductId(null);
        setCurrentCategory(null);
      } 
      // Secure Admin page
      else if (path === '/secure-admin') {
        setCurrentView('secure-admin');
        setSelectedProductId(null);
        setCurrentCategory(null);
      } 
      // Compare page
      else if (path === '/compare') {
        setCurrentView('compare');
        setSelectedProductId(null);
        setCurrentCategory(null);
      }
      // Ready to Use page for affiliate products
      else if (path === '/ready-to-use') {
        setCurrentView('ready-to-use');
        setSelectedProductId(null);
        setCurrentCategory(null);
      }
      // About Us page
      else if (path === '/about-us') {
        setCurrentView('about-us');
        setSelectedProductId(null);
        setCurrentCategory(null);
      }
      // Dynamic products page
      else if (path === '/products') {
        setCurrentView('products');
        setSelectedProductId(null);
        setCurrentCategory(null);
      }
      // Legacy products page - keep for backward compatibility
      else if (path === '/products-original') {
        setCurrentView('products-original');
        setSelectedProductId(null);
        setCurrentCategory(null);
      }
      // Product detail page (new version)
      else if (path.startsWith('/products/')) {
        const productId = path.substring('/products/'.length);
        setCurrentView('product-detail');
        setSelectedProductId(productId);
        setCurrentCategory(null);
      }
      // Product management page
      else if (path === '/product-management') {
        setCurrentView('product-management');
        setSelectedProductId(null);
        setCurrentCategory(null);
      }
      // Unified search page
      else if (path === '/search') {
        setCurrentView('search');
        setSelectedProductId(null);
        
        // If search includes category, set it from search params
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setCurrentCategory(categoryParam);
        } else {
          setCurrentCategory(null);
        }
        
        // Use the already loaded data
        try {
          if (initialDataRef.current.length === 0) {
            console.log("Warning: initialDataRef is empty, loading data again for search page");
            // Try to load data again
            getInitialData().then(data => {
              initialDataRef.current = data;
              setMcpData(data);
            });
          } else {
            console.log(`Search page: Using ${initialDataRef.current.length} items from initialDataRef`);
          }
        } catch (err) {
          console.error("Error refreshing MCP data for search page:", err);
        }
      } 
      // Home page
      else if (path === '/' || path === '') {
        setCurrentView('home');
        setSelectedProductId(null);
        setCurrentCategory(null);
        
        // Use the already loaded data for the home page
        try {
          if (initialDataRef.current.length === 0) {
            console.log("Warning: initialDataRef is empty, loading data again for home page");
            // Try to load data again
            getInitialData().then(data => {
              initialDataRef.current = data;
              setMcpData(data);
            });
          } else {
            console.log(`Home page: Using ${initialDataRef.current.length} items from initialDataRef`);
          }
        } catch (err) {
          console.error("Error refreshing MCP data for home page:", err);
        }
      }
      // Any other URL - redirect to home
      else {
        console.warn(`Unknown route: ${path}, redirecting to home page`);
        // First set the view to 'home' to prevent flashing search/list page
        setCurrentView('home');
        setSelectedProductId(null);
        setCurrentCategory(null);
        // Then update the URL
        window.location.href = '/';
      }
    };

    // Set up the event listener for navigation
    window.addEventListener('popstate', handleRouteChange);
    
    // Initial processing of the URL
    handleRouteChange();
    
    // We're removing the initial scroll to top to prevent scrolling issues

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []); // Don't add mcpData as a dependency to prevent cyclic updates
  */

  const navigateToDetail = (productId) => {
    // Store a flag in sessionStorage indicating we're navigating programmatically
    sessionStorage.setItem('programmatic_navigation', 'true');
    
    // Use proper URL paths with path-based routing
    window.location.href = `/products/${productId}`;
    
    // Don't reload even if we're on the same product to avoid refresh loops
    // Just let the component handle updating the view
    const currentProduct = selectedProductId;
    if (String(currentProduct) === String(productId)) {
      console.log("Already on this product, no need to reload");
    }
    
    // We'll let the component handle scrolling once it mounts
  };

  const navigateToList = (type = null, categorySlug = null) => {
    // Debug: Log what's happening as we navigate to list
    console.log(`navigateToList called with type: "${type}", categorySlug: "${categorySlug}"`);
    
    // Handle case when the first parameter is actually the categorySlug (backward compatibility)
    if (type && typeof type === 'string' && !categorySlug && type !== 'server' && type !== 'client' && type !== 'all') {
      console.log("Type parameter appears to be a category, moving it to categorySlug");
      categorySlug = type;
      type = null;
    }
    
    // Handle case when an object is passed instead of a string
    if (categorySlug && typeof categorySlug === 'object') {
      console.log("Object passed to navigateToList - ignoring category parameter");
      categorySlug = null;
    }
    
    // Use the data from our ref instead of repeatedly calling getInitialData
    // This ensures we always show the complete set of MCP servers (combined from both sources)
    const allData = initialDataRef.current;
    console.log(`Setting mcpData with ${allData.length} MCP servers from initial data ref`);
    setMcpData(allData);
    
    // Store a flag in sessionStorage indicating we're navigating programmatically
    sessionStorage.setItem('programmatic_navigation', 'true');
    
    // Create new params object directly
    const newParams = new URLSearchParams();
    
    // Always start at page 1 for a new list view
    newParams.set('page', '1');
    
    // Add type parameter if provided
    if (type && typeof type === 'string') {
      newParams.set('type', type);
    }
    
    // Add category if provided and is a valid string
    if (categorySlug && typeof categorySlug === 'string') {
      newParams.set('category', categorySlug);
    }
    
    // Always add sorting by popularity
    newParams.set('sort', 'popularity');
    
    // Build the new URL - using path-based routing for products
    const paramString = newParams.toString();
    const baseUrl = '/products';
    const newUrl = paramString ? `${baseUrl}?${paramString}` : baseUrl;
    
    console.log(`Navigating to: ${newUrl}`);
    
    // Navigate to the appropriate URL using href instead of hash
    window.location.href = newUrl;
    
    // Force view update to ensure it's showing the list
    setCurrentView('search');
    setSelectedProductId(null);
    setCurrentCategory(categorySlug);
  };
  
  const navigateToCategories = () => {
    window.location.href = '/browse-categories';
  };
  
  const navigateToNewCategories = () => {
    console.log("Navigating to categories page");
    window.location.href = '/browse-categories';
  };

  const navigateToWhatIsMcp = () => {
    window.location.href = '/about-us';
  };

  const navigateToConnectToClaude = () => {
    window.location.href = '/connect-to-claude';
  };

  const navigateToSubmit = () => {
    window.location.href = '/submit';
  };
  
  
  const navigateToSecureAdmin = () => {
    window.location.href = '/secure-admin';
  };
  
  const navigateToCompare = () => {
    window.location.href = '/compare';
  };
  
  
  const navigateToReadyToUse = () => {
    window.location.href = '/ready-to-use';
  }
  
  const navigateToAboutUs = () => {
    window.location.href = '/about-us';
  };
  
  const navigateToProducts = () => {
    window.location.href = '/products';
  };
  
  const navigateToOriginalProducts = () => {
    window.location.href = '/products-original';
  };
  
  const navigateToProductDetail = (productId) => {
    window.location.href = `/products/${productId}`;
  };
  
  const navigateToProductManagement = () => {
    window.location.href = '/product-management';
  };


  // Debug: Track URL and state changes
  useEffect(() => {
    console.log('🟠 App state changed - currentView:', currentView, 'URL:', window.location.href);
  }, [currentView]);

  useEffect(() => {
    const logNavigation = () => {
      console.log('🔵 Navigation event - URL:', window.location.href);
    };
    
    window.addEventListener('popstate', logNavigation);
    window.addEventListener('pushstate', logNavigation);
    
    return () => {
      window.removeEventListener('popstate', logNavigation);
      window.removeEventListener('pushstate', logNavigation);
    };
  }, []);

  // OLD VIEW SYSTEM DISABLED - Now using Router exclusively
  /*
  let viewComponent;
  
  // Home view
  // if (currentView === 'home') {
  //   viewComponent = <HomePage 
  //     featuredProducts={featuredProducts} // Use memoized featured products
  //     onNavigateToList={navigateToList} // This now supports (type, category) arguments
  //     onNavigateToDetail={navigateToDetail}
  //     onNavigateToCategories={navigateToCategories}
  //     onNavigateToConnectToClaude={navigateToConnectToClaude}
  //     onNavigateToWhatIsMcp={navigateToWhatIsMcp}
  //   />;
  // }
  // Product list view
  // else if (currentView === 'list') {
  //   viewComponent = <ProductListPage 
  //     key="product-list-page" // Added stable key to maintain component instance
  //     allProductsData={mcpData} 
  //     onNavigateToDetail={navigateToDetail} 
  //     currentCategoryFilter={currentCategory} 
  //   />;
  // } 
  // Product detail view
  else if (currentView === 'detail') {
    if (selectedProductId) {
      // First try to find product in mcpData by exact ID match
      let product = mcpData.find(p => 
        p.id === selectedProductId || 
        String(p.id) === String(selectedProductId)
      );
      
      // If not found by ID, try match by name (for new MCP servers)
      if (!product) {
        product = mcpData.find(p => 
          p.name && p.name.toLowerCase() === String(selectedProductId).toLowerCase()
        );
      }
      
      // For new MCP servers that might use the name as identifier
      if (!product) {
        // Check if selectedProductId matches a normalized name (lowercase with hyphens)
        product = mcpData.find(p => 
          p.name && p.name.toLowerCase().replace(/\s+/g, '-') === selectedProductId
        );
      }
      
      // If still not found, try in allProductsData (original source)
      if (!product) {
        product = Object.values(allProductsData).find(p => 
          p.id === selectedProductId || 
          String(p.id) === String(selectedProductId) ||
          (p.name && p.name.toLowerCase() === String(selectedProductId).toLowerCase()) ||
          (p.name && p.name.toLowerCase().replace(/\s+/g, '-') === selectedProductId)
        );
      }
      
      // If we found the product in either source
      if (product) {
        // Use the new ProductDetailTech component instead of ProductDetailPage
        viewComponent = <ProductDetailTech />;
      } else {
        // Product not found case
        console.error(`Product with ID ${selectedProductId} not found in any data source`);
        viewComponent = (
          <div className="text-center py-10">
            <h2 className="text-2xl text-red-500">Product not found</h2>
            <p className="text-gray-400 mb-4">The MCP server you're looking for could not be found.</p>
            <button 
              onClick={() => navigateToList()} 
              className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-300"
            >
              Back to All MCP Servers
            </button>
          </div>
        );
      }
    } else {
      // No product ID case
      viewComponent = (
        <div className="text-center py-10">
          <h2 className="text-2xl text-red-500">No product selected</h2>
          <button 
            onClick={() => navigateToList()} 
            className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-300"
          >
            Browse All MCP Servers
          </button>
        </div>
      );
    }
  } 
  // Categories view (using new enhanced component)
  else if (currentView === 'categories-new') {
    viewComponent = <NewCategoriesPage onNavigateToCategorySearch={navigateToList} />;
  } 
  // What is MCP view
  else if (currentView === 'what-is-mcp') {
    viewComponent = <WhatIsAnMcpServerPage />;
  } 
  // Connect to Claude view
  else if (currentView === 'connect-claude') {
    viewComponent = <ConnectToClaudePage />;
  } 
  // Login view
  else if (currentView === 'login') {
    viewComponent = <LoginPage />;
  }
  // Register view
  else if (currentView === 'register') {
    viewComponent = <RegisterPage />;
  }
  // Profile view
  else if (currentView === 'profile') {
    viewComponent = <ProfilePage />;
  }
  // Submit view
  else if (currentView === 'submit') {
    viewComponent = <SubmitServerPage />;
  } 
  // Secure Admin view
  else if (currentView === 'secure-admin') {
    viewComponent = <SecureAdminPage />;
  } 
  // Compare view (redirects to product list instead as CompareServersPage is removed)
  else if (currentView === 'compare') {
    viewComponent = <ProductListPage 
      products={mcpData} 
      onNavigateToDetail={navigateToDetail} 
      currentCategory={currentCategory}
    />;
  }
  // Test pagination view removed
  // Ready to Use view
  else if (currentView === 'ready-to-use') {
    viewComponent = <ReadyToUsePage />;
  }
  // About Us view
  else if (currentView === 'about-us') {
    viewComponent = <AboutUsPage onNavigateToCategories={navigateToCategories} />;
  }
  // Dynamic products view
  else if (currentView === 'products') {
    viewComponent = <PremiumProductsPage />;
  }
  // Legacy products view (for backward compatibility)
  else if (currentView === 'products-original') {
    viewComponent = <OriginalProductsPage />;
  }
  // Product detail view (new version)
  else if (currentView === 'product-detail') {
    viewComponent = <ProductDetailTech />;
  }
  // Product management view
  else if (currentView === 'product-management') {
    viewComponent = <TechHubProductManagementDemo />;
  }
  // Search results view
  else if (currentView === 'search') {
    viewComponent = (
      <SearchResultsLayout>
        <SearchResultsPage />
      </SearchResultsLayout>
    );
  }
  // Default/error case
  else {
    viewComponent = (
      <div className="text-center py-10">
        <h2 className="text-2xl text-red-500">Page not found</h2>
        <p className="text-gray-400 mb-4">The page you're looking for doesn't exist or has been moved.</p>
        <button 
          onClick={() => navigateToList()} 
          className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-300"
        >
          Back to Home
        </button>
      </div>
    );
  }
  */

  // Back to top button functionality
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // TEMPORARILY DISABLED: Testing if scroll handler causes re-mounting
  /*
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 300) {
            setShowBackToTop(true);
          } else {
            setShowBackToTop(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  */
  
  // Only scroll once on button click, don't set up continuous scrolling
  const scrollToTop = () => {
    // Use a simple once-only scroll action
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Inner component that uses the language context
  const AppContent = () => {
    const { currentLanguage } = useLanguage();
    
    return (
      <div className="bg-zinc-900 min-h-screen flex flex-col text-gray-200 overflow-x-hidden">
        {appIsInitialized && (
          <>
            {currentView !== 'search' && (
              <>
                <DataStatusAlert />
                <Header 
                onNavigateHome={() => {
                  console.log("Navigating to home");
                  // Fix for navigation: when on a direct URL path, we need to go to the base URL first
                  if (window.location.pathname.includes('/products/')) {
                    // We're on a direct URL path, need to navigate to base URL
                    window.location.href = window.location.origin;
                  } else {
                    // We're already on a hash-based URL, just change the hash
                    window.location.hash = '#/';
                    setCurrentView('home');
                    setSelectedProductId(null);
                    setCurrentCategory(null);
                  }
                }} 
                onNavigateCategories={navigateToCategories}
                onNavigateNewCategories={navigateToNewCategories}
                onNavigateWhatIsMcp={navigateToWhatIsMcp} 
                onNavigateConnectToClaude={navigateToConnectToClaude}
                onNavigateSubmit={navigateToSubmit}
                onNavigateCompare={navigateToCompare}
                onNavigateReadyToUse={navigateToReadyToUse}
                onNavigateProducts={navigateToProducts}
                onNavigateOriginalProducts={navigateToOriginalProducts}
                onNavigateProductManagement={navigateToProductManagement}
                searchComponent={<GlobalSearchBar />}
              />
              </>
            )}
          <main className="flex-grow relative overflow-hidden">
            <div className="page-container">
              <Routes>
                {/* All routes now use path-based routing with language support */}
                {/* Root routes */}
                <Route path="/" element={
                  <AnimatePresence 
                    show={true} 
                    animation={getPageTransitionAnimation('home')}
                    duration={500}
                  >
                    <HomePage 
                      featuredProducts={featuredProducts}
                      onNavigateToList={navigateToList}
                      onNavigateToDetail={navigateToDetail}
                      onNavigateToCategories={navigateToCategories}
                      onNavigateToConnectToClaude={navigateToConnectToClaude}
                      onNavigateToWhatIsMcp={navigateToWhatIsMcp}
                    />
                  </AnimatePresence>
                } />
                
                {/* Language-specific routes */}
                <Route path="/:lang/products/:id" element={<ProductDetailTech />} />
                <Route path="/:lang/products" element={<OriginalProductsPage />} />
                <Route path="/:lang/products-original" element={<PremiumProductsPage />} />
                <Route path="/:lang/product-management" element={<TechHubProductManagementDemo />} />
                <Route path="/:lang/browse-categories" element={<NewCategoriesPage onNavigateToCategorySearch={navigateToList} />} />
                <Route path="/:lang/what-is-an-mcp-server" element={<WhatIsAnMcpServerPage />} />
                <Route path="/:lang/connect-to-claude" element={<ConnectToClaudePage />} />
                <Route path="/:lang/submit" element={<SubmitServerPage />} />
                <Route path="/:lang/secure-admin" element={<SecureAdminPage />} />
                <Route path="/:lang/compare" element={<ProductListPage products={mcpData} onNavigateToDetail={navigateToDetail} currentCategory={currentCategory} />} />
                <Route path="/:lang/ready-to-use" element={<ReadyToUsePage />} />
                <Route path="/:lang/about-us" element={<AboutUsPage onNavigateToCategories={navigateToCategories} />} />
                <Route path="/:lang/login" element={<LoginPage />} />
                <Route path="/:lang/register" element={<RegisterPage />} />
                <Route path="/:lang/profile" element={<ProfilePage />} />
                <Route path="/:lang/search" element={
                  <SearchResultsLayout>
                    <SearchResultsPage />
                  </SearchResultsLayout>
                } />
                <Route path="/:lang/agents" element={<AgentRunner />} />
                <Route path="/:lang/agents/keys" element={<ApiKeyManager />} />
                {/* News and Courses routes */}
                <Route path="/:lang/news" element={<NewsPage />} />
                <Route path="/:lang/news/:slug" element={<NewsArticlePage />} />
                <Route path="/:lang/news/category/:category" element={<NewsCategoryPage />} />
                <Route path="/:lang/courses" element={<CoursesPage />} />
                <Route path="/:lang/courses/:slug" element={<CoursePage />} />
                <Route path="/:lang/courses/category/:category" element={<CourseCategoryPage />} />
                <Route path="/:lang" element={
                  <AnimatePresence 
                    show={true} 
                    animation={getPageTransitionAnimation('home')}
                    duration={500}
                  >
                    <HomePage 
                      featuredProducts={featuredProducts}
                      onNavigateToList={navigateToList}
                      onNavigateToDetail={navigateToDetail}
                      onNavigateToCategories={navigateToCategories}
                      onNavigateToConnectToClaude={navigateToConnectToClaude}
                      onNavigateToWhatIsMcp={navigateToWhatIsMcp}
                    />
                  </AnimatePresence>
                } />
                
                {/* Legacy routes without language prefix (will redirect) */}
                <Route path="/products/:id" element={<ProductDetailTech />} />
                <Route path="/products" element={<OriginalProductsPage />} />
                <Route path="/products-original" element={<PremiumProductsPage />} />
                <Route path="/product-management" element={<TechHubProductManagementDemo />} />
                <Route path="/browse-categories" element={<NewCategoriesPage onNavigateToCategorySearch={navigateToList} />} />
                <Route path="/what-is-an-mcp-server" element={<WhatIsAnMcpServerPage />} />
                <Route path="/connect-to-claude" element={<ConnectToClaudePage />} />
                <Route path="/submit" element={<SubmitServerPage />} />
                <Route path="/secure-admin" element={<SecureAdminPage />} />
                <Route path="/compare" element={<ProductListPage products={mcpData} onNavigateToDetail={navigateToDetail} currentCategory={currentCategory} />} />
                <Route path="/ready-to-use" element={<ReadyToUsePage />} />
                <Route path="/about-us" element={<AboutUsPage onNavigateToCategories={navigateToCategories} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/search" element={
                  <SearchResultsLayout>
                    <SearchResultsPage />
                  </SearchResultsLayout>
                } />
                <Route path="/agents" element={<AgentRunner />} />
                <Route path="/agents/keys" element={<ApiKeyManager />} />
                {/* News and Courses legacy routes */}
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<NewsArticlePage />} />
                <Route path="/news/category/:category" element={<NewsCategoryPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:slug" element={<CoursePage />} />
                <Route path="/courses/category/:category" element={<CourseCategoryPage />} />
                
                {/* Fallback route for unknown paths */}
                <Route path="*" element={
                  <AnimatePresence 
                    show={true} 
                    animation={getPageTransitionAnimation('home')}
                    duration={500}
                  >
                    <div className="text-center py-10">
                      <h2 className="text-2xl text-red-500">Page not found</h2>
                      <p className="text-gray-400 mb-4">The page you're looking for doesn't exist or has been moved.</p>
                      <button 
                        onClick={() => window.location.href = '/'} 
                        className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-300"
                      >
                        Back to Home
                      </button>
                    </div>
                  </AnimatePresence>
                } />
              </Routes>
            </div>
          </main>
          <Footer />
        </>
      )}
      
      {/* Back to top button - only show when app is initialized and back-to-top is triggered */}
      {appIsInitialized && (
        <div 
          className={`fixed right-6 bottom-6 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600/90 to-indigo-600/90 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-700/20 cursor-pointer transition-all duration-300 z-40 hover:scale-110 ${
            showBackToTop 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
          onClick={scrollToTop}
          title="Back to top"
        >
        <span className="absolute inset-0 rounded-full bg-white/10 scale-0 hover:scale-100 transition-transform duration-300"></span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 relative z-10" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </div>
      )}
        </div>
    );
  };

  return (
    <Router>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </Router>
  );
}

export default App;