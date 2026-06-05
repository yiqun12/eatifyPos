import { detectInitialLang } from './detectInitialLang';

const fakeStore = (obj) => ({ getItem: (k) => (k in obj ? obj[k] : null) });

test('uses explicit appLanguage when valid', () => {
  expect(detectInitialLang(fakeStore({ appLanguage: 'zh' }))).toBe('zh');
  expect(detectInitialLang(fakeStore({ appLanguage: 'en' }))).toBe('en');
});

test('falls back to legacy Google-language Chinese marker', () => {
  expect(detectInitialLang(fakeStore({ 'Google-language': 'Chinese (Simplified)' }))).toBe('zh');
  expect(detectInitialLang(fakeStore({ 'Google-language': '中文(简体)' }))).toBe('zh');
});

test('defaults to en', () => {
  expect(detectInitialLang(fakeStore({}))).toBe('en');
  expect(detectInitialLang(fakeStore({ 'Google-language': 'English' }))).toBe('en');
});
