import { translations as rawDict } from '../data/static_text_translations.js';
import { migrated } from './locales/migrated';
import { toResources } from './buildResources';

export const { en, zh } = toResources({ ...rawDict, ...migrated });
