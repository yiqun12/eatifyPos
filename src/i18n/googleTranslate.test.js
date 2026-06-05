import { ensureGoogleTranslate } from './googleTranslate';

afterEach(() => {
  document.querySelectorAll('#google-translate-script').forEach((n) => n.remove());
  delete window.googleTranslateElementInit;
});

test('injects exactly one script tag even when called repeatedly', () => {
  ensureGoogleTranslate();
  ensureGoogleTranslate();
  ensureGoogleTranslate();
  expect(document.querySelectorAll('#google-translate-script').length).toBe(1);
});

test('registers the global init callback', () => {
  ensureGoogleTranslate();
  expect(typeof window.googleTranslateElementInit).toBe('function');
});
