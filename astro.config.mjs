import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://nikip728.github.io',
  base: process.env.BASE_PATH ?? '/Portfolio',
  output: 'static',
});
