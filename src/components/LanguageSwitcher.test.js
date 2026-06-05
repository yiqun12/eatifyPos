import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import i18n from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';

test('selecting 中文 switches i18n language and persists to localStorage', async () => {
  await i18n.changeLanguage('en');
  render(<LanguageSwitcher />);
  fireEvent.change(screen.getByLabelText('Language'), { target: { value: 'zh' } });
  expect(i18n.language).toBe('zh');
  expect(localStorage.getItem('appLanguage')).toBe('zh');
  expect(localStorage.getItem('Google-language')).toContain('Chinese');
});
