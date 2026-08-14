import {
  isPublicHomePath,
  shouldBlockForAuth,
  resolveProtectedAccountView,
} from './authRoute';

describe('isPublicHomePath', () => {
  test.each(['/', '/home', '/home/', '/Home', '/home?x=1'])(
    'treats %s as the marketing homepage',
    (pathname) => {
      expect(isPublicHomePath(pathname)).toBe(true);
    }
  );

  test.each(['/account', '/Account', '/store', '/career', '/scan'])(
    'does not treat %s as the homepage',
    (pathname) => {
      expect(isPublicHomePath(pathname)).toBe(false);
    }
  );
});

describe('shouldBlockForAuth', () => {
  test('does not block the homepage while Firebase auth is restoring', () => {
    expect(shouldBlockForAuth(true, '/')).toBe(false);
    expect(shouldBlockForAuth(true, '/home')).toBe(false);
  });

  test('blocks account and store while auth is restoring', () => {
    expect(shouldBlockForAuth(true, '/account')).toBe(true);
    expect(shouldBlockForAuth(true, '/Account')).toBe(true);
    expect(shouldBlockForAuth(true, '/store')).toBe(true);
  });

  test('does not block any route after auth is ready', () => {
    expect(shouldBlockForAuth(false, '/account')).toBe(false);
    expect(shouldBlockForAuth(false, '/')).toBe(false);
  });
});

describe('resolveProtectedAccountView', () => {
  test('does not resolve to login while the session is still loading', () => {
    expect(resolveProtectedAccountView(null, true)).toBe('loading');
    expect(resolveProtectedAccountView({ uid: '1' }, true)).toBe('loading');
  });

  test('shows the account page when a session exists', () => {
    expect(resolveProtectedAccountView({ uid: '1' }, false)).toBe('account');
  });

  test('shows login only after auth finished with no user', () => {
    expect(resolveProtectedAccountView(null, false)).toBe('login');
  });
});
