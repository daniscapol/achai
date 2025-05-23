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
    if (hasAnimated) return;
    
    const timer = setTimeout(() => {
      animateCounter();
      setHasAnimated(true);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [value, delay]); // Simplified without IntersectionObserver
  
  const animateCounter = () => {
    // Simplified animation - just set the final value after a delay
    setTimeout(() => {
      setDisplayValue(value);
    }, 100);
  };
  
  return (
    <div
      ref={counterRef}
      className={`relative overflow-hidden backdrop-blur-md rounded-xl p-5 text-center ${className}`}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-white/5 rounded-xl"></div>
      
      {/* Simplified effects without motion */}
      <div className="absolute inset-0 border border-transparent rounded-xl hover:border-purple-500/30 transition-colors duration-300"></div>
      
      {/* Counter value with gradient text */}
      <div className="relative z-10">
        <span className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradientColors}`}>
          {prefix}{displayValue.toLocaleString()}{suffix}
        </span>
        
        {labelText && (
          <div className={labelClassName}>{labelText}</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AnimatedCounter);