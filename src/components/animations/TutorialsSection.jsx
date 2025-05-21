import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * TutorialsSection - A section for displaying tutorials with dynamic animations
 * Maintains the same visual style as the other sections
 */
const TutorialsSection = ({
  title = "Learn with Tutorials",
  description = "Master MCP servers with our comprehensive guides",
  tutorials = [],
  onViewAll,
  onTutorialSelect,
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
          className="absolute right-[10%] top-[10%] w-[30vw] h-[30vw] rounded-full bg-gradient-radial from-purple-600/5 to-transparent blur-3xl opacity-30"
        />
        
        <div 
          className="absolute left-[5%] bottom-[20%] w-[25vw] h-[25vw] rounded-full bg-gradient-radial from-blue-600/5 to-transparent blur-3xl opacity-20"
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
              Tutorials
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
              View All Tutorials
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
        
        {/* Tutorials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tutorials.map((tutorial, index) => (
            <TutorialCard 
              key={tutorial.id || index} 
              tutorial={tutorial} 
              index={index} 
              onClick={() => onTutorialSelect(tutorial)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * TutorialCard - Individual tutorial card with hover animations
 */
const TutorialCard = ({ tutorial, index = 0, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // For difficulty level rendering
  const getDifficultyColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };
  
  // Difficulty icon
  const DifficultyIcon = ({ level }) => {
    const filledCircles = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3
    }[level?.toLowerCase()] || 0;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full ${i < filledCircles ? getDifficultyColor(level) : 'bg-zinc-600'}`}
          ></div>
        ))}
      </div>
    );
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
        {/* Title and difficulty */}
        <div className="p-6">
          {/* Icon with difficulty indicator */}
          <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600`}>
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            
            {tutorial.difficulty && (
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${getDifficultyColor(tutorial.difficulty)}`}>
                  {tutorial.difficulty}
                </span>
                <DifficultyIcon level={tutorial.difficulty} />
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-300 transition-all duration-300">
            {tutorial.title}
          </h3>
          
          <p className="text-zinc-400 text-sm mb-4 line-clamp-3">
            {tutorial.description}
          </p>
          
          {/* Details */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
            {/* Duration */}
            {tutorial.duration && (
              <div className="flex items-center text-zinc-500 text-xs">
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                {tutorial.duration}
              </div>
            )}
            
            {/* Read more link - using CSS transitions instead of JS for better performance */}
            <div className="flex items-center text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">
              <span className="text-sm font-medium">View Tutorial</span>
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
      </div>
    </motion.div>
  );
};

export default TutorialsSection;