import { isAppRoute } from './appRoutes';

test('account and store (any case, with subpaths) are app routes', () => {
  expect(isAppRoute('/account')).toBe(true);
  expect(isAppRoute('/Account')).toBe(true);
  expect(isAppRoute('/store')).toBe(true);
  expect(isAppRoute('/account/anything')).toBe(true);
});

test('marketing routes are not app routes', () => {
  expect(isAppRoute('/')).toBe(false);
  expect(isAppRoute('/career')).toBe(false);
  expect(isAppRoute('/scan_article')).toBe(false);
  expect(isAppRoute('/accounts-payable')).toBe(false);
});
