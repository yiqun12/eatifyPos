export function toResources(rawDict) {
  const en = {};
  const zh = {};
  for (const [key, value] of Object.entries(rawDict || {})) {
    if (!value) continue;
    const enText = value.en != null ? value.en : key;
    en[key] = enText;
    zh[key] = value.ch != null ? value.ch : enText;
  }
  return { en, zh };
}
