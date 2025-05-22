/**
 * News Updater Utilities
 * 
 * This module provides functions for updating news data, including
 * fetching from sources, scheduling updates, and managing the news database.
 */

import { validateArticle, validateUrl, getFallbackUrl } from './newsUtilities';

/**
 * Updates the news data by fetching from configured sources
 * 
 * @param {Array} sources - Array of news sources to fetch from
 * @param {string} apiKey - OpenAI API key for processing content
 * @param {Array} existingArticles - Existing articles to merge with
 * @returns {Array} - Updated array of news articles
 */
export async function updateNews(sources, apiKey, existingArticles = []) {
  console.log('Updating news with sources:', sources);
  
  if (!sources || !Array.isArray(sources)) {
    console.error('Invalid sources provided to updateNews');
    return existingArticles;
  }
  
  // For demo purposes, we'll generate mock news data
  // In a real implementation, we would fetch from the sources
  const mockNews = [
    {
      id: "anthropic-claude-3-opus",
      title: "Anthropic Releases Claude 3 Opus, Most Powerful Model Yet",
      summary: "Anthropic has released Claude 3 Opus, its most powerful AI model to date. Claude 3 Opus outperforms GPT-4 on multiple benchmarks including reasoning, mathematics, coding, and knowledge. The model features enhanced context understanding, improved reasoning capabilities, and stronger guardrails for safety.",
      date: new Date().toISOString().split('T')[0],
      source: "Anthropic",
      source_url: "https://www.anthropic.com/news",
      image_url: null,
      image_color: "from-purple-500 to-indigo-600",
      image_icon: "brain",
      category: "Model Releases",
      tags: ["Anthropic", "Claude", "Large Language Models", "AI Safety"],
      full_article_url: "https://www.anthropic.com/news/claude-3-family"
    },
    {
      id: "gemini-1-5-pro-launch",
      title: "Google Launches Gemini 1.5 Pro with 1 Million Token Context Window",
      summary: "Google has launched Gemini 1.5 Pro, featuring a groundbreaking 1 million token context window. This massive increase in context capacity allows the model to process and reason across extremely long inputs, including entire codebases, books, or hours of video. Early testers have noted significant improvements in long-context tasks such as document analysis and complex reasoning over extended materials.",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
      source: "Google DeepMind",
      source_url: "https://deepmind.google/blog/",
      image_url: null,
      image_color: "from-indigo-500 to-blue-600",
      image_icon: "brain",
      category: "Model Releases",
      tags: ["Google", "Gemini", "LLMs", "Long Context"],
      full_article_url: "https://deepmind.google/technologies/gemini/1.5/"
    },
    {
      id: "openai-sora-video-generation",
      title: "OpenAI Introduces Sora: Text-to-Video AI Model",
      summary: "OpenAI has unveiled Sora, a new AI model capable of generating realistic and imaginative video from text prompts. Sora can create videos up to 60 seconds long, maintaining visual quality and adherence to the laws of physics. The model demonstrates understanding of complex scenes, multiple characters, specific camera movements, and accurate details of subjects in motion. While currently limited to select researchers and safety testers, Sora represents a significant advance in generative video capabilities.",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
      source: "OpenAI",
      source_url: "https://openai.com/blog",
      image_url: null,
      image_color: "from-pink-500 to-purple-600",
      image_icon: "image",
      category: "Generative AI",
      tags: ["OpenAI", "Text-to-Video", "Generative AI", "Sora"],
      full_article_url: "https://openai.com/sora"
    },
    {
      id: "meta-llama-3-release",
      title: "Meta Releases Llama 3: Open Source LLM with Improved Capabilities",
      summary: "Meta has released Llama 3, the latest version of its open-source large language model family. The new model demonstrates significant improvements in reasoning, coding, and multilingual abilities compared to its predecessors. Available in 8B and 70B parameter sizes, Llama 3 narrows the gap with proprietary models while maintaining Meta's commitment to the open-source AI ecosystem. Researchers and developers can now access the models through Hugging Face or Meta's website.",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
      source: "Meta AI",
      source_url: "https://ai.meta.com/blog/",
      image_url: null,
      image_color: "from-green-500 to-teal-600",
      image_icon: "code-branch",
      category: "Open Source",
      tags: ["Meta", "Llama", "Open Source", "LLMs"],
      full_article_url: "https://ai.meta.com/blog/meta-llama-3/"
    }
  ];
  
  // In a real implementation, we would customize these based on the sources
  // For demo, we'll just use mock data with different dates
  
  // Merge with existing articles, avoiding duplicates
  const existingIds = existingArticles.map(article => article.id);
  const newArticles = mockNews.filter(article => !existingIds.includes(article.id));
  
  // Add all articles
  const mergedArticles = [...newArticles, ...existingArticles];
  
  // Sort by date (newest first)
  mergedArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Validate all articles to ensure proper URLs
  const validatedArticles = mergedArticles.map(validateArticle);
  
  return validatedArticles;
}

/**
 * Creates a scheduler for automatic news updates
 * 
 * @param {string} frequency - Update frequency (daily, weekly, custom)
 * @param {Function} updateFunction - Function to run for updates
 * @returns {Object} - Scheduler object with controls
 */
export function createSchedule(frequency, updateFunction) {
  if (!updateFunction || typeof updateFunction !== 'function') {
    throw new Error('Update function must be provided');
  }
  
  let timer = null;
  let nextRunTime = null;
  
  // Calculate interval based on frequency
  const getIntervalMs = () => {
    switch (frequency) {
      case 'daily':
        return 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'custom':
      default:
        return 12 * 60 * 60 * 1000; // 12 hours
    }
  };
  
  // Initialize next run time
  const calculateNextRunTime = () => {
    return new Date(Date.now() + getIntervalMs());
  };
  
  // Start scheduler
  const start = () => {
    // Clear any existing timer
    if (timer) {
      clearTimeout(timer);
    }
    
    // Set next run time
    nextRunTime = calculateNextRunTime();
    
    // Set new timer
    timer = setTimeout(async () => {
      try {
        // Run update function
        await updateFunction();
        
        // Restart timer after successful execution
        start();
      } catch (error) {
        console.error('Error in scheduled update:', error);
        // Still restart timer to maintain schedule
        start();
      }
    }, getIntervalMs());
    
    // Return status
    return {
      isRunning: true,
      nextRunTime,
      frequency
    };
  };
  
  // Stop scheduler
  const stop = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    
    nextRunTime = null;
    
    return {
      isRunning: false,
      nextRunTime: null,
      frequency
    };
  };
  
  // Return scheduler controls
  return {
    start,
    stop,
    getStatus: () => ({
      isRunning: !!timer,
      nextRunTime,
      frequency
    })
  };
}