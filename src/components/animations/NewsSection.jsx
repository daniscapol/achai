import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * NewsSection - A section for displaying latest news articles with dynamic animations
 * Maintains the same visual style as the other sections
 */
const NewsSection = ({
  title = "Latest News",
  description = "Stay updated with the latest developments in AI and LLMs",
  newsArticles = [],
  onViewAll,
  onArticleSelect,
  className = ""
}) => {
  return (
    <section className={`relative py-20 overflow-hidden ${className}`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900 to-slate-900/80"></div>
        
        {/* Static background elements for better performance */}
        <div 
          className="absolute left-[10%] top-[20%] w-[35vw] h-[35vw] rounded-full bg-gradient-radial from-violet-600/5 to-transparent blur-3xl opacity-30"
        />
        
        <div 
          className="absolute right-[5%] bottom-[10%] w-[25vw] h-[25vw] rounded-full bg-gradient-radial from-indigo-600/5 to-transparent blur-3xl opacity-20"
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-3">
              News & Updates
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                {title}
              </span>
            </h2>
            <p className="text-zinc-400 mt-2 max-w-md">
              {description}
            </p>
          </motion.div>
          
          <motion.button
            onClick={onViewAll}
            className="mt-4 md:mt-0 px-6 py-2.5 bg-white/5 border border-white/10 hover:border-purple-500/30 backdrop-blur-sm rounded-lg group transition-all duration-300"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.07)' }}
          >
            <span className="flex items-center">
              View All News
              <svg 
                className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </span>
          </motion.button>
        </div>
        
        {/* News grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsArticles.map((article, index) => (
            <NewsCard 
              key={article.id || index} 
              article={article} 
              index={index} 
              onClick={() => onArticleSelect(article)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * NewsCard - Individual news article card with hover animations
 */
const NewsCard = ({ article, index = 0, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format date 
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: 0.05 * Math.min(index, 2) }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="h-full relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 cursor-pointer group">
        {/* News article image with gradient overlay */}
        <div className="relative h-48 overflow-hidden">
          {article.imageUrl ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60 z-10"></div>
              <img 
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover will-change-transform transition-transform duration-500 group-hover:scale-105"
                style={{ transform: "translateZ(0)" }}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50"></div>
          )}
          
          {/* Category tag */}
          {article.category && (
            <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
              {article.category}
            </div>
          )}
          
          {/* Date */}
          {article.date && (
            <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs text-white/80">
              {formatDate(article.date)}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-300 transition-all duration-300">
            {article.title}
          </h3>
          
          <p className="text-zinc-400 text-sm mb-4 line-clamp-3">
            {article.summary || article.content}
          </p>
          
          {/* Read more link - using CSS for animation instead of JS for better performance */}
          <div className="flex items-center text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">
            <span className="text-sm font-medium">Read more</span>
            <svg 
              className="w-4 h-4 ml-1 transform transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsSection;