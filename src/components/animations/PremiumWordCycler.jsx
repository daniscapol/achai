import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PremiumWordCycler - A high-end word cycling component like those used by major tech companies
 * Features smooth transitions, background blur effects, and precise timing
 * 
 * @param {Array} words - Array of words to cycle through
 * @param {number} duration - Duration each word appears in ms 
 * @param {number} transitionDuration - Duration of transition animations in ms
 * @param {string} className - Additional CSS classes
 * @param {any} children - Content to display after the cycling words
 */
const PremiumWordCycler = ({ 
  words = [],
  duration = 2000,
  transitionDuration = 500,
  className = "",
  children
}) => {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);
  const containerRef = useRef(null);
  
  // Get text metrics to maintain consistent width
  const [maxWidth, setMaxWidth] = useState(0);
  const textRef = useRef(null);
  
  useEffect(() => {
    // Set a timer to cycle through the words
    const timer = setInterval(() => {
      setKey(prevKey => prevKey + 1); // Update key to force animation
      setIndex(prevIndex => (prevIndex + 1) % words.length);
    }, duration);
    
    return () => clearInterval(timer);
  }, [words, duration]);
  
  // Measure text width to prevent layout shifts
  useEffect(() => {
    if (!containerRef.current || words.length === 0) return;
    
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'nowrap';
    
    // Get computed styles from the container
    const containerStyles = window.getComputedStyle(containerRef.current);
    tempDiv.style.fontSize = containerStyles.fontSize;
    tempDiv.style.fontWeight = containerStyles.fontWeight;
    tempDiv.style.fontFamily = containerStyles.fontFamily;
    
    // Measure each word
    let maxWidth = 0;
    words.forEach(word => {
      tempDiv.textContent = word;
      document.body.appendChild(tempDiv);
      const width = tempDiv.offsetWidth;
      maxWidth = Math.max(maxWidth, width);
      document.body.removeChild(tempDiv);
    });
    
    // Add some padding
    setMaxWidth(maxWidth + 20);
  }, [words]);
  
  // Animation variants
  const variants = {
    enter: { 
      y: 20, 
      opacity: 0,
      filter: 'blur(8px)'
    },
    center: { 
      y: 0, 
      opacity: 1,
      filter: 'blur(0px)'
    },
    exit: { 
      y: -20, 
      opacity: 0,
      filter: 'blur(8px)'
    }
  };

  return (
    <span 
      ref={containerRef}
      className={`inline-flex items-center ${className}`}
      style={{ minWidth: maxWidth ? `${maxWidth}px` : 'auto' }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={key}
          ref={textRef}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: transitionDuration / 1000 },
            filter: { duration: transitionDuration / 1000 }
          }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      {children}
    </span>
  );
};

export default PremiumWordCycler;