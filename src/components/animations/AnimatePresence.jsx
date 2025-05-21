import React, { useState, useRef, useEffect } from 'react';

/**
 * AnimatePresence component for smooth transitions when components mount/unmount
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the content
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.animation - Animation type ('fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'scale')
 * @param {number} props.duration - Animation duration in milliseconds
 * @param {Function} props.onExited - Callback fired after exit animation completes
 */
const AnimatePresence = ({ 
  show = true, 
  children, 
  animation = 'fade',
  duration = 300,
  onExited,
  ...props 
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [animationState, setAnimationState] = useState(show ? 'entered' : 'exited');
  const timeoutRef = useRef();
  
  // Get classes for different animation states and types
  const getAnimationClasses = () => {
    const baseTransition = `transition-all duration-${duration} ease-in-out`;
    
    const animations = {
      'fade': {
        'entering': `${baseTransition} opacity-0`,
        'entered': `${baseTransition} opacity-100`,
        'exiting': `${baseTransition} opacity-0`,
        'exited': 'hidden'
      },
      'slide-up': {
        'entering': `${baseTransition} opacity-0 translate-y-8`,
        'entered': `${baseTransition} opacity-100 translate-y-0`,
        'exiting': `${baseTransition} opacity-0 translate-y-8`,
        'exited': 'hidden'
      },
      'slide-down': {
        'entering': `${baseTransition} opacity-0 -translate-y-8`,
        'entered': `${baseTransition} opacity-100 translate-y-0`,
        'exiting': `${baseTransition} opacity-0 -translate-y-8`,
        'exited': 'hidden'
      },
      'slide-left': {
        'entering': `${baseTransition} opacity-0 translate-x-8`,
        'entered': `${baseTransition} opacity-100 translate-x-0`,
        'exiting': `${baseTransition} opacity-0 translate-x-8`,
        'exited': 'hidden'
      },
      'slide-right': {
        'entering': `${baseTransition} opacity-0 -translate-x-8`,
        'entered': `${baseTransition} opacity-100 translate-x-0`,
        'exiting': `${baseTransition} opacity-0 -translate-x-8`,
        'exited': 'hidden'
      },
      'scale': {
        'entering': `${baseTransition} opacity-0 scale-95`,
        'entered': `${baseTransition} opacity-100 scale-100`,
        'exiting': `${baseTransition} opacity-0 scale-95`,
        'exited': 'hidden'
      }
    };
    
    return animations[animation][animationState];
  };
  
  useEffect(() => {
    if (show) {
      // When showing, first render the component
      setShouldRender(true);
      // Clear any existing timeout
      clearTimeout(timeoutRef.current);
      // Set entering state immediately
      setAnimationState('entering');
      // Then set entered state after a frame
      requestAnimationFrame(() => {
        setAnimationState('entered');
      });
    } else {
      // When hiding, first set exiting state
      setAnimationState('exiting');
      // Then set exited state and stop rendering after animation completes
      timeoutRef.current = setTimeout(() => {
        setAnimationState('exited');
        setShouldRender(false);
        if (onExited) onExited();
      }, duration);
    }
    
    return () => clearTimeout(timeoutRef.current);
  }, [show, duration, onExited]);
  
  if (!shouldRender) return null;
  
  return (
    <div className={getAnimationClasses()} {...props}>
      {children}
    </div>
  );
};

export default AnimatePresence;