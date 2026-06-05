import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en, zh } from './resources';
import { detectInitialLang } from './detectInitialLang';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: detectInitialLang(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'zh'],
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  returnEmptyString: false,
  saveMissing: process.env.NODE_ENV === 'development',
  missingKeyHandler: (lngs, ns, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[i18n missing]', key);
    }
  },
});

export default i18n;
