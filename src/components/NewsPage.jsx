import React, { useState, useEffect } from 'react';
import { Search, Clock, User, Newspaper, Eye, Share2, Filter, ChevronDown, AlertCircle } from 'lucide-react';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showBreaking, setShowBreaking] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'published_at', label: 'Recently Published' },
    { value: 'view_count', label: 'Most Read' },
    { value: 'title', label: 'Alphabetical' }
  ];

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory, showBreaking, showFeatured, sortBy]);

  const fetchNews = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort: sortBy,
        order: 'DESC'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (showBreaking) params.append('breaking', 'true');
      if (showFeatured) params.append('featured', 'true');

      const response = await fetch(`${API_BASE_URL}/news?${params}`);
      const data = await response.json();
      
      setNews(data.news || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/categories`);
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNews();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowBreaking(false);
    setShowFeatured(false);
    setSortBy('created_at');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return formatDate(dateString);
  };

  const navigateToArticle = (slug) => {
    window.location.hash = `#/news/${slug}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            MCP News
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stay updated with the latest developments in the Model Context Protocol ecosystem, AI technology, and industry insights.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </form>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex gap-4 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-600">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showBreaking}
                    onChange={(e) => setShowBreaking(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Breaking News</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showFeatured}
                    onChange={(e) => setShowFeatured(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">Featured</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Loading news...</p>
          </div>
        )}

        {/* News Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {news.map((article) => (
                <div
                  key={article.id}
                  onClick={() => navigateToArticle(article.slug)}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                >
                  {article.featured_image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      
                      <div className="absolute top-4 left-4 flex gap-2">
                        {article.is_breaking && (
                          <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Breaking
                          </span>
                        )}
                        
                        {article.is_featured && (
                          <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                        {article.category}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.reading_time || 3} min read
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {article.excerpt || article.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{article.author_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.view_count || 0}</span>
                        </div>
                        
                        {article.share_count > 0 && (
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span>{article.share_count}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {timeAgo(article.published_at || article.created_at)}
                      </span>
                      
                      {article.source_name && (
                        <span className="text-xs text-gray-500 bg-slate-700 px-2 py-1 rounded">
                          {article.source_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {news.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No news articles found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 bg-slate-800 rounded-lg text-white">
                  {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage; 