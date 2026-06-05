import { toResources } from './buildResources';

test('maps {key:{ch,en}} into en/zh bundles', () => {
  const out = toResources({ Hours: { ch: '小时', en: 'Hours' } });
  expect(out.en.Hours).toBe('Hours');
  expect(out.zh.Hours).toBe('小时');
});

test('zh falls back to en (then key) when ch is missing', () => {
  expect(toResources({ Foo: { en: 'Foo' } }).zh.Foo).toBe('Foo');
  expect(toResources({ Bar: {} }).zh.Bar).toBe('Bar');
});

test('skips null/undefined entries without throwing', () => {
  expect(() => toResources({ X: null })).not.toThrow();
});
