import React, { useState, useEffect } from 'react';
import { validateUrl, validateArticle, getExampleArticles } from '../utils/newsUtilities';

// Helper function to get theme icon based on category
const getCategoryIcon = (category) => {
  switch(category) {
    case 'Model Releases':
      return 'brain';
    case 'Research Papers':
      return 'flask-vial';
    case 'Business':
      return 'briefcase';
    case 'Ethics & Safety':
      return 'shield-check';
    case 'Applications':
      return 'app-window';
    case 'Generative AI':
      return 'image';
    case 'Open Source':
      return 'code-branch';
    case 'Developer Tools':
      return 'code';
    default:
      return 'sparkles';
  }
};

// Helper function to get theme color based on category
const getCategoryColor = (category) => {
  switch(category) {
    case 'Model Releases':
      return 'from-purple-500 to-indigo-600';
    case 'Research Papers':
      return 'from-blue-500 to-purple-600';
    case 'Business':
      return 'from-blue-500 to-teal-600';
    case 'Ethics & Safety':
      return 'from-red-500 to-pink-600';
    case 'Applications':
      return 'from-indigo-500 to-blue-600';
    case 'Generative AI':
      return 'from-pink-500 to-purple-600';
    case 'Open Source':
      return 'from-green-500 to-teal-600';
    case 'Developer Tools':
      return 'from-amber-500 to-orange-600';
    default:
      return 'from-gray-500 to-zinc-600';
  }
};

// Function to render the appropriate icon SVG
const renderIcon = (iconName) => {
  switch(iconName) {
    case 'brain':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454Z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m17.25 12 .25.036a11.249 11.249 0 0 1-1.764-.844" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.208 14.608 .232-.218a8.973 8.973 0 0 0 2.363-5.227" />
        </svg>
      );
    case 'flask-vial':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19.5 14.5M9.75 3.186c-.177.011-.348.03-.525.055m0 0a50.763 50.763 0 0 0-2.25.3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75V21a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-8.25M9 12.75h6M9 12.75a.75.75 0 0 0-.75.75M15 12.75a.75.75 0 0 1 .75.75" />
        </svg>
      );
    case 'code':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      );
    case 'heart-pulse':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      );
    case 'app-window':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
        </svg>
      );
    case 'image':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      );
    case 'code-branch':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
        </svg>
      );
    case 'sparkles':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      );
  }
};

