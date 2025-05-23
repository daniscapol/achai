import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enTranslations from './locales/en.json';
import ptTranslations from './locales/pt.json';

const resources = {
  en: {
    translation: enTranslations
  },
  pt: {
    translation: ptTranslations
  }
};

// Simple language detector that uses localStorage and browser preferences
const customDetector = {
  name: 'customDetector',
  lookup() {
    const storedLanguage = localStorage.getItem('achai-language');
    if (storedLanguage && ['en', 'pt'].includes(storedLanguage)) {
      return storedLanguage;
    }
    const browserLang = navigator.language || navigator.languages?.[0];
    return browserLang?.startsWith('pt') ? 'pt' : 'pt';
  },
  cacheUserLanguage(lng) {
    localStorage.setItem('achai-language', lng);
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Language detection configuration
    detection: {
      order: ['customDetector', 'localStorage', 'navigator'],
      lookupLocalStorage: 'achai-language',
      caches: ['localStorage'],
    },
    
    fallbackLng: 'pt',
    debug: process.env.NODE_ENV === 'development',
    
    // Common namespace
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // React options
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: false,
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
  });

// Add custom detector after initialization
i18n.services.languageDetector.addDetector(customDetector);

export default i18n;