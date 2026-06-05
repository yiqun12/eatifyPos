export function detectInitialLang(storage = (typeof window !== 'undefined' ? window.localStorage : null)) {
  try {
    const explicit = storage && storage.getItem('appLanguage');
    if (explicit === 'en' || explicit === 'zh') return explicit;
    const legacy = (storage && storage.getItem('Google-language')) || '';
    if (legacy.includes('Chinese') || legacy.includes('中')) return 'zh';
  } catch (e) { /* storage unavailable */ }
  return 'en';
}
