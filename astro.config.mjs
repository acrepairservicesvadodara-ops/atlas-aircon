import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.atlasaircons.com',
  integrations: [
    sitemap(),
  ],
  output: 'static',
  vite: {
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
        '@data': '/src/data',
      },
    },
  },
});
