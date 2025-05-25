import { Course } from '../src/utils/Course.js';

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
      return res.status(200).end();
    }

    switch (method) {
      case 'GET':
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

      case 'POST':
        // Create new course (admin only)
        const courseData = req.body;
        
        // Basic validation
        if (!courseData.title || !courseData.description || !courseData.content || !courseData.instructor_name) {
          return res.status(400).json({ 
            error: 'Missing required fields: title, description, content, instructor_name' 
          });
        }
        
        const newCourse = await Course.create(courseData);
        return res.status(201).json({ course: newCourse });

      case 'PUT':
        // Update course (admin only)
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ error: 'Course ID is required' });
        }
        
        const updateData = req.body;
        const updatedCourse = await Course.update(parseInt(id), updateData);
        
        if (!updatedCourse) {
          return res.status(404).json({ error: 'Course not found' });
        }
        
        return res.status(200).json({ course: updatedCourse });

      case 'DELETE':
        // Delete course (admin only)
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Course ID is required' });
        }
        
        const deletedCourse = await Course.delete(parseInt(deleteId));
        
        if (!deletedCourse) {
          return res.status(404).json({ error: 'Course not found' });
        }
        
        return res.status(200).json({ 
          message: 'Course archived successfully',
          id: deletedCourse.id 
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }

  } catch (error) {
    console.error('Course API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}