export function isPublicHomePath(pathname = '') {
  const path = String(pathname).split('?')[0].replace(/\/+$/, '') || '/';
  return path === '/' || path.toLowerCase() === '/home';
}

export function shouldBlockForAuth(userLoading, pathname) {
  return Boolean(userLoading) && !isPublicHomePath(pathname);
}

export function resolveProtectedAccountView(user, userLoading) {
  if (userLoading) return 'loading';
  if (user) return 'account';
  return 'login';
}
