import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Static export: `next build` writes a plain site to out/ (index.html at its root).
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // The site imports the kit from the repository root (../kit/dist).
  turbopack: { root: path.join(__dirname, '..') },
  outputFileTracingRoot: path.join(__dirname, '..'),
};

export default config;
