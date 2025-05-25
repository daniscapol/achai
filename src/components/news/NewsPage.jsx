import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, User, Tag, Search, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Pagination from '../Pagination';
import SkeletonLoader from '../animations/SkeletonLoader';
import { motion } from 'framer-motion';
import { fetchWithFallback, fallbackNewsData, fallbackNewsCategories } from '../../utils/productionFallback';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const NewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadArticles();
    loadCategories();
    loadRecentArticles();
  }, [currentPage, selectedCategory, searchTerm]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params);
  }, [currentPage, selectedCategory, searchTerm, setSearchParams]);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: 'published',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const data = await fetchWithFallback(`${API_BASE_URL}/news?${params}`, fallbackNewsData);

      if (data.success) {
        setArticles(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        
        // Set featured articles (first 3 on first page)
        if (currentPage === 1 && !searchTerm && !selectedCategory) {
          setFeaturedArticles(data.data.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      // Use fallback data on error
      setArticles(fallbackNewsData.data);
      setTotalPages(1);
      setFeaturedArticles(fallbackNewsData.data.slice(0, 3));
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchWithFallback(`${API_BASE_URL}/news/categories`, fallbackNewsCategories);
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(fallbackNewsCategories.data);
    }
  };

  const loadRecentArticles = async () => {
    try {
      const data = await fetchWithFallback(`${API_BASE_URL}/news?limit=5&status=published`, fallbackNewsData);
      if (data.success) {
        setRecentArticles(data.data || []);
      }
    } catch (error) {
      console.error('Error loading recent articles:', error);
      setRecentArticles(fallbackNewsData.data.slice(0, 5));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadArticles();
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(' ').length || 0;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Hero Section */}
      {currentPage === 1 && !searchTerm && !selectedCategory && featuredArticles.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-r from-purple-900/20 to-pink-900/20 py-20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold text-white mb-4">Latest News & Updates</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Stay informed with the latest developments in AI, MCP, and technology
              </p>
            </motion.div>

            {/* Featured Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-zinc-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group"
                >
                  {article.featured_image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
                      <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.published_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {calculateReadTime(article.content)}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      <Link to={`/news/${article.slug}`}>{article.title}</Link>
                    </h2>
                    <p className="text-gray-400 mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-400">{article.category_name}</span>
                      <Link
                        to={`/news/${article.slug}`}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
                      >
                        Read more <ArrowRight className="h-3 w-3" />
                      </Link>
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
          {/* Main Articles Area */}
          <div className="lg:col-span-3">
            {/* Page Header */}
            {(searchTerm || selectedCategory || currentPage > 1) && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedCategory 
                    ? categories.find(c => c.slug === selectedCategory)?.name + ' Articles'
                    : searchTerm 
                    ? `Search Results for "${searchTerm}"`
                    : 'All Articles'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Link to="/news" className="hover:text-purple-400">News</Link>
                  {selectedCategory && (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      <span>{categories.find(c => c.id.toString() === selectedCategory)?.name}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Articles Grid */}
            {isLoading ? (
              <SkeletonLoader rows={6} />
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No articles found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {articles.map((article) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
                    >
                      {article.featured_image && (
                        <Link to={`/news/${article.slug}`} className="block relative h-48 overflow-hidden">
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-60"></div>
                        </Link>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(article.published_at)}
                          </span>
                          {article.author_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {article.author_name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                          <Link to={`/news/${article.slug}`}>{article.title}</Link>
                        </h3>
                        <p className="text-gray-400 mb-4 line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/news/category/${article.category_slug || article.category_name?.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                          >
                            <Tag className="h-3 w-3" />
                            {article.category_name}
                          </Link>
                          <Link
                            to={`/news/${article.slug}`}
                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm"
                          >
                            Read more <ArrowRight className="h-3 w-3" />
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
              <h3 className="text-lg font-semibold text-white mb-4">Search Articles</h3>
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search news..."
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
                  <li key={category.slug}>
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
                        {category.article_count || '0'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Articles */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Articles</h3>
              <ul className="space-y-4">
                {recentArticles.map((article) => (
                  <li key={article.id} className="border-b border-zinc-700 last:border-0 pb-4 last:pb-0">
                    <Link
                      to={`/news/${article.slug}`}
                      className="group"
                    >
                      <h4 className="text-sm font-medium text-gray-300 group-hover:text-purple-400 transition-colors mb-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {formatDate(article.published_at)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-300 mb-4">
                Get the latest news and updates delivered to your inbox.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Subscribe to Newsletter
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;