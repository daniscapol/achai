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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454Z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m17.25 12 .25.036a11.249 11.249 0 0 1-1.764-.844" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.208 14.608.232-.218a8.973 8.973 0 0 0 2.363-5.227" />
        </svg>
      );
    case 'flask-vial':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19.5 14.5M9.75 3.186c-.177.011-.348.03-.525.055m0 0a50.763 50.763 0 0 0-2.25.3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75V21a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-8.25M9 12.75h6M9 12.75a.75.75 0 0 0-.75.75M15 12.75a.75.75 0 0 1 .75.75" />
        </svg>
      );
    case 'code':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      );
    case 'heart-pulse':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      );
    case 'app-window':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
        </svg>
      );
    case 'image':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      );
    case 'code-branch':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
        </svg>
      );
    case 'sparkles':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      );
  }
};

const NewsCard = ({ article }) => {
  const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get color and icon based on category
  const cardColor = article.image_color || getCategoryColor(article.category);
  const cardIcon = article.image_icon || getCategoryIcon(article.category);

  // Calculate days since publication for "New" badge
  const daysSincePublication = Math.floor((new Date() - new Date(article.date)) / (1000 * 60 * 60 * 24));
  const isNew = daysSincePublication < 7; // Show "New" badge for articles less than 7 days old

  return (
    <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-xl border border-zinc-700 hover:border-purple-500/50 hover:shadow-purple-500/10 hover:shadow-2xl transition-all duration-300 h-full flex flex-col group">
      {/* Article image with animated gradient on hover */}
      <div className="relative h-56 overflow-hidden">
        <div className={`w-full h-full bg-gradient-to-br ${cardColor} flex items-center justify-center transition-transform duration-700 group-hover:scale-110`}>
          <div className="text-white transition-all duration-500 transform group-hover:scale-125">
            {renderIcon(cardIcon)}
          </div>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-800/90"></div>
        
        {/* Category and "New" badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {article.category && (
            <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium">
              {article.category}
            </div>
          )}
          {isNew && (
            <div className="bg-purple-600 px-3 py-1 rounded-full text-xs text-white font-bold animate-pulse">
              New
            </div>
          )}
        </div>
        
        {/* Source badge in top left */}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          {article.source}
        </div>
      </div>
      
      {/* Article content */}
      <div className="p-6 flex-grow flex flex-col relative -mt-10 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">{article.title}</h3>
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">{article.summary}</p>
          </div>
        </div>
        
        {/* Tags with hover effect */}
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {article.tags && article.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-zinc-700/70 hover:bg-purple-700/50 text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-colors duration-200">
              {tag}
            </span>
          ))}
          {article.tags && article.tags.length > 3 && (
            <span className="text-xs bg-zinc-700/70 hover:bg-purple-700/50 text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-colors duration-200">
              +{article.tags.length - 3}
            </span>
          )}
        </div>
        
        {/* Metadata footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-700/50">
          <div className="flex items-center text-sm text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          
          {/* Read time estimate */}
          <div className="text-sm text-gray-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {/* Estimate reading time based on word count (avg reading speed 200 words/min) */}
            {Math.max(1, Math.ceil(article.summary.split(' ').length / 200))} min read
          </div>
        </div>
      </div>
      
      {/* Read More button with hover animation */}
      <div className="p-5 pt-0">
        <a 
          href={article.id ? `#/news/${article.id}` : '#/news'}
          onClick={(e) => {
            // Prevent navigation if no valid ID
            if (!article.id) {
              e.preventDefault();
              console.error("Article has no valid ID", article);
              return false;
            }
          }}
          className="block w-full bg-purple-600 hover:bg-purple-500 text-white text-center py-3 rounded-md transition-all duration-300 group-hover:translate-y-0 translate-y-0 flex items-center justify-center"
        >
          <span>Read Article</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

