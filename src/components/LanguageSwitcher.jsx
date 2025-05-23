import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = ({ 
  variant = 'default', // default, compact, mobile
  className = '',
  showLabel = true,
  placement = 'bottom-right' // bottom-right, bottom-left, top-right, top-left
}) => {
  const { t } = useTranslation();
  const { 
    currentLanguage, 
    changeLanguage, 
    getAvailableLanguages,
    getLanguageDisplayName 
  } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const availableLanguages = getAvailableLanguages();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  // Get flag emoji for language
  const getFlagEmoji = (langCode) => {
    const flags = {
      en: '🇺🇸',
      pt: '🇧🇷'
    };
    return flags[langCode] || '🌐';
  };

  // Dropdown placement classes
  const getPlacementClasses = () => {
    const placements = {
      'bottom-right': 'top-full right-0 mt-2',
      'bottom-left': 'top-full left-0 mt-2',
      'top-right': 'bottom-full right-0 mb-2',
      'top-left': 'bottom-full left-0 mb-2'
    };
    return placements[placement] || placements['bottom-right'];
  };

  // Compact variant (just flags)
  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label={t('language.change_language')}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-lg">{getFlagEmoji(currentLanguage)}</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`absolute ${getPlacementClasses()} z-50 min-w-[160px] bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden`}
              role="listbox"
              aria-label={t('language.change_language')}
            >
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors duration-150 flex items-center space-x-3 ${
                    currentLanguage === language.code 
                      ? 'bg-purple-600/20 text-purple-300' 
                      : 'text-zinc-300'
                  }`}
                  role="option"
                  aria-selected={currentLanguage === language.code}
                >
                  <span className="text-lg">{getFlagEmoji(language.code)}</span>
                  <span className="font-medium">{language.nativeName}</span>
                  {currentLanguage === language.code && (
                    <svg className="w-4 h-4 ml-auto text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile variant (full width)
  if (variant === 'mobile') {
    return (
      <div className={`w-full ${className}`}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label={t('language.change_language')}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getFlagEmoji(currentLanguage)}</span>
            <span className="font-medium text-zinc-200">
              {getLanguageDisplayName()}
            </span>
          </div>
          <svg 
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden"
              role="listbox"
              aria-label={t('language.change_language')}
            >
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-3 hover:bg-zinc-700 transition-colors duration-150 flex items-center space-x-3 ${
                    currentLanguage === language.code 
                      ? 'bg-purple-600/20 text-purple-300' 
                      : 'text-zinc-300'
                  }`}
                  role="option"
                  aria-selected={currentLanguage === language.code}
                >
                  <span className="text-lg">{getFlagEmoji(language.code)}</span>
                  <span className="font-medium">{language.nativeName}</span>
                  {currentLanguage === language.code && (
                    <svg className="w-4 h-4 ml-auto text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label={t('language.change_language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-lg">{getFlagEmoji(currentLanguage)}</span>
        {showLabel && (
          <span className="font-medium text-zinc-200">
            {getLanguageDisplayName()}
          </span>
        )}
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${getPlacementClasses()} z-50 min-w-[180px] bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden`}
            role="listbox"
            aria-label={t('language.change_language')}
          >
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors duration-150 flex items-center space-x-3 ${
                  currentLanguage === language.code 
                    ? 'bg-purple-600/20 text-purple-300' 
                    : 'text-zinc-300'
                }`}
                role="option"
                aria-selected={currentLanguage === language.code}
              >
                <span className="text-lg">{getFlagEmoji(language.code)}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-zinc-500">{language.name}</div>
                </div>
                {currentLanguage === language.code && (
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;