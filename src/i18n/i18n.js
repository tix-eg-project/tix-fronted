// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // Load translations from public folder
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next)
  .init({
    fallbackLng: 'ar',
    debug: false,
    backend: {
      loadPath: '/translations/{{lng}}/global.json',
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

// ✅ Set direction and lang after initialization
i18n.on('initialized', () => {
  const lng = i18n.language;
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
});

// ✅ Also update if language changes dynamically
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
