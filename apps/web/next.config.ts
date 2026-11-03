import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const config: NextConfig = {
  turbopack: { root: resolve(import.meta.dirname, '../..') },
  serverExternalPackages: ['node:sqlite'],
  poweredByHeader: false,
};
export default config;
