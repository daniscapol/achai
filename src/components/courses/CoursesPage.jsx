import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, User, Tag, Search, ChevronRight, Clock, ArrowRight, BookOpen, DollarSign, Star, Users } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Pagination from '../Pagination';
import SkeletonLoader from '../animations/SkeletonLoader';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadCourses();
    loadCategories();
    loadRecentCourses();
  }, [currentPage, selectedCategory, selectedDifficulty, priceRange, sortBy, searchTerm]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
    if (priceRange) params.set('price', priceRange);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params);
  }, [currentPage, selectedCategory, selectedDifficulty, priceRange, sortBy, searchTerm, setSearchParams]);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: 'published',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty }),
        ...(priceRange && { price_range: priceRange }),
        ...(sortBy && { sort: sortBy })
      });

      const response = await fetch(`${API_BASE_URL}/courses?${params}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        
        // Set featured courses (first 3 on first page)
        if (currentPage === 1 && !searchTerm && !selectedCategory && !selectedDifficulty) {
          setFeaturedCourses(data.data.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadRecentCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses?limit=5&status=published`);
      const data = await response.json();
      if (data.success) {
        setRecentCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error loading recent courses:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCourses();
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Hero Section */}
      {currentPage === 1 && !searchTerm && !selectedCategory && !selectedDifficulty && featuredCourses.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-r from-purple-900/20 to-pink-900/20 py-20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold text-white mb-4">AI & MCP Courses</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Learn from experts and master the latest AI and MCP technologies
              </p>
            </motion.div>

            {/* Featured Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course, index) => (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-zinc-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group"
                >
                  {course.thumbnail_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
                      <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        Featured
                      </span>
                      <span className={`absolute top-4 right-4 text-white text-xs px-2 py-1 rounded ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration || 'Self-paced'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrolled_count || 0} enrolled
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      <Link to={`/courses/${course.slug}`}>{course.title}</Link>
                    </h2>
                    <p className="text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-300">{course.rating || '4.5'}</span>
                      </div>
                      <span className="text-lg font-bold text-purple-400">{formatPrice(course.price)}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Courses Area */}
          <div className="lg:col-span-3">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-3xl font-bold text-white mb-2 sm:mb-0">
                  {selectedCategory 
                    ? categories.find(c => c.slug === selectedCategory)?.name + ' Courses'
                    : selectedDifficulty
                    ? selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1) + ' Courses'
                    : searchTerm 
                    ? `Search Results for "${searchTerm}"`
                    : 'All Courses'}
                </h2>
                
                {/* Sort Dropdown */}
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
              
              {(searchTerm || selectedCategory || selectedDifficulty || priceRange) && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Link to="/courses" className="hover:text-purple-400">Courses</Link>
                  {selectedCategory && (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      <span>{categories.find(c => c.slug === selectedCategory)?.name}</span>
                    </>
                  )}
                  {selectedDifficulty && (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      <span>{selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}</span>
                    </>
                  )}
                  {priceRange && (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      <span>{priceRange === 'free' ? 'Free' : priceRange === 'paid' ? 'Paid' : 'All Prices'}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Courses Grid */}
            {isLoading ? (
              <SkeletonLoader rows={6} />
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No courses found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {courses.map((course) => (
                    <motion.article
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
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
                            {course.duration || 'Self-paced'}
                          </span>
                          {course.instructor_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {course.instructor_name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                          <Link to={`/courses/${course.slug}`}>{course.title}</Link>
                        </h3>
                        <p className="text-gray-400 mb-4 line-clamp-3">{course.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <Link
                            to={`/courses/category/${course.category_slug || course.category_name?.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <Tag className="h-3 w-3" />
                            {course.category_name}
                          </Link>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-300">{course.rating || '4.5'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-400">{formatPrice(course.price)}</span>
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

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            {/* Search */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Search Courses</h3>
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
                    onClick={() => handleDifficultySelect('')}
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
                      onClick={() => handleDifficultySelect(level)}
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

            {/* Categories */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      !selectedCategory 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${
                        selectedCategory === category.slug
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs bg-zinc-700 px-2 py-1 rounded">
                        {category.course_count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Courses */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Courses</h3>
              <ul className="space-y-4">
                {recentCourses.map((course) => (
                  <li key={course.id} className="border-b border-zinc-700 last:border-0 pb-4 last:pb-0">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="group"
                    >
                      <h4 className="text-sm font-medium text-gray-300 group-hover:text-purple-400 transition-colors mb-1">
                        {course.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {course.instructor_name}
                        </p>
                        <p className="text-sm font-semibold text-purple-400">
                          {formatPrice(course.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learning CTA */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6">
              <BookOpen className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Start Learning Today</h3>
              <p className="text-sm text-gray-300 mb-4">
                Join thousands of learners mastering AI and MCP technologies.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Browse All Courses
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;