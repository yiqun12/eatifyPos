export const ERROR_RELOAD_GUARD_KEY = 'eatify:error-boundary-reload';
export const LAST_ERROR_BOUNDARY_KEY = 'eatify:last-error-boundary';

const DEFAULT_COOLDOWN_MS = 30_000;
const DEFAULT_MAX_RELOADS = 1;

const parseState = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export function createErrorReloadDecision({
  storage,
  pathname,
  now = Date.now(),
  cooldownMs = DEFAULT_COOLDOWN_MS,
  maxReloads = DEFAULT_MAX_RELOADS,
}) {
  const state = parseState(storage && storage.getItem(ERROR_RELOAD_GUARD_KEY));
  const isSameRoute = state && state.pathname === pathname;
  const isWithinCooldown = state && now - state.firstAt < cooldownMs;
  const count = isSameRoute && isWithinCooldown ? state.count : 0;
  const firstAt = isSameRoute && isWithinCooldown ? state.firstAt : now;

  return {
    count,
    cooldownMs,
    firstAt,
    maxReloads,
    now,
    pathname,
    storage,
  };
}

export function shouldReloadAfterError(decision) {
  return Boolean(decision && decision.storage && decision.count < decision.maxReloads);
}

export function recordErrorReloadAttempt(decision) {
  if (!decision || !decision.storage) return;

  decision.storage.setItem(
    ERROR_RELOAD_GUARD_KEY,
    JSON.stringify({
      count: decision.count + 1,
      firstAt: decision.firstAt,
      lastAt: decision.now,
      pathname: decision.pathname,
    })
  );
}
