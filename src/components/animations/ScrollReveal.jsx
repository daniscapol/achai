import React, { useRef, useState, useEffect } from 'react';
import { prefersReducedMotion } from './index';

/**
 * ScrollReveal component for animating elements as they enter the viewport
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to reveal
 * @param {string} props.direction - Direction to animate from ('up', 'down', 'left', 'right')
 * @param {number} props.distance - Distance to animate from in pixels
 * @param {number} props.delay - Delay before animation starts in ms
 * @param {number} props.duration - Animation duration in ms
 * @param {number} props.threshold - Intersection threshold (0-1)
 * @param {boolean} props.once - Whether to only animate once
 */
const ScrollReveal = ({ 
  children, 
  direction = 'up',
  distance = 20,
  delay = 0,
  duration = 500,
  threshold = 0.05,
  once = false,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const reducedMotion = prefersReducedMotion();
  
  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { 
        threshold,
        rootMargin: '100px 0px'  // Start loading elements 100px before they come into view
      }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once, reducedMotion]);
  
  // Get transform value based on direction - reduce distance for smoother animations
  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    
    // Use smaller distance for smoother animation
    const actualDistance = Math.min(distance, 15);
    
    switch (direction) {
      case 'up':
        return `translate3d(0, ${actualDistance}px, 0)`;
      case 'down':
        return `translate3d(0, -${actualDistance}px, 0)`;
      case 'left':
        return `translate3d(${actualDistance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${actualDistance}px, 0, 0)`;
      default:
        return `translate3d(0, ${actualDistance}px, 0)`;
    }
  };
  
  // If reduced motion is preferred, just render children without animation
  if (reducedMotion) {
    return <div {...props}>{children}</div>;
  }
  
  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        transitionDelay: `${delay}ms`
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;