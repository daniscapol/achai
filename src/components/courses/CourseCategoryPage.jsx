import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, Search, ChevronRight, Clock, ArrowRight, ArrowLeft, BookOpen, DollarSign, Star, Users, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Pagination from '../Pagination';
import SkeletonLoader from '../animations/SkeletonLoader';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const CourseCategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadCategory();
    loadCategories();
  }, [slug]);

  useEffect(() => {
    if (category) {
      loadCourses();
      // Update page title and meta tags
      document.title = `${category.name} Courses - achAI`;
      updateMetaTags();
    }
  }, [currentPage, searchTerm, selectedDifficulty, priceRange, sortBy, category]);

  const loadCategory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/course-categories/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setCategory(data.data);
      } else {
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error loading category:', error);
      navigate('/courses');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/course-categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: 'published',
        category_id: category.id,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty }),
        ...(priceRange && { price_range: priceRange }),
        ...(sortBy && { sort: sortBy })
      });

      const response = await fetch(`${API_BASE_URL}/courses?${params}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetaTags = () => {
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = category.description || `Browse ${category.name} courses on achAI. Learn from experts and master new skills.`;
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = `${category.name} Courses - achAI`;

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = category.description || `Browse ${category.name} courses on achAI`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCourses();
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? 'Free' : `$${numPrice.toFixed(2)}`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'bg-green-600',
      'intermediate': 'bg-yellow-600',
      'advanced': 'bg-red-600'
    };
    return colors[difficulty] || 'bg-gray-600';
  };

  if (!category && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Category Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-900/20 to-pink-900/20 py-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link to="/" className="hover:text-purple-400">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/courses" className="hover:text-purple-400">Courses</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-300">{category?.name}</span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{category?.name} Courses</h1>
            {category?.description && (
              <p className="text-xl text-gray-300 max-w-3xl mb-6">
                {category.description}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-gray-400">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {category?.course_count || 0} Courses
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {category?.student_count || '1000+'} Students
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Search in {category?.name}</h3>
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-white pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Difficulty Filter */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Difficulty Level</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedDifficulty('')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      !selectedDifficulty 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    All Levels
                  </button>
                </li>
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <li key={level}>
                    <button
                      onClick={() => setSelectedDifficulty(level)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${
                        selectedDifficulty === level
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                      }`}
                    >
                      <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(level)}`}>
                        {level.charAt(0).toUpperCase()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Price</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setPriceRange('')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      !priceRange 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    All Prices
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPriceRange('free')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${
                      priceRange === 'free'
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    <span>Free</span>
                    <span className="text-xs bg-green-600 px-2 py-1 rounded">Free</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setPriceRange('paid')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${
                      priceRange === 'paid'
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    <span>Paid</span>
                    <DollarSign className="h-4 w-4" />
                  </button>
                </li>
              </ul>
            </div>

            {/* Other Categories */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Other Categories</h3>
              <ul className="space-y-2">
                {categories
                  .filter(cat => cat.id !== category?.id)
                  .map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/courses/category/${cat.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs bg-zinc-700 px-2 py-1 rounded">
                          {cat.course_count}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
              <Link
                to="/courses"
                className="block mt-4 text-center text-purple-400 hover:text-purple-300 text-sm"
              >
                View All Courses →
              </Link>
            </div>
          </aside>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {/* Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <p className="text-gray-400 mb-2 sm:mb-0">
                {courses.length} courses found
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Courses */}
            {isLoading ? (
              <SkeletonLoader rows={6} />
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-4">No courses found in this category.</p>
                <Button
                  onClick={() => navigate('/courses')}
                  variant="outline"
                  className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse All Courses
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {courses.map((course, index) => (
                    <motion.article
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-zinc-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
                    >
                      {course.thumbnail_url && (
                        <Link to={`/courses/${course.slug}`} className="block relative h-48 overflow-hidden">
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
                          <span className={`absolute top-4 right-4 text-white text-xs px-2 py-1 rounded ${getDifficultyColor(course.difficulty)}`}>
                            {course.difficulty}
                          </span>
                        </Link>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration_hours ? `${course.duration_hours}h` : 'Self-paced'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrollment_count || 0} enrolled
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                          <Link to={`/courses/${course.slug}`}>{course.title}</Link>
                        </h3>
                        <p className="text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-300">
                            {course.rating || '4.5'} ({course.rating_count || 0} reviews)
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">By {course.instructor_name}</p>
                            <p className="text-lg font-bold text-purple-400">{formatPrice(course.price)}</p>
                          </div>
                          <Link
                            to={`/courses/${course.slug}`}
                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
                          >
                            View course <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseCategoryPage;