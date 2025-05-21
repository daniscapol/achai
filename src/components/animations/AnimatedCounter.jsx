import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedCounter - A visually appealing number counter that animates from 0 to target value
 * Features gradient text, animation effects, and configurable styling
 */
const AnimatedCounter = ({
  value = 0,
  prefix = '',
  suffix = '',
  duration = 2.5,
  delay = 0,
  className = '',
  gradientColors = 'from-purple-400 to-indigo-300',
  labelText = '',
  labelClassName = 'text-purple-200 text-sm mt-1'
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const counterRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    if (!counterRef.current || hasAnimated) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => {
            animateCounter();
            setHasAnimated(true);
          }, delay * 1000);
          
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(counterRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [value, delay, hasAnimated]);
  
  const animateCounter = () => {
    const startTime = performance.now();
    const endValue = value;
    
    // Easing function for more natural animation
    const easeOutExpo = (t) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };
    
    const updateCounter = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Apply easing for smoother counting
      const easedProgress = easeOutExpo(progress);
      
      // Optimize by using fewer state updates for large numbers
      const newValue = Math.round(easedProgress * endValue);
      if (newValue !== displayValue) {
        setDisplayValue(newValue);
      }
      
      if (progress < 1) {
        // For large numbers, use fewer animation frames
        if (endValue > 1000 && progress > 0.5) {
          setTimeout(() => requestAnimationFrame(updateCounter), 30);
        } else {
          requestAnimationFrame(updateCounter);
        }
      }
    };
    
    requestAnimationFrame(updateCounter);
  };
  
  return (
    <motion.div
      ref={counterRef}
      className={`relative overflow-hidden backdrop-blur-md rounded-xl p-5 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-white/5 rounded-xl"></div>
      
      {/* Simplified shine effect - only shows on hover for better performance */}
      <motion.div 
        className="absolute inset-0 w-full h-full bg-white/5 -skew-x-12 -translate-x-full"
        initial={{ x: '-150%' }}
        whileHover={{ x: '150%' }}
        transition={{ 
          duration: 1.5,
          ease: "easeInOut"
        }}
      />
      
      {/* Border that pulses on hover */}
      <motion.div 
        className="absolute inset-0 border border-transparent rounded-xl"
        whileHover={{ 
          borderColor: 'rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 15px 0 rgba(168, 85, 247, 0.1)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Counter value with gradient text */}
      <div className="relative z-10">
        <span className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradientColors}`}>
          {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
        
        {labelText && (
          <div className={labelClassName}>{labelText}</div>
        )}
      </div>
    </motion.div>
  );
};

export default AnimatedCounter;