import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

const base = process.env.BASE_PATH ?? '/portfolio';

export default defineConfig({
  site: process.env.SITE_URL || 'https://nikip728.github.io',
  base,
  output: 'static',
  markdown: {
    processor: satteri({
      hastPlugins: [{
        name: 'local-image-base',
        element: {
          filter: ['img'],
          visit(node, ctx) {
            const src = node.properties?.src;
            if (typeof src === 'string' && src.startsWith('/images/')) {
              ctx.setProperty(node, 'src', `${base.replace(/\/$/, '')}${src}`);
            }
          },
        },
      }],
    }),
  },
});
