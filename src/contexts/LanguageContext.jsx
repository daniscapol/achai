import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLanguage, setCurrentLanguage] = useState('pt');

  // Get language from URL path
  const getLanguageFromPath = (pathname) => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments[0] && ['en', 'pt'].includes(pathSegments[0])) {
      return pathSegments[0];
    }
    return null;
  };

  // Get path without language prefix
  const getPathWithoutLanguage = (pathname) => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments[0] && ['en', 'pt'].includes(pathSegments[0])) {
      return '/' + pathSegments.slice(1).join('/');
    }
    return pathname;
  };

  // Add language prefix to path
  const getPathWithLanguage = (pathname, language) => {
    const cleanPath = getPathWithoutLanguage(pathname);
    return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
  };

  // Initialize language on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem('achai-language');
    const browserLanguage = navigator.language?.startsWith('pt') ? 'pt' : 'pt'; // Always default to PT
    
    let initialLanguage = storedLanguage || 'pt'; // Default to PT if no stored language
    
    // Ensure we have a valid language
    if (!['en', 'pt'].includes(initialLanguage)) {
      initialLanguage = 'pt'; // Always fallback to PT
    }

    setCurrentLanguage(initialLanguage);
    i18n.changeLanguage(initialLanguage);
  }, []);

  // Handle language changes
  const changeLanguage = async (newLanguage) => {
    if (!['en', 'pt'].includes(newLanguage)) {
      console.warn('Invalid language:', newLanguage);
      return;
    }

    setCurrentLanguage(newLanguage);
    
    try {
      await i18n.changeLanguage(newLanguage);
      localStorage.setItem('achai-language', newLanguage);
      console.log('Language changed to:', newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Toggle between languages
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'pt' ? 'en' : 'pt';
    changeLanguage(newLanguage);
  };

  // Get localized path for navigation
  const getLocalizedPath = (path) => {
    return getPathWithLanguage(path, currentLanguage);
  };

  // Check if current language is RTL (not applicable for EN/PT but useful for future)
  const isRTL = () => {
    return false; // Neither English nor Portuguese are RTL
  };

  // Get language display name
  const getLanguageDisplayName = (lang = currentLanguage) => {
    const names = {
      en: 'English',
      pt: 'Português'
    };
    return names[lang] || lang;
  };

  // Get available languages
  const getAvailableLanguages = () => {
    return [
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'en', name: 'English', nativeName: 'English' }
    ];
  };

  const value = {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    getLocalizedPath,
    getPathWithoutLanguage,
    getPathWithLanguage,
    getLanguageFromPath,
    isRTL,
    getLanguageDisplayName,
    getAvailableLanguages,
    // Helper methods
    isEnglish: currentLanguage === 'en',
    isPortuguese: currentLanguage === 'pt',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;