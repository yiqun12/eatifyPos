import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('appLanguage', lng);
      // keep menu/product data layer (item.CHI logic) in sync
      localStorage.setItem('Google-language', lng === 'zh' ? 'Chinese (Simplified)' : 'English');
    } catch (e) { /* ignore */ }
  };

  const current = i18n.language;
  return (
    <div className="notranslate" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <button type="button" onClick={() => setLang('en')}
        style={{ fontWeight: current === 'en' ? 'bold' : 'normal' }}>EN</button>
      <span>|</span>
      <button type="button" onClick={() => setLang('zh')}
        style={{ fontWeight: current === 'zh' ? 'bold' : 'normal' }}>中文</button>
    </div>
  );
}
