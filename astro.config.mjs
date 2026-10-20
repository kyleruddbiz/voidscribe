import { defineConfig, envField } from 'astro/config';

import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

import { site as siteContent } from './src/content/site/index.ts';

const site = siteContent.url;

export default defineConfig({
  site,
  build: { format: 'file' },
  integrations: [
    svelte(),
    sitemap({
      filter: (page) =>
        page !== `${site}/` && page !== `${site}/kyle-rudd/hard-problems`,
    }),
  ],
  env: {
    schema: {
      ITCH_ACCESS_CODE: envField.string({
        context: 'server',
        access: 'public',
      }),
    },
  },
});
