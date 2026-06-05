// 会长期开着、需移除 GT 的应用内路由前缀。后续计划在此追加 /kitchen、/terminal 等。
const APP_ROUTE_PREFIXES = ['/account', '/store'];

export function isAppRoute(pathname) {
  const p = (pathname != null
    ? pathname
    : (typeof window !== 'undefined' ? window.location.pathname : '')
  ).toLowerCase();
  return APP_ROUTE_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + '/'));
}
