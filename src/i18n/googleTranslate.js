const SCRIPT_ID = 'google-translate-script';
const CALLBACK = 'googleTranslateElementInit';
const CONTAINER_ID = 'google_translate_element';

export function ensureGoogleTranslate() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  window[CALLBACK] = () => {
    const TranslateElement = window.google && window.google.translate && window.google.translate.TranslateElement;
    const container = document.getElementById(CONTAINER_ID);
    if (!TranslateElement || !container || container.dataset.gtInit === 'true') return;
    container.innerHTML = '';
    new TranslateElement({ includedLanguages: 'en,zh-CN', autoDisplay: false }, CONTAINER_ID);
    container.dataset.gtInit = 'true';
  };

  if (window.google && window.google.translate && window.google.translate.TranslateElement) {
    window[CALLBACK]();
    return;
  }
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `//translate.google.com/translate_a/element.js?cb=${CALLBACK}`;
  script.onerror = () => console.error('Failed to load the Google Translate script');
  document.body.appendChild(script);
}
