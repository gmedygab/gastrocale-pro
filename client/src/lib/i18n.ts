import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importa direttamente i file di traduzione
import translationEN from '../translations/en.json';
import translationIT from '../translations/it.json';

const resources = {
  en: {
    translation: translationEN
  },
  it: {
    translation: translationIT
  }
};

// Inizializza i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: localStorage.getItem('language') || 'en', // default language
    debug: true, // abilitato per debug
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;