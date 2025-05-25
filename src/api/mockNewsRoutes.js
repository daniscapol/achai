import express from 'express';

const router = express.Router();

// Mock data
const mockNewsCategories = [
  { id: 1, name: 'Technical Articles', slug: 'technical-articles', description: 'In-depth technical content', article_count: 4 },
  { id: 2, name: 'Product Updates', slug: 'product-updates', description: 'Latest product releases', article_count: 2 },
  { id: 3, name: 'Industry News', slug: 'industry-news', description: 'AI and MCP ecosystem news', article_count: 3 },
  { id: 4, name: 'Company News', slug: 'company-news', description: 'Company updates', article_count: 1 }
];

const mockArticles = [
  {
    id: 1,
    title: 'Introduction to Model Context Protocol (MCP)',
    slug: 'introduction-to-model-context-protocol-mcp',
    content: 'The Model Context Protocol (MCP) is revolutionizing how AI models interact with external systems. This comprehensive guide explores the fundamentals of MCP and its implementation strategies. Learn how to integrate MCP into your AI applications and unlock new possibilities for AI-powered automation. The protocol provides a standardized way for AI models to access external data sources, tools, and services, enabling more sophisticated and context-aware AI applications.',
    excerpt: 'Learn the basics of Model Context Protocol and how it\'s changing AI development.',
    featured_image: '/assets/news-images/mcp-intro.jpg',
    author_name: 'Dr. Sarah Chen',
    author_avatar: '/assets/avatars/sarah-chen.jpg',
    category_name: 'Technical Articles',
    category_slug: 'technical-articles',
    status: 'published',
    published_at: '2025-01-20T10:00:00Z',
    view_count: 1250,
    created_at: '2025-01-20T09:00:00Z',
    updated_at: '2025-01-20T10:00:00Z'
  },
  {
    id: 2,
    title: 'Building Your First AI Agent with MCP',
    slug: 'building-your-first-ai-agent-with-mcp',
    content: 'Step-by-step tutorial on creating powerful AI agents using the Model Context Protocol. We\'ll cover setup, configuration, and best practices for agent development. This hands-on guide will take you from zero to having a working AI agent that can interact with external systems through MCP. You\'ll learn about agent architecture, communication patterns, and error handling.',
    excerpt: 'A practical guide to creating AI agents using MCP technology.',
    featured_image: '/assets/news-images/ai-agent-building.jpg',
    author_name: 'Prof. Michael Rodriguez',
    author_avatar: '/assets/avatars/michael-rodriguez.jpg',
    category_name: 'Technical Articles',
    category_slug: 'technical-articles',
    status: 'published',
    published_at: '2025-01-19T14:30:00Z',
    view_count: 980,
    created_at: '2025-01-19T13:30:00Z',
    updated_at: '2025-01-19T14:30:00Z'
  },
  {
    id: 3,
    title: 'MCP Server Development Best Practices',
    slug: 'mcp-server-development-best-practices',
    content: 'Essential best practices for developing robust MCP servers. Learn about security, performance optimization, and scalability considerations when building production-ready MCP implementations. This guide covers authentication patterns, rate limiting, error handling, and monitoring strategies for MCP servers.',
    excerpt: 'Essential tips for building production-ready MCP servers.',
    featured_image: '/assets/news-images/mcp-servers.jpg',
    author_name: 'Dr. Sarah Chen',
    author_avatar: '/assets/avatars/sarah-chen.jpg',
    category_name: 'Technical Articles',
    category_slug: 'technical-articles',
    status: 'published',
    published_at: '2025-01-18T11:15:00Z',
    view_count: 742,
    created_at: '2025-01-18T10:15:00Z',
    updated_at: '2025-01-18T11:15:00Z'
  },
  {
    id: 4,
    title: 'achAI Platform Updates - January 2025',
    slug: 'achai-platform-updates-january-2025',
    content: 'Exciting new features and improvements coming to the achAI platform this month. We\'ve added enhanced search capabilities, improved user interface, and expanded our MCP server collection with over 100 new integrations. The platform now supports advanced filtering, real-time updates, and improved performance.',
    excerpt: 'Latest updates and improvements to the achAI platform.',
    featured_image: '/assets/news-images/platform-updates.jpg',
    author_name: 'Admin',
    author_avatar: '/assets/avatars/admin.jpg',
    category_name: 'Product Updates',
    category_slug: 'product-updates',
    status: 'published',
    published_at: '2025-01-17T16:00:00Z',
    view_count: 1580,
    created_at: '2025-01-17T15:00:00Z',
    updated_at: '2025-01-17T16:00:00Z'
  },
  {
    id: 5,
    title: 'The Future of AI Integration with MCP',
    slug: 'future-of-ai-integration-with-mcp',
    content: 'Exploring the future possibilities of AI integration through the Model Context Protocol. This article discusses emerging trends, upcoming features, and the roadmap for MCP development. Learn about the vision for seamless AI-to-system integration and how MCP is shaping the future of AI applications.',
    excerpt: 'Discover what\'s next for AI integration and MCP technology.',
    featured_image: '/assets/news-images/future-ai.jpg',
    author_name: 'Dr. Lisa Thompson',
    author_avatar: '/assets/avatars/lisa-thompson.jpg',
    category_name: 'Industry News',
    category_slug: 'industry-news',
    status: 'published',
    published_at: '2025-01-16T13:45:00Z',
    view_count: 892,
    created_at: '2025-01-16T12:45:00Z',
    updated_at: '2025-01-16T13:45:00Z'
  }
];

// GET /api/news - Get all articles with pagination, search, filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, popular, slug } = req.query;
    
    // Get single article by slug
    if (slug) {
      const article = mockArticles.find(a => a.slug === slug);
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      return res.status(200).json({ article });
    }
    
    // Get popular articles
    if (popular) {
      const sortedArticles = [...mockArticles].sort((a, b) => b.view_count - a.view_count);
      const popularArticles = sortedArticles.slice(0, parseInt(limit));
      return res.status(200).json({ articles: popularArticles });
    }
    
    let filteredArticles = [...mockArticles];
    
    // Search articles
    if (search) {
      const searchLower = search.toLowerCase();
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.excerpt.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (category) {
      filteredArticles = filteredArticles.filter(article =>
        article.category_slug === category || article.category_id === parseInt(category)
      );
    }
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(filteredArticles.length / parseInt(limit));
    
    return res.status(200).json({
      success: true,
      data: paginatedArticles,
      pagination: {
        total: filteredArticles.length,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('News API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/news/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    return res.status(200).json({ 
      success: true,
      data: mockNewsCategories 
    });
  } catch (error) {
    console.error('News Categories API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;