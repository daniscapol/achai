# Internationalization (i18n) Implementation

This document explains the internationalization setup for the AchAI website, supporting English and Portuguese languages.

## Architecture

### Technologies Used
- **react-i18next**: React bindings for i18next
- **i18next**: Internationalization framework
- **i18next-browser-languagedetector**: Browser language detection
- **i18next-http-backend**: Loading translations via HTTP

### Directory Structure
```
src/
├── i18n/
│   ├── index.js                 # i18n configuration
│   ├── locales/
│   │   ├── en.json              # English translations
│   │   └── pt.json              # Portuguese translations
│   └── README.md                # This file
├── contexts/
│   └── LanguageContext.jsx     # Language context provider
└── components/
    └── LanguageSwitcher.jsx     # Language switcher component
```

## URL Structure

The application supports language-specific URLs:

### Supported Patterns
- `/` - Root (defaults to browser language)
- `/en` - English homepage
- `/pt` - Portuguese homepage
- `/en/products` - English products page
- `/pt/produtos` - Portuguese products page (future)
- `/en/about-us` - English about page
- `/pt/sobre-nos` - Portuguese about page (future)

### Language Detection Priority
1. URL path language prefix (`/en/`, `/pt/`)
2. localStorage saved preference
3. Browser language detection
4. Default fallback to English

## Usage

### In Components

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('homepage.hero.title')}</h1>
      <p>{t('homepage.hero.description')}</p>
    </div>
  );
}
```

### With Variables

```jsx
// Translation with interpolation
<p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>

// Translation with count
<span>{t('products.product_card.stars', { count: 5 })}</span>
```

### Using Language Context

```jsx
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { 
    currentLanguage, 
    changeLanguage, 
    getLocalizedPath,
    isEnglish,
    isPortuguese 
  } = useLanguage();
  
  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      <button onClick={() => changeLanguage('pt')}>
        Switch to Portuguese
      </button>
      <a href={getLocalizedPath('/about-us')}>
        About Us (localized link)
      </a>
    </div>
  );
}
```

### Language Switcher Component

The `LanguageSwitcher` component provides multiple variants:

```jsx
import LanguageSwitcher from './LanguageSwitcher';

// Compact version (flags only)
<LanguageSwitcher variant="compact" showLabel={false} />

// Default version (flags + language names)
<LanguageSwitcher variant="default" />

// Mobile version (full width)
<LanguageSwitcher variant="mobile" />
```

## Translation Files

### Structure
All translations are organized in nested objects by feature/section:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save"
  },
  "navigation": {
    "home": "Home",
    "products": "Products",
    "about_us": "About Us"
  },
  "homepage": {
    "hero": {
      "title": "The Future of AI is Here",
      "subtitle": "Discover cutting-edge AI solutions"
    }
  }
}
```

### Translation Keys Naming Convention
- Use snake_case for translation keys
- Organize by feature/page (e.g., `homepage.hero.title`)
- Use descriptive, meaningful key names
- Group common elements under `common.*`

### Adding New Translations
1. Add the key to both `en.json` and `pt.json`
2. Use the same key structure in both files
3. Test the translation in both languages
4. Ensure proper interpolation for dynamic content

## Configuration

### Language Configuration (`src/i18n/index.js`)

```javascript
const resources = {
  en: { translation: enTranslations },
  pt: { translation: ptTranslations }
};

i18n.init({
  resources,
  fallbackLng: 'en',
  detection: {
    order: ['customDetector', 'localStorage', 'navigator'],
    lookupLocalStorage: 'achai-language',
    caches: ['localStorage'],
  },
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});
```

### Language Context Configuration

The `LanguageContext` provides:
- Current language state
- Language change functions
- URL management for language routes
- Helper methods for language-aware navigation

## Best Practices

### For Developers
1. **Always use translation keys**: Never hardcode text strings
2. **Test both languages**: Ensure UI works with different text lengths
3. **Use semantic keys**: Make translation keys self-explanatory
4. **Handle pluralization**: Use i18next plural features when needed
5. **Consider RTL**: Although not needed for EN/PT, structure allows future expansion

### For Translators
1. **Maintain context**: Keep the meaning and tone consistent
2. **Consider UI space**: Portuguese text can be longer than English
3. **Use proper terminology**: Maintain consistent technical terms
4. **Test in context**: Review translations in the actual UI

### Performance Considerations
1. **Lazy loading**: Translations are loaded on demand
2. **Caching**: Browser localStorage caches language preference
3. **Bundle size**: Only active language translations are loaded

## Future Enhancements

### Planned Features
1. **SEO-friendly URLs**: Language-specific slugs (e.g., `/pt/produtos`)
2. **Additional languages**: Easy to add Spanish, French, etc.
3. **Translation management**: Integration with translation services
4. **RTL support**: Ready for Arabic, Hebrew languages
5. **Date/time localization**: Locale-specific formatting

### Adding New Languages
1. Create new translation file (e.g., `es.json`)
2. Add language to available languages list
3. Update language detection logic
4. Add flag emoji to LanguageSwitcher
5. Test all functionality in new language

## Troubleshooting

### Common Issues
1. **Missing translations**: Check console for missing key warnings
2. **Language not switching**: Verify localStorage and URL routing
3. **Layout issues**: Test with longer Portuguese translations
4. **URL conflicts**: Ensure language prefixes don't conflict with existing routes

### Debug Mode
Enable debug mode in development:
```javascript
i18n.init({
  debug: process.env.NODE_ENV === 'development',
  // ... other config
});
```

This will log translation loading and missing keys to the console.