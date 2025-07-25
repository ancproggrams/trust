
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import commonNL from '../../public/locales/nl/common.json';
import commonEN from '../../public/locales/en/common.json';
import commonDE from '../../public/locales/de/common.json';
import commonFR from '../../public/locales/fr/common.json';

import dashboardNL from '../../public/locales/nl/dashboard.json';
import dashboardEN from '../../public/locales/en/dashboard.json';

import authNL from '../../public/locales/nl/auth.json';
import authEN from '../../public/locales/en/auth.json';

// Define available languages
export const LANGUAGES = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

// Translation resources
const resources = {
  nl: {
    common: commonNL,
    dashboard: dashboardNL,
    auth: authNL,
  },
  en: {
    common: commonEN,
    dashboard: dashboardEN,
    auth: authEN,
  },
  de: {
    common: commonDE,
    dashboard: {},
    auth: {},
  },
  fr: {
    common: commonFR,
    dashboard: {},
    auth: {},
  },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'nl', // Default language
    fallbackLng: 'nl',
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'auth'],
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
    
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;

// Helper functions
export const getCurrentLanguage = (): LanguageCode => {
  return (i18n.language || 'nl') as LanguageCode;
};

export const setLanguage = (lng: LanguageCode): Promise<any> => {
  return i18n.changeLanguage(lng);
};

export const getLanguageInfo = (code: LanguageCode) => {
  return LANGUAGES.find(lang => lang.code === code);
};

// Storage helpers
export const saveLanguagePreference = (lng: LanguageCode): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('trustio-language', lng);
  }
};

export const getStoredLanguagePreference = (): LanguageCode | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('trustio-language');
    return stored as LanguageCode || null;
  }
  return null;
};

// Browser language detection
export const detectBrowserLanguage = (): LanguageCode => {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    const supportedLang = LANGUAGES.find(lang => lang.code === browserLang);
    return supportedLang?.code || 'nl';
  }
  return 'nl';
};

// Initialize language on app start
export const initializeLanguage = (): void => {
  const stored = getStoredLanguagePreference();
  const detected = detectBrowserLanguage();
  const initialLang = stored || detected || 'nl';
  
  setLanguage(initialLang);
};
