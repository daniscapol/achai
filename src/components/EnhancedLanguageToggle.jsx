import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedLanguageToggle = ({ 
  variant = 'toggle', // toggle, button, minimal
  size = 'medium', // small, medium, large
  className = '',
  showTooltip = true,
  position = 'bottom' // top, bottom, left, right
}) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const toggleRef = useRef(null);

  // Language configuration
  const languages = {
    en: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      shortName: 'EN'
    },
    pt: {
      code: 'pt',
      name: 'Portuguese',
      nativeName: 'Português',
      flag: '🇧🇷',
      shortName: 'PT'
    }
  };

  const currentLang = languages[currentLanguage];
  const otherLang = languages[currentLanguage === 'en' ? 'pt' : 'en'];

  // Size configurations
  const sizeConfig = {
    small: {
      toggle: 'w-12 h-6',
      thumb: 'w-5 h-5',
      flag: 'text-lg',
      text: 'text-xs',
      spacing: 'gap-1'
    },
    medium: {
      toggle: 'w-16 h-8',
      thumb: 'w-7 h-7',
      flag: 'text-xl',
      text: 'text-sm',
      spacing: 'gap-2'
    },
    large: {
      toggle: 'w-20 h-10',
      thumb: 'w-9 h-9',
      flag: 'text-2xl',
      text: 'text-base',
      spacing: 'gap-3'
    }
  };

  const config = sizeConfig[size];

  // Handle language toggle with animation
  const handleToggle = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newLang = currentLanguage === 'en' ? 'pt' : 'en';
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    try {
      await changeLanguage(newLang);
      // Small delay for animation completion
      setTimeout(() => setIsAnimating(false), 300);
    } catch (error) {
      console.error('Language change failed:', error);
      setIsAnimating(false);
    }
  };

  // Tooltip management
  useEffect(() => {
    let timeout;
    if (isHovered && showTooltip) {
      timeout = setTimeout(() => setShowTooltipState(true), 500);
    } else {
      setShowTooltipState(false);
    }
    return () => clearTimeout(timeout);
  }, [isHovered, showTooltip]);

  // Keyboard accessibility
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  // Toggle Switch Variant (Recommended)
  if (variant === 'toggle') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        {/* Toggle Container */}
        <motion.button
          ref={toggleRef}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isAnimating}
          className={`
            relative ${config.toggle} rounded-full transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900
            ${isAnimating ? 'cursor-wait' : 'cursor-pointer'}
            ${isHovered ? 'shadow-lg shadow-purple-500/20' : 'shadow-md'}
            bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700
            hover:from-zinc-600 hover:via-zinc-500 hover:to-zinc-600
            active:scale-95
          `}
          whileTap={{ scale: 0.95 }}
          aria-label={t('language.switch_to', { lang: otherLang.nativeName })}
          aria-pressed={currentLanguage === 'pt'}
          role="switch"
        >
          {/* Background Gradient Animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 opacity-0"
            animate={{
              opacity: isHovered ? 0.1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Flag indicators on both ends */}
          <div className="absolute inset-y-0 left-1 flex items-center">
            <span className={`${config.flag} transition-opacity duration-200 ${currentLanguage === 'en' ? 'opacity-100' : 'opacity-40'}`}>
              🇺🇸
            </span>
          </div>
          <div className="absolute inset-y-0 right-1 flex items-center">
            <span className={`${config.flag} transition-opacity duration-200 ${currentLanguage === 'pt' ? 'opacity-100' : 'opacity-40'}`}>
              🇧🇷
            </span>
          </div>

          {/* Moving Thumb */}
          <motion.div
            className={`
              ${config.thumb} absolute top-0.5 bg-white rounded-full shadow-lg
              flex items-center justify-center text-zinc-700 font-bold
              ${config.text}
            `}
            animate={{
              x: currentLanguage === 'en' ? 1 : `calc(100% + 2px)`,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)'
            }}
          >
            {currentLang.shortName}
          </motion.div>

          {/* Ripple effect on click */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Enhanced Tooltip */}
        <AnimatePresence>
          {showTooltipState && (
            <motion.div
              initial={{ opacity: 0, y: position === 'bottom' ? -10 : 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: position === 'bottom' ? -10 : 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute z-50 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl
                ${position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'}
                left-1/2 transform -translate-x-1/2 whitespace-nowrap
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{otherLang.flag}</span>
                <span className="text-sm text-zinc-200 font-medium">
                  {t('language.switch_to', { lang: otherLang.nativeName })}
                </span>
              </div>
              {/* Tooltip Arrow */}
              <div 
                className={`
                  absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-zinc-800 border rotate-45
                  ${position === 'bottom' 
                    ? '-top-1 border-r-0 border-b-0 border-zinc-600' 
                    : '-bottom-1 border-l-0 border-t-0 border-zinc-600'
                  }
                `}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Button Variant (Alternative style)
  if (variant === 'button') {
    return (
      <div className={`relative inline-flex ${className}`}>
        <motion.button
          onClick={handleToggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isAnimating}
          className={`
            flex items-center ${config.spacing} px-4 py-2 rounded-xl transition-all duration-300
            bg-zinc-800/80 border border-zinc-700/50 hover:border-purple-500/50
            focus:outline-none focus:ring-2 focus:ring-purple-500/50
            ${isAnimating ? 'cursor-wait' : 'cursor-pointer'}
            hover:bg-zinc-700/80 active:scale-95
          `}
          whileTap={{ scale: 0.95 }}
          aria-label={t('language.switch_to', { lang: otherLang.nativeName })}
        >
          {/* Current Language */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentLang.flag}</span>
            <span className={`${config.text} font-medium text-zinc-200`}>
              {currentLang.shortName}
            </span>
          </div>

          {/* Separator & Switch Arrow */}
          <motion.div
            animate={{ rotate: isAnimating ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-zinc-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </motion.div>

          {/* Next Language */}
          <div className="flex items-center gap-2 opacity-60">
            <span className="text-xl">{otherLang.flag}</span>
            <span className={`${config.text} font-medium text-zinc-400`}>
              {otherLang.shortName}
            </span>
          </div>

          {/* Loading indicator */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute right-2"
              >
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    );
  }

  // Minimal Variant (Just flags with smooth transition)
  if (variant === 'minimal') {
    return (
      <motion.button
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isAnimating}
        className={`
          relative p-2 rounded-lg transition-all duration-300 ${className}
          focus:outline-none focus:ring-2 focus:ring-purple-500/50
          ${isAnimating ? 'cursor-wait' : 'cursor-pointer'}
          hover:bg-white/10 active:scale-90
        `}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        aria-label={t('language.switch_to', { lang: otherLang.nativeName })}
      >
        <motion.span
          key={currentLanguage}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl block"
        >
          {currentLang.flag}
        </motion.span>

        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    );
  }

  return null;
};

export default EnhancedLanguageToggle;