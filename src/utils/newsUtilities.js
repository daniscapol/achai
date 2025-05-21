/**
 * News Utilities
 * Helper functions for news articles validation and management
 */

// Check if a URL is valid and use HTTPS
export const validateUrl = (url) => {
  if (!url) return null;
  
  try {
    const newUrl = new URL(url);
    // Force HTTPS for security
    if (newUrl.protocol === 'http:') {
      newUrl.protocol = 'https:';
    }
    return newUrl.toString();
  } catch (e) {
    // If it's not a valid URL, check if it's a path
    if (url.startsWith('/')) {
      return url;
    }
    console.warn("Invalid URL:", url);
    return null;
  }
};

// Provide a fallback URL when none is available
export const getFallbackUrl = (category) => {
  const fallbacks = {
    'Model Releases': '/assets/news-images/claude3.jpg',
    'Research Papers': '/assets/news-images/anthropic.jpg',
    'Business': '/assets/news-images/anthropic.jpg',
    'Ethics & Safety': '/assets/news-images/anthropic.jpg',
    'Applications': '/assets/news-images/fallback.jpg',
    'Generative AI': '/assets/news-images/sora.jpg',
    'Open Source': '/assets/news-images/llama3.jpg',
    'Developer Tools': '/assets/news-images/fallback.jpg'
  };
  
  return fallbacks[category] || '/assets/news-images/fallback.jpg';
};

// Validate and fix an article's fields
export const validateArticle = (article) => {
  if (!article) return null;
  
  // Deep clone to avoid modifying the original
  const validatedArticle = JSON.parse(JSON.stringify(article));
  
  // Add an ID if missing
  if (!validatedArticle.id) {
    validatedArticle.id = `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Add missing title
  if (!validatedArticle.title) {
    validatedArticle.title = "Untitled Article";
  }
  
  // Ensure summary exists
  if (!validatedArticle.summary) {
    // Extract from content if available
    if (validatedArticle.content) {
      // Remove markdown headers and get first paragraph
      const content = validatedArticle.content
        .replace(/^#+ .+$/gm, '')
        .trim();
      const firstParagraph = content.split('\n\n')[0].trim();
      validatedArticle.summary = firstParagraph.substring(0, 150) + 
        (firstParagraph.length > 150 ? '...' : '');
    } else {
      validatedArticle.summary = "No summary available for this article.";
    }
  }
  
  // Truncate too long summaries
  if (validatedArticle.summary && validatedArticle.summary.length > 250) {
    validatedArticle.summary = validatedArticle.summary.substring(0, 250) + '...';
  }
  
  // Validate image URL
  if (validatedArticle.image_url) {
    validatedArticle.image_url = validateUrl(validatedArticle.image_url);
  }
  
  // Add fallback image if missing
  if (!validatedArticle.image_url && !validatedArticle.image_path) {
    // Use a default fallback image based on category
    validatedArticle.image_path = getFallbackUrl(validatedArticle.category);
  }
  
  // Ensure date exists and is valid
  if (!validatedArticle.date) {
    validatedArticle.date = new Date().toISOString().slice(0, 10);
  } else {
    try {
      // Check if date is valid
      new Date(validatedArticle.date).toISOString();
    } catch (e) {
      validatedArticle.date = new Date().toISOString().slice(0, 10);
    }
  }
  
  // Ensure category exists
  if (!validatedArticle.category) {
    validatedArticle.category = "AI News";
  }
  
  // Ensure tags exists
  if (!validatedArticle.tags || !Array.isArray(validatedArticle.tags)) {
    validatedArticle.tags = [validatedArticle.category.toLowerCase()];
  }
  
  // Ensure author exists
  if (!validatedArticle.author) {
    validatedArticle.author = "AI News Team";
  }
  
  // Ensure source exists
  if (!validatedArticle.source) {
    validatedArticle.source = "Internal";
  }
  
  return validatedArticle;
};

// Generate example articles when no source is available
export const getExampleArticles = () => {
  return [
    {
      id: "news-1",
      title: "Claude 3 Released with Enhanced MCP Support",
      summary: "Anthropic announces Claude 3 with improved Model Context Protocol capabilities, featuring better integration with external tools and more efficient processing of diverse data types.",
      content: "# Claude 3 Released with Enhanced MCP Support\n\nAnthropic has announced Claude 3, featuring major improvements to MCP support. The new model allows for more seamless interaction with tools and better contextual understanding when working with various data sources.\n\nKey improvements include:\n\n- Enhanced reasoning capabilities when working with multiple tools\n- Better recognition of data formats\n- Reduced hallucination when processing complex inputs\n- Improved recall of information from lengthy contexts\n\nThe update represents a significant step forward for Claude's ability to interact with the growing ecosystem of MCP servers.",
      image_path: "/assets/news-images/claude3.jpg",
      author: "Anthropic Team",
      date: "2024-03-04",
      category: "Model Releases",
      source: "Anthropic",
      tags: ["claude", "announcement", "release", "mcp"]
    },
    {
      id: "news-2",
      title: "New MCP Servers Available in Marketplace",
      summary: "Several new MCP servers have been added to the marketplace, expanding the range of tools available for AI assistants to use.",
      content: "# New MCP Servers Available\n\nThe MCP ecosystem continues to grow with several new servers added this month. These include specialized tools for database access, API integration, and more advanced computer vision capabilities.\n\nNew additions include:\n\n- **PostgreSQL Server**: Direct database querying and management\n- **GitHub Integration**: Repository management and issue tracking\n- **Image Analysis**: Advanced computer vision for detailed image understanding\n- **PDF Processing**: Extract and manipulate content from PDF documents\n\nThese new servers expand the capabilities available to Claude and other AI assistants, enabling more complex workflows and reducing the need for human intervention in many tasks.",
      image_path: "/assets/news-images/anthropic.jpg",
      author: "MCP Team",
      date: "2024-04-15",
      category: "Developer Tools",
      source: "MCP Marketplace",
      tags: ["marketplace", "servers", "updates", "tools"]
    },
    {
      id: "news-3",
      title: "Building Custom MCP Servers: Best Practices",
      summary: "Learn how to create effective custom MCP servers that follow best practices for security, performance, and usability.",
      content: "# Building Custom MCP Servers: Best Practices\n\nAs the MCP ecosystem grows, more developers are creating custom servers to extend the capabilities of AI assistants. This article explores best practices for building reliable, secure, and efficient MCP servers.\n\n## Security Considerations\n\nWhen building MCP servers, security should be a top priority. Always validate inputs, use proper authentication, and avoid exposing sensitive information.\n\n## Performance Optimization\n\nOptimizing your server's performance is crucial for a good user experience. Implement caching strategies, use efficient data structures, and consider scalability from the start.\n\n## User Experience\n\nA well-designed MCP server should have clear documentation, intuitive interfaces, and helpful error messages. Consider how your server will be used in real-world scenarios and design accordingly.",
      image_path: "/assets/news-images/fallback.jpg",
      author: "Developer Relations",
      date: "2024-05-01",
      category: "Developer Tools",
      source: "MCP Documentation",
      tags: ["development", "best practices", "security", "tutorials"]
    }
  ];
};

export default {
  validateUrl,
  validateArticle,
  getExampleArticles,
  getFallbackUrl
};