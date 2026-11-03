
import { resolve } from 'node:path';

const config = {
  turbopack: { root: resolve(import.meta.dirname, '../..') },
  serverExternalPackages: ['node:sqlite'],
  poweredByHeader: false,
};
export default config;
