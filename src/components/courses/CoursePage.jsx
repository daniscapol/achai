import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Users, BookOpen, CheckCircle, Play, Lock, User, Calendar, Globe, Award } from 'lucide-react';
import { Button } from '../ui/button';
import SkeletonLoader from '../animations/SkeletonLoader';
import { motion } from 'framer-motion';
import EnrollmentModal from './EnrollmentModal';
// Removed fallback system - using real database APIs only

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const CoursePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [slug]);

  const loadCourse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/courses?slug=${slug}`);
      const data = await response.json();

      if (data.success && data.data) {
        setCourse(data.data);
        // Check if user is enrolled
        setIsEnrolled(data.data.is_enrolled || false);
        // Load related courses if we have a category
        if (data.data.category_id) {
          loadRelatedCourses(data.data.category_id, data.data.id);
        }
      } else {
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      navigate('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedCourses = async (categoryId, currentCourseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses?category_id=${categoryId}&limit=3&status=published`);
      const data = await response.json();
      
      if (data.success) {
        // Filter out the current course
        const filtered = data.data.filter(c => c.id !== currentCourseId);
        setRelatedCourses(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading related courses:', error);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 py-12">
        <div className="container mx-auto px-4">
          <SkeletonLoader rows={10} />
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-900/20 to-pink-900/20 py-12">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/courses" className="hover:text-purple-400 flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Courses
            </Link>
            <span>/</span>
            <Link to={`/courses?category=${course.category_id}`} className="hover:text-purple-400">
              {course.category_name}
            </Link>
            <span>/</span>
            <span className="text-white">{course.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className={`text-white text-sm px-3 py-1 rounded ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  <span className="text-sm text-gray-400">
                    Last updated {formatDate(course.updated_at)}
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
                
                <p className="text-lg text-gray-300 mb-6">{course.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Created by {course.instructor_name || 'Expert Instructor'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration || 'Self-paced'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{course.enrolled_count || 0} students enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{course.language || 'English'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{course.rating || '4.5'} ({course.reviews_count || 0} reviews)</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Course Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-zinc-800 rounded-lg overflow-hidden sticky top-24"
              >
                {course.thumbnail_url && (
                  <div className="relative h-48">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
                    <button className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-purple-600 rounded-full p-4 hover:bg-purple-700 transition-colors">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </button>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="text-3xl font-bold text-purple-400 mb-6">
                    {formatPrice(course.price)}
                  </div>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
                    onClick={() => isEnrolled ? navigate(`/learning/courses/${course.slug}`) : setShowEnrollmentModal(true)}
                  >
                    {isEnrolled ? 'Continue Learning' : course.price === 0 ? 'Start Learning' : 'Enroll Now'}
                  </Button>
                  
                  <Button variant="outline" className="w-full border-purple-600 text-purple-400 hover:bg-purple-600/10">
                    Add to Wishlist
                  </Button>
                  
                  <div className="mt-6 space-y-3">
                    <h3 className="font-semibold text-white mb-3">This course includes:</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Access on mobile and desktop</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Downloadable resources</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-700 mb-8">
              {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab
                      ? 'text-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">What you'll learn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.learning_outcomes?.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <span className="text-gray-300">{outcome}</span>
                        </div>
                      )) || (
                        <>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span className="text-gray-300">Master fundamental concepts and principles</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span className="text-gray-300">Build real-world projects and applications</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span className="text-gray-300">Learn industry best practices</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            <span className="text-gray-300">Get hands-on experience with tools</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
                    <ul className="space-y-2">
                      {course.requirements?.map((req, index) => (
                        <li key={index} className="text-gray-300 flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      )) || (
                        <>
                          <li className="text-gray-300 flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>Basic understanding of programming concepts</span>
                          </li>
                          <li className="text-gray-300 flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>A computer with internet connection</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {course.full_description || course.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white mb-4">Course Curriculum</h2>
                  {course.curriculum?.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-zinc-800 rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-zinc-700">
                        <h3 className="font-semibold text-white">
                          Section {sectionIndex + 1}: {section.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {section.lessons?.length || 0} lessons • {section.duration || '30 min'}
                        </p>
                      </div>
                      <div className="divide-y divide-zinc-700">
                        {section.lessons?.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="p-4 flex items-center justify-between hover:bg-zinc-700/50 transition-colors">
                            <div className="flex items-center gap-3">
                              {lesson.is_preview ? (
                                <Play className="h-4 w-4 text-purple-400" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-500" />
                              )}
                              <div>
                                <p className="text-gray-300">{lesson.title}</p>
                                <p className="text-sm text-gray-500">{lesson.type} • {lesson.duration}</p>
                              </div>
                            </div>
                            {lesson.is_preview && (
                              <button className="text-sm text-purple-400 hover:text-purple-300">
                                Preview
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )) || (
                    <div className="bg-zinc-800 rounded-lg p-8 text-center">
                      <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Curriculum details coming soon</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'instructor' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Your Instructor</h2>
                  <div className="bg-zinc-800 rounded-lg p-6">
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                        {course.instructor_name?.charAt(0) || 'I'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {course.instructor_name || 'Expert Instructor'}
                        </h3>
                        <p className="text-purple-400 mb-3">{course.instructor_title || 'AI & Technology Expert'}</p>
                        <p className="text-gray-300 mb-4">
                          {course.instructor_bio || 'Experienced instructor with years of expertise in AI and technology education. Passionate about helping students master complex concepts through practical, hands-on learning.'}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <span>{course.instructor_courses || 15} courses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{course.instructor_students || '10,000+'} students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{course.instructor_rating || '4.8'} rating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Student Reviews</h2>
                  {course.reviews?.length > 0 ? (
                    course.reviews.map((review, index) => (
                      <div key={index} className="bg-zinc-800 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-lg font-bold text-white">
                            {review.user_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{review.user_name}</h4>
                              <span className="text-sm text-gray-400">{formatDate(review.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-300">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-zinc-800 rounded-lg p-8 text-center">
                      <Star className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No reviews yet. Be the first to review this course!</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Courses */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold text-white mb-6">Related Courses</h3>
            <div className="space-y-4">
              {relatedCourses.map((relatedCourse) => (
                <Link
                  key={relatedCourse.id}
                  to={`/courses/${relatedCourse.slug}`}
                  className="block bg-zinc-800 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group"
                >
                  {relatedCourse.thumbnail_url && (
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={relatedCourse.thumbnail_url}
                        alt={relatedCourse.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-2">
                      {relatedCourse.title}
                    </h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{relatedCourse.instructor_name}</span>
                      <span className="text-purple-400 font-semibold">{formatPrice(relatedCourse.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Modal */}
      <EnrollmentModal
        course={course}
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onSuccess={() => {
          setIsEnrolled(true);
          setShowEnrollmentModal(false);
        }}
      />
    </div>
  );
};

export default CoursePage;