const NewsPage = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Load news data from API
  useEffect(() => {
    // Prevents flickering by setting loading state
    setIsLoading(true);
    
    const fetchNewsData = async () => {
      try {
        // Import the API service
        const { newsApi } = await import('../utils/apiService.js');
        
        // Fetch news data
        const result = await newsApi.getNewsArticles();
        const newsData = result.articles || [];
        
        // Process the news data
        processNewsData(newsData);
        
        // Also fetch categories
        try {
          const categoriesData = await newsApi.getNewsCategories();
          if (Array.isArray(categoriesData) && categoriesData.length > 0) {
            setCategories(['All', ...categoriesData]);
          }
        } catch (error) {
          console.error("Error fetching news categories:", error);
        }
      } catch (error) {
        console.error("Error fetching news data from API:", error);
        
        // Try to load from localStorage as fallback
        try {
          const savedNews = localStorage.getItem('news_data');
          if (savedNews) {
            const parsedNews = JSON.parse(savedNews);
            processNewsData(parsedNews);
            return;
          }
        } catch (e) {
          console.error("Error parsing saved news from localStorage:", e);
        }
        
        // Then try loading directly from the public data path
        fetch('/data/news_data.json')
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch news data: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log("Fetched news data successfully from static JSON:", data);
            processNewsData(data);
          })
          .catch(fallbackError => {
            console.error("Error fetching news data from static JSON:", fallbackError);
            
            // Final fallback to preset example data
            const fallbackData = getExampleArticles();
            console.log("Using fallback example news data");
            processNewsData(fallbackData);
          });
      }
    };
    
    fetchNewsData();
  }, []);
  
  // Function to process news data consistently
  const processNewsData = (data) => {
    console.log("Processing news data:", data);
    
    if (!data || !Array.isArray(data)) {
      console.error("Invalid news data format");
      setIsLoading(false);
      return;
    }
    
    // Process the data once to avoid multiple state updates
    try {
      // Validate each article - fix URLs, add fallbacks, etc.
      const validatedArticles = data.map(article => {
        const validated = validateArticle(article);
        
        // Add theme icon and color if not present
        return {
          ...validated,
          image_icon: validated.image_icon || getCategoryIcon(validated.category),
          image_color: validated.image_color || getCategoryColor(validated.category),
          id: validated.id || `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
      });
      
      // Sort articles by date (newest first)
      const sortedArticles = [...validatedArticles].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      // Set article state
      setNewsArticles(sortedArticles);
      setFilteredArticles(sortedArticles);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(sortedArticles.map(article => article.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Save to localStorage for faster loading next time
      // and for NewsAdminPanel integration
      try {
        localStorage.setItem('news_data', JSON.stringify(sortedArticles));
        console.log("Saved news data to localStorage");
        
        // In production, we would also trigger a server update
        if (window.saveNewsToServer) {
          window.saveNewsToServer(sortedArticles)
            .then(() => console.log("Synced news with server"))
            .catch(err => console.warn("Server sync failed:", err));
        }
      } catch (e) {
        console.warn("Could not save news data to localStorage:", e);
      }
      
      // Done loading
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing news data:", error);
      setIsLoading(false);
    }
  };
  
  // Filter news based on search and category using API
  useEffect(() => {
    const filterNews = async () => {
      // Don't attempt filtering during initial loading
      if (isLoading) return;
      
      try {
        // Import the API service
        const { newsApi } = await import('../utils/apiService.js');
        
        // Set temporary loading state for filters
        setIsLoading(true);
        
        if (searchTerm.trim()) {
          // Search news via API
          const result = await newsApi.searchNews(searchTerm);
          let filteredResults = result.articles || [];
          
          // Apply category filter if needed (client-side for combined filtering)
          if (activeCategory !== 'All') {
            filteredResults = filteredResults.filter(article => 
              article.category === activeCategory
            );
          }
          
          setFilteredArticles(filteredResults);
        } 
        else if (activeCategory !== 'All') {
          // Filter by category via API
          const result = await newsApi.filterNewsByCategory(activeCategory);
          setFilteredArticles(result.articles || []);
        } 
        else {
          // No filters, use all news articles
          setFilteredArticles(newsArticles);
        }
      } catch (error) {
        console.error("Error filtering news via API:", error);
        
        // Fallback to client-side filtering if API fails
        let results = newsArticles;
        
        // Apply category filter
        if (activeCategory !== 'All') {
          results = results.filter(article => article.category === activeCategory);
        }
        
        // Apply search filter
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          results = results.filter(article => 
            article.title.toLowerCase().includes(searchLower) ||
            article.summary.toLowerCase().includes(searchLower) ||
            (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchLower)))
          );
        }
        
        setFilteredArticles(results);
      } finally {
        // Always end loading state
        setIsLoading(false);
      }
    };
    
    // Only filter if we have articles loaded
    if (newsArticles.length > 0) {
      filterNews();
    }
  }, [searchTerm, activeCategory, newsArticles, isLoading]);
  
  // Loading skeletons for better UX
  const FeaturedArticleSkeleton = () => (
    <div className="md:col-span-2 xl:col-span-3 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1">
          <div className="aspect-video w-full rounded-lg bg-zinc-700"></div>
        </div>
        <div className="md:col-span-1 flex flex-col justify-center space-y-4">
          <div className="h-4 bg-zinc-700 rounded w-1/3"></div>
          <div className="h-8 bg-zinc-700 rounded w-full"></div>
          <div className="h-4 bg-zinc-700/70 rounded w-full"></div>
          <div className="h-4 bg-zinc-700/70 rounded w-5/6"></div>
          <div className="h-4 bg-zinc-700/70 rounded w-4/6"></div>
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-zinc-700/40 rounded"></div>
            <div className="flex space-x-2">
              <div className="h-6 w-16 bg-zinc-700/50 rounded-full"></div>
              <div className="h-6 w-16 bg-zinc-700/50 rounded-full"></div>
            </div>
          </div>
          <div className="h-12 bg-zinc-700 rounded-md w-48"></div>
        </div>
      </div>
    </div>
  );
  
  const NewsCardSkeleton = () => (
    <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg border border-zinc-700 h-full flex flex-col animate-pulse">
      <div className="h-56 bg-zinc-700"></div>
      <div className="p-6 flex-grow flex flex-col relative -mt-10 z-10">
        <div className="h-7 bg-zinc-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-zinc-700/70 rounded w-full mb-2"></div>
        <div className="h-4 bg-zinc-700/70 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-zinc-700/70 rounded w-4/6 mb-4"></div>
        <div className="flex gap-2 mb-3">
          <div className="h-7 w-20 bg-zinc-700/50 rounded-full"></div>
          <div className="h-7 w-20 bg-zinc-700/50 rounded-full"></div>
        </div>
        <div className="mt-auto pt-4 flex justify-between border-t border-zinc-700/50">
          <div className="h-4 w-24 bg-zinc-700/40 rounded"></div>
          <div className="h-4 w-32 bg-zinc-700/40 rounded"></div>
        </div>
      </div>
      <div className="p-5 pt-0">
        <div className="h-12 bg-zinc-700 rounded-md mt-4"></div>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto p-4 min-h-screen">
      {/* Page header */}
      <div className="my-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          AI <span className="text-purple-400">News & Updates</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Stay informed with the latest developments, breakthroughs, and releases in the world of AI.
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto mb-6">
          <input 
            type="text" 
            placeholder="Search articles by title, content, or tags..." 
            className="w-full p-4 pl-12 bg-zinc-800 border border-zinc-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Clear search button */}
          {searchTerm && !isLoading && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Category filters - rendered even during loading for UI stability */}
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => !isLoading && setActiveCategory(category)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeCategory === category 
                  ? 'bg-purple-600 text-white' 
                  : isLoading
                    ? 'bg-zinc-800/70 text-gray-500 cursor-not-allowed'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Loading state - Shows skeleton instead of empty state */}
      {isLoading ? (
        <>
          {/* Skeleton loading state for results info */}
          <div className="h-5 bg-zinc-800 w-56 rounded mb-4 animate-pulse"></div>
          
          {/* Skeleton loading state for news grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <FeaturedArticleSkeleton />
            
            <div className="col-span-full">
              <div className="border-b border-zinc-700 my-10"></div>
              <div className="h-8 bg-zinc-800 w-56 rounded mb-8 animate-pulse"></div>
            </div>
            
            {[...Array(5)].map((_, index) => (
              <NewsCardSkeleton key={index} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Results info - only shown when not loading */}
          <div className="text-gray-400 text-sm mb-4">
            Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
            {activeCategory !== 'All' && <span> in {activeCategory}</span>}
            {searchTerm && <span> matching "{searchTerm}"</span>}
          </div>
          
          {/* News grid - only shown when not loading */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredArticles.slice(0, 1).map((article, index) => (
                <div key={article.id || index} className="md:col-span-2 xl:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-1">
                      <div className={`aspect-video w-full rounded-lg bg-gradient-to-br ${article.image_color || getCategoryColor(article.category)} flex items-center justify-center`}>
                        <div className="text-white scale-150">
                          {renderIcon(article.image_icon || getCategoryIcon(article.category))}
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-1 flex flex-col justify-center">
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Featured Article</span>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{article.title}</h2>
                      <p className="text-gray-300 mb-4">{article.summary}</p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-400">{new Date(article.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        </div>
                        <div className="flex space-x-2">
                          {article.tags && article.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="bg-zinc-800 text-purple-300 px-3 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <a 
                        href={article.id ? `#/news/${article.id}` : '#/news'}
                        onClick={(e) => {
                          // Prevent navigation if no valid ID
                          if (!article.id) {
                            e.preventDefault();
                            console.error("Article has no valid ID", article);
                            return false;
                          }
                        }}
                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white text-center py-3 px-6 rounded-md transition-all duration-300 inline-flex items-center justify-center"
                      >
                        <span>Read Featured Article</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-span-full">
                <div className="border-b border-zinc-700 my-10"></div>
                <h3 className="text-2xl font-bold text-white mb-8">Latest Articles</h3>
              </div>
              {filteredArticles.slice(1).map((article, index) => (
                <NewsCard key={article.id || index} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-zinc-800/30 rounded-lg border border-zinc-700 mb-12">
              <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5M19 20V10m0 0l-3-3m3 3l3-3" />
              </svg>
              <p className="text-gray-400 text-xl mb-4">No articles found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('All');
                }}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
              >
                Clear filters and try again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPage;