import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, Search, ChevronRight, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Pagination from '../Pagination';
import SkeletonLoader from '../animations/SkeletonLoader';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const NewsCategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    loadCategory();
    loadCategories();
  }, [slug]);

  useEffect(() => {
    if (category) {
      loadArticles();
      // Update page title and meta tags
      document.title = `${category.name} News - achAI`;
      updateMetaTags();
    }
  }, [currentPage, searchTerm, category]);

  const loadCategory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/news-categories/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setCategory(data.data);
      } else {
        navigate('/news');
      }
    } catch (error) {
      console.error('Error loading category:', error);
      navigate('/news');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/news-categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: 'published',
        category_id: category.id,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_BASE_URL}/news?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetaTags = () => {
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = category.description || `Browse ${category.name} articles and news on achAI`;
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = `${category.name} News - achAI`;

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = category.description || `Browse ${category.name} articles and news on achAI`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadArticles();
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
              <Link to="/news" className="hover:text-purple-400">News</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-300">{category?.name}</span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{category?.name} News</h1>
            {category?.description && (
              <p className="text-xl text-gray-300 max-w-3xl">
                {category.description}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-6 mt-6 text-gray-400">
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {category?.article_count || 0} Articles
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Articles Grid */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-8">
              <form onSubmit={handleSearch} className="relative max-w-md">
                <Input
                  type="text"
                  placeholder={`Search ${category?.name} articles...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Articles */}
            {isLoading ? (
              <SkeletonLoader rows={6} />
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No articles found in this category.</p>
                <Button
                  onClick={() => navigate('/news')}
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All News
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {articles.map((article, index) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
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
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {calculateReadTime(article.content)}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                          <Link to={`/news/${article.slug}`}>{article.title}</Link>
                        </h3>
                        <p className="text-gray-400 mb-4 line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          {article.author_name && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {article.author_name}
                            </span>
                          )}
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
            {/* Other Categories */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Other Categories</h3>
              <ul className="space-y-2">
                {categories
                  .filter(cat => cat.id !== category?.id)
                  .map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/news/category/${cat.slug}`}
                        className="flex items-center justify-between px-3 py-2 rounded text-gray-400 hover:text-white hover:bg-zinc-700 transition-colors"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs bg-zinc-700 px-2 py-1 rounded">
                          {cat.article_count}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
              <Link
                to="/news"
                className="block mt-4 text-center text-purple-400 hover:text-purple-300 text-sm"
              >
                View All News →
              </Link>
            </div>

            {/* Popular Tags */}
            {category?.popular_tags && category.popular_tags.length > 0 && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {category.popular_tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/news?tag=${tag.slug}`}
                      className="bg-zinc-700 text-gray-400 px-3 py-1 rounded-full text-sm hover:bg-zinc-600 hover:text-white transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter CTA */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-300 mb-4">
                Get the latest {category?.name} news delivered to your inbox.
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

export default NewsCategoryPage;