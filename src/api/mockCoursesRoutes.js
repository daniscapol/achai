import express from 'express';

const router = express.Router();

// Mock data
const mockCourseCategories = [
  { id: 1, name: 'AI Development', slug: 'ai-development', description: 'AI and ML development courses', course_count: 3 },
  { id: 2, name: 'MCP Integration', slug: 'mcp-integration', description: 'Model Context Protocol courses', course_count: 2 },
  { id: 3, name: 'Agent Development', slug: 'agent-development', description: 'AI agent building courses', course_count: 1 },
  { id: 4, name: 'Web Development', slug: 'web-development', description: 'Modern web development', course_count: 1 },
  { id: 5, name: 'Data Science', slug: 'data-science', description: 'Data analysis and science', course_count: 1 }
];

const mockCourses = [
  {
    id: 1,
    title: 'MCP Fundamentals: Building AI Applications',
    slug: 'mcp-fundamentals-building-ai-applications',
    description: 'Master the fundamentals of Model Context Protocol and learn to build powerful AI applications.',
    content: 'This comprehensive course covers everything you need to know about MCP development. From basic concepts to advanced implementation patterns, you\'ll learn how to create robust MCP servers and clients. The course includes hands-on projects, real-world examples, and best practices for production deployment.',
    thumbnail: '/assets/course-thumbnails/mcp-fundamentals.jpg',
    instructor_name: 'Dr. Sarah Chen',
    instructor_bio: 'AI Research Scientist with 10+ years of experience in distributed systems and AI integration',
    price: 99.99,
    currency: 'USD',
    duration_hours: 8.5,
    difficulty_level: 'beginner',
    category_id: 2,
    category_name: 'MCP Integration',
    category_slug: 'mcp-integration',
    tags: ['MCP', 'AI', 'API', 'Development'],
    status: 'published',
    enrollment_count: 1250,
    rating: 4.8,
    rating_count: 156,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-20T14:30:00Z'
  },
  {
    id: 2,
    title: 'Introduction to AI and Machine Learning',
    slug: 'introduction-to-ai-and-machine-learning',
    description: 'Perfect starting point for anyone interested in AI and machine learning concepts.',
    content: 'Start your AI journey with this beginner-friendly introduction to core concepts. Learn about neural networks, machine learning algorithms, and practical AI applications. This course provides a solid foundation for understanding how AI works and how to apply it in real-world scenarios.',
    thumbnail: '/assets/course-thumbnails/ai-ml-intro.jpg',
    instructor_name: 'Dr. Lisa Thompson',
    instructor_bio: 'Data Science Lead with expertise in ML education and practical AI applications',
    price: 0.00,
    currency: 'USD',
    duration_hours: 6.0,
    difficulty_level: 'beginner',
    category_id: 1,
    category_name: 'AI Development',
    category_slug: 'ai-development',
    tags: ['AI', 'Machine Learning', 'Beginner', 'Free'],
    status: 'published',
    enrollment_count: 3200,
    rating: 4.6,
    rating_count: 428,
    created_at: '2025-01-12T09:00:00Z',
    updated_at: '2025-01-18T16:20:00Z'
  },
  {
    id: 3,
    title: 'Advanced AI Agent Development',
    slug: 'advanced-ai-agent-development',
    description: 'Build sophisticated AI agents using cutting-edge techniques and best practices.',
    content: 'Take your AI development skills to the next level with advanced agent architectures, multi-modal AI systems, and complex reasoning patterns. This course covers advanced topics like agent communication, coordination, and decision-making in complex environments.',
    thumbnail: '/assets/course-thumbnails/advanced-agents.jpg',
    instructor_name: 'Prof. Michael Rodriguez',
    instructor_bio: 'Computer Science Professor and AI Consultant specializing in autonomous systems',
    price: 149.99,
    currency: 'USD',
    duration_hours: 12.0,
    difficulty_level: 'advanced',
    category_id: 3,
    category_name: 'Agent Development',
    category_slug: 'agent-development',
    tags: ['AI Agents', 'Advanced', 'Autonomous Systems'],
    status: 'published',
    enrollment_count: 580,
    rating: 4.9,
    rating_count: 87,
    created_at: '2025-01-10T11:30:00Z',
    updated_at: '2025-01-19T13:45:00Z'
  },
  {
    id: 4,
    title: 'Data Science with AI Tools',
    slug: 'data-science-with-ai-tools',
    description: 'Learn modern data science techniques enhanced by AI and machine learning tools.',
    content: 'Combine traditional data science with modern AI tools for powerful insights. This course covers data analysis, visualization, statistical modeling, and how to leverage AI to accelerate your data science workflows.',
    thumbnail: '/assets/course-thumbnails/data-science-ai.jpg',
    instructor_name: 'Dr. James Wilson',
    instructor_bio: 'Senior Data Scientist and Analytics Expert with 15+ years in the field',
    price: 79.99,
    currency: 'USD',
    duration_hours: 10.0,
    difficulty_level: 'intermediate',
    category_id: 5,
    category_name: 'Data Science',
    category_slug: 'data-science',
    tags: ['Data Science', 'Analytics', 'Python', 'AI Tools'],
    status: 'published',
    enrollment_count: 920,
    rating: 4.7,
    rating_count: 203,
    created_at: '2025-01-08T14:00:00Z',
    updated_at: '2025-01-17T10:15:00Z'
  },
  {
    id: 5,
    title: 'Modern Web Development with AI Integration',
    slug: 'modern-web-development-ai-integration',
    description: 'Build modern web applications with integrated AI capabilities and smart features.',
    content: 'Learn how to create web applications that leverage AI services and APIs. This course covers modern web frameworks, AI service integration, and building intelligent user interfaces that adapt to user behavior.',
    thumbnail: '/assets/course-thumbnails/web-dev-ai.jpg',
    instructor_name: 'Alex Johnson',
    instructor_bio: 'Full-stack developer and AI integration specialist',
    price: 89.99,
    currency: 'USD',
    duration_hours: 9.5,
    difficulty_level: 'intermediate',
    category_id: 4,
    category_name: 'Web Development',
    category_slug: 'web-development',
    tags: ['Web Development', 'AI Integration', 'JavaScript', 'React'],
    status: 'published',
    enrollment_count: 760,
    rating: 4.5,
    rating_count: 142,
    created_at: '2025-01-05T12:20:00Z',
    updated_at: '2025-01-16T15:30:00Z'
  }
];

