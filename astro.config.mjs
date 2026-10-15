import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.atlasaircons.com',
  integrations: [
    sitemap({
      filter: (page) => {
        const p = new URL(page).pathname;
        const blocked = [
          '/cart/',
          '/checkout/',
          '/my-account/',
          '/ac-gas-charging/',
          '/ac-installation/',
          '/cassette-ac-service/',
          '/industrial-hvac/',
          '/inverter-pcb-repair/',
          '/404/',
        ];
        return !blocked.includes(p);
      },
    }),
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
