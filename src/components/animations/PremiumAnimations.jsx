import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FloatingElement - Creates a gently floating animation for UI elements
 * Perfect for logos, icons, or decorative elements to add subtle movement
 */
export const FloatingElement = ({ 
  children, 
  duration = 4, 
  distance = 10, 
  delay = 0,
  className
}) => {
  return (
    <motion.div
      className={className}
      initial={{ y: 0 }}
      animate={{ 
        y: [-distance/2, distance/2, -distance/2],
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * GlowingBorder - Adds a pulsing glow effect to element borders
 * Great for highlighting important cards or buttons
 */
export const GlowingBorder = ({ 
  children, 
  color = 'from-purple-500 to-indigo-500', 
  duration = 3,
  intensity = 0.5,
  className = "",
  containerClassName = ""
}) => {
  return (
    <div className={`relative ${containerClassName}`}>
      <motion.div 
        className={`absolute -inset-1 bg-gradient-to-r ${color} rounded-lg blur-md opacity-0 group-hover:opacity-${Math.round(intensity * 100)} transition-opacity ${className}`}
        animate={{ 
          opacity: [0, intensity, 0],
        }}
        transition={{ 
          duration, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * GradientText - Animates gradient text with a shifting effect
 * Perfect for headlines and important text that should draw attention
 */
export const GradientText = ({ 
  text, 
  colors = 'from-purple-400 via-indigo-400 to-purple-400', 
  duration = 8,
  className = ""
}) => {
  return (
    <motion.span 
      className={`text-transparent bg-clip-text bg-gradient-to-r ${colors} inline-block ${className}`}
      style={{ backgroundSize: '200% 100%' }}
      animate={{ 
        backgroundPosition: ['0% center', '100% center', '0% center'],
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "linear"
      }}
    >
      {text}
    </motion.span>
  );
};

/**
 * SlideInStagger - Animates children sequentially when they appear in viewport
 * Perfect for list items, features, or grid contents
 * Optimized for performance
 */
export const SlideInStagger = ({ 
  children, 
  delay = 0.15, 
  direction = 'up',
  distance = 20,
  staggerDelay = 0.1,
  className = "",
  once = true
}) => {
  const directionMap = {
    up: { y: distance, opacity: 0 },
    down: { y: -distance, opacity: 0 },
    left: { x: distance, opacity: 0 },
    right: { x: -distance, opacity: 0 }
  };

  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  // Performance optimization: Limit stagger to max 3 items
  const maxStaggerItems = 3;
  const childrenCount = React.Children.count(children);
  const staggerCount = Math.min(childrenCount, maxStaggerItems);
  
  // Calculate step size for staggered animations based on total children
  const stepSize = childrenCount > maxStaggerItems ? childrenCount / maxStaggerItems : 1;

  useEffect(() => {
    if (!ref.current || !window.IntersectionObserver) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold: 0.05, rootMargin: '30px' } // More permissive threshold
    );
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [once]);

  return (
    <div ref={ref} className={className}>
      <AnimatePresence>
        {isInView && React.Children.map(children, (child, i) => {
          // Determine if this child gets staggered animation
          // For large lists, only apply staggered delay to a few items
          const isStaggered = i < staggerCount;
          const staggerIndex = Math.floor(i / stepSize);
          
          return (
            <motion.div
              key={i}
              initial={directionMap[direction]}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.5, // Reduced duration
                delay: isStaggered ? delay + (staggerIndex * staggerDelay) : delay,
                ease: "easeOut" // Simpler easing function
              }}
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

/**
 * ShimmerEffect - Creates a shimmering highlight effect
 * Perfect for borders, buttons, or any element that needs subtle attention
 */
export const ShimmerEffect = ({ 
  children, 
  className = "",
  width = 50,
  duration = 3,
  delay = 0,
  angle = 45
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ 
          background: `linear-gradient(${angle}deg, transparent, rgba(255,255,255,0.2), transparent)`,
          left: '-100%',
          top: 0,
          width: `${width}%`,
          height: '100%'
        }}
        animate={{ 
          left: '200%',
        }}
        transition={{ 
          duration, 
          repeat: Infinity, 
          ease: "linear",
          delay
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * ParticleOverlay - Creates a field of floating particles
 * Perfect for hero sections or featured content areas
 */
export const ParticleOverlay = ({ 
  count = 20, 
  color = 'bg-purple-400', 
  size = 'small',
  speed = 'medium',
  opacity = 40
}) => {
  const sizeMap = {
    tiny: 'w-1 h-1',
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  const opacityClass = `opacity-${opacity}`;
  const sizeClass = sizeMap[size] || sizeMap.small;
  
  const speedMap = {
    slow: { min: 20, max: 40 },
    medium: { min: 10, max: 25 },
    fast: { min: 5, max: 15 }
  };
  
  const speedSetting = speedMap[speed] || speedMap.medium;

  const randomDuration = () => {
    return Math.random() * (speedSetting.max - speedSetting.min) + speedSetting.min;
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(count)].map((_, i) => {
        const duration = randomDuration();
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 10;
        
        return (
          <motion.div
            key={i}
            className={`absolute rounded-full ${color} ${sizeClass} ${opacityClass} blur-sm`}
            style={{ left: `${left}%`, top: `${top}%` }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 40 - 20, 0]
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * MeshGradient - Creates an animated mesh gradient background
 * Perfect for section backgrounds or card backgrounds
 */
export const MeshGradient = ({ 
  className = "", 
  intensity = 'medium',
  speed = 'medium',
  colors = 'purple'
}) => {
  const intensityMap = {
    light: {
      primary: '0.05',
      secondary: '0.03',
      tertiary: '0.02'
    },
    medium: {
      primary: '0.1',
      secondary: '0.07',
      tertiary: '0.05'
    },
    strong: {
      primary: '0.2',
      secondary: '0.15',
      tertiary: '0.1'
    }
  };
  
  const intensitySetting = intensityMap[intensity] || intensityMap.medium;
  
  const speedMap = {
    slow: 20,
    medium: 15,
    fast: 10
  };
  
  const durationBase = speedMap[speed] || speedMap.medium;
  
  const colorMap = {
    purple: {
      primary: 'rgba(139, 92, 246,',
      secondary: 'rgba(79, 70, 229,',
      tertiary: 'rgba(67, 56, 202,'
    },
    blue: {
      primary: 'rgba(59, 130, 246,',
      secondary: 'rgba(37, 99, 235,',
      tertiary: 'rgba(29, 78, 216,'
    },
    cyan: {
      primary: 'rgba(34, 211, 238,',
      secondary: 'rgba(6, 182, 212,',
      tertiary: 'rgba(8, 145, 178,'
    },
    pink: {
      primary: 'rgba(236, 72, 153,',
      secondary: 'rgba(219, 39, 119,',
      tertiary: 'rgba(190, 24, 93,'
    }
  };
  
  const colorSet = colorMap[colors] || colorMap.purple;

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <motion.div
        className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle at center, ${colorSet.primary}${intensitySetting.primary}), ${colorSet.secondary}${intensitySetting.secondary}) 50%, transparent 70%)`,
          filter: 'blur(50px)'
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: durationBase,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle at center, ${colorSet.secondary}${intensitySetting.secondary}), ${colorSet.tertiary}${intensitySetting.tertiary}) 50%, transparent 70%)`,
          filter: 'blur(60px)'
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: durationBase * 1.3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      <motion.div
        className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle at center, ${colorSet.tertiary}${intensitySetting.tertiary}), ${colorSet.primary}${intensitySetting.primary}) 50%, transparent 70%)`,
          filter: 'blur(45px)'
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: durationBase * 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </div>
  );
};

/**
 * CinematicBlur - Adds a cinematic blur effect as user scrolls
 * Perfect for creating depth and focus during page scrolling
 */
export const CinematicBlur = ({ children, className = "", intensity = 'medium' }) => {
  const ref = useRef(null);
  const [blur, setBlur] = useState(0);
  
  const intensityMap = {
    light: 10,
    medium: 15, 
    strong: 20
  };
  
  const maxBlur = intensityMap[intensity] || intensityMap.medium;

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(viewportHeight / 2 - elementCenter);
      const maxDistance = viewportHeight / 2 + rect.height / 2;
      
      // Calculate blur based on distance from center of viewport
      const calculatedBlur = (distanceFromCenter / maxDistance) * maxBlur;
      setBlur(calculatedBlur);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Calculate initial value
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [maxBlur]);

  return (
    <div 
      ref={ref} 
      className={className}
      style={{ 
        filter: `blur(${blur}px)`,
        transition: 'filter 0.2s ease-out'
      }}
    >
      {children}
    </div>
  );
};

/**
 * HoverSpotlight - Creates a spotlight effect on hover
 * Perfect for cards, buttons, or any interactive element
 */
export const HoverSpotlight = ({ 
  children, 
  className = "", 
  color = 'rgba(139, 92, 246, 0.1)', 
  size = 300, 
  intensity = 1,
  disabled = false
}) => {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current || disabled) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && !disabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: intensity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute"
          style={{
            left: position.x - size / 2,
            top: position.y - size / 2,
            width: size,
            height: size,
            background: `radial-gradient(circle closest-side, ${color}, transparent)`,
            transform: 'translate(0, 0)',
            zIndex: 0
          }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * TextReveal - Reveals text with a typing or fading effect
 * Perfect for hero text and headlines
 */
export const TextReveal = ({ 
  text, 
  type = 'fade', 
  duration = 1, 
  delay = 0,
  staggerChildren = 0.03,
  once = true,
  className = ""
}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    if (!ref.current || !window.IntersectionObserver) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [once]);

  // Split text into array of words for animation
  const words = text.split(' ');
  
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerChildren,
        delayChildren: delay
      }
    }
  };
  
  // Variants for each word based on animation type
  const wordVariants = {
    fade: {
      hidden: { opacity: 0, y: 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: duration / 2,
          ease: [0.215, 0.61, 0.355, 1]
        }
      }
    },
    typing: {
      hidden: { width: 0, opacity: 0 },
      visible: { 
        width: "auto", 
        opacity: 1,
        transition: { 
          duration: duration / 3,
          ease: "linear"
        }
      }
    },
    slide: {
      hidden: { y: 50, opacity: 0 },
      visible: { 
        y: 0, 
        opacity: 1,
        transition: { 
          duration: duration / 2,
          ease: [0.215, 0.61, 0.355, 1]
        }
      }
    }
  };

  return (
    <div ref={ref} className={className}>
      {type === 'typing' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="inline-flex flex-wrap"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block whitespace-pre overflow-hidden"
              variants={wordVariants.typing}
            >
              {word + ' '}
            </motion.span>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="inline-flex flex-wrap"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block whitespace-pre"
              variants={wordVariants[type] || wordVariants.fade}
            >
              {word + ' '}
            </motion.span>
          ))}
        </motion.div>
      )}
    </div>
  );
};

/**
 * MorphingShape - Creates a shape that morphs between different forms
 * Perfect for abstract decorative elements
 */
export const MorphingShape = ({ 
  className = "", 
  color = "bg-purple-600", 
  opacity = 10,
  duration = 20, 
  size = 300
}) => {
  const shapes = [
    'rounded-[30%_70%_70%_30%/30%_30%_70%_70%]',
    'rounded-[80%_20%_50%_50%/50%_40%_60%_50%]',
    'rounded-[30%_70%_40%_60%/60%_30%_70%_40%]',
    'rounded-[60%_40%_70%_30%/40%_50%_50%_60%]'
  ];
  
  const [currentShape, setCurrentShape] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentShape((prev) => (prev + 1) % shapes.length);
    }, duration * 1000 / shapes.length);
    
    return () => clearInterval(interval);
  }, [duration, shapes.length]);

  return (
    <div 
      className={`${className} ${color} opacity-${opacity} ${shapes[currentShape]}`}
      style={{ 
        width: size, 
        height: size,
        transition: `border-radius ${duration / shapes.length}s ease-in-out`
      }}
    />
  );
};

export default {
  FloatingElement,
  GlowingBorder,
  GradientText,
  SlideInStagger,
  ShimmerEffect,
  ParticleOverlay,
  MeshGradient,
  CinematicBlur,
  HoverSpotlight,
  TextReveal,
  MorphingShape
};