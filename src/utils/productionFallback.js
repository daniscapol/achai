// Production fallback data for when news/courses APIs are not available
export const fallbackNewsData = {
  success: true,
  data: [
    {
      id: 1,
      title: "MCP Server Development Best Practices",
      slug: "mcp-server-development-best-practices", 
      content: "Essential best practices for developing robust MCP servers. Learn about security, performance optimization, and scalability considerations...",
      excerpt: "Essential tips for building production-ready MCP servers.",
      author: "Development Team",
      category: "Technical Articles",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_count: 150
    },
    {
      id: 2,
      title: "Building Your First AI Agent with MCP",
      slug: "building-your-first-ai-agent-with-mcp",
      content: "Step-by-step tutorial on creating powerful AI agents using the Model Context Protocol. We'll cover setup, configuration, and best practices...",
      excerpt: "A practical guide to creating AI agents using MCP technology.",
      author: "ACHAI Team", 
      category: "Technical Articles",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_count: 120
    },
    {
      id: 3,
      title: "Introduction to Model Context Protocol",
      slug: "introduction-to-model-context-protocol",
      content: "The Model Context Protocol (MCP) is revolutionizing how AI models interact with external systems...",
      excerpt: "Learn the basics of Model Context Protocol and how it's changing AI development.",
      author: "ACHAI Team",
      category: "Technical Articles", 
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_count: 95
    }
  ],
  pagination: {
    total: 3,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrev: false
  }
};

export const fallbackNewsCategories = {
  success: true,
  data: [
    { name: "Technical Articles", slug: "technical-articles" },
    { name: "Model Releases", slug: "model-releases" },
    { name: "Generative AI", slug: "generative-ai" }
  ]
};

export const fallbackCoursesData = {
  success: true,
  data: [
    {
      id: 1,
      title: "MCP Fundamentals: Building AI Applications",
      slug: "mcp-fundamentals-building-ai-applications",
      description: "Master the fundamentals of Model Context Protocol and learn to build powerful AI applications.",
      content: "This comprehensive course covers everything you need to know about MCP development...",
      thumbnail: null,
      instructor_name: "Dr. Sarah Chen",
      instructor_bio: "AI Research Scientist with 10+ years of experience",
      price: "99.99",
      currency: "USD",
      duration_hours: "8.50",
      difficulty_level: "beginner",
      status: "published",
      enrollment_count: 245,
      rating: "4.8",
      rating_count: 42,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_name: "MCP Integration",
      category_slug: "mcp-integration"
    },
    {
      id: 2,
      title: "Advanced AI Agent Development",
      slug: "advanced-ai-agent-development", 
      description: "Build sophisticated AI agents using cutting-edge MCP techniques and best practices.",
      content: "Take your AI development skills to the next level with advanced agent architectures...",
      thumbnail: null,
      instructor_name: "Prof. Michael Rodriguez",
      instructor_bio: "Computer Science Professor and AI Consultant",
      price: "149.99",
      currency: "USD",
      duration_hours: "12.00",
      difficulty_level: "advanced",
      status: "published",
      enrollment_count: 128,
      rating: "4.9",
      rating_count: 28,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_name: "Agent Development",
      category_slug: "agent-development"
    }
  ],
  pagination: {
    total: 2,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrev: false
  }
};

export const fallbackCourseCategories = {
  success: true,
  data: [
    { id: 1, name: "MCP Integration", slug: "mcp-integration", description: "Learn Model Context Protocol integration" },
    { id: 2, name: "Agent Development", slug: "agent-development", description: "Build and deploy AI agents" },
    { id: 3, name: "AI Development", slug: "ai-development", description: "General AI and machine learning development" }
  ]
};

// Helper function to check if API is available
export const checkApiAvailability = async (url) => {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Enhanced fetch with fallback
export const fetchWithFallback = async (url, fallbackData) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`API endpoint ${url} returned ${response.status}, using fallback data`);
      return fallbackData;
    }
    return await response.json();
  } catch (error) {
    console.warn(`API endpoint ${url} failed:`, error.message, 'using fallback data');
    return fallbackData;
  }
};