const NewsDetailPage = ({ articleId }) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  
  // Load the specific article data with improved stability
  useEffect(() => {
    // Start with loading state
    setLoading(true);
    setError(null);
    
    // Try loading from localStorage first for speed
    try {
      const savedNews = localStorage.getItem('news_data');
      if (savedNews) {
        try {
          const articles = JSON.parse(savedNews);
          processArticleData(articles);
          return; // Exit early if loaded from localStorage
        } catch (e) {
          console.error("Error parsing saved news from localStorage:", e);
          // Continue to load from file
        }
      }
      
      // Fall back to fetching directly from the public data path
      fetch('/data/news_data.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch article data: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("Fetched article data successfully:", data);
          processArticleData(data);
        })
        .catch(err => {
          console.error("Error fetching article data:", err);
          
          // Fallback to preset examples with verified URLs
          const fallbackData = getExampleArticles();
          
          // Process article data with the hardcoded fallback
          const foundArticle = fallbackData.find(a => a.id === articleId);
          if (foundArticle) {
            processArticleData(fallbackData);
          } else {
            setError(`Article with ID "${articleId}" not found.`);
            setLoading(false);
          }
        });
    } catch (error) {
      console.error("Error in news article loading:", error);
      setError("Failed to load article data. Please try again later.");
      setLoading(false);
    }
  }, [articleId]);
  
  // Process article data consistently
  const processArticleData = (data) => {
    try {
      // First attempt to find by exact ID match
      let found = data.find(a => a.id === articleId);
      
      // If not found, try with case-insensitive match
      if (!found) {
        found = data.find(a => a.id && a.id.toLowerCase() === articleId.toLowerCase());
      }
      
      // If still not found, try with normalized ID (spaces to dashes)
      if (!found) {
        found = data.find(a => 
          a.id && a.id.toLowerCase().replace(/\s+/g, '-') === articleId.toLowerCase()
        );
      }
      
      if (found) {
        // Use the utility to validate and fix URLs
        const validatedArticle = validateArticle(found);
        
        // Add icon and color based on category if not already present
        if (!validatedArticle.image_icon) {
          validatedArticle.image_icon = getCategoryIcon(validatedArticle.category);
        }
        if (!validatedArticle.image_color) {
          validatedArticle.image_color = getCategoryColor(validatedArticle.category);
        }
        
        // Set the article
        setArticle(validatedArticle);
        
        // Find related articles with the same category or tags
        const related = data
          .filter(a => a.id !== articleId)
          .filter(a => a.category === found.category || 
            (a.tags && found.tags && a.tags.some(tag => found.tags.includes(tag))))
          .slice(0, 3);
        
        // Ensure related articles have icons and colors and valid URLs
        const relatedWithIcons = related.map(a => ({
          ...a,
          image_icon: a.image_icon || getCategoryIcon(a.category),
          image_color: a.image_color || getCategoryColor(a.category),
          source_url: validateUrl(a.source_url) || '#',
          full_article_url: validateUrl(a.full_article_url) || validateUrl(a.source_url) || '#'
        }));
        
        setRelatedArticles(relatedWithIcons);
        setError(null);
      } else {
        setError(`Article with ID "${articleId}" not found.`);
      }
      
      // Complete loading
      setLoading(false);
    } catch (error) {
      console.error("Error processing article data:", error);
      setError("Failed to process article data. Please try again later.");
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div className="text-center max-w-md bg-zinc-800/50 p-8 rounded-lg border border-zinc-700">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <a 
            href="#/news"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
          >
            Back to News
          </a>
        </div>
      </div>
    );
  }
  
  if (!article) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 pb-16">
      {/* Navigation */}
      <div className="mb-6">
        <a 
          href="#/news" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </a>
      </div>
      
      {/* Article header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <span className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-800">
            {article.category}
          </span>
          <span className="text-gray-400 text-sm">
            {formatDate(article.date)}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {article.title}
        </h1>
        
        <div className="text-gray-400 text-sm mb-6 flex items-center">
          <span>Source: </span>
          <a 
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 ml-1"
          >
            {article.source}
          </a>
        </div>
      </div>
      
      {/* Featured image - Using themed icons */}
      <div className="mb-8 rounded-lg overflow-hidden shadow-xl">
        <div className={`w-full h-64 bg-gradient-to-br ${article.image_color || getCategoryColor(article.category)} flex items-center justify-center`}>
          <div className="text-white">
            {renderIcon(article.image_icon || getCategoryIcon(article.category))}
          </div>
        </div>
      </div>
      
      {/* Article content */}
      <div className="max-w-4xl mx-auto">
        <div className="prose prose-invert prose-lg max-w-none mb-8">
          <p className="text-xl leading-relaxed mb-6">{article.summary}</p>
          
          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700 mb-8">
            <p className="text-gray-300">This is a summary of the full article. For complete details, please visit the source website:</p>
            <a 
              href={article.full_article_url || article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
            >
              Read Full Article
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold text-white mb-3">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span key={index} className="bg-zinc-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(relArticle => (
                <div key={relArticle.id} className="bg-zinc-800 rounded-lg overflow-hidden shadow-md border border-zinc-700 hover:border-purple-500/50 transition-all duration-300">
                  <a href={`#/news/${relArticle.id}`} className="block">
                    {/* Themed icon for related article */}
                    <div className={`w-full h-40 bg-gradient-to-br ${relArticle.image_color || getCategoryColor(relArticle.category)} flex items-center justify-center`}>
                      <div className="text-white">
                        {renderIcon(relArticle.image_icon || getCategoryIcon(relArticle.category))}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-white font-bold mb-2 line-clamp-2">{relArticle.title}</h4>
                      <p className="text-gray-400 text-sm line-clamp-2">{relArticle.summary}</p>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-700">
                        <span className="text-xs text-gray-500">{formatDate(relArticle.date)}</span>
                        <span className="text-purple-400 text-sm">Read more</span>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetailPage;