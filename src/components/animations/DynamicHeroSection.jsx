import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';
import MeshGradient from './MeshGradient';
import { prefersReducedMotion } from '../animations';

/**
 * DynamicHeroSection - A vibrant hero section with animated elements
 * Features dynamic background elements, prominent word cycling, and eye-catching effects
 */
const DynamicHeroSection = ({ 
  onExplore, 
  onLearnMore,
  className = "" 
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const containerRef = useRef(null);
  const [animatedElements, setAnimatedElements] = useState([]);
  
  // Words to cycle through
  const cyclingWords = ['AI', 'LLMs', 'Claude', 'Solutions', 'Agents'];
  
  // Generate random floating elements for background
  useEffect(() => {
    const elements = [];
    const shapes = [
      'circle',
      'hexagon',
      'square'
    ];
    
    const colors = [
      'bg-purple-500/20',
      'bg-indigo-500/20',
      'bg-violet-500/20'
    ];
    
    // Further reduce number of elements for better performance
    for (let i = 0; i < 6; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 4, // Even smaller elements
        duration: Math.random() * 20 + 80, // Slower, simpler animation
        delay: Math.random() * 3,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        clockwise: Math.random() > 0.5
      });
    }
    
    setAnimatedElements(elements);
  }, []);
  
  // Word cycling effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => (prev + 1) % cyclingWords.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [cyclingWords.length]);

  // Shape renderer
  const renderShape = (shape, size, className) => {
    switch(shape) {
      case 'circle':
        return <div className={`rounded-full ${className}`} style={{ width: size, height: size }}></div>;
      case 'square':
        return <div className={`rounded-md ${className}`} style={{ width: size, height: size }}></div>;
      case 'hexagon':
        return (
          <div className={`${className}`} style={{ width: size, height: size*0.866, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
        );
      case 'triangle':
        return (
          <div className={`${className}`} style={{ width: size, height: size*0.866, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
        );
      case 'pentagon':
        return (
          <div className={`${className}`} style={{ width: size, height: size, clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}></div>
        );
      case 'star':
        return (
          <div className={`${className}`} style={{ width: size, height: size, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div>
        );
      default:
        return <div className={`rounded-full ${className}`} style={{ width: size, height: size }}></div>;
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden min-h-[90vh] bg-gradient-to-b from-slate-900 via-purple-900/30 to-slate-900 ${className}`}
    >
      {/* Dynamic background elements */}
      {/* Use optimized MeshGradient for better performance */}
      <MeshGradient 
        color="purple" 
        intensity="light" 
        animate={!prefersReducedMotion} 
      />
      
      <div className="absolute inset-0 z-10">
        {/* Animated floating elements */}
        {animatedElements.map(el => (
          <motion.div
            key={el.id}
            className="absolute"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
            }}
            animate={{
              x: el.clockwise ? [0, 20, 0, -20, 0] : [0, -20, 0, 20, 0],
              y: el.clockwise ? [0, -20, 0, 20, 0] : [0, 20, 0, -20, 0],
              rotate: el.clockwise ? [0, 360] : [0, -360],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              ease: "linear",
              delay: el.delay,
            }}
          >
            {renderShape(el.shape, el.size, el.color)}
          </motion.div>
        ))}
      </div>
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 pt-28 pb-20 flex flex-col items-center justify-center min-h-[90vh]">
        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          {/* Subtitle tag */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 inline-block"
          >
            <span className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm px-6 py-2 rounded-full text-purple-200 text-sm font-medium border border-purple-500/20">
              The Ultimate Resource Hub
            </span>
          </motion.div>
          
          {/* Main headline with word cycling effect */}
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Supercharge your
            <div className="relative h-[1.2em] w-full my-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  className="absolute left-0 right-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  {cyclingWords[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            with AchAI
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-purple-100/80 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Discover, compare, and connect with premium AchAI solutions to enhance your AI workflows and boost productivity.
          </motion.p>
          
          {/* Call to action buttons */}
          <motion.div 
            className="flex flex-wrap gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {/* Primary CTA */}
            <motion.button
              onClick={onExplore}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-bold text-lg relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated shine effect */}
              <motion.div 
                className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-[45deg] -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000"
                initial={{ x: '-100%' }}
                animate={{ x: ['150%', '-100%'] }}
                transition={{ 
                  repeat: Infinity, 
                  repeatDelay: 5,
                  duration: 1.5,
                  ease: "easeInOut" 
                }}
              />
              <span className="relative z-10">Browse Solutions</span>
            </motion.button>
            
            {/* Secondary CTA */}
            <motion.a
              href="/about-us"
              className="px-8 py-4 bg-white/5 border border-purple-500/30 backdrop-blur-md rounded-lg text-white font-bold text-lg inline-flex items-center"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(168, 85, 247, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              Learn About AchAI
            </motion.a>
          </motion.div>
          
          {/* Stats with animated counters */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <AnimatedCounter
              value={300}
              suffix="+"
              duration={2.5}
              delay={0.2}
              labelText="AI Solutions"
              className="bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border border-purple-500/20"
            />
            
            <AnimatedCounter
              value={25}
              duration={2.5}
              delay={0.5}
              labelText="Categories"
              gradientColors="from-indigo-400 to-blue-300"
              className="bg-gradient-to-br from-indigo-900/30 to-blue-900/20 border border-indigo-500/20"
            />
            
            <AnimatedCounter
              value={10000}
              suffix="+"
              duration={2.5}
              delay={0.8}
              labelText="Monthly Users"
              gradientColors="from-violet-400 to-fuchsia-300"
              className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/20 border border-violet-500/20"
            />
          </motion.div>
        </motion.div>
        
        {/* Enhanced Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-[45%] transform -translate-x-1/2 flex flex-col items-center z-20"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut"
          }}
        >
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-500/30 flex flex-col items-center">
            <span className="text-sm font-medium text-purple-100 mb-2">Scroll to explore</span>
            <motion.div
              animate={{
                y: [0, 4, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
                repeatType: "reverse"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-400">
                <path d="M12 20V4M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DynamicHeroSection;