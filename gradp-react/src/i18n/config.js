import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arTranslation from './ar.json';
import enTranslation from './en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation }
    },
    fallbackLng: 'en', 
    debug: false, 
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false 
    }
  });

const currentLang = i18n.language || 'en';
document.documentElement.dir = currentLang.startsWith('ar') ? 'rtl' : 'ltr';
document.documentElement.lang = currentLang;

export default i18n;