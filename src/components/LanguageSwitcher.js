import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'EN', legacyValue: 'English' },
  { value: 'zh', label: '中文', legacyValue: 'Chinese (Simplified)' },
];

const normalizeLanguage = (lng) => (
  String(lng || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
);

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('appLanguage', lng);
      // keep menu/product data layer (item.CHI logic) in sync
      localStorage.setItem(
        'Google-language',
        LANGUAGE_OPTIONS.find((option) => option.value === lng)?.legacyValue || 'English'
      );
    } catch (e) { /* ignore */ }
  };

  const current = normalizeLanguage(i18n.language);

  return (
    <select
      aria-label="Language"
      className="notranslate"
      value={current}
      onChange={(event) => setLang(event.target.value)}
      style={{
        height: 30,
        minWidth: 74,
        padding: '2px 24px 2px 8px',
        border: '1px solid #d0d5dd',
        borderRadius: 4,
        backgroundColor: '#fff',
        color: '#344054',
        fontSize: 13,
        lineHeight: '18px',
        cursor: 'pointer',
      }}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}
