import express from 'express';
import { Course } from '../utils/Course.js';

const router = express.Router();

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
      slug 
    } = req.query;
    
    // Get single course by slug
    if (slug) {
      const course = await Course.getBySlug(slug);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      return res.status(200).json({ course });
    }
    
    // Get popular courses
    if (popular) {
      const courses = await Course.getPopular(parseInt(limit));
      return res.status(200).json({ courses });
    }
    
    // Get featured courses
    if (featured) {
      const courses = await Course.getFeatured(parseInt(limit));
      return res.status(200).json({ courses });
    }
    
    // Search courses
    if (search) {
      const result = await Course.search(search, parseInt(page), parseInt(limit));
      return res.status(200).json({
        success: true,
        data: result.courses,
        pagination: result.pagination
      });
    }
    
    // Get courses by category
    if (category) {
      const result = await Course.getByCategory(category, parseInt(page), parseInt(limit));
      return res.status(200).json({
        success: true,
        data: result.courses,
        pagination: result.pagination
      });
    }
    
    // Get courses by difficulty
    if (difficulty) {
      const result = await Course.getByDifficulty(difficulty, parseInt(page), parseInt(limit));
      return res.status(200).json({
        success: true,
        data: result.courses,
        pagination: result.pagination
      });
    }
    
    // Get all courses
    const result = await Course.getAll(parseInt(page), parseInt(limit));
    return res.status(200).json({
      success: true,
      data: result.courses,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Course API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// POST /api/courses - Create new course (admin only)
router.post('/', async (req, res) => {
  try {
    const courseData = req.body;
    
    // Basic validation
    if (!courseData.title || !courseData.description || !courseData.content || !courseData.instructor_name) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: title, description, content, instructor_name' 
      });
    }
    
    const newCourse = await Course.create(courseData);
    return res.status(201).json({ 
      success: true,
      data: newCourse 
    });

  } catch (error) {
    console.error('Course API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// PUT /api/courses/:id - Update course (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedCourse = await Course.update(parseInt(id), updateData);
    
    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    return res.status(200).json({ course: updatedCourse });

  } catch (error) {
    console.error('Course API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// DELETE /api/courses/:id - Delete course (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCourse = await Course.delete(parseInt(id));
    
    if (!deletedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    return res.status(200).json({ 
      message: 'Course archived successfully',
      id: deletedCourse.id 
    });

  } catch (error) {
    console.error('Course API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/courses/categories - Get all categories (must be before /:id route)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Course.getCategories();
    return res.status(200).json({ 
      success: true,
      data: categories 
    });
  } catch (error) {
    console.error('Course Categories API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET /api/courses/:id - Get single course by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get by ID first (if it's a number)
    let course;
    if (!isNaN(id)) {
      course = await Course.getById(parseInt(id));
    }
    
    // If not found by ID or ID is not a number, try by slug
    if (!course) {
      course = await Course.getBySlug(id);
    }
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    return res.status(200).json({ 
      success: true,
      data: course 
    });
  } catch (error) {
    console.error('Course API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;