// GET /api/courses - Get all courses with pagination, search, filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      difficulty, 
      popular, 
      featured,
      slug,
      sort = 'newest'
    } = req.query;
    
    // Get single course by slug
    if (slug) {
      const course = mockCourses.find(c => c.slug === slug);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      return res.status(200).json({ course });
    }
    
    // Get popular courses
    if (popular) {
      const sortedCourses = [...mockCourses].sort((a, b) => b.enrollment_count - a.enrollment_count);
      const popularCourses = sortedCourses.slice(0, parseInt(limit));
      return res.status(200).json({ courses: popularCourses });
    }
    
    // Get featured courses
    if (featured) {
      const featuredCourses = mockCourses.filter(course => course.rating >= 4.5);
      const sortedFeatured = featuredCourses.sort((a, b) => b.rating - a.rating);
      const limitedFeatured = sortedFeatured.slice(0, parseInt(limit));
      return res.status(200).json({ courses: limitedFeatured });
    }
    
    let filteredCourses = [...mockCourses];
    
    // Search courses
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.instructor_name.toLowerCase().includes(searchLower) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by category
    if (category) {
      filteredCourses = filteredCourses.filter(course =>
        course.category_slug === category || course.category_id === parseInt(category)
      );
    }
    
    // Filter by difficulty
    if (difficulty) {
      filteredCourses = filteredCourses.filter(course =>
        course.difficulty_level === difficulty
      );
    }
    
    // Sort courses
    switch (sort) {
      case 'price_low':
        filteredCourses.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filteredCourses.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredCourses.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filteredCourses.sort((a, b) => b.enrollment_count - a.enrollment_count);
        break;
      case 'newest':
      default:
        filteredCourses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(filteredCourses.length / parseInt(limit));
    
    return res.status(200).json({
      success: true,
      data: paginatedCourses,
      pagination: {
        total: filteredCourses.length,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Course API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/courses/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    return res.status(200).json({ 
      success: true,
      data: mockCourseCategories 
    });
  } catch (error) {
    console.error('Course Categories API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;