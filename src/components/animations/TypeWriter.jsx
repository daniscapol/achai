import { useState, useEffect, useRef, useCallback } from 'react';
import { prefersReducedMotion } from './index';

/**
 * TypeWriter component that creates a typing and deleting effect
 * 
 * @param {Object} props
 * @param {string[]} props.texts - Array of texts to type
 * @param {number} props.typingSpeed - Speed of typing in milliseconds
 * @param {number} props.deletingSpeed - Speed of deleting in milliseconds
 * @param {number} props.delayAfterType - Delay after typing in milliseconds
 * @param {number} props.delayAfterDelete - Delay after deleting in milliseconds
 * @param {boolean} props.loop - Whether to loop through the texts
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.cursor - Custom cursor element
 * @returns {JSX.Element}
 */
const TypeWriter = ({
  texts = ['Default text'],
  typingSpeed = 100,
  deletingSpeed = 50,
  delayAfterType = 1500,
  delayAfterDelete = 500,
  loop = true,
  className = '',
  cursor = <span className="animate-blink-cursor">|</span>,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const reducedMotion = prefersReducedMotion();
  const timeoutRef = useRef(null);
  
  // If user prefers reduced motion, just show the full text without animation
  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(texts[textIndex]);
    }
  }, [reducedMotion, textIndex, texts]);

  const typeText = useCallback(() => {
    // If user prefers reduced motion, skip animation
    if (reducedMotion) return;
    
    const currentText = texts[textIndex];
    
    if (isDeleting) {
      // Deleting text animation
      setDisplayText(currentText.substring(0, displayText.length - 1));
      
      if (displayText.length <= 1) {
        setIsDeleting(false);
        
        // Move to next text after deleting is complete
        const nextIndex = textIndex === texts.length - 1 ? 0 : textIndex + 1;
        setTextIndex(loop ? nextIndex : Math.min(nextIndex, texts.length - 1));
        
        // Pause after deleting before starting to type next text
        timeoutRef.current = setTimeout(typeText, delayAfterDelete);
        return;
      }
    } else {
      // Typing text animation
      setDisplayText(currentText.substring(0, displayText.length + 1));
      
      // When text is fully typed
      if (displayText.length >= currentText.length) {
        // Set deleting state after delay
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
          typeText();
        }, delayAfterType);
        return;
      }
    }
    
    // Continue typing or deleting with appropriate speed
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    timeoutRef.current = setTimeout(typeText, speed);
  }, [
    displayText, 
    textIndex, 
    isDeleting, 
    texts, 
    loop, 
    reducedMotion, 
    delayAfterDelete, 
    delayAfterType, 
    typingSpeed, 
    deletingSpeed
  ]);
  
  // Start typing effect on component mount
  useEffect(() => {
    if (reducedMotion) return;
    
    // Initial timeout to start typing
    timeoutRef.current = setTimeout(typeText, typingSpeed);
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [typeText, typingSpeed, reducedMotion]);
  
  // Add proper styling for animation and accessibility
  return (
    <div className={`inline-flex items-center ${className}`} aria-live="polite">
      <span>{displayText}</span>
      {!reducedMotion && cursor}
    </div>
  );
};

export default TypeWriter;