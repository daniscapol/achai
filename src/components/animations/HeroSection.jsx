import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import PremiumWordCycler from './PremiumWordCycler';
import { 
  GradientText, 
  ParticleOverlay, 
  ShimmerEffect, 
  MeshGradient,
  TextReveal,
  HoverSpotlight
} from './PremiumAnimations';

/**
 * HeroSection - A premium hero section with advanced animations
 * Features parallax effects, word cycling, particle effects, and more
 * 
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onExplore - Handler for the explore button click
 * @param {Function} props.onLearnMore - Handler for the learn more button click
 */
const HeroSection = ({ 
  className = "", 
  onExplore,
  onLearnMore 
}) => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [isMounted, setIsMounted] = useState(false);
  
  // Parallax values for different elements
  const y1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  // Dynamic stats with counter animation
  const [stats] = useState([
    { value: 300, label: 'MCP Servers', suffix: '+' },
    { value: 25, label: 'Categories', suffix: '' },
    { value: 10000, label: 'Monthly Users', suffix: '+' }
  ]);
  
  // Words for the cycling effect
  const roleWords = [
    'hub',
    'marketplace',
    'platform',
    'ecosystem'
  ];
  
  const techWords = [
    'AI',
    'LLMs',
    'MCPs',
    'Agents'
  ];
  
  useEffect(() => {
    setIsMounted(true);
    
    // Cleanup animations on unmount
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  // Detect if reduced motion is preferred
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  return (
    <div 
      ref={containerRef}
      className={`relative min-h-[90vh] overflow-hidden ${className}`}
    >
      {/* Background effects */}
      <MeshGradient intensity="medium" colors="purple" />
      
      {!prefersReducedMotion && (
        <ParticleOverlay count={15} opacity={20} speed="slow" />
      )}
      
      {/* Hero content with parallax */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div 
          style={{ y: y1, opacity }} 
          className="max-w-5xl mx-auto text-center"
        >
          {/* Headline with advanced text animations */}
          <div className="mb-6">
            <TextReveal
              text="Your ultimate"
              type="slide"
              duration={1.5}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white"
            />
          </div>
          
          <div className="mb-10 text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
            <PremiumWordCycler
              words={roleWords}
              duration={3000}
              transitionDuration={500}
              className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text mr-2"
            /> 
            for all things 
            <PremiumWordCycler
              words={techWords}
              duration={3000}
              transitionDuration={500}
              className="text-transparent bg-gradient-to-r from-purple-400 to-indigo-600 bg-clip-text ml-2"
            />
          </div>
          
          <TextReveal
            text="Discover, compare, and connect with premium MCP servers to enhance your AI workflows"
            type="fade"
            staggerChildren={0.01}
            duration={1.5}
            delay={0.5}
            className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto mb-12"
          />
          
          {/* CTA buttons with hover effects */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <HoverSpotlight>
              <ShimmerEffect>
                <motion.button
                  onClick={onExplore}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-bold text-lg transition-all"
                >
                  Explore MCPs
                </motion.button>
              </ShimmerEffect>
            </HoverSpotlight>
            
            <HoverSpotlight>
              <motion.button
                onClick={onLearnMore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-purple-300/30 rounded-lg text-white font-bold text-lg transition-all"
              >
                Learn More
              </motion.button>
            </HoverSpotlight>
          </div>
        </motion.div>
        
        {/* Stats section with counter animation */}
        <motion.div 
          style={{ y: y2 }} 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="relative overflow-hidden bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20"
            >
              <ShimmerEffect delay={index * 0.5}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1), duration: 0.6 }}
                >
                  <CountUpValue 
                    value={stat.value} 
                    duration={2} 
                    delay={1 + (index * 0.2)}
                    className="text-4xl font-bold text-white mb-2"
                    suffix={stat.suffix}
                  />
                  <div className="text-purple-200">{stat.label}</div>
                </motion.div>
              </ShimmerEffect>
            </div>
          ))}
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "loop" 
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          <span className="sr-only">Scroll down</span>
        </motion.div>
      </div>
    </div>
  );
};

// Animated counter component
const CountUpValue = ({ value, duration = 2, delay = 0, className = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  
  useEffect(() => {
    // Skip animation for users who prefer reduced motion
    if (typeof window !== 'undefined' && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(value);
      return;
    }
  
    let startTimestamp;
    let animationFrameId;
    
    const delayTimeout = setTimeout(() => {
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        const currentCount = Math.floor(progress * value);
        
        setCount(currentCount);
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setCount(value);
        }
      };
      
      animationFrameId = requestAnimationFrame(step);
    }, delay * 1000);
    
    return () => {
      clearTimeout(delayTimeout);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration, delay]);
  
  return (
    <span ref={countRef} className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export default HeroSection;