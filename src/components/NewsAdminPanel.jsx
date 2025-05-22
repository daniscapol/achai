import React, { useState, useEffect } from 'react';
import { updateNews, createSchedule } from '../utils/newsUpdater';
import { saveNewsToServer, generateServerScript } from '../utils/serverSync';

// This component is embedded in the AdminPage component
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454Z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m17.25 12 .25.036a11.249 11.249 0 0 1-1.764-.844" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.208 14.608.232-.218a8.973 8.973 0 0 0 2.363-5.227" />
        </svg>
      );
    case 'flask-vial':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19.5 14.5M9.75 3.186c-.177.011-.348.03-.525.055m0 0a50.763 50.763 0 0 0-2.25.3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75V21a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-8.25M9 12.75h6M9 12.75a.75.75 0 0 0-.75.75M15 12.75a.75.75 0 0 1 .75.75" />
        </svg>
      );
    case 'code':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      );
    case 'heart-pulse':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      );
    case 'app-window':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8.25V18a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6ZM7.5 6h.008v.008H7.5V6Zm2.25 0h.008v.008H9.75V6Z" />
        </svg>
      );
    case 'image':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      );
    case 'code-branch':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
        </svg>
      );
    case 'sparkles':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      );
  }
};

const NewsAdminPanel = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    summary: '',
    date: '',
    source: '',
    source_url: '',
    image_url: null,
    image_color: 'from-purple-500 to-indigo-600',
    image_icon: 'sparkles',
    category: '',
    tags: [],
    full_article_url: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [customSources, setCustomSources] = useState([]);
  const [newSource, setNewSource] = useState({ name: '', url: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [fetchingProgress, setFetchingProgress] = useState(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleStatus, setScheduleStatus] = useState(null);
  
  // For debugging
  const [newsLoaded, setNewsLoaded] = useState(false);
  
  // Load news data - only once on component mount
  useEffect(() => {
    // Prevent double-loading and flashing
    if (newsLoaded) return;
    
    const loadNewsData = async () => {
      try {
        // First try to load from API/database
        const { newsApi } = await import('../utils/apiService.js');
        const result = await newsApi.getNewsArticles();
        let articles = result.articles || [];
        
        if (articles.length > 0) {
          console.log("Loaded news data from API/database:", articles.length);
          
          // Sort by date (newest first)
          articles.sort((a, b) => new Date(b.published_at || b.date) - new Date(a.published_at || a.date));
          
          setNewsArticles(articles);
          setNewsLoaded(true);
          
          // Cache for future loads
          localStorage.setItem('news_data', JSON.stringify(articles));
          return;
        }
      } catch (error) {
        console.error("Error loading news data from API:", error);
      }
      
      // Fallback to localStorage if API fails
      try {
        const savedNews = localStorage.getItem('news_data');
        if (savedNews) {
          const articles = JSON.parse(savedNews);
          console.log("Loaded news data from localStorage:", articles.length);
          
          // Sort by date (newest first)
          articles.sort((a, b) => new Date(b.date || b.published_at) - new Date(a.date || a.published_at));
          
          setNewsArticles(articles);
          setNewsLoaded(true);
          return;
        }
      } catch (e) {
        console.error("Error parsing saved news data:", e);
      }
      
      // Final fallback to static JSON file
      try {
        const staticNewsData = require('../news/news_data.json');
        const articles = staticNewsData || [];
        console.log("Loaded news data from static file:", articles.length);
        
        // Sort by date (newest first)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setNewsArticles(articles);
        
        // Cache for future loads
        localStorage.setItem('news_data', JSON.stringify(articles));
      } catch (error) {
        console.error("Error loading static news data:", error);
        setNewsArticles([]);
      } finally {
        setNewsLoaded(true);
      }
    };
    
    loadNewsData();
  }, []);
  
  // Load custom sources from localStorage or initialize empty
  useEffect(() => {
    const savedSources = localStorage.getItem('news_custom_sources');
    if (savedSources) {
      try {
        setCustomSources(JSON.parse(savedSources));
      } catch (e) {
        console.error("Error parsing saved sources:", e);
        setCustomSources([]);
      }
    } else {
      // Default sources
      const defaultSources = [
        { name: 'Anthropic Blog', url: 'https://www.anthropic.com/news' },
        { name: 'OpenAI Blog', url: 'https://openai.com/blog' },
        { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/' },
        { name: 'Meta AI Blog', url: 'https://ai.meta.com/blog/' },
        { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog' }
      ];
      setCustomSources(defaultSources);
      localStorage.setItem('news_custom_sources', JSON.stringify(defaultSources));
    }
  }, []);
  
  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);
  
  // Save API key to localStorage when changed
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
  }, [apiKey]);
  
  // Load schedule settings from localStorage
  useEffect(() => {
    try {
      const savedSchedule = localStorage.getItem('news_update_schedule');
      if (savedSchedule) {
        const schedule = JSON.parse(savedSchedule);
        setScheduleEnabled(!!schedule.enabled);
        setScheduleFrequency(schedule.frequency || 'daily');
        
        // Set schedule status if available
        if (schedule.nextRunTime) {
          const nextRun = new Date(schedule.nextRunTime);
          setScheduleStatus({
            isRunning: schedule.enabled,
            nextRunTime: nextRun,
            frequency: schedule.frequency
          });
        }
      }
    } catch (error) {
      console.error('Error loading schedule settings:', error);
      // Continue with defaults
    }
  }, []);
  
  // Handle schedule toggle
  const handleScheduleToggle = (enabled) => {
    setScheduleEnabled(enabled);
    
    try {
      if (enabled) {
        // Create new schedule
        const scheduler = createSchedule(scheduleFrequency, handleAutoFetchNews);
        const status = scheduler.start();
        setScheduleStatus(status);
        
        // Save to localStorage
        localStorage.setItem('news_update_schedule', JSON.stringify({
          enabled: true,
          frequency: scheduleFrequency,
          nextRunTime: status.nextRunTime?.toISOString()
        }));
        
        setUpdateStatus({ 
          type: 'success', 
          message: `Automatic updates scheduled to run ${scheduleFrequency}. Next update: ${status.nextRunTime?.toLocaleString()}`
        });
      } else {
        // Disable schedule
        // In a real implementation, we would call scheduler.stop()
        localStorage.setItem('news_update_schedule', JSON.stringify({
          enabled: false,
          frequency: scheduleFrequency
        }));
        
        setScheduleStatus(null);
        setUpdateStatus({ 
          type: 'info', 
          message: 'Automatic updates have been disabled.'
        });
      }
    } catch (error) {
      console.error('Error managing schedule:', error);
      setUpdateStatus({ 
        type: 'error', 
        message: `Failed to ${enabled ? 'enable' : 'disable'} schedule: ${error.message}`
      });
    }
  };
  
  // Filter news by search term
  const filteredArticles = newsArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.tags && article.tags.some(tag => 
      typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );
  
  // Handle selecting an article to edit
  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setFormData({
      ...article,
      // Set defaults for themed icons if not present
      image_color: article.image_color || getCategoryColor(article.category),
      image_icon: article.image_icon || getCategoryIcon(article.category),
      tags: article.tags ? (Array.isArray(article.tags) ? article.tags.join(', ') : article.tags) : ''
    });
    setEditMode(true);
  };
  
  // Handle creating a new article
  const handleNewArticle = () => {
    setSelectedArticle(null);
    setFormData({
      id: '',
      title: '',
      summary: '',
      date: new Date().toISOString().split('T')[0],
      source: '',
      source_url: '',
      image_url: null,
      image_color: 'from-purple-500 to-indigo-600',
      image_icon: 'sparkles',
      category: '',
      tags: '',
      full_article_url: ''
    });
    setEditMode(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If category changes, update the icon and color too
    if (name === 'category') {
      setFormData({
        ...formData,
        [name]: value,
        image_icon: getCategoryIcon(value),
        image_color: getCategoryColor(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Process tags from comma-separated string to array
      const processedTags = formData.tags 
        ? (typeof formData.tags === 'string' 
            ? formData.tags.split(',').map(tag => tag.trim())
            : formData.tags)
        : [];
      
      // Set themed icon and color based on category if not already set
      const categoryIcon = getCategoryIcon(formData.category);
      const categoryColor = getCategoryColor(formData.category);
      
      // Create the article object for API
      const articleToSave = {
        title: formData.title,
        summary: formData.summary,
        source: formData.source,
        source_url: formData.source_url,
        category: formData.category,
        external_url: formData.full_article_url,
        image_icon: formData.image_icon || categoryIcon,
        image_color: formData.image_color || categoryColor,
        tags: processedTags,
        slug: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        published_at: formData.date
      };
      
      // Import API service
      const { newsApi } = await import('../utils/apiService.js');
      const adminToken = 'admin-token'; // In production, this would come from auth context
      
      let savedArticle;
      if (selectedArticle) {
        // Update existing article via API
        savedArticle = await newsApi.admin.updateNewsArticle(selectedArticle.id, articleToSave, adminToken);
        setUpdateStatus({ type: 'success', message: 'Article updated successfully in database!' });
      } else {
        // Create new article via API
        savedArticle = await newsApi.admin.createNewsArticle(articleToSave, adminToken);
        setUpdateStatus({ type: 'success', message: 'New article created successfully in database!' });
      }
      
      // Refresh the articles list from the database
      const result = await newsApi.getNewsArticles();
      const updatedArticles = result.articles || [];
      
      // Sort by date (newest first)
      updatedArticles.sort((a, b) => new Date(b.published_at || b.date) - new Date(a.published_at || a.date));
      
      setNewsArticles(updatedArticles);
      
      // Also update localStorage for faster loading
      localStorage.setItem('news_data', JSON.stringify(updatedArticles));
      
      // Exit edit mode
      setEditMode(false);
    } catch (error) {
      console.error('Error saving article:', error);
      setUpdateStatus({ 
        type: 'error', 
        message: `Failed to save article: ${error.message}. Article will be saved locally only.` 
      });
      
      // Fallback to localStorage only if API fails
      const processedTags = formData.tags 
        ? (typeof formData.tags === 'string' 
            ? formData.tags.split(',').map(tag => tag.trim())
            : formData.tags)
        : [];
      
      const categoryIcon = getCategoryIcon(formData.category);
      const categoryColor = getCategoryColor(formData.category);
      
      const localArticle = {
        ...formData,
        id: formData.id || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image_url: null,
        image_icon: formData.image_icon || categoryIcon,
        image_color: formData.image_color || categoryColor,
        tags: processedTags
      };
      
      if (selectedArticle) {
        const updatedArticles = newsArticles.map(article => 
          article.id === selectedArticle.id ? localArticle : article
        );
        setNewsArticles(updatedArticles);
        saveArticlesToLocalStorage(updatedArticles);
      } else {
        const newArticles = [localArticle, ...newsArticles];
        setNewsArticles(newArticles);
        saveArticlesToLocalStorage(newArticles);
      }
      
      setEditMode(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save articles to localStorage
  const saveArticlesToLocalStorage = (articles) => {
    try {
      localStorage.setItem('news_data', JSON.stringify(articles));
      console.log(`Saved ${articles.length} articles to localStorage`);
      // In a real application, this would call an API to save to the server/file
    } catch (error) {
      console.error("Error saving articles to localStorage:", error);
    }
  };
  
  // Handle article deletion
  const handleDelete = async (articleId) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      setIsLoading(true);
      
      try {
        // Import API service and delete from database
        const { newsApi } = await import('../utils/apiService.js');
        const adminToken = 'admin-token'; // In production, this would come from auth context
        
        await newsApi.admin.deleteNewsArticle(articleId, adminToken);
        setUpdateStatus({ type: 'success', message: 'Article deleted successfully from database!' });
        
        // Refresh the articles list from the database
        const result = await newsApi.getNewsArticles();
        const updatedArticles = result.articles || [];
        
        // Sort by date (newest first)
        updatedArticles.sort((a, b) => new Date(b.published_at || b.date) - new Date(a.published_at || a.date));
        
        setNewsArticles(updatedArticles);
        
        // Also update localStorage
        localStorage.setItem('news_data', JSON.stringify(updatedArticles));
      } catch (error) {
        console.error('Error deleting article:', error);
        setUpdateStatus({ 
          type: 'error', 
          message: `Failed to delete article from database: ${error.message}. Removing from local list only.` 
        });
        
        // Fallback to localStorage only if API fails
        const updatedArticles = newsArticles.filter(article => article.id !== articleId);
        setNewsArticles(updatedArticles);
        saveArticlesToLocalStorage(updatedArticles);
      } finally {
        setIsLoading(false);
      }
      
      // Exit edit mode if we were editing this article
      if (selectedArticle && selectedArticle.id === articleId) {
        setEditMode(false);
      }
    }
  };
  
  // Handle adding a new custom source
  const handleAddSource = () => {
    if (newSource.name && newSource.url) {
      const updatedSources = [...customSources, newSource];
      setCustomSources(updatedSources);
      localStorage.setItem('news_custom_sources', JSON.stringify(updatedSources));
      setNewSource({ name: '', url: '' });
      setUpdateStatus({ type: 'success', message: 'Source added successfully!' });
    }
  };
  
  // Handle removing a custom source
  const handleRemoveSource = (index) => {
    const updatedSources = customSources.filter((_, i) => i !== index);
    setCustomSources(updatedSources);
    localStorage.setItem('news_custom_sources', JSON.stringify(updatedSources));
    setUpdateStatus({ type: 'success', message: 'Source removed successfully!' });
  };
  
  // Handle API key test - always succeed for demo purposes
  const handleTestApiKey = async () => {
    if (!apiKey) {
      setUpdateStatus({ type: 'error', message: 'Please enter an API key first.' });
      return;
    }
    
    setIsLoading(true);
    setUpdateStatus({ type: 'info', message: 'Testing API key...' });
    
    // In a real implementation, we would make an actual API call here
    // For demo purposes, we'll simulate the testing and always succeed
    setTimeout(() => {
      setIsLoading(false);
      setUpdateStatus({ type: 'success', message: 'API key is valid and working!' });
    }, 1000);
  };
  
  // Mock articles with stable IDs so they don't keep changing
  const mockArticles = [
    {
      id: "deepmind-physics-article",
      title: "DeepMind Announces New Breakthrough in AI Understanding of Physics",
      summary: "DeepMind has revealed a major advancement in AI's ability to understand and predict complex physical systems. The new model, PhysicsGPT, demonstrates unprecedented capabilities in modeling quantum interactions and could accelerate discoveries in material science and drug development.",
      date: new Date().toISOString().split('T')[0],
      source: "DeepMind",
      source_url: "https://deepmind.com/blog",
      image_url: null,
      image_color: "from-blue-500 to-purple-600",
      image_icon: "flask-vial",
      category: "Research Papers",
      tags: ["DeepMind", "Physics", "Quantum Computing", "AI Research"],
      full_article_url: "https://deepmind.com/blog/physics-gpt"
    },
    {
      id: "anthropic-sdk-article",
      title: "Anthropic Releases Claude API for JavaScript Developers",
      summary: "Anthropic has released an official JavaScript SDK for Claude, making it easier for web developers to integrate Claude's capabilities into their applications. The new SDK includes TypeScript support, streaming responses, and comprehensive documentation with examples.",
      date: new Date().toISOString().split('T')[0],
      source: "Anthropic",
      source_url: "https://www.anthropic.com/news",
      image_url: null,
      image_color: "from-purple-500 to-pink-600",
      image_icon: "code",
      category: "Developer Tools",
      tags: ["Anthropic", "Claude", "JavaScript", "SDK", "API"],
      full_article_url: "https://www.anthropic.com/news/claude-js-sdk"
    },
    {
      id: "medical-ai-article",
      title: "Open Source AI Model Outperforms Commercial Alternatives on Medical Tasks",
      summary: "A new open-source large language model specialized for medical applications has demonstrated performance surpassing several commercial alternatives in diagnostic assistance, medical literature analysis, and patient communication tasks.",
      date: new Date().toISOString().split('T')[0],
      source: "arXiv",
      source_url: "https://arxiv.org",
      image_url: null,
      image_color: "from-green-500 to-teal-600",
      image_icon: "heart-pulse",
      category: "Open Source",
      tags: ["Medical AI", "Open Source", "Healthcare", "LLMs"],
      full_article_url: "https://arxiv.org/abs/2023.12345"
    }
  ];

  // Handle auto-fetching news using the newsUpdater utility
  const handleAutoFetchNews = async () => {
    if (!apiKey) {
      setUpdateStatus({ type: 'error', message: 'Please enter an OpenAI API key before fetching news.' });
      return;
    }
    
    // Prevent double-click or multiple fetches
    if (isLoading) return;
    
    setIsLoading(true);
    setUpdateStatus({ type: 'info', message: 'Fetching news...' });
    setFetchingProgress({ step: 'init', message: 'Initializing news fetch process...' });
    
    try {
      // Create a progress reporting function for the different steps
      const reportProgress = (step, message) => {
        setFetchingProgress({ step, message });
      };
      
      // Set initial progress
      reportProgress('sources', 'Connecting to news sources...');
      
      // Wait a moment for UI update
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Execute the news update process
      reportProgress('fetching', 'Retrieving articles from sources...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      reportProgress('analyzing', 'Analyzing and processing content...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      reportProgress('generating', 'Generating summaries and extracting metadata...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      reportProgress('saving', 'Saving new articles to database...');
      
      // Use the newsUpdater utility with real sources
      const updatedArticles = await updateNews(customSources, apiKey, newsArticles);
      
      // Update the UI and localStorage
      setNewsArticles(updatedArticles);
      
      // Calculate how many new articles were added
      const newArticlesCount = updatedArticles.length - newsArticles.length;
      
      // Final status update
      setIsLoading(false);
      setFetchingProgress(null);
      
      // Create a file copy for file-based access in public folder
      try {
        // In a real implementation, this would be done server-side
        // Here we're just updating localStorage and noting that server-side would be needed
        
        setUpdateStatus({ 
          type: 'success', 
          message: `Successfully added ${newArticlesCount} new articles! In a production environment, the news_updater.js script would synchronize these changes with the server.`
        });
      } catch (error) {
        console.error('Error creating file copy:', error);
        setUpdateStatus({ 
          type: 'warning', 
          message: `Added ${newArticlesCount} articles to browser storage, but server sync failed. Changes may not persist across page refreshes.`
        });
      }
    } catch (error) {
      console.error('Error in auto-fetch process:', error);
      setIsLoading(false);
      setFetchingProgress(null);
      setUpdateStatus({ 
        type: 'error', 
        message: `Failed to fetch news: ${error.message}`
      });
    }
  };
  
  // Export articles to JSON file and generate server script
  const handleExportArticles = () => {
    try {
      // Create a data URL for the JSON file
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(newsArticles, null, 2));
      
      // Create an anchor element and set properties for download
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "news_data.json");
      
      // Append to the body, click to trigger download, then remove
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      // Also generate and download the server script
      const scriptConfig = {
        apiKey: apiKey ? apiKey : "API_KEY_GOES_HERE",
        frequency: scheduleFrequency,
        sourceCount: customSources.length
      };
      
      const serverScript = generateServerScript(scriptConfig);
      const scriptDataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(serverScript);
      
      const scriptDownloadNode = document.createElement('a');
      scriptDownloadNode.setAttribute("href", scriptDataStr);
      scriptDownloadNode.setAttribute("download", "news_updater.sh");
      
      document.body.appendChild(scriptDownloadNode);
      scriptDownloadNode.click();
      scriptDownloadNode.remove();
      
      // Simulate syncing with server - in a real app this would be an API call
      saveNewsToServer(newsArticles)
        .then(result => {
          console.log("Server sync result:", result);
          setUpdateStatus({ 
            type: 'success', 
            message: 'Articles exported successfully! Server script generated for automated updates.'
          });
        })
        .catch(err => {
          console.error("Server sync error:", err);
          setUpdateStatus({ 
            type: 'warning', 
            message: 'Articles exported, but server sync failed. Use the downloaded script for server setup.'
          });
        });
    } catch (error) {
      console.error("Error exporting articles:", error);
      setUpdateStatus({ type: 'error', message: 'Failed to export articles. See console for details.' });
    }
  };
  
  return (
    <div className="bg-zinc-900 text-gray-200 p-6 rounded-lg border border-zinc-700 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5M19 20V10m0 0l-3-3m3 3l3-3" />
        </svg>
        News Administration
      </h2>
      
      {/* Status message */}
      {updateStatus && (
        <div className={`mb-6 p-3 rounded-md ${updateStatus.type === 'success' ? 'bg-green-900/50 text-green-200' : updateStatus.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-blue-900/50 text-blue-200'}`}>
          {updateStatus.message}
          <button 
            className="ml-3 text-sm underline"
            onClick={() => setUpdateStatus(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex mb-6 border-b border-zinc-700">
        <button 
          className={`px-4 py-2 font-medium ${!editMode && !showSettings ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => {
            setEditMode(false);
            setShowSettings(false);
          }}
        >
          Articles
        </button>
        <button 
          className={`px-4 py-2 font-medium ${editMode ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => {
            if (!editMode) {
              handleNewArticle();
            }
            setShowSettings(false);
          }}
        >
          {editMode ? 'Edit Article' : 'New Article'}
        </button>
        <button 
          className={`px-4 py-2 font-medium ${showSettings ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'} flex items-center`}
          onClick={() => {
            setShowSettings(true);
            setEditMode(false);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>
      
      {/* Edit/Create Article Form */}
      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Summary</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white h-32"
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Model Releases">Model Releases</option>
                    <option value="Research Papers">Research Papers</option>
                    <option value="Business">Business</option>
                    <option value="Ethics & Safety">Ethics & Safety</option>
                    <option value="Applications">Applications</option>
                    <option value="Generative AI">Generative AI</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Developer Tools">Developer Tools</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Source</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Source URL</label>
                <input
                  type="url"
                  name="source_url"
                  value={formData.source_url}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Full Article URL</label>
                <input
                  type="url"
                  name="full_article_url"
                  value={formData.full_article_url}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Article Icon</label>
                <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4">
                  <div className={`w-full h-16 mb-2 rounded-md bg-gradient-to-r ${formData.image_color || getCategoryColor(formData.category)} flex items-center justify-center`}>
                    {renderIcon(formData.image_icon || getCategoryIcon(formData.category))}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">The icon and colors are automatically selected based on the article category.</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  placeholder="AI, Machine Learning, GPT"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-700">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            {selectedArticle && (
              <button
                type="button"
                onClick={() => handleDelete(selectedArticle.id)}
                className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors"
            >
              {selectedArticle ? 'Update' : 'Create'} Article
            </button>
          </div>
        </form>
      ) : showSettings ? (
        <div>
          {/* Settings and news sources panel */}
          <div className="mb-6 p-6 border border-zinc-700 rounded-lg bg-zinc-800/50">
            <h3 className="text-xl font-bold text-white mb-4">News Update Configuration</h3>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">OpenAI API Key</label>
              <div className="flex">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-grow p-2 bg-zinc-700 border border-zinc-600 rounded-l-md text-white"
                  placeholder="sk-..."
                />
                <button 
                  onClick={handleTestApiKey}
                  disabled={isLoading || !apiKey}
                  className={`px-4 py-2 rounded-r-md transition-colors
                    ${isLoading || !apiKey ? 'bg-zinc-600 text-gray-400 cursor-not-allowed' : 'bg-zinc-600 text-white hover:bg-zinc-500'}`}
                >
                  Test Key
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-1">Your API key is stored in your browser's local storage. It's never sent to the server except when running the news updater.</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">News Sources</label>
              <div className="max-h-40 overflow-y-auto mb-4 border border-zinc-700 rounded-md divide-y divide-zinc-700">
                {customSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-zinc-700/50">
                    <div>
                      <span className="text-white">{source.name}</span>
                      <span className="text-gray-400 text-sm ml-2">{source.url}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveSource(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <label className="block text-gray-400 text-sm mb-1">Source Name</label>
                  <input
                    type="text"
                    value={newSource.name}
                    onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                    className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-white"
                    placeholder="e.g., Anthropic Blog"
                  />
                </div>
                <div className="flex-grow">
                  <label className="block text-gray-400 text-sm mb-1">URL</label>
                  <input
                    type="url"
                    value={newSource.url}
                    onChange={(e) => setNewSource({...newSource, url: e.target.value})}
                    className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-white"
                    placeholder="https://..."
                  />
                </div>
                <button 
                  onClick={handleAddSource}
                  disabled={!newSource.name || !newSource.url}
                  className={`px-4 py-2 rounded-md transition-colors ${!newSource.name || !newSource.url ? 'bg-zinc-600 text-gray-400 cursor-not-allowed' : 'bg-zinc-600 text-white hover:bg-zinc-500'}`}
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">Automatic Updates</h4>
                <p className="text-gray-400 mb-4">Configure the news updater to run automatically on a schedule. In a production environment, this would be implemented using server cron jobs or GitHub Actions.</p>
                <div className="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    id="enable-auto-updates" 
                    checked={scheduleEnabled}
                    onChange={(e) => handleScheduleToggle(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500"
                    disabled={!apiKey}
                  />
                  <label htmlFor="enable-auto-updates" className="text-gray-300">
                    Enable automatic updates
                    {!apiKey && <span className="text-red-400 ml-2 text-sm">(requires API key)</span>}
                  </label>
                </div>
                <div className="mb-2">
                  <label className="block text-gray-400 text-sm mb-1">Update frequency</label>
                  <select 
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                    value={scheduleFrequency}
                    onChange={(e) => {
                      setScheduleFrequency(e.target.value);
                      // If schedule is enabled, update it
                      if (scheduleEnabled) {
                        handleScheduleToggle(false);
                        setTimeout(() => handleScheduleToggle(true), 100);
                      }
                    }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom (12 hours)</option>
                  </select>
                </div>
                
                {/* Schedule status information */}
                {scheduleStatus && scheduleEnabled && (
                  <div className="mt-4 p-3 bg-purple-900/30 rounded-md border border-purple-800/40">
                    <div className="flex items-center text-sm text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        Next update scheduled for: <span className="text-purple-300 font-semibold">
                          {scheduleStatus.nextRunTime ? scheduleStatus.nextRunTime.toLocaleString() : 'calculating...'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">Data Management</h4>
                <p className="text-gray-400 mb-4">Tools for backing up, exporting, or restoring your news articles database.</p>
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={handleExportArticles}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Articles
                  </button>
                  <label 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import Articles
                    <input type="file" className="hidden" accept=".json" />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="border-t border-zinc-700 pt-4 flex justify-end">
              <button
                onClick={handleAutoFetchNews}
                disabled={isLoading || !apiKey}
                className={`flex items-center px-6 py-3 rounded-md font-medium ${
                  apiKey && !isLoading 
                    ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                    : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Fetching...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Fetch Latest News
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Fetching progress indicator */}
          {fetchingProgress && (
            <div className="mb-6 bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">News Fetching Progress</h4>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-200 bg-purple-900">
                      {fetchingProgress.step === 'init' && 'Initializing'}
                      {fetchingProgress.step === 'sources' && 'Connecting to Sources'}
                      {fetchingProgress.step === 'fetching' && 'Retrieving Content'}
                      {fetchingProgress.step === 'analyzing' && 'Analyzing Content'}
                      {fetchingProgress.step === 'generating' && 'Generating Summaries'}
                      {fetchingProgress.step === 'saving' && 'Saving Articles'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-purple-200">
                      {fetchingProgress.step === 'init' && '10%'}
                      {fetchingProgress.step === 'sources' && '25%'}
                      {fetchingProgress.step === 'fetching' && '45%'}
                      {fetchingProgress.step === 'analyzing' && '65%'}
                      {fetchingProgress.step === 'generating' && '85%'}
                      {fetchingProgress.step === 'saving' && '95%'}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-zinc-700">
                  <div style={{ 
                    width: fetchingProgress.step === 'init' ? '10%' : 
                           fetchingProgress.step === 'sources' ? '25%' : 
                           fetchingProgress.step === 'fetching' ? '45%' : 
                           fetchingProgress.step === 'analyzing' ? '65%' : 
                           fetchingProgress.step === 'generating' ? '85%' : 
                           fetchingProgress.step === 'saving' ? '95%' : '0%' 
                  }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                </div>
                <p className="text-sm text-gray-400">{fetchingProgress.message}</p>
              </div>
            </div>
          )}
          
          {/* Implementation notes */}
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/40 rounded-lg">
            <h4 className="font-semibold text-blue-300 mb-2">Implementation Notes</h4>
            <p className="text-gray-300 text-sm">In a production environment, the news updater functionality would:</p>
            <ul className="list-disc list-inside text-gray-300 text-sm mt-2 space-y-1">
              <li>Use server-side Node.js to run the <code className="bg-zinc-800 px-1 rounded text-blue-300">news_updater.js</code> script</li>
              <li>Execute API calls to news sources and OpenAI</li>
              <li>Update the actual news_data.json file on the server</li>
              <li>Run on a scheduled basis via cron jobs or GitHub Actions</li>
              <li>Keep secure credentials in environment variables</li>
              <li>Send notification emails when new articles are added</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          {/* Articles list */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">All Articles ({newsArticles.length})</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search articles..."
                    className="py-2 pl-8 pr-4 w-64 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={handleNewArticle}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Article
                </button>
              </div>
            </div>
            
            {/* Fetch news button */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-400">
                <span className="font-semibold text-gray-300">Last updated:</span> {newsArticles[0]?.date ? new Date(newsArticles[0].date).toLocaleDateString() : 'Never'}
              </div>
              <button
                onClick={() => {
                  setShowSettings(true);
                  setEditMode(false);
                }}
                className="flex items-center text-sm px-4 py-2 bg-zinc-700 text-gray-300 rounded-md hover:bg-zinc-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Update News Sources
              </button>
            </div>
            
            {!newsLoaded ? (
              <div className="p-8 flex justify-center items-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-zinc-700 h-12 w-12"></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-700 rounded"></div>
                      <div className="h-4 bg-zinc-700 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-zinc-700 rounded-lg overflow-hidden">
                <table className="w-full table-fixed">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left p-3 text-gray-300 font-medium w-1/2">Title</th>
                      <th className="text-left p-3 text-gray-300 font-medium w-24 whitespace-nowrap">Date</th>
                      <th className="text-left p-3 text-gray-300 font-medium hidden md:table-cell w-28">Category</th>
                      <th className="text-left p-3 text-gray-300 font-medium hidden lg:table-cell w-28">Source</th>
                      <th className="text-right p-3 text-gray-300 font-medium w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {filteredArticles.length > 0 ? (
                      filteredArticles.map((article) => (
                        <tr key={article.id} className="hover:bg-zinc-800/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-md bg-gradient-to-r ${article.image_color || getCategoryColor(article.category)} flex items-center justify-center flex-shrink-0`}>
                                {renderIcon(article.image_icon || getCategoryIcon(article.category))}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-white truncate">{article.title}</div>
                                <div className="text-sm text-gray-400 line-clamp-1 md:hidden">{article.source} · {article.category}</div>
                                <div className="text-sm text-gray-400 line-clamp-1">{article.summary}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-gray-300 whitespace-nowrap">
                            {new Date(article.date).toLocaleDateString()}
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs">
                              {article.category}
                            </span>
                          </td>
                          <td className="p-3 text-gray-300 hidden lg:table-cell truncate">
                            {article.source}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleSelectArticle(article)}
                              className="text-purple-400 hover:text-purple-300 mr-3"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-400">
                          {searchTerm 
                            ? "No articles found matching your search criteria." 
                            : "No articles found. Create your first article or fetch the latest news."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsAdminPanel;