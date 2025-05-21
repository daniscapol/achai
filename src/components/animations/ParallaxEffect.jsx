import React, { useRef, useState, useEffect } from 'react';
import { prefersReducedMotion } from './index';

/**
 * ParallaxEffect component for creating subtle mouse-based parallax effects
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to apply effect to
 * @param {number} props.depth - Depth of the parallax effect (1-10)
 * @param {boolean} props.glare - Whether to add a glare effect
 * @param {string} props.className - Additional CSS classes
 */
const ParallaxEffect = ({ 
  children, 
  depth = 3,
  glare = false,
  className = '',
  ...props 
}) => {
  const ref = useRef(null);
  const [transform, setTransform] = useState('');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const reducedMotion = prefersReducedMotion();
  
  // Normalize depth value
  const normalizedDepth = Math.min(Math.max(depth, 1), 10) / 40;
  
  useEffect(() => {
    // Skip effect if user prefers reduced motion
    if (reducedMotion) return;
    
    const handleMouseMove = (e) => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate mouse position relative to center of element (-1 to 1)
      const relativeX = (e.clientX - centerX) / (rect.width / 2);
      const relativeY = (e.clientY - centerY) / (rect.height / 2);
      
      // Calculate transform based on mouse position and depth
      const rotateY = relativeX * normalizedDepth * 10;
      const rotateX = -relativeY * normalizedDepth * 10;
      const translateZ = 0;
      
      // Update transform
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`);
      
      // Update glare position if enabled
      if (glare) {
        const glareX = (relativeX + 1) * 50; // Convert -1...1 to 0...100
        const glareY = (relativeY + 1) * 50; // Convert -1...1 to 0...100
        const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
        const glareOpacity = 0.2 - distance * 0.1; // Reduce opacity as distance from center increases
        
        setGlarePosition({
          x: glareX,
          y: glareY,
          opacity: Math.max(0, glareOpacity)
        });
      }
    };
    
    const handleMouseLeave = () => {
      setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
      if (glare) {
        setGlarePosition({ x: 50, y: 50, opacity: 0 });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    if (ref.current) {
      ref.current.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (ref.current) {
        ref.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [normalizedDepth, glare, reducedMotion]);
  
  // If reduced motion is preferred, just render children without effect
  if (reducedMotion) {
    return <div className={className} {...props}>{children}</div>;
  }
  
  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{
        transform: transform,
        transition: 'transform 0.1s ease-out',
        willChange: 'transform',
        transformStyle: 'preserve-3d'
      }}
      {...props}
    >
      {children}
      
      {/* Glare effect */}
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
          style={{ zIndex: 2 }}
        >
          <div
            className="absolute inset-0 transform scale-150"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,${glarePosition.opacity}) 0%, rgba(255,255,255,0) 60%)`,
              transition: 'background 0.1s ease-out'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ParallaxEffect;