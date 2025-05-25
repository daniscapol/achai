import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, User, Tag, Clock, ArrowLeft, Share2, 
  Facebook, Twitter, Linkedin, Copy, Check, BookmarkPlus,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import SkeletonLoader from '../animations/SkeletonLoader';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '../../hooks/use-toast';
import CommentsSection from './CommentsSection';
// Removed fallback system - using real database APIs only

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const NewsArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  useEffect(() => {
    if (article) {
      loadRelatedArticles();
      // Update page title and meta tags
      document.title = `${article.title} - achAI News`;
      updateMetaTags();
      
      // Update JSON-LD structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.excerpt || article.meta_description,
        "image": article.featured_image,
        "datePublished": article.published_at,
        "dateModified": article.updated_at || article.published_at,
        "author": {
          "@type": "Person",
          "name": article.author_name
        },
        "publisher": {
          "@type": "Organization", 
          "name": "achAI",
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/assets/logo.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": window.location.href
        },
        "keywords": article.tags?.map(t => t.name).join(', ')
      });
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [article]);

  const loadArticle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/news?slug=${slug}`);
      const data = await response.json();

      if (data.success && data.data) {
        setArticle(data.data);
      } else {
        navigate('/news');
      }
    } catch (error) {
      console.error('Error loading article:', error);
      navigate('/news');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedArticles = async () => {
    try {
      const params = new URLSearchParams({
        category_id: article.category_id,
        limit: 3,
        status: 'published'
      });

      const response = await fetch(`${API_BASE_URL}/news?${params}`);
      const data = await response.json();

      if (data.success) {
        // Filter out current article
        const related = data.data.filter(a => a.id !== article.id);
        setRelatedArticles(related.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading related articles:', error);
    }
  };

  const updateMetaTags = () => {
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = article.meta_description || article.excerpt || '';
    } else {
      const newMetaDesc = document.createElement('meta');
      newMetaDesc.name = 'description';
      newMetaDesc.content = article.meta_description || article.excerpt || '';
      document.head.appendChild(newMetaDesc);
    }

    // Update keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (article.meta_keywords || article.tags) {
      const keywords = article.meta_keywords || article.tags?.map(t => t.name).join(', ');
      if (metaKeywords) {
        metaKeywords.content = keywords;
      } else {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        metaKeywords.content = keywords;
        document.head.appendChild(metaKeywords);
      }
    }

    // Update Open Graph tags
    const updateOrCreateMeta = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.content = content;
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    updateOrCreateMeta('og:title', article.title);
    updateOrCreateMeta('og:description', article.meta_description || article.excerpt || '');
    updateOrCreateMeta('og:type', 'article');
    updateOrCreateMeta('og:url', window.location.href);
    if (article.featured_image) {
      updateOrCreateMeta('og:image', article.featured_image);
    }
    updateOrCreateMeta('article:published_time', article.published_at);
    if (article.updated_at) {
      updateOrCreateMeta('article:modified_time', article.updated_at);
    }
    if (article.author_name) {
      updateOrCreateMeta('article:author', article.author_name);
    }
    if (article.category_name) {
      updateOrCreateMeta('article:section', article.category_name);
    }

    // Update Twitter Card tags
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', article.title);
    updateOrCreateMeta('twitter:description', article.meta_description || article.excerpt || '');
    if (article.featured_image) {
      updateOrCreateMeta('twitter:image', article.featured_image);
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = window.location.href;
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = window.location.href;
      document.head.appendChild(canonical);
    }
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

  const shareArticle = (platform) => {
    const url = window.location.href;
    const title = article.title;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: 'Link copied!',
          description: 'Article link has been copied to clipboard',
          variant: 'default'
        });
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <SkeletonLoader rows={10} />
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Hero Section with Featured Image */}
      {article.featured_image && (
        <div className="relative h-96 overflow-hidden">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto px-4 max-w-4xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button and Breadcrumbs */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/news')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Link to="/news" className="hover:text-purple-400">News</Link>
              <ChevronRight className="h-3 w-3" />
              <Link 
                to={`/news?category=${article.category_id}`}
                className="hover:text-purple-400"
              >
                {article.category_name}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-300">{article.title}</span>
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link
                to={`/news?category=${article.category_id}`}
                className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm hover:bg-purple-600/30 transition-colors"
              >
                {article.category_name}
              </Link>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">{article.title}</h1>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm pb-6 border-b border-zinc-800">
              {article.author_name && (
                <div className="flex items-center gap-2">
                  {article.author_avatar ? (
                    <img
                      src={article.author_avatar}
                      alt={article.author_name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span>{article.author_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(article.published_at)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {calculateReadTime(article.content)}
              </div>
            </div>
          </header>

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-gray-400 text-sm">Share:</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => shareArticle('twitter')}
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => shareArticle('facebook')}
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => shareArticle('linkedin')}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => shareArticle('copy')}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white ml-auto"
            >
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>

          {/* Article Content */}
          <div className="prose prose-invert max-w-none mb-12">
            {article.excerpt && (
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                {article.excerpt}
              </p>
            )}
            
            <div className="text-gray-300">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-semibold text-white mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold text-white mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="text-gray-300">{children}</li>,
                a: ({ href, children }) => (
                  <a href={href} className="text-purple-400 hover:text-purple-300 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-4">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children }) => (
                  inline ? (
                    <code className="bg-zinc-800 px-1 py-0.5 rounded text-purple-400 text-sm">{children}</code>
                  ) : (
                    <code className="block bg-zinc-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 my-4">{children}</code>
                  )
                ),
                img: ({ src, alt }) => (
                  <img src={src} alt={alt} className="rounded-lg my-6 w-full" />
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-8">
              <Tag className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/news?tag=${tag.slug}`}
                    className="bg-zinc-800 text-gray-400 px-3 py-1 rounded-full text-sm hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {article.author_bio && (
            <div className="bg-zinc-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">About the Author</h3>
              <div className="flex items-start gap-4">
                {article.author_avatar && (
                  <img
                    src={article.author_avatar}
                    alt={article.author_name}
                    className="h-16 w-16 rounded-full"
                  />
                )}
                <div>
                  <h4 className="font-medium text-white mb-2">{article.author_name}</h4>
                  <p className="text-gray-400 text-sm">{article.author_bio}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-8 border-t border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <motion.article
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
                >
                  {related.featured_image && (
                    <Link to={`/news/${related.slug}`} className="block relative h-40 overflow-hidden">
                      <img
                        src={related.featured_image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </Link>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      <Link to={`/news/${related.slug}`}>{related.title}</Link>
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{related.excerpt}</p>
                    <div className="text-xs text-gray-500">
                      {formatDate(related.published_at)}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {article.related_products && article.related_products.length > 0 && (
          <section className="mt-12 pt-8 border-t border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.related_products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-1">{product.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section - Can be toggled on/off via environment variable or article settings */}
        {import.meta.env.VITE_ENABLE_COMMENTS !== 'false' && (
          <CommentsSection articleId={article.id} articleSlug={article.slug} />
        )}
      </article>
    </div>
  );
};

export default NewsArticlePage;