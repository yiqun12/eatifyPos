import {
  createErrorReloadDecision,
  recordErrorReloadAttempt,
  shouldReloadAfterError,
} from './errorReloadGuard';

const storage = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => {
      delete data[key];
    },
    dump: () => ({ ...data }),
  };
};

test('allows first reload for a route and blocks repeated reload loops', () => {
  const store = storage();
  const first = createErrorReloadDecision({
    storage: store,
    pathname: '/account',
    now: 1000,
  });

  expect(shouldReloadAfterError(first)).toBe(true);
  recordErrorReloadAttempt(first);

  const second = createErrorReloadDecision({
    storage: store,
    pathname: '/account',
    now: 1500,
  });

  expect(shouldReloadAfterError(second)).toBe(false);
});

test('resets reload guard after the cooldown window', () => {
  const store = storage();
  const first = createErrorReloadDecision({
    storage: store,
    pathname: '/store',
    now: 1000,
  });

  recordErrorReloadAttempt(first);

  const afterCooldown = createErrorReloadDecision({
    storage: store,
    pathname: '/store',
    now: 1000 + 31_000,
  });

  expect(shouldReloadAfterError(afterCooldown)).toBe(true);